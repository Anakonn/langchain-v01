---
translated: true
---

# 하이브리드 검색

LangChain의 표준 검색은 벡터 유사도에 의해 수행됩니다. 그러나 Astra DB, ElasticSearch, Neo4J, AzureSearch 등 여러 벡터스토어 구현은 벡터 유사도 검색과 기타 검색 기술(전체 텍스트, BM25 등)을 결합한 더 고급 검색을 지원합니다. 이를 일반적으로 "하이브리드" 검색이라고 합니다.

**1단계: 사용하는 벡터스토어가 하이브리드 검색을 지원하는지 확인하세요**

현재 LangChain에는 하이브리드 검색을 수행하는 통일된 방법이 없습니다. 각 벡터스토어는 이를 수행하는 고유한 방법을 가질 수 있습니다. 이는 일반적으로 `similarity_search` 중에 전달되는 키워드 인수로 노출됩니다. 문서나 소스 코드를 읽고 사용하는 벡터스토어가 하이브리드 검색을 지원하는지 확인하고, 지원하는 경우 사용하는 방법을 알아보세요.

**2단계: 해당 매개변수를 체인의 구성 가능한 필드로 추가하세요**

이렇게 하면 체인을 호출하고 런타임에 관련 플래그를 쉽게 구성할 수 있습니다. 구성에 대한 자세한 내용은 [이 문서](/docs/expression_language/primitives/configure)를 참조하세요.

**3단계: 구성 가능한 필드로 체인을 호출하세요**

이제 런타임에 이 체인을 구성 가능한 필드로 호출할 수 있습니다.

## 코드 예제

이제 코드에서 어떻게 생겼는지 구체적인 예를 살펴보겠습니다. 이 예제에서는 Astra DB의 Cassandra/CQL 인터페이스를 사용하겠습니다.

다음 Python 패키지를 설치하세요:

```python
!pip install "cassio>=0.1.7"
```

[연결 비밀](https://docs.datastax.com/en/astra/astra-db-vector/get-started/quickstart.html)을 가져오세요.

cassio를 초기화하세요:

```python
import cassio

cassio.init(
    database_id="Your database ID",
    token="Your application token",
    keyspace="Your key space",
)
```

용어 일치를 활성화하려면 표준 [인덱스 분석기](https://docs.datastax.com/en/astra/astra-db-vector/cql/use-analyzers-with-cql.html)로 Cassandra VectorStore를 생성하세요.

```python
from cassio.table.cql import STANDARD_ANALYZER
from langchain_community.vectorstores import Cassandra
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings()
vectorstore = Cassandra(
    embedding=embeddings,
    table_name="test_hybrid",
    body_index_options=[STANDARD_ANALYZER],
    session=None,
    keyspace=None,
)

vectorstore.add_texts(
    [
        "In 2023, I visited Paris",
        "In 2022, I visited New York",
        "In 2021, I visited New Orleans",
    ]
)
```

표준 유사도 검색을 수행하면 모든 문서를 가져옵니다:

```python
vectorstore.as_retriever().invoke("What city did I visit last?")
```

```output
[Document(page_content='In 2022, I visited New York'),
 Document(page_content='In 2023, I visited Paris'),
 Document(page_content='In 2021, I visited New Orleans')]
```

Astra DB 벡터스토어 `body_search` 인수는 검색을 용어 `new`로 필터링하는 데 사용할 수 있습니다.

```python
vectorstore.as_retriever(search_kwargs={"body_search": "new"}).invoke(
    "What city did I visit last?"
)
```

```output
[Document(page_content='In 2022, I visited New York'),
 Document(page_content='In 2021, I visited New Orleans')]
```

이제 질문-응답을 수행할 체인을 생성할 수 있습니다.

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import (
    ConfigurableField,
    RunnablePassthrough,
)
from langchain_openai import ChatOpenAI
```

기본적인 질문-응답 체인 설정입니다.

```python
template = """Answer the question based only on the following context:
{context}
Question: {question}
"""
prompt = ChatPromptTemplate.from_template(template)

model = ChatOpenAI()

retriever = vectorstore.as_retriever()
```

여기서 검색기를 구성 가능한 필드로 표시합니다. 모든 벡터스토어 검색기에는 `search_kwargs`라는 필드가 있습니다. 이는 단순히 벡터스토어 특정 필드가 있는 딕셔너리입니다.

```python
configurable_retriever = retriever.configurable_fields(
    search_kwargs=ConfigurableField(
        id="search_kwargs",
        name="Search Kwargs",
        description="The search kwargs to use",
    )
)
```

이제 구성 가능한 검색기를 사용하여 체인을 생성할 수 있습니다.

```python
chain = (
    {"context": configurable_retriever, "question": RunnablePassthrough()}
    | prompt
    | model
    | StrOutputParser()
)
```

```python
chain.invoke("What city did I visit last?")
```

```output
Paris
```

이제 구성 가능한 옵션으로 체인을 호출할 수 있습니다. `search_kwargs`는 구성 가능한 필드의 ID입니다. 값은 Astra DB에 사용할 검색 kwargs입니다.

```python
chain.invoke(
    "What city did I visit last?",
    config={"configurable": {"search_kwargs": {"body_search": "new"}}},
)
```

```output
New York
```