---
translated: true
---

# Elasticsearch

>[Elasticsearch](https://www.elastic.co/elasticsearch/)は、分散型のRESTfulな検索およびアナリティクスエンジンです。分散型、マルチテナント対応の全文検索エンジンを提供し、HTTPウェブインターフェースとスキーマフリーのJSONドキュメントをサポートしています。キーワード検索、ベクトル検索、ハイブリッド検索、複雑なフィルタリングに対応しています。

`ElasticsearchRetriever`は、[クエリDSL](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl.html)を通じて`Elasticsearch`の機能にフレキシブルにアクセスできるようにするための汎用ラッパーです。ほとんどのユースケースでは、他のクラス(`ElasticsearchStore`、`ElasticsearchEmbeddings`など)で十分ですが、それらでは不十分な場合は`ElasticsearchRetriever`を使用できます。

```python
%pip install --upgrade --quiet elasticsearch langchain-elasticsearch
```

```python
from typing import Any, Dict, Iterable

from elasticsearch import Elasticsearch
from elasticsearch.helpers import bulk
from langchain.embeddings import DeterministicFakeEmbedding
from langchain_core.documents import Document
from langchain_core.embeddings import Embeddings
from langchain_elasticsearch import ElasticsearchRetriever
```

## 設定

ここでは、Elasticsearchへの接続を定義します。この例では、ローカルで実行中のインスタンスを使用しています。または、[Elastic Cloud](https://cloud.elastic.co/)でアカウントを作成し、[無料トライアル](https://www.elastic.co/cloud/cloud-trial-overview)を開始することもできます。

```python
es_url = "http://localhost:9200"
es_client = Elasticsearch(hosts=[es_url])
es_client.info()
```

ベクトル検索の場合、ここでは単に擬似的なランダムエンベディングを使用しています。実際のユースケースでは、利用可能なLangChain`Embeddings`クラスの1つを選択してください。

```python
embeddings = DeterministicFakeEmbedding(size=3)
```

## サンプルデータの定義

```python
index_name = "test-langchain-retriever"
text_field = "text"
dense_vector_field = "fake_embedding"
num_characters_field = "num_characters"
texts = [
    "foo",
    "bar",
    "world",
    "hello world",
    "hello",
    "foo bar",
    "bla bla foo",
]
```

## データのインデックス化

通常、ユーザーは既にElasticsearchのインデックスにデータがある場合に`ElasticsearchRetriever`を使用します。ここでは、サンプルのテキストドキュメントをインデックス化しています。`ElasticsearchStore.from_documents`を使ってインデックスを作成した場合は、それでも問題ありません。

```python
def create_index(
    es_client: Elasticsearch,
    index_name: str,
    text_field: str,
    dense_vector_field: str,
    num_characters_field: str,
):
    es_client.indices.create(
        index=index_name,
        mappings={
            "properties": {
                text_field: {"type": "text"},
                dense_vector_field: {"type": "dense_vector"},
                num_characters_field: {"type": "integer"},
            }
        },
    )


def index_data(
    es_client: Elasticsearch,
    index_name: str,
    text_field: str,
    dense_vector_field: str,
    embeddings: Embeddings,
    texts: Iterable[str],
    refresh: bool = True,
) -> None:
    create_index(
        es_client, index_name, text_field, dense_vector_field, num_characters_field
    )

    vectors = embeddings.embed_documents(list(texts))
    requests = [
        {
            "_op_type": "index",
            "_index": index_name,
            "_id": i,
            text_field: text,
            dense_vector_field: vector,
            num_characters_field: len(text),
        }
        for i, (text, vector) in enumerate(zip(texts, vectors))
    ]

    bulk(es_client, requests)

    if refresh:
        es_client.indices.refresh(index=index_name)

    return len(requests)
```

```python
index_data(es_client, index_name, text_field, dense_vector_field, embeddings, texts)
```

```output
7
```

## 使用例

### ベクトル検索

この例では、擬似的なエンベディングを使用したデンスベクトル検索。

```python
def vector_query(search_query: str) -> Dict:
    vector = embeddings.embed_query(search_query)  # same embeddings as for indexing
    return {
        "knn": {
            "field": dense_vector_field,
            "query_vector": vector,
            "k": 5,
            "num_candidates": 10,
        }
    }


vector_retriever = ElasticsearchRetriever.from_es_params(
    index_name=index_name,
    body_func=vector_query,
    content_field=text_field,
    url=es_url,
)

vector_retriever.invoke("foo")
```

```output
[Document(page_content='foo', metadata={'_index': 'test-langchain-index', '_id': '0', '_score': 1.0, '_source': {'fake_embedding': [-2.336764233933763, 0.27510289545940503, -0.7957597268194339], 'num_characters': 3}}),
 Document(page_content='world', metadata={'_index': 'test-langchain-index', '_id': '2', '_score': 0.6770179, '_source': {'fake_embedding': [-0.7041151202179595, -1.4652961969276497, -0.25786766898672847], 'num_characters': 5}}),
 Document(page_content='hello world', metadata={'_index': 'test-langchain-index', '_id': '3', '_score': 0.4816144, '_source': {'fake_embedding': [0.42728413221815387, -1.1889908285425348, -1.445433230084671], 'num_characters': 11}}),
 Document(page_content='hello', metadata={'_index': 'test-langchain-index', '_id': '4', '_score': 0.46853775, '_source': {'fake_embedding': [-0.28560441330564046, 0.9958894823084921, 1.5489829880195058], 'num_characters': 5}}),
 Document(page_content='foo bar', metadata={'_index': 'test-langchain-index', '_id': '5', '_score': 0.2086992, '_source': {'fake_embedding': [0.2533670476638539, 0.08100381646160418, 0.7763644080870179], 'num_characters': 7}})]
```

### BM25

従来のキーワードマッチング。

```python
def bm25_query(search_query: str) -> Dict:
    return {
        "query": {
            "match": {
                text_field: search_query,
            },
        },
    }


bm25_retriever = ElasticsearchRetriever.from_es_params(
    index_name=index_name,
    body_func=bm25_query,
    content_field=text_field,
    url=es_url,
)

bm25_retriever.invoke("foo")
```

```output
[Document(page_content='foo', metadata={'_index': 'test-langchain-index', '_id': '0', '_score': 0.9711467, '_source': {'fake_embedding': [-2.336764233933763, 0.27510289545940503, -0.7957597268194339], 'num_characters': 3}}),
 Document(page_content='foo bar', metadata={'_index': 'test-langchain-index', '_id': '5', '_score': 0.7437035, '_source': {'fake_embedding': [0.2533670476638539, 0.08100381646160418, 0.7763644080870179], 'num_characters': 7}}),
 Document(page_content='bla bla foo', metadata={'_index': 'test-langchain-index', '_id': '6', '_score': 0.6025789, '_source': {'fake_embedding': [1.7365927060137358, -0.5230400847844948, 0.7978339724186192], 'num_characters': 11}})]
```

### ハイブリッド検索

[Reciprocal Rank Fusion](https://www.elastic.co/guide/en/elasticsearch/reference/current/rrf.html)(RRF)を使用してベクトル検索とBM25検索の結果セットを組み合わせたもの。

```python
def hybrid_query(search_query: str) -> Dict:
    vector = embeddings.embed_query(search_query)  # same embeddings as for indexing
    return {
        "query": {
            "match": {
                text_field: search_query,
            },
        },
        "knn": {
            "field": dense_vector_field,
            "query_vector": vector,
            "k": 5,
            "num_candidates": 10,
        },
        "rank": {"rrf": {}},
    }


hybrid_retriever = ElasticsearchRetriever.from_es_params(
    index_name=index_name,
    body_func=hybrid_query,
    content_field=text_field,
    url=es_url,
)

hybrid_retriever.invoke("foo")
```

```output
[Document(page_content='foo', metadata={'_index': 'test-langchain-index', '_id': '0', '_score': 0.9711467, '_source': {'fake_embedding': [-2.336764233933763, 0.27510289545940503, -0.7957597268194339], 'num_characters': 3}}),
 Document(page_content='foo bar', metadata={'_index': 'test-langchain-index', '_id': '5', '_score': 0.7437035, '_source': {'fake_embedding': [0.2533670476638539, 0.08100381646160418, 0.7763644080870179], 'num_characters': 7}}),
 Document(page_content='bla bla foo', metadata={'_index': 'test-langchain-index', '_id': '6', '_score': 0.6025789, '_source': {'fake_embedding': [1.7365927060137358, -0.5230400847844948, 0.7978339724186192], 'num_characters': 11}})]
```

### ファジー一致

タイプミスに寛容なキーワードマッチング。

```python
def fuzzy_query(search_query: str) -> Dict:
    return {
        "query": {
            "match": {
                text_field: {
                    "query": search_query,
                    "fuzziness": "AUTO",
                }
            },
        },
    }


fuzzy_retriever = ElasticsearchRetriever.from_es_params(
    index_name=index_name,
    body_func=fuzzy_query,
    content_field=text_field,
    url=es_url,
)

fuzzy_retriever.invoke("fox")  # note the character tolernace
```

```output
[Document(page_content='foo', metadata={'_index': 'test-langchain-index', '_id': '0', '_score': 0.6474311, '_source': {'fake_embedding': [-2.336764233933763, 0.27510289545940503, -0.7957597268194339], 'num_characters': 3}}),
 Document(page_content='foo bar', metadata={'_index': 'test-langchain-index', '_id': '5', '_score': 0.49580228, '_source': {'fake_embedding': [0.2533670476638539, 0.08100381646160418, 0.7763644080870179], 'num_characters': 7}}),
 Document(page_content='bla bla foo', metadata={'_index': 'test-langchain-index', '_id': '6', '_score': 0.40171927, '_source': {'fake_embedding': [1.7365927060137358, -0.5230400847844948, 0.7978339724186192], 'num_characters': 11}})]
```

### 複雑なフィルタリング

さまざまなフィールドに対するフィルタの組み合わせ。

```python
def filter_query_func(search_query: str) -> Dict:
    return {
        "query": {
            "bool": {
                "must": [
                    {"range": {num_characters_field: {"gte": 5}}},
                ],
                "must_not": [
                    {"prefix": {text_field: "bla"}},
                ],
                "should": [
                    {"match": {text_field: search_query}},
                ],
            }
        }
    }


filtering_retriever = ElasticsearchRetriever.from_es_params(
    index_name=index_name,
    body_func=filter_query_func,
    content_field=text_field,
    url=es_url,
)

filtering_retriever.invoke("foo")
```

```output
[Document(page_content='foo bar', metadata={'_index': 'test-langchain-index', '_id': '5', '_score': 1.7437035, '_source': {'fake_embedding': [0.2533670476638539, 0.08100381646160418, 0.7763644080870179], 'num_characters': 7}}),
 Document(page_content='world', metadata={'_index': 'test-langchain-index', '_id': '2', '_score': 1.0, '_source': {'fake_embedding': [-0.7041151202179595, -1.4652961969276497, -0.25786766898672847], 'num_characters': 5}}),
 Document(page_content='hello world', metadata={'_index': 'test-langchain-index', '_id': '3', '_score': 1.0, '_source': {'fake_embedding': [0.42728413221815387, -1.1889908285425348, -1.445433230084671], 'num_characters': 11}}),
 Document(page_content='hello', metadata={'_index': 'test-langchain-index', '_id': '4', '_score': 1.0, '_source': {'fake_embedding': [-0.28560441330564046, 0.9958894823084921, 1.5489829880195058], 'num_characters': 5}})]
```

クエリマッチが上位にあることに注意してください。フィルターを通過した他のドキュメントも結果セットに含まれていますが、すべて同じスコアになっています。

### カスタムドキュメントマッパー

Elasticsearchの結果(hit)をLangChainのドキュメントにマッピングする関数をカスタマイズすることができます。

```python
def num_characters_mapper(hit: Dict[str, Any]) -> Document:
    num_chars = hit["_source"][num_characters_field]
    content = hit["_source"][text_field]
    return Document(
        page_content=f"This document has {num_chars} characters",
        metadata={"text_content": content},
    )


custom_mapped_retriever = ElasticsearchRetriever.from_es_params(
    index_name=index_name,
    body_func=filter_query_func,
    document_mapper=num_characters_mapper,
    url=es_url,
)

custom_mapped_retriever.invoke("foo")
```

```output
[Document(page_content='This document has 7 characters', metadata={'text_content': 'foo bar'}),
 Document(page_content='This document has 5 characters', metadata={'text_content': 'world'}),
 Document(page_content='This document has 11 characters', metadata={'text_content': 'hello world'}),
 Document(page_content='This document has 5 characters', metadata={'text_content': 'hello'})]
```
