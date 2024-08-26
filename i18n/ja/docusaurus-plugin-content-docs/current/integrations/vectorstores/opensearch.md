---
translated: true
---

# OpenSearch

> [OpenSearch](https://opensearch.org/)は、Apache 2.0ライセンスの下で提供されている、スケーラブル、柔軟、拡張性のある、オープンソースのサーチ、分析、観測アプリケーションのソフトウェアスイートです。 `OpenSearch`は、`Apache Lucene`に基づいた分散型のサーチおよび分析エンジンです。

このノートブックでは、`OpenSearch`データベースに関連する機能の使用方法を示します。

実行するには、OpenSearchインスタンスが起動している必要があります: [簡単なDockerインストールはこちら](https://hub.docker.com/r/opensearchproject/opensearch)。

`similarity_search`は、デフォルトで近似k-NN検索を実行します。これは、大規模なデータセットに推奨されるlucene、nmslib、faissなどのいくつかのアルゴリズムの1つを使用します。ブルートフォース検索を行うには、Script ScoringやPainless Scriptingなどの他の検索方法があります。
詳細は[こちら](https://opensearch.org/docs/latest/search-plugins/knn/index/)をご確認ください。

## インストール

Pythonクライアントをインストールします。

```python
%pip install --upgrade --quiet  opensearch-py
```

OpenAIEmbeddingsを使用するには、OpenAIのAPIキーが必要です。

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import OpenSearchVectorSearch
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

```python
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

## Approximate k-NN を使用した similarity_search

カスタムパラメータを使用した `Approximate k-NN` 検索の `similarity_search`

```python
docsearch = OpenSearchVectorSearch.from_documents(
    docs, embeddings, opensearch_url="http://localhost:9200"
)

# If using the default Docker installation, use this instantiation instead:
# docsearch = OpenSearchVectorSearch.from_documents(
#     docs,
#     embeddings,
#     opensearch_url="https://localhost:9200",
#     http_auth=("admin", "admin"),
#     use_ssl = False,
#     verify_certs = False,
#     ssl_assert_hostname = False,
#     ssl_show_warn = False,
# )
```

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = docsearch.similarity_search(query, k=10)
```

```python
print(docs[0].page_content)
```

```python
docsearch = OpenSearchVectorSearch.from_documents(
    docs,
    embeddings,
    opensearch_url="http://localhost:9200",
    engine="faiss",
    space_type="innerproduct",
    ef_construction=256,
    m=48,
)

query = "What did the president say about Ketanji Brown Jackson"
docs = docsearch.similarity_search(query)
```

```python
print(docs[0].page_content)
```

## Script Scoring を使用した similarity_search

カスタムパラメータを使用した `Script Scoring` の `similarity_search`

```python
docsearch = OpenSearchVectorSearch.from_documents(
    docs, embeddings, opensearch_url="http://localhost:9200", is_appx_search=False
)

query = "What did the president say about Ketanji Brown Jackson"
docs = docsearch.similarity_search(
    "What did the president say about Ketanji Brown Jackson",
    k=1,
    search_type="script_scoring",
)
```

```python
print(docs[0].page_content)
```

## Painless Scripting を使用した similarity_search

カスタムパラメータを使用した `Painless Scripting` の `similarity_search`

```python
docsearch = OpenSearchVectorSearch.from_documents(
    docs, embeddings, opensearch_url="http://localhost:9200", is_appx_search=False
)
filter = {"bool": {"filter": {"term": {"text": "smuggling"}}}}
query = "What did the president say about Ketanji Brown Jackson"
docs = docsearch.similarity_search(
    "What did the president say about Ketanji Brown Jackson",
    search_type="painless_scripting",
    space_type="cosineSimilarity",
    pre_filter=filter,
)
```

```python
print(docs[0].page_content)
```

## 最大限の限界関連性検索 (MMR)

類似文書を検索したい場合で、多様な結果も得たい場合は、MMRを検討してください。最大限の限界関連性は、クエリへの類似性と選択された文書の多様性を最適化します。

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = docsearch.max_marginal_relevance_search(query, k=2, fetch_k=10, lambda_param=0.5)
```

## 既存のOpenSearchインスタンスの使用

既に文書にベクトルが存在する、既存のOpenSearchインスタンスを使用することも可能です。

```python
# this is just an example, you would need to change these values to point to another opensearch instance
docsearch = OpenSearchVectorSearch(
    index_name="index-*",
    embedding_function=embeddings,
    opensearch_url="http://localhost:9200",
)

# you can specify custom field names to match the fields you're using to store your embedding, document text value, and metadata
docs = docsearch.similarity_search(
    "Who was asking about getting lunch today?",
    search_type="script_scoring",
    space_type="cosinesimil",
    vector_field="message_embedding",
    text_field="message",
    metadata_field="message_metadata",
)
```

## AOSS (Amazon OpenSearch Service Serverless) の使用

これは、`faiss`エンジンと`efficient_filter`を使用した`AOSS`の例です。

いくつかの`python`パッケージをインストールする必要があります。

```python
%pip install --upgrade --quiet  boto3 requests requests-aws4auth
```

```python
import boto3
from opensearchpy import RequestsHttpConnection
from requests_aws4auth import AWS4Auth

service = "aoss"  # must set the service as 'aoss'
region = "us-east-2"
credentials = boto3.Session(
    aws_access_key_id="xxxxxx", aws_secret_access_key="xxxxx"
).get_credentials()
awsauth = AWS4Auth("xxxxx", "xxxxxx", region, service, session_token=credentials.token)

docsearch = OpenSearchVectorSearch.from_documents(
    docs,
    embeddings,
    opensearch_url="host url",
    http_auth=awsauth,
    timeout=300,
    use_ssl=True,
    verify_certs=True,
    connection_class=RequestsHttpConnection,
    index_name="test-index-using-aoss",
    engine="faiss",
)

docs = docsearch.similarity_search(
    "What is feature selection",
    efficient_filter=filter,
    k=200,
)
```

## AOS (Amazon OpenSearch Service) の使用

```python
%pip install --upgrade --quiet  boto3
```

```python
# This is just an example to show how to use Amazon OpenSearch Service, you need to set proper values.
import boto3
from opensearchpy import RequestsHttpConnection

service = "es"  # must set the service as 'es'
region = "us-east-2"
credentials = boto3.Session(
    aws_access_key_id="xxxxxx", aws_secret_access_key="xxxxx"
).get_credentials()
awsauth = AWS4Auth("xxxxx", "xxxxxx", region, service, session_token=credentials.token)

docsearch = OpenSearchVectorSearch.from_documents(
    docs,
    embeddings,
    opensearch_url="host url",
    http_auth=awsauth,
    timeout=300,
    use_ssl=True,
    verify_certs=True,
    connection_class=RequestsHttpConnection,
    index_name="test-index",
)

docs = docsearch.similarity_search(
    "What is feature selection",
    k=200,
)
```
