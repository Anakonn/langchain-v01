---
sidebar_position: 3
translated: true
---

# 쿼리가 생성되지 않는 경우 처리

때때로, 쿼리 분석 기술은 여러 개의 쿼리를 생성할 수 있지만, 쿼리가 전혀 생성되지 않는 경우도 있을 수 있습니다! 이 경우, 전체 체인은 쿼리 분석 결과를 검사하여 검색기를 호출할지 여부를 결정해야 합니다.

이 예제에서는 모의 데이터를 사용할 것입니다.

## 설정

#### 종속성 설치

```python
# %pip install -qU langchain langchain-community langchain-openai langchain-chroma

```

#### 환경 변수 설정

이 예제에서는 OpenAI를 사용합니다:

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()

# 선택 사항, LangSmith로 실행 추적을 위해 주석 해제. 여기서 가입하세요: https://smith.langchain.com.

# os.environ["LANGCHAIN_TRACING_V2"] = "true"

# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()

```

### 인덱스 생성

가짜 정보를 사용하여 벡터스토어를 생성하겠습니다.

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings

texts = ["Harrison worked at Kensho"]
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
vectorstore = Chroma.from_texts(
    texts,
    embeddings,
)
retriever = vectorstore.as_retriever()
```

## 쿼리 분석

출력을 구조화하기 위해 함수 호출을 사용할 것입니다. 하지만, LLM을 구성하여 검색 쿼리를 나타내는 함수를 호출할 필요가 없도록 설정할 것입니다(필요하지 않은 경우). 또한 검색을 언제 해야 하는지와 하지 말아야 하는지를 명시적으로 설명하는 프롬프트를 사용하여 쿼리 분석을 수행할 것입니다.

```python
from typing import Optional

from langchain_core.pydantic_v1 import BaseModel, Field


class Search(BaseModel):
    """직업 기록 데이터베이스에서 검색합니다."""

    query: str = Field(
        ...,
        description="직업 기록에 적용되는 유사 검색 쿼리.",
    )
```

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI

system = """사용자 정보를 도와주기 위해 정보를 검색할 수 있는 검색 쿼리를 발행할 수 있습니다.

검색이 필요하지 않을 수도 있습니다. 필요하지 않다면, 그냥 일반적으로 응답하세요."""
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "{question}"),
    ]
)
llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
structured_llm = llm.bind_tools([Search])
query_analyzer = {"question": RunnablePassthrough()} | prompt | structured_llm
```

이를 호출하면 때로는 함수 호출을 반환하고, 그렇지 않은 경우도 있다는 것을 알 수 있습니다.

```python
query_analyzer.invoke("where did Harrison Work")
```

```output
AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_ZnoVX4j9Mn8wgChaORyd1cvq', 'function': {'arguments': '{"query":"Harrison"}', 'name': 'Search'}, 'type': 'function'}]})
```

```python
query_analyzer.invoke("hi!")
```

```output
AIMessage(content='Hello! How can I assist you today?')
```

## 쿼리 분석을 통한 검색

이를 체인에 포함시키려면 어떻게 해야 할까요? 아래 예제를 살펴보겠습니다.

```python
from langchain_core.output_parsers.openai_tools import PydanticToolsParser
from langchain_core.runnables import chain

output_parser = PydanticToolsParser(tools=[Search])
```

```python
@chain
def custom_chain(question):
    response = query_analyzer.invoke(question)
    if "tool_calls" in response.additional_kwargs:
        query = output_parser.invoke(response)
        docs = retriever.invoke(query[0].query)
        # 더 많은 논리를 추가할 수 있습니다 - 예를 들어 다른 LLM 호출 등
        return docs
    else:
        return response
```

```python
custom_chain.invoke("where did Harrison Work")
```

```output
Number of requested results 4 is greater than number of elements in index 1, updating n_results = 1
```

```output
[Document(page_content='Harrison worked at Kensho')]
```

```python
custom_chain.invoke("hi!")
```

```output
AIMessage(content='Hello! How can I assist you today?')
```