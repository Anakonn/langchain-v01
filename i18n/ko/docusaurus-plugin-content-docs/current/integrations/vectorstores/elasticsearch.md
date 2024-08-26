---
translated: true
---

# Elasticsearch

>[Elasticsearch](https://www.elastic.co/elasticsearch/)는 분산된 RESTful 검색 및 분석 엔진으로, 벡터 검색과 어휘 검색을 모두 수행할 수 있습니다. Apache Lucene 라이브러리 위에 구축되어 있습니다.

이 노트북은 `Elasticsearch` 데이터베이스와 관련된 기능을 사용하는 방법을 보여줍니다.

```python
%pip install --upgrade --quiet langchain-elasticsearch langchain-openai tiktoken langchain
```

## Elasticsearch 실행 및 연결

Elasticsearch 인스턴스를 설정하는 두 가지 주요 방법은 다음과 같습니다:

1. Elastic Cloud: Elastic Cloud는 관리되는 Elasticsearch 서비스입니다. [무료 체험](https://cloud.elastic.co/registration?utm_source=langchain&utm_content=documentation)에 가입하세요.

로그인 자격 증명이 필요 없는 Elasticsearch 인스턴스에 연결하려면 Elasticsearch URL과 인덱스 이름을 임베딩 객체와 함께 생성자에 전달하면 됩니다.

2. 로컬 Elasticsearch 설치: Elasticsearch를 로컬에서 실행하여 시작할 수 있습니다. 가장 쉬운 방법은 공식 Elasticsearch Docker 이미지를 사용하는 것입니다. 자세한 내용은 [Elasticsearch Docker 문서](https://www.elastic.co/guide/en/elasticsearch/reference/current/docker.html)를 참조하세요.

### Docker를 통한 Elasticsearch 실행

예시: 보안이 비활성화된 단일 노드 Elasticsearch 인스턴스 실행. 이는 프로덕션 환경에 적합하지 않습니다.

```bash
docker run -p 9200:9200 -e "discovery.type=single-node" -e "xpack.security.enabled=false" -e "xpack.security.http.ssl.enabled=false" docker.elastic.co/elasticsearch/elasticsearch:8.12.1
```

Elasticsearch 인스턴스가 실행되면 Elasticsearch URL과 인덱스 이름을 임베딩 객체와 함께 생성자에 전달하여 연결할 수 있습니다.

예시:

```python
from langchain_elasticsearch import ElasticsearchStore
from langchain_openai import OpenAIEmbeddings

embedding = OpenAIEmbeddings()
elastic_vector_search = ElasticsearchStore(
    es_url="http://localhost:9200",
    index_name="test_index",
    embedding=embedding
)
```

### 인증

프로덕션 환경에서는 보안을 활성화하는 것이 좋습니다. 로그인 자격 증명으로 연결하려면 `es_api_key` 또는 `es_user`와 `es_password` 매개변수를 사용할 수 있습니다.

예시:

```python
from langchain_elasticsearch import ElasticsearchStore
from langchain_openai import OpenAIEmbeddings

embedding = OpenAIEmbeddings()
elastic_vector_search = ElasticsearchStore(
    es_url="http://localhost:9200",
    index_name="test_index",
    embedding=embedding,
    es_user="elastic",
    es_password="changeme"
)
```

또한 최대 재시도 횟수 등을 구성할 수 있는 `Elasticsearch` 클라이언트 객체를 사용할 수 있습니다.

예시:

```python
import elasticsearch
from langchain_elasticsearch import ElasticsearchStore

es_client= elasticsearch.Elasticsearch(
    hosts=["http://localhost:9200"],
    es_user="elastic",
    es_password="changeme"
    max_retries=10,
)

embedding = OpenAIEmbeddings()
elastic_vector_search = ElasticsearchStore(
    index_name="test_index",
    es_connection=es_client,
    embedding=embedding,
)
```

#### "elastic" 사용자의 비밀번호를 어떻게 얻을 수 있나요?

Elastic Cloud의 "elastic" 사용자 비밀번호를 얻는 방법:
1. https://cloud.elastic.co 에서 Elastic Cloud 콘솔에 로그인합니다.
2. "Security" > "Users"로 이동합니다.
3. "elastic" 사용자를 찾아 "Edit"를 클릭합니다.
4. "Reset password"를 클릭합니다.
5. 비밀번호 재설정 지침을 따릅니다.

#### API 키를 어떻게 얻을 수 있나요?

API 키를 얻는 방법:
1. https://cloud.elastic.co 에서 Elastic Cloud 콘솔에 로그인합니다.
2. Kibana를 열고 Stack Management > API Keys로 이동합니다.
3. "Create API key"를 클릭합니다.
4. API 키의 이름을 입력하고 "Create"를 클릭합니다.
5. API 키를 복사하여 `api_key` 매개변수에 붙여넣습니다.

### Elastic Cloud

Elastic Cloud의 Elasticsearch 인스턴스에 연결하려면 `es_cloud_id` 매개변수 또는 `es_url`을 사용할 수 있습니다.

예시:

```python
from langchain_elasticsearch import ElasticsearchStore
from langchain_openai import OpenAIEmbeddings

embedding = OpenAIEmbeddings()
elastic_vector_search = ElasticsearchStore(
    es_cloud_id="<cloud_id>",
    index_name="test_index",
    embedding=embedding,
    es_user="elastic",
    es_password="changeme"
)
```

`OpenAIEmbeddings`를 사용하려면 환경에서 OpenAI API 키를 구성해야 합니다.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

## 기본 예시

이 예시에서는 "state_of_the_union.txt"를 TextLoader를 통해 로드하고, 텍스트를 500단어 청크로 나누어 각 청크를 Elasticsearch에 인덱싱합니다.

데이터가 인덱싱되면 "What did the president say about Ketanji Brown Jackson"이라는 쿼리와 가장 유사한 상위 4개 청크를 찾습니다.

Elasticsearch는 [docker](#running-elasticsearch-via-docker)를 통해 localhost:9200에서 로컬로 실행 중입니다. Elastic Cloud에서 Elasticsearch에 연결하는 방법에 대한 자세한 내용은 위의 [인증을 통한 연결](#authentication)을 참조하세요.

```python
from langchain_elasticsearch import ElasticsearchStore
from langchain_openai import OpenAIEmbeddings
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=500, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

```python
db = ElasticsearchStore.from_documents(
    docs,
    embeddings,
    es_url="http://localhost:9200",
    index_name="test-basic",
)

db.client.indices.refresh(index="test-basic")

query = "What did the president say about Ketanji Brown Jackson"
results = db.similarity_search(query)
print(results)
```

```output
[Document(page_content='One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': '../../modules/state_of_the_union.txt'}), Document(page_content='As I said last year, especially to our younger transgender Americans, I will always have your back as your President, so you can be yourself and reach your God-given potential. \n\nWhile it often appears that we never agree, that isn’t true. I signed 80 bipartisan bills into law last year. From preventing government shutdowns to protecting Asian-Americans from still-too-common hate crimes to reforming military justice.', metadata={'source': '../../modules/state_of_the_union.txt'}), Document(page_content='A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans. \n\nAnd if we are to advance liberty and justice, we need to secure the Border and fix the immigration system.', metadata={'source': '../../modules/state_of_the_union.txt'}), Document(page_content='This is personal to me and Jill, to Kamala, and to so many of you. \n\nCancer is the #2 cause of death in America–second only to heart disease. \n\nLast month, I announced our plan to supercharge  \nthe Cancer Moonshot that President Obama asked me to lead six years ago. \n\nOur goal is to cut the cancer death rate by at least 50% over the next 25 years, turn more cancers from death sentences into treatable diseases.  \n\nMore support for patients and families.', metadata={'source': '../../modules/state_of_the_union.txt'})]
```

# 메타데이터

`ElasticsearchStore`는 문서와 함께 저장되는 메타데이터를 지원합니다. 이 메타데이터 dict 객체는 Elasticsearch 문서의 메타데이터 객체 필드에 저장됩니다. 메타데이터 값에 따라 Elasticsearch는 메타데이터 객체 필드의 데이터 유형을 자동으로 설정합니다. 예를 들어 메타데이터 값이 문자열인 경우 Elasticsearch는 메타데이터 객체 필드의 매핑을 문자열 유형으로 설정합니다.

```python
# Adding metadata to documents
for i, doc in enumerate(docs):
    doc.metadata["date"] = f"{range(2010, 2020)[i % 10]}-01-01"
    doc.metadata["rating"] = range(1, 6)[i % 5]
    doc.metadata["author"] = ["John Doe", "Jane Doe"][i % 2]

db = ElasticsearchStore.from_documents(
    docs, embeddings, es_url="http://localhost:9200", index_name="test-metadata"
)

query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query)
print(docs[0].metadata)
```

```output
{'source': '../../modules/state_of_the_union.txt', 'date': '2016-01-01', 'rating': 2, 'author': 'John Doe'}
```

## 메타데이터 필터링

문서에 메타데이터를 추가하면 쿼리 시간에 메타데이터 필터링을 추가할 수 있습니다.

### 예시: 정확한 키워드로 필터링

주의: 우리는 분석되지 않은 키워드 하위 필드를 사용하고 있습니다.

```python
docs = db.similarity_search(
    query, filter=[{"term": {"metadata.author.keyword": "John Doe"}}]
)
print(docs[0].metadata)
```

```output
{'source': '../../modules/state_of_the_union.txt', 'date': '2016-01-01', 'rating': 2, 'author': 'John Doe'}
```

### 예시: 부분 일치로 필터링

이 예시는 부분 일치로 필터링하는 방법을 보여줍니다. 이는 메타데이터 필드의 정확한 값을 모를 때 유용합니다. 예를 들어 `author` 메타데이터 필드로 필터링하려고 하는데 저자의 정확한 값을 모르는 경우, 부분 일치를 사용하여 저자의 성으로 필터링할 수 있습니다. 퍼지 매칭도 지원됩니다.

"Jon"은 "John Doe"와 일치하는데, "Jon"이 "John" 토큰과 유사하기 때문입니다.

```python
docs = db.similarity_search(
    query,
    filter=[{"match": {"metadata.author": {"query": "Jon", "fuzziness": "AUTO"}}}],
)
print(docs[0].metadata)
```

```output
{'source': '../../modules/state_of_the_union.txt', 'date': '2016-01-01', 'rating': 2, 'author': 'John Doe'}
```

### 예시: 날짜 범위로 필터링

```python
docs = db.similarity_search(
    "Any mention about Fred?",
    filter=[{"range": {"metadata.date": {"gte": "2010-01-01"}}}],
)
print(docs[0].metadata)
```

```output
{'source': '../../modules/state_of_the_union.txt', 'date': '2012-01-01', 'rating': 3, 'author': 'John Doe', 'geo_location': {'lat': 40.12, 'lon': -71.34}}
```

### 예시: 숫자 범위로 필터링

```python
docs = db.similarity_search(
    "Any mention about Fred?", filter=[{"range": {"metadata.rating": {"gte": 2}}}]
)
print(docs[0].metadata)
```

```output
{'source': '../../modules/state_of_the_union.txt', 'date': '2012-01-01', 'rating': 3, 'author': 'John Doe', 'geo_location': {'lat': 40.12, 'lon': -71.34}}
```

### 예시: 지리적 거리로 필터링

`metadata.geo_location`에 대한 geo_point 매핑이 선언된 인덱스가 필요합니다.

```python
docs = db.similarity_search(
    "Any mention about Fred?",
    filter=[
        {
            "geo_distance": {
                "distance": "200km",
                "metadata.geo_location": {"lat": 40, "lon": -70},
            }
        }
    ],
)
print(docs[0].metadata)
```

필터는 위에서 언급한 것 이외에도 많은 유형의 쿼리를 지원합니다.

다음은 문서의 내용을 한국어로 번역한 것입니다:

# 거리 유사성 알고리즘

Elasticsearch는 다음과 같은 벡터 거리 유사성 알고리즘을 지원합니다:

- cosine
- euclidean
- dot_product

cosine 유사성 알고리즘이 기본값입니다.

similarity 매개변수를 통해 필요한 유사성 알고리즘을 지정할 수 있습니다.

**주의**
검색 전략에 따라 유사성 알고리즘은 쿼리 시간에 변경할 수 없습니다. 필드의 인덱스 매핑을 생성할 때 설정해야 합니다. 유사성 알고리즘을 변경해야 하는 경우 인덱스를 삭제하고 올바른 distance_strategy로 다시 생성해야 합니다.

```python

db = ElasticsearchStore.from_documents(
    docs,
    embeddings,
    es_url="http://localhost:9200",
    index_name="test",
    distance_strategy="COSINE"
    # distance_strategy="EUCLIDEAN_DISTANCE"
    # distance_strategy="DOT_PRODUCT"
)

```

# 검색 전략

Elasticsearch는 다양한 검색 전략을 지원하여 다른 벡터 데이터베이스에 비해 큰 장점을 가지고 있습니다. 이 노트북에서는 가장 일반적인 검색 전략 중 일부를 구성하는 방법을 알아보겠습니다.

기본적으로 `ElasticsearchStore`는 `ApproxRetrievalStrategy`를 사용합니다.

## ApproxRetrievalStrategy

이 전략은 쿼리 벡터와 가장 유사한 상위 `k`개의 벡터를 반환합니다. `k` 매개변수는 `ElasticsearchStore` 초기화 시 설정됩니다. 기본값은 `10`입니다.

```python
db = ElasticsearchStore.from_documents(
    docs,
    embeddings,
    es_url="http://localhost:9200",
    index_name="test",
    strategy=ElasticsearchStore.ApproxRetrievalStrategy(),
)

docs = db.similarity_search(
    query="What did the president say about Ketanji Brown Jackson?", k=10
)
```

### 예시: 하이브리드 근사 검색

이 예시에서는 근사 의미 검색과 키워드 기반 검색을 결합하는 하이브리드 검색을 구현하는 방법을 보여줍니다.

RRF를 사용하여 두 가지 검색 방법의 점수를 균형있게 조정합니다.

하이브리드 검색을 활성화하려면 `ElasticsearchStore`의 `ApproxRetrievalStrategy` 생성자에서 `hybrid=True`를 설정해야 합니다.

```python

db = ElasticsearchStore.from_documents(
    docs,
    embeddings,
    es_url="http://localhost:9200",
    index_name="test",
    strategy=ElasticsearchStore.ApproxRetrievalStrategy(
        hybrid=True,
    )
)
```

`hybrid`가 활성화되면 근사 의미 검색과 키워드 기반 검색을 결합한 쿼리가 수행됩니다.

`rrf`(Reciprocal Rank Fusion)를 사용하여 두 가지 검색 방법의 점수를 균형있게 조정합니다.

**주의** RRF는 Elasticsearch 8.9.0 이상에서 지원됩니다.

```json
{
    "knn": {
        "field": "vector",
        "filter": [],
        "k": 1,
        "num_candidates": 50,
        "query_vector": [1.0, ..., 0.0],
    },
    "query": {
        "bool": {
            "filter": [],
            "must": [{"match": {"text": {"query": "foo"}}}],
        }
    },
    "rank": {"rrf": {}},
}
```

### 예시: Elasticsearch의 임베딩 모델을 사용한 근사 검색

이 예시에서는 Elasticsearch에 배포된 임베딩 모델을 사용하여 근사 검색을 수행하는 방법을 보여줍니다.

이를 사용하려면 `ElasticsearchStore`의 `ApproxRetrievalStrategy` 생성자에서 `query_model_id` 인수를 통해 모델 ID를 지정해야 합니다.

**주의** 이 기능을 사용하려면 모델이 Elasticsearch ml 노드에 배포되어 실행되고 있어야 합니다. [노트북 예시](https://github.com/elastic/elasticsearch-labs/blob/main/notebooks/integrations/hugging-face/loading-model-from-hugging-face.md)에서 eland를 사용하여 모델을 배포하는 방법을 확인할 수 있습니다.

```python
APPROX_SELF_DEPLOYED_INDEX_NAME = "test-approx-self-deployed"

# Note: This does not have an embedding function specified
# Instead, we will use the embedding model deployed in Elasticsearch
db = ElasticsearchStore(
    es_cloud_id="<your cloud id>",
    es_user="elastic",
    es_password="<your password>",
    index_name=APPROX_SELF_DEPLOYED_INDEX_NAME,
    query_field="text_field",
    vector_query_field="vector_query_field.predicted_value",
    strategy=ElasticsearchStore.ApproxRetrievalStrategy(
        query_model_id="sentence-transformers__all-minilm-l6-v2"
    ),
)

# Setup a Ingest Pipeline to perform the embedding
# of the text field
db.client.ingest.put_pipeline(
    id="test_pipeline",
    processors=[
        {
            "inference": {
                "model_id": "sentence-transformers__all-minilm-l6-v2",
                "field_map": {"query_field": "text_field"},
                "target_field": "vector_query_field",
            }
        }
    ],
)

# creating a new index with the pipeline,
# not relying on langchain to create the index
db.client.indices.create(
    index=APPROX_SELF_DEPLOYED_INDEX_NAME,
    mappings={
        "properties": {
            "text_field": {"type": "text"},
            "vector_query_field": {
                "properties": {
                    "predicted_value": {
                        "type": "dense_vector",
                        "dims": 384,
                        "index": True,
                        "similarity": "l2_norm",
                    }
                }
            },
        }
    },
    settings={"index": {"default_pipeline": "test_pipeline"}},
)

db.from_texts(
    ["hello world"],
    es_cloud_id="<cloud id>",
    es_user="elastic",
    es_password="<cloud password>",
    index_name=APPROX_SELF_DEPLOYED_INDEX_NAME,
    query_field="text_field",
    vector_query_field="vector_query_field.predicted_value",
    strategy=ElasticsearchStore.ApproxRetrievalStrategy(
        query_model_id="sentence-transformers__all-minilm-l6-v2"
    ),
)

# Perform search
db.similarity_search("hello world", k=10)
```

## SparseVectorRetrievalStrategy (ELSER)

이 전략은 Elasticsearch의 sparse vector 검색을 사용하여 상위 k개의 결과를 검색합니다. 현재는 자체 "ELSER" 임베딩 모델만 지원합니다.

**주의** 이 기능을 사용하려면 ELSER 모델이 Elasticsearch ml 노드에 배포되어 실행되고 있어야 합니다.

이 전략을 사용하려면 `ElasticsearchStore` 생성자에서 `SparseVectorRetrievalStrategy`를 지정하면 됩니다.

```python
# Note that this example doesn't have an embedding function. This is because we infer the tokens at index time and at query time within Elasticsearch.
# This requires the ELSER model to be loaded and running in Elasticsearch.
db = ElasticsearchStore.from_documents(
    docs,
    es_cloud_id="My_deployment:dXMtY2VudHJhbDEuZ2NwLmNsb3VkLmVzLmlvOjQ0MyQ2OGJhMjhmNDc1M2Y0MWVjYTk2NzI2ZWNkMmE5YzRkNyQ3NWI4ODRjNWQ2OTU0MTYzODFjOTkxNmQ1YzYxMGI1Mw==",
    es_user="elastic",
    es_password="GgUPiWKwEzgHIYdHdgPk1Lwi",
    index_name="test-elser",
    strategy=ElasticsearchStore.SparseVectorRetrievalStrategy(),
)

db.client.indices.refresh(index="test-elser")

results = db.similarity_search(
    "What did the president say about Ketanji Brown Jackson", k=4
)
print(results[0])
```

```output
page_content='One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.' metadata={'source': '../../modules/state_of_the_union.txt'}
```

## ExactRetrievalStrategy

이 전략은 Elasticsearch의 정확한 검색(brute force로도 알려짐)을 사용하여 상위 k개의 결과를 검색합니다.

이 전략을 사용하려면 `ElasticsearchStore` 생성자에서 `ExactRetrievalStrategy`를 지정하면 됩니다.

```python

db = ElasticsearchStore.from_documents(
    docs,
    embeddings,
    es_url="http://localhost:9200",
    index_name="test",
    strategy=ElasticsearchStore.ExactRetrievalStrategy()
)
```

## BM25RetrievalStrategy

이 전략을 사용하면 벡터 검색 없이 순수 BM25를 사용하여 검색할 수 있습니다.

이 전략을 사용하려면 `ElasticsearchStore` 생성자에서 `BM25RetrievalStrategy`를 지정하면 됩니다.

아래 예시에서는 임베딩 옵션이 지정되지 않았으므로, 임베딩을 사용하지 않고 BM25로만 검색이 수행됩니다.

```python
from langchain_elasticsearch import ElasticsearchStore

db = ElasticsearchStore(
    es_url="http://localhost:9200",
    index_name="test_index",
    strategy=ElasticsearchStore.BM25RetrievalStrategy(),
)

db.add_texts(
    ["foo", "foo bar", "foo bar baz", "bar", "bar baz", "baz"],
)

results = db.similarity_search(query="foo", k=10)
print(results)
```

```output
[Document(page_content='foo'), Document(page_content='foo bar'), Document(page_content='foo bar baz')]
```

## 쿼리 사용자 정의

`custom_query` 매개변수를 사용하면 Elasticsearch에서 문서를 검색하는 데 사용되는 쿼리를 조정할 수 있습니다. 이는 더 복잡한 쿼리를 사용하거나 필드에 대한 선형 부스팅을 지원하려는 경우에 유용합니다.

```python
# Example of a custom query thats just doing a BM25 search on the text field.
def custom_query(query_body: dict, query: str):
    """Custom query to be used in Elasticsearch.
    Args:
        query_body (dict): Elasticsearch query body.
        query (str): Query string.
    Returns:
        dict: Elasticsearch query body.
    """
    print("Query Retriever created by the retrieval strategy:")
    print(query_body)
    print()

    new_query_body = {"query": {"match": {"text": query}}}

    print("Query thats actually used in Elasticsearch:")
    print(new_query_body)
    print()

    return new_query_body


results = db.similarity_search(
    "What did the president say about Ketanji Brown Jackson",
    k=4,
    custom_query=custom_query,
)
print("Results:")
print(results[0])
```

```output
Query Retriever created by the retrieval strategy:
{'query': {'bool': {'must': [{'text_expansion': {'vector.tokens': {'model_id': '.elser_model_1', 'model_text': 'What did the president say about Ketanji Brown Jackson'}}}], 'filter': []}}}

Query thats actually used in Elasticsearch:
{'query': {'match': {'text': 'What did the president say about Ketanji Brown Jackson'}}}

Results:
page_content='One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.' metadata={'source': '../../modules/state_of_the_union.txt'}
```

# 문서 빌더 사용자 정의

`doc_builder` 매개변수를 사용하면 Elasticsearch에서 검색된 데이터를 사용하여 문서를 구축하는 방식을 조정할 수 있습니다. 이는 Langchain을 사용하여 생성되지 않은 인덱스를 사용하는 경우에 특히 유용합니다.

```python
from typing import Dict

from langchain_core.documents import Document


def custom_document_builder(hit: Dict) -> Document:
    src = hit.get("_source", {})
    return Document(
        page_content=src.get("content", "Missing content!"),
        metadata={
            "page_number": src.get("page_number", -1),
            "original_filename": src.get("original_filename", "Missing filename!"),
        },
    )


results = db.similarity_search(
    "What did the president say about Ketanji Brown Jackson",
    k=4,
    doc_builder=custom_document_builder,
)
print("Results:")
print(results[0])
```

# FAQ

## 질문: Elasticsearch에 문서를 인덱싱할 때 타임아웃 오류가 발생합니다. 어떻게 해결할 수 있나요?

한 가지 가능한 문제는 문서를 Elasticsearch에 인덱싱하는 데 시간이 더 오래 걸릴 수 있다는 것입니다. ElasticsearchStore는 Elasticsearch 벌크 API를 사용하며, 타임아웃 오류 발생 가능성을 줄이기 위해 조정할 수 있는 몇 가지 기본값이 있습니다.

이는 SparseVectorRetrievalStrategy를 사용할 때도 좋은 방법입니다.

기본값은 다음과 같습니다:
- `chunk_size`: 500
- `max_chunk_bytes`: 100MB

이 값들을 조정하려면 ElasticsearchStore의 `add_texts` 메서드에 `chunk_size`와 `max_chunk_bytes` 매개변수를 전달하면 됩니다.

```python
    vector_store.add_texts(
        texts,
        bulk_kwargs={
            "chunk_size": 50,
            "max_chunk_bytes": 200000000
        }
    )
```

# ElasticsearchStore로 업그레이드하기

이미 Elasticsearch를 사용하는 Langchain 기반 프로젝트가 있다면 이전 구현인 `ElasticVectorSearch`와 `ElasticKNNSearch`를 사용하고 있을 수 있습니다. 이제 이 구현들은 더 이상 사용되지 않으며, 더 유연하고 사용하기 쉬운 새로운 구현인 `ElasticsearchStore`를 소개합니다. 이 노트북은 새로운 구현으로 업그레이드하는 과정을 안내합니다.

## 새로운 점은 무엇인가요?

---
title: 새로운 구현
---

새로운 구현은 이제 `ElasticsearchStore`라는 하나의 클래스로, 전략을 통해 approx, exact, ELSER 검색 검색을 수행할 수 있습니다.

## ElasticKNNSearch 사용

이전 구현:

```python

from langchain_community.vectorstores.elastic_vector_search import ElasticKNNSearch

db = ElasticKNNSearch(
  elasticsearch_url="http://localhost:9200",
  index_name="test_index",
  embedding=embedding
)

```

새로운 구현:

```python

from langchain_elasticsearch import ElasticsearchStore

db = ElasticsearchStore(
  es_url="http://localhost:9200",
  index_name="test_index",
  embedding=embedding,
  # if you use the model_id
  # strategy=ElasticsearchStore.ApproxRetrievalStrategy( query_model_id="test_model" )
  # if you use hybrid search
  # strategy=ElasticsearchStore.ApproxRetrievalStrategy( hybrid=True )
)

```

## ElasticVectorSearch 사용

이전 구현:

```python

from langchain_community.vectorstores.elastic_vector_search import ElasticVectorSearch

db = ElasticVectorSearch(
  elasticsearch_url="http://localhost:9200",
  index_name="test_index",
  embedding=embedding
)

```

새로운 구현:

```python

from langchain_elasticsearch import ElasticsearchStore

db = ElasticsearchStore(
  es_url="http://localhost:9200",
  index_name="test_index",
  embedding=embedding,
  strategy=ElasticsearchStore.ExactRetrievalStrategy()
)

```

```python
db.client.indices.delete(
    index="test-metadata, test-elser, test-basic",
    ignore_unavailable=True,
    allow_no_indices=True,
)
```

```output
ObjectApiResponse({'acknowledged': True})
```
