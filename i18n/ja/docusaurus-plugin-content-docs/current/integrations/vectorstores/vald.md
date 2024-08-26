---
translated: true
---

# Vald

> [Vald](https://github.com/vdaas/vald)は、高度にスケーラブルな分散型の高速な近似最近傍(ANN)密ベクトル検索エンジンです。

このノートブックでは、`Vald`データベースに関連する機能の使用方法を示します。

このノートブックを実行するには、実行中のValdクラスターが必要です。
詳細については、[Get Started](https://github.com/vdaas/vald#get-started)をご覧ください。

[インストール手順](https://github.com/vdaas/vald-client-python#install)をご覧ください。

```python
%pip install --upgrade --quiet  vald-client-python
```

## 基本的な例

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

### ベクトルによる類似検索

```python
embedding_vector = embeddings.embed_query(query)
docs = db.similarity_search_by_vector(embedding_vector)
docs[0].page_content
```

### スコアによる類似検索

```python
docs_and_scores = db.similarity_search_with_score(query)
docs_and_scores[0]
```

## 最大限の限界関連性検索(MMR)

リトリーバーオブジェクトで類似検索を使用する以外に、`mmr`もリトリーバーとして使用できます。

```python
retriever = db.as_retriever(search_type="mmr")
retriever.invoke(query)
```

または、`max_marginal_relevance_search`を直接使用することもできます:

```python
db.max_marginal_relevance_search(query, k=2, fetch_k=10)
```

## 安全な接続の使用例

このノートブックを実行するには、[Athenz](https://github.com/AthenZ/athenz)認証を使用して、セキュアな接続でValdクラスターを実行する必要があります。

以下は、次の構成を使用したValdクラスターの例です。

ingress(TLS) -> [authorization-proxy](https://github.com/AthenZ/authorization-proxy)(grpcメタデータのathenz-role-authをチェック) -> vald-lb-gateway

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

### ベクトルによる類似検索

```python
embedding_vector = embeddings.embed_query(query)
docs = db.similarity_search_by_vector(embedding_vector, grpc_metadata=metadata)
docs[0].page_content
```

### スコアによる類似検索

```python
docs_and_scores = db.similarity_search_with_score(query, grpc_metadata=metadata)
docs_and_scores[0]
```

### 最大限の限界関連性検索(MMR)

```python
retriever = db.as_retriever(
    search_kwargs={"search_type": "mmr", "grpc_metadata": metadata}
)
retriever.invoke(query, grpc_metadata=metadata)
```

または:

```python
db.max_marginal_relevance_search(query, k=2, fetch_k=10, grpc_metadata=metadata)
```
