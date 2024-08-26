---
sidebar_position: 5
translated: true
---

# 여러 검색기 처리

때때로, 쿼리 분석 기술을 사용하면 사용할 검색기를 선택할 수 있습니다. 이를 위해 검색기를 선택하는 논리를 추가해야 합니다. 이 문서에서는 이를 수행하는 간단한 예제(모의 데이터 사용)를 보여줍니다.

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
vectorstore = Chroma.from_texts(texts, embeddings, collection_name="harrison")
retriever_harrison = vectorstore.as_retriever(search_kwargs={"k": 1})

texts = ["Ankush worked at Facebook"]
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
vectorstore = Chroma.from_texts(texts, embeddings, collection_name="ankush")
retriever_ankush = vectorstore.as_retriever(search_kwargs={"k": 1})
```

## 쿼리 분석

함수 호출을 사용하여 출력을 구조화할 것입니다. 여러 쿼리를 반환하도록 하겠습니다.

```python
from typing import List, Optional

from langchain_core.pydantic_v1 import BaseModel, Field


class Search(BaseModel):
    """사람에 대한 정보를 검색합니다."""

    query: str = Field(
        ...,
        description="검색할 쿼리",
    )
    person: str = Field(
        ...,
        description="사람에 대한 정보를 검색합니다. 'HARRISON' 또는 'ANKUSH'이어야 합니다.",
    )
```

```python
from langchain_core.output_parsers.openai_tools import PydanticToolsParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI

output_parser = PydanticToolsParser(tools=[Search])

system = """사용자 정보를 도와주기 위해 정보를 검색할 수 있는 검색 쿼리를 발행할 수 있습니다."""
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

검색기 간의 라우팅이 가능함을 확인할 수 있습니다.

```python
query_analyzer.invoke("where did Harrison Work")
```

```output
Search(query='workplace', person='HARRISON')
```

```python
query_analyzer.invoke("where did ankush Work")
```

```output
Search(query='workplace', person='ANKUSH')
```

## 쿼리 분석을 통한 검색

이를 체인에 포함시키려면 어떻게 해야 할까요? 검색기를 선택하고 검색 쿼리를 전달하는 간단한 논리만 필요합니다.

```python
from langchain_core.runnables import chain
```

```python
retrievers = {
    "HARRISON": retriever_harrison,
    "ANKUSH": retriever_ankush,
}
```

```python
@chain
def custom_chain(question):
    response = query_analyzer.invoke(question)
    retriever = retrievers[response.person]
    return retriever.invoke(response.query)
```

```python
custom_chain.invoke("where did Harrison Work")
```

```output
[Document(page_content='Harrison worked at Kensho')]
```

```python
custom_chain.invoke("where did ankush Work")
```

```output
[Document(page_content='Ankush worked at Facebook')]
```