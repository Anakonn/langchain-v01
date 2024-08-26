---
translated: true
---

# Vald

> [Vald](https://github.com/vdaas/vald)는 고도로 확장 가능한 분산 고속 근사 최근접 이웃(ANN) 밀집 벡터 검색 엔진입니다.

이 노트북은 `Vald` 데이터베이스와 관련된 기능을 사용하는 방법을 보여줍니다.

이 노트북을 실행하려면 실행 중인 Vald 클러스터가 필요합니다.
자세한 내용은 [Get Started](https://github.com/vdaas/vald#get-started)를 확인하세요.

[설치 지침](https://github.com/vdaas/vald-client-python#install)을 참조하세요.

```python
%pip install --upgrade --quiet  vald-client-python
```

## 기본 예제

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Vald
from langchain_text_splitters import CharacterTextSplitter

raw_documents = TextLoader("state_of_the_union.txt").load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
documents = text_splitter.split_documents(raw_documents)
embeddings = HuggingFaceEmbeddings()
db = Vald.from_documents(documents, embeddings, host="localhost", port=8080)
```

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query)
docs[0].page_content
```

### 벡터에 의한 유사도 검색

```python
embedding_vector = embeddings.embed_query(query)
docs = db.similarity_search_by_vector(embedding_vector)
docs[0].page_content
```

### 점수를 포함한 유사도 검색

```python
docs_and_scores = db.similarity_search_with_score(query)
docs_and_scores[0]
```

## 최대 한계 관련성 검색(MMR)

retriever 객체에서 유사도 검색을 사용하는 것 외에도 `mmr`을 retriever로 사용할 수 있습니다.

```python
retriever = db.as_retriever(search_type="mmr")
retriever.invoke(query)
```

또는 `max_marginal_relevance_search`를 직접 사용할 수 있습니다:

```python
db.max_marginal_relevance_search(query, k=2, fetch_k=10)
```

## 보안 연결 사용 예제

이 노트북을 실행하려면 [Athenz](https://github.com/AthenZ/athenz) 인증을 사용하여 다음과 같은 구성의 Vald 클러스터를 실행해야 합니다.

ingress(TLS) -> [authorization-proxy](https://github.com/AthenZ/authorization-proxy)(athenz-role-auth in grpc metadata 확인) -> vald-lb-gateway

```python
import grpc

with open("test_root_cacert.crt", "rb") as root:
    credentials = grpc.ssl_channel_credentials(root_certificates=root.read())

# Refresh is required for server use
with open(".ztoken", "rb") as ztoken:
    token = ztoken.read().strip()

metadata = [(b"athenz-role-auth", token)]
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Vald
from langchain_text_splitters import CharacterTextSplitter

raw_documents = TextLoader("state_of_the_union.txt").load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
documents = text_splitter.split_documents(raw_documents)
embeddings = HuggingFaceEmbeddings()

db = Vald.from_documents(
    documents,
    embeddings,
    host="localhost",
    port=443,
    grpc_use_secure=True,
    grpc_credentials=credentials,
    grpc_metadata=metadata,
)
```

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query, grpc_metadata=metadata)
docs[0].page_content
```

### 벡터에 의한 유사도 검색

```python
embedding_vector = embeddings.embed_query(query)
docs = db.similarity_search_by_vector(embedding_vector, grpc_metadata=metadata)
docs[0].page_content
```

### 점수를 포함한 유사도 검색

```python
docs_and_scores = db.similarity_search_with_score(query, grpc_metadata=metadata)
docs_and_scores[0]
```

### 최대 한계 관련성 검색(MMR)

```python
retriever = db.as_retriever(
    search_kwargs={"search_type": "mmr", "grpc_metadata": metadata}
)
retriever.invoke(query, grpc_metadata=metadata)
```

또는:

```python
db.max_marginal_relevance_search(query, k=2, fetch_k=10, grpc_metadata=metadata)
```
