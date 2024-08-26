---
sidebar_position: 4
translated: true
---

# 여러 쿼리 처리

때때로, 쿼리 분석 기술을 사용하면 여러 쿼리가 생성될 수 있습니다. 이 경우 모든 쿼리를 실행하고 결과를 결합해야 합니다. 이 문서에서는 간단한 예제(모의 데이터를 사용)를 통해 이를 수행하는 방법을 보여줍니다.

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

texts = ["Harrison worked at Kensho", "Ankush worked at Facebook"]
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
vectorstore = Chroma.from_texts(
    texts,
    embeddings,
)
retriever = vectorstore.as_retriever(search_kwargs={"k": 1})
```

## 쿼리 분석

함수 호출을 사용하여 출력을 구조화할 것입니다. 여러 쿼리를 반환하도록 하겠습니다.

```python
from typing import List, Optional

from langchain_core.pydantic_v1 import BaseModel, Field


class Search(BaseModel):
    """직업 기록 데이터베이스에 대한 검색."""

    queries: List[str] = Field(
        ...,
        description="검색할 개별 쿼리",
    )
```

```python
from langchain_core.output_parsers.openai_tools import PydanticToolsParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI

output_parser = PydanticToolsParser(tools=[Search])

system = """사용자 정보를 도와주기 위해 정보를 검색할 수 있는 검색 쿼리를 발행할 수 있습니다.

두 개의 개별 정보를 찾아야 하는 경우 그렇게 할 수 있습니다!"""
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "{question}"),
    ]
)
llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
structured_llm = llm.with_structured_output(Search)
query_analyzer = {"question": RunnablePassthrough()} | prompt | structured_llm
```

```output
/Users/harrisonchase/workplace/langchain/libs/core/langchain_core/_api/beta_decorator.py:86: LangChainBetaWarning: The function `with_structured_output` is in beta. It is actively being worked on, so the API may change.
  warn_beta(
```

여러 쿼리를 생성할 수 있는지 확인할 수 있습니다.

```python
query_analyzer.invoke("where did Harrison Work")
```

```output
Search(queries=['Harrison work location'])
```

```python
query_analyzer.invoke("where did Harrison and ankush Work")
```

```output
Search(queries=['Harrison work place', 'Ankush work place'])
```

## 쿼리 분석을 통한 검색

그렇다면 이를 체인에 포함시키려면 어떻게 해야 할까요? 비동기적으로 검색기를 호출하면 쿼리를 반복하면서 응답 시간에 차단되지 않도록 할 수 있습니다.

```python
from langchain_core.runnables import chain
```

```python
@chain
async def custom_chain(question):
    response = await query_analyzer.ainvoke(question)
    docs = []
    for query in response.queries:
        new_docs = await retriever.ainvoke(query)
        docs.extend(new_docs)
    # 여기에서 문서를 재정렬하거나 중복 제거하는 것에 대해 생각할 수 있습니다.
    # 하지만 이는 별도의 주제입니다.
    return docs
```

```python
await custom_chain.ainvoke("where did Harrison Work")
```

```output
[Document(page_content='Harrison worked at Kensho')]
```

```python
await custom_chain.ainvoke("where did Harrison and ankush Work")
```

```output
[Document(page_content='Harrison worked at Kensho'),
 Document(page_content='Ankush worked at Facebook')]
```