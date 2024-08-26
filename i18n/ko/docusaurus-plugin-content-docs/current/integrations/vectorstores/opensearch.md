---
translated: true
---

# OpenSearch

> [OpenSearch](https://opensearch.org/)는 Apache 2.0 라이선스 하에 제공되는 확장 가능하고 유연하며 확장 가능한 오픈 소스 소프트웨어 스위트로, 검색, 분석 및 관찰 애플리케이션을 위한 것입니다. `OpenSearch`는 `Apache Lucene`을 기반으로 하는 분산 검색 및 분석 엔진입니다.

이 노트북은 `OpenSearch` 데이터베이스와 관련된 기능을 사용하는 방법을 보여줍니다.

실행하려면 OpenSearch 인스턴스가 실행 중이어야 합니다: [여기에서 쉬운 Docker 설치를 참조하세요](https://hub.docker.com/r/opensearchproject/opensearch).

`similarity_search`는 기본적으로 Approximate k-NN Search를 수행하며, 이는 대용량 데이터셋에 권장되는 lucene, nmslib, faiss 등의 여러 알고리즘 중 하나를 사용합니다. 브루트 포스 검색을 수행하려면 Script Scoring 및 Painless Scripting과 같은 다른 검색 방법을 사용할 수 있습니다.
자세한 내용은 [여기](https://opensearch.org/docs/latest/search-plugins/knn/index/)를 확인하세요.

## 설치

Python 클라이언트를 설치합니다.

```python
%pip install --upgrade --quiet  opensearch-py
```

OpenAIEmbeddings를 사용하려면 OpenAI API 키를 얻어야 합니다.

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

## Approximate k-NN을 사용한 similarity_search

사용자 정의 매개변수를 사용한 `Approximate k-NN` 검색 `similarity_search`

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

## Script Scoring을 사용한 similarity_search

사용자 정의 매개변수를 사용한 `Script Scoring` `similarity_search`

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

## Painless Scripting을 사용한 similarity_search

사용자 정의 매개변수를 사용한 `Painless Scripting` `similarity_search`

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

## 최대 한계 관련성 검색(MMR)

유사한 문서를 찾고 싶지만 다양한 결과를 받고 싶다면 MMR 방법을 고려해 보세요. 최대 한계 관련성은 쿼리와의 유사성과 선택된 문서 간의 다양성을 최적화합니다.

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = docsearch.max_marginal_relevance_search(query, k=2, fetch_k=10, lambda_param=0.5)
```

## 기존 OpenSearch 인스턴스 사용

벡터가 이미 존재하는 문서가 있는 기존 OpenSearch 인스턴스를 사용할 수도 있습니다.

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

## AOSS(Amazon OpenSearch Service Serverless) 사용

`faiss` 엔진과 `efficient_filter`를 사용하는 `AOSS`의 예입니다.

몇 가지 `python` 패키지를 설치해야 합니다.

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

## AOS(Amazon OpenSearch Service) 사용

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
