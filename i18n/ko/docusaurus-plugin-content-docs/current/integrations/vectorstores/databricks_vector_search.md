---
translated: true
---

# Databricks 벡터 검색

Databricks 벡터 검색은 벡터 데이터베이스에 데이터의 벡터 표현과 메타데이터를 저장할 수 있는 서버리스 유사성 검색 엔진입니다. 벡터 검색을 사용하면 Unity Catalog에서 관리하는 Delta 테이블에서 자동 업데이트되는 벡터 검색 인덱스를 만들고 간단한 API를 사용하여 가장 유사한 벡터를 반환할 수 있습니다.

이 노트북은 LangChain과 Databricks 벡터 검색을 사용하는 방법을 보여줍니다.

`databricks-vectorsearch` 및 이 노트북에서 사용되는 관련 Python 패키지를 설치합니다.

```python
%pip install --upgrade --quiet  langchain-core databricks-vectorsearch langchain-openai tiktoken
```

임베딩에 `OpenAIEmbeddings`를 사용합니다.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

문서를 분할하고 임베딩을 가져옵니다.

```python
from langchain_community.document_loaders import TextLoader
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
emb_dim = len(embeddings.embed_query("hello"))
```

## Databricks 벡터 검색 클라이언트 설정

```python
from databricks.vector_search.client import VectorSearchClient

vsc = VectorSearchClient()
```

## 벡터 검색 엔드포인트 생성

이 엔드포인트는 벡터 검색 인덱스를 생성하고 액세스하는 데 사용됩니다.

```python
vsc.create_endpoint(name="vector_search_demo_endpoint", endpoint_type="STANDARD")
```

## Direct Vector Access 인덱스 생성

Direct Vector Access 인덱스는 REST API 또는 SDK를 통해 임베딩 벡터와 메타데이터를 직접 읽고 쓸 수 있습니다. 이 인덱스의 경우 임베딩 벡터와 인덱스 업데이트를 직접 관리해야 합니다.

```python
vector_search_endpoint_name = "vector_search_demo_endpoint"
index_name = "ml.llm.demo_index"

index = vsc.create_direct_access_index(
    endpoint_name=vector_search_endpoint_name,
    index_name=index_name,
    primary_key="id",
    embedding_dimension=emb_dim,
    embedding_vector_column="text_vector",
    schema={
        "id": "string",
        "text": "string",
        "text_vector": "array<float>",
        "source": "string",
    },
)

index.describe()
```

```python
from langchain_community.vectorstores import DatabricksVectorSearch

dvs = DatabricksVectorSearch(
    index, text_column="text", embedding=embeddings, columns=["source"]
)
```

## 문서 인덱스에 추가

```python
dvs.add_documents(docs)
```

## 유사성 검색

```python
query = "What did the president say about Ketanji Brown Jackson"
dvs.similarity_search(query)
print(docs[0].page_content)
```

## Delta Sync 인덱스 사용

`DatabricksVectorSearch`를 사용하여 Delta Sync 인덱스에서 검색할 수도 있습니다. Delta Sync 인덱스는 Delta 테이블에서 자동으로 동기화됩니다. `add_text`/`add_documents`를 수동으로 호출할 필요가 없습니다. 자세한 내용은 [Databricks 문서 페이지](https://docs.databricks.com/en/generative-ai/vector-search.html#delta-sync-index-with-managed-embeddings)를 참조하세요.

```python
dvs_delta_sync = DatabricksVectorSearch("catalog_name.schema_name.delta_sync_index")
dvs_delta_sync.similarity_search(query)
```
