---
translated: true
---

# Databricks 벡터 검색

>[Databricks 벡터 검색](https://docs.databricks.com/en/generative-ai/vector-search.html)은 벡터 데이터베이스에 데이터의 벡터 표현과 메타데이터를 저장할 수 있는 서버리스 유사성 검색 엔진입니다. 벡터 검색을 사용하면 Unity Catalog에서 관리하는 Delta 테이블에서 자동 업데이트되는 벡터 검색 인덱스를 만들고 간단한 API를 사용하여 가장 유사한 벡터를 반환할 수 있습니다.

이 연습에서는 Databricks 벡터 검색을 사용하여 `SelfQueryRetriever`를 시연합니다.

## Databricks 벡터 저장소 인덱스 생성

먼저 Databricks 벡터 저장소 인덱스를 만들고 일부 데이터로 채워야 합니다. 영화 요약이 포함된 작은 데모 문서 세트를 만들었습니다.

**참고:** self-query retriever를 사용하려면 `lark`(`pip install lark`)와 통합 관련 요구 사항이 설치되어 있어야 합니다.

```python
%pip install --upgrade --quiet  langchain-core databricks-vectorsearch langchain-openai tiktoken
```

```output
Note: you may need to restart the kernel to use updated packages.
```

OpenAI API 키를 얻어야 하므로 `OpenAIEmbeddings`를 사용하겠습니다.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
databricks_host = getpass.getpass("Databricks host:")
databricks_token = getpass.getpass("Databricks token:")
```

```output
OpenAI API Key: ········
Databricks host: ········
Databricks token: ········
```

```python
from databricks.vector_search.client import VectorSearchClient
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings()
emb_dim = len(embeddings.embed_query("hello"))

vector_search_endpoint_name = "vector_search_demo_endpoint"


vsc = VectorSearchClient(
    workspace_url=databricks_host, personal_access_token=databricks_token
)
vsc.create_endpoint(name=vector_search_endpoint_name, endpoint_type="STANDARD")
```

```output
[NOTICE] Using a Personal Authentication Token (PAT). Recommended for development only. For improved performance, please use Service Principal based authentication. To disable this message, pass disable_notice=True to VectorSearchClient().
```

```python
index_name = "udhay_demo.10x.demo_index"

index = vsc.create_direct_access_index(
    endpoint_name=vector_search_endpoint_name,
    index_name=index_name,
    primary_key="id",
    embedding_dimension=emb_dim,
    embedding_vector_column="text_vector",
    schema={
        "id": "string",
        "page_content": "string",
        "year": "int",
        "rating": "float",
        "genre": "string",
        "text_vector": "array<float>",
    },
)

index.describe()
```

```python
index = vsc.get_index(endpoint_name=vector_search_endpoint_name, index_name=index_name)

index.describe()
```

```python
from langchain_core.documents import Document

docs = [
    Document(
        page_content="A bunch of scientists bring back dinosaurs and mayhem breaks loose",
        metadata={"id": 1, "year": 1993, "rating": 7.7, "genre": "action"},
    ),
    Document(
        page_content="Leo DiCaprio gets lost in a dream within a dream within a dream within a ...",
        metadata={"id": 2, "year": 2010, "genre": "thriller", "rating": 8.2},
    ),
    Document(
        page_content="A bunch of normal-sized women are supremely wholesome and some men pine after them",
        metadata={"id": 3, "year": 2019, "rating": 8.3, "genre": "drama"},
    ),
    Document(
        page_content="Three men walk into the Zone, three men walk out of the Zone",
        metadata={"id": 4, "year": 1979, "rating": 9.9, "genre": "science fiction"},
    ),
    Document(
        page_content="A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea",
        metadata={"id": 5, "year": 2006, "genre": "thriller", "rating": 9.0},
    ),
    Document(
        page_content="Toys come alive and have a blast doing so",
        metadata={"id": 6, "year": 1995, "genre": "animated", "rating": 9.3},
    ),
]
```

```python
from langchain_community.vectorstores import DatabricksVectorSearch

vector_store = DatabricksVectorSearch(
    index,
    text_column="page_content",
    embedding=embeddings,
    columns=["year", "rating", "genre"],
)
```

```python
vector_store.add_documents(docs)
```

## 자체 쿼리 검색기 만들기

이제 검색기를 인스턴스화할 수 있습니다. 이를 위해서는 문서에서 지원하는 메타데이터 필드에 대한 정보와 문서 내용에 대한 간단한 설명을 제공해야 합니다.

```python
from langchain.chains.query_constructor.base import AttributeInfo
from langchain.retrievers.self_query.base import SelfQueryRetriever
from langchain_openai import OpenAI

metadata_field_info = [
    AttributeInfo(
        name="genre",
        description="The genre of the movie",
        type="string",
    ),
    AttributeInfo(
        name="year",
        description="The year the movie was released",
        type="integer",
    ),
    AttributeInfo(
        name="rating", description="A 1-10 rating for the movie", type="float"
    ),
]
document_content_description = "Brief summary of a movie"
llm = OpenAI(temperature=0)
retriever = SelfQueryRetriever.from_llm(
    llm, vector_store, document_content_description, metadata_field_info, verbose=True
)
```

## 테스트해보기

이제 실제로 검색기를 사용해 볼 수 있습니다!

```python
# This example only specifies a relevant query
retriever.invoke("What are some movies about dinosaurs")
```

```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'year': 1993.0, 'rating': 7.7, 'genre': 'action', 'id': 1.0}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995.0, 'rating': 9.3, 'genre': 'animated', 'id': 6.0}),
 Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979.0, 'rating': 9.9, 'genre': 'science fiction', 'id': 4.0}),
 Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'year': 2006.0, 'rating': 9.0, 'genre': 'thriller', 'id': 5.0})]
```

```python
# This example specifies a filter
retriever.invoke("What are some highly rated movies (above 9)?")
```

```output
[Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995.0, 'rating': 9.3, 'genre': 'animated', 'id': 6.0}),
 Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979.0, 'rating': 9.9, 'genre': 'science fiction', 'id': 4.0})]
```

```python
# This example specifies both a relevant query and a filter
retriever.invoke("What are the thriller movies that are highly rated?")
```

```output
[Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'year': 2006.0, 'rating': 9.0, 'genre': 'thriller', 'id': 5.0}),
 Document(page_content='Leo DiCaprio gets lost in a dream within a dream within a dream within a ...', metadata={'year': 2010.0, 'rating': 8.2, 'genre': 'thriller', 'id': 2.0})]
```

```python
# This example specifies a query and composite filter
retriever.invoke(
    "What's a movie after 1990 but before 2005 that's all about dinosaurs, \
    and preferably has a lot of action"
)
```

```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'year': 1993.0, 'rating': 7.7, 'genre': 'action', 'id': 1.0})]
```

## k 필터링

자체 쿼리 검색기를 사용하여 `k`(검색할 문서 수)를 지정할 수도 있습니다.

생성자에 `enable_limit=True`를 전달하면 이 기능을 사용할 수 있습니다.

## k 필터링

자체 쿼리 검색기를 사용하여 `k`(검색할 문서 수)를 지정할 수도 있습니다.

생성자에 `enable_limit=True`를 전달하면 이 기능을 사용할 수 있습니다.

```python
retriever = SelfQueryRetriever.from_llm(
    llm,
    vector_store,
    document_content_description,
    metadata_field_info,
    verbose=True,
    enable_limit=True,
)
```

```python
retriever.invoke("What are two movies about dinosaurs?")
```
