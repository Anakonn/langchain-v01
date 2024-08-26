---
translated: true
---

# ElasticSearch BM25

>[Elasticsearch](https://www.elastic.co/elasticsearch/)は、分散型のRESTful検索およびアナリティクスエンジンです。分散型、マルチテナント対応の全文検索エンジンを提供し、HTTPウェブインターフェースとスキーマフリーのJSONドキュメントを備えています。

>情報検索の分野では、[Okapi BM25](https://en.wikipedia.org/wiki/Okapi_BM25)（BMは「best matching」の略）は、検索クエリに対する文書の関連性を推定するために検索エンジンで使用される順位付け関数です。これは、1970年代と1980年代にStephen E. Robertson、Karen Spärck Jonesらによって開発された確率的検索フレームワークに基づいています。

>実際の順位付け関数の名称はBM25です。より完全な名称であるOkapi BM25には、1980年代と1990年代にロンドンのCity Universityで実装されたOkapi情報検索システムの名称が含まれています。BM25およびその新しい派生版であるBM25F（ドキュメントの構造とアンカーテキストを考慮できるBM25のバージョン）は、ドキュメント検索で使用されるTF-IDF型の検索関数を表しています。

このノートブックでは、`ElasticSearch`と`BM25`を使用するリトリーバーの使用方法を示します。

BM25の詳細については、[このブログ記事](https://www.elastic.co/blog/practical-bm25-part-2-the-bm25-algorithm-and-its-variables)を参照してください。

```python
%pip install --upgrade --quiet  elasticsearch
```

```python
from langchain_community.retrievers import (
    ElasticSearchBM25Retriever,
)
```

## 新しいリトリーバーの作成

```python
elasticsearch_url = "http://localhost:9200"
retriever = ElasticSearchBM25Retriever.create(elasticsearch_url, "langchain-index-4")
```

```python
# Alternatively, you can load an existing index
# import elasticsearch
# elasticsearch_url="http://localhost:9200"
# retriever = ElasticSearchBM25Retriever(elasticsearch.Elasticsearch(elasticsearch_url), "langchain-index")
```

## テキストの追加（必要な場合）

必要に応じて、リトリーバーにテキストを追加することができます（まだ含まれていない場合）

```python
retriever.add_texts(["foo", "bar", "world", "hello", "foo bar"])
```

```output
['cbd4cb47-8d9f-4f34-b80e-ea871bc49856',
 'f3bd2e24-76d1-4f9b-826b-ec4c0e8c7365',
 '8631bfc8-7c12-48ee-ab56-8ad5f373676e',
 '8be8374c-3253-4d87-928d-d73550a2ecf0',
 'd79f457b-2842-4eab-ae10-77aa420b53d7']
```

## リトリーバーの使用

リトリーバーを使用することができます!

```python
result = retriever.invoke("foo")
```

```python
result
```

```output
[Document(page_content='foo', metadata={}),
 Document(page_content='foo bar', metadata={})]
```
