---
translated: true
---

# Elasticsearch

>[Elasticsearch](https://www.elastic.co/elasticsearch/)は、ベクトルおよび語彙検索を実行できる分散型のRESTful検索およびアナリティクスエンジンです。Apache Luceneライブラリの上に構築されています。

このノートブックでは、`Elasticsearch`データベースに関連する機能の使用方法を示します。

```python
%pip install --upgrade --quiet langchain-elasticsearch langchain-openai tiktoken langchain
```

## Elasticsearchの起動と接続

Elasticsearchインスタンスを使用するための主な2つの方法は次のとおりです:

1. Elastic Cloud: Elastic Cloudは管理されたElasticsearchサービスです。[無料トライアル](https://cloud.elastic.co/registration?utm_source=langchain&utm_content=documentation)にサインアップしてください。

ログイン資格情報を必要としないElasticsearchインスタンスに接続するには、ElasticsearchのURLとインデックス名を埋め込みオブジェクトとともにコンストラクタに渡します。

2. Elasticsearchのローカルインストール: Elasticsearchを自分でローカルで起動する方法です。最も簡単な方法は、公式のElasticsearchDockerイメージを使用することです。詳細は[Elasticsearch Dockerドキュメンテーション](https://www.elastic.co/guide/en/elasticsearch/reference/current/docker.html)を参照してください。

### Dockerを使ってElasticsearchを実行する

例: セキュリティを無効にした単一ノードのElasticsearchインスタンスを実行します。これは本番環境では推奨されません。

```bash
docker run -p 9200:9200 -e "discovery.type=single-node" -e "xpack.security.enabled=false" -e "xpack.security.http.ssl.enabled=false" docker.elastic.co/elasticsearch/elasticsearch:8.12.1
```

Elasticsearchインスタンスが起動したら、ElasticsearchのURLとインデックス名を埋め込みオブジェクトとともにコンストラクタに渡して接続できます。

例:

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

### 認証

本番環境では、セキュリティを有効にすることをお勧めします。ログイン資格情報で接続するには、`es_api_key`または`es_user`と`es_password`のパラメーターを使用できます。

例:

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

また、最大リトライ数などを設定できる`Elasticsearch`クライアントオブジェクトを使用することもできます。

例:

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

#### デフォルトの"elastic"ユーザーのパスワードを取得する方法

Elastic Cloudのデフォルトの"elastic"ユーザーのパスワードを取得するには:
1. https://cloud.elastic.coでElastic Cloudコンソールにログインします
2. "Security" > "Users"に移動します
3. "elastic"ユーザーを見つけ、"Edit"をクリックします
4. "Reset password"をクリックします
5. パスワードをリセットするための指示に従います

#### API Keyを取得する方法

API Keyを取得するには:
1. https://cloud.elastic.coでElastic Cloudコンソールにログインします
2. Kibanaを開き、Stack Management > API Keysに移動します
3. "Create API key"をクリックします
4. API Keyの名前を入力し、"Create"をクリックします
5. API Keyをコピーし、`api_key`パラメーターに貼り付けます

### Elastic Cloud

Elastic Cloudのエラスティックサーチインスタンスに接続するには、`es_cloud_id`パラメーターまたは`es_url`を使用できます。

例:

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

`OpenAIEmbeddings`を使用するには、環境にOpenAI APIキーを設定する必要があります。

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

## 基本的な例

この例では、TextLoaderを使って"state_of_the_union.txt"を読み込み、テキストを500単語のチャンクに分割し、各チャンクをElasticsearchにインデックス化します。

データがインデックス化されたら、"What did the president say about Ketanji Brown Jackson"というクエリに最も似た上位4つのチャンクを検索します。

Elasticsearchは[docker](#running-elasticsearch-via-docker)を使ってlocalhost:9200で実行されています。Elastic Cloudからの接続の詳細については、上記の[認証](#authentication)セクションを参照してください。

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

# メタデータ

`ElasticsearchStore`はメタデータをドキュメントと一緒に保存できます。このメタデータ辞書オブジェクトは、Elasticsearchドキュメントのメタデータオブジェクトフィールドに保存されます。メタデータの値に基づいて、Elasticsearchは自動的にマッピングを設定し、メタデータ値のデータ型を推測します。たとえば、メタデータ値が文字列の場合、Elasticsearchはメタデータオブジェクトフィールドの文字列型のマッピングを設定します。

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

## メタデータのフィルタリング

ドキュメントにメタデータを追加すると、クエリ時にメタデータフィルタリングを追加できます。

### 例: 完全一致キーワードでフィルタリング

注意: 解析されていないキーワードサブフィールドを使用しています。

```python
docs = db.similarity_search(
    query, filter=[{"term": {"metadata.author.keyword": "John Doe"}}]
)
print(docs[0].metadata)
```

```output
{'source': '../../modules/state_of_the_union.txt', 'date': '2016-01-01', 'rating': 2, 'author': 'John Doe'}
```

### 例: 部分一致でフィルタリング

この例は、部分一致でフィルタリングする方法を示しています。これは、メタデータフィールドの正確な値がわからない場合に便利です。たとえば、メタデータフィールド`author`でフィルタリングしたいが、著者の正確な値がわからない場合は、著者の姓で部分一致でフィルタリングできます。ファジー一致もサポートされています。

"Jon"は"John Doe"に一致します。なぜなら"Jon"は"John"トークンに近い一致だからです。

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

### 例: 日付範囲でフィルタリング

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

### 例: 数値範囲でフィルタリング

```python
docs = db.similarity_search(
    "Any mention about Fred?", filter=[{"range": {"metadata.rating": {"gte": 2}}}]
)
print(docs[0].metadata)
```

```output
{'source': '../../modules/state_of_the_union.txt', 'date': '2012-01-01', 'rating': 3, 'author': 'John Doe', 'geo_location': {'lat': 40.12, 'lon': -71.34}}
```

### 例: 地理的距離でフィルタリング

`metadata.geo_location`に地理座標のマッピングが宣言されたインデックスが必要です。

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

フィルタリングには上記以外にも多くのタイプのクエリがサポートされています。

詳細は[ドキュメンテーション](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl.html)を参照してください。

# 距離類似アルゴリズム

Elasticsearchは以下のベクトル距離類似アルゴリズムをサポートしています:

- cosine
- euclidean
- dot_product

cosine類似度アルゴリズムがデフォルトです。

similarityパラメータを使って必要な類似アルゴリズムを指定できます。

**注意**
検索戦略によっては、クエリ時にアルゴリズムを変更できません。フィールドのインデックスマッピングを作成する際に設定する必要があります。アルゴリズムを変更する場合は、インデックスを削除して正しい distance_strategy で再作成する必要があります。

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

# 検索戦略

Elasticsearchは他のベクトルデータベースに比べ、幅広い検索戦略をサポートする大きな利点があります。このノートブックでは、`ElasticsearchStore`を使ってよく使われる検索戦略を設定する方法を説明します。

デフォルトでは、`ElasticsearchStore`は`ApproxRetrievalStrategy`を使います。

## ApproxRetrievalStrategy

これはクエリベクトルに最も似た上位`k`件のベクトルを返します。`k`パラメータは`ElasticsearchStore`の初期化時に設定します。デフォルト値は`10`です。

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

### 例: ハイブリッド検索

この例では、`ElasticsearchStore`をハイブリッド検索用に設定する方法を示します。近似意味検索とキーワード検索を組み合わせて使います。

RRFを使って2つの検索手法の得点をバランスさせます。

ハイブリッド検索を有効にするには、`ElasticsearchStore`の`ApproxRetrievalStrategy`コンストラクタで`hybrid=True`を設定します。

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

`hybrid`を有効にすると、クエリは近似意味検索とキーワード検索の組み合わせで実行されます。

`rrf`(Reciprocal Rank Fusion)を使って2つの検索手法の得点をバランスさせます。

**注意** RRFにはElasticsearch 8.9.0以上が必要です。

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

### 例: Elasticsearchの埋め込みモデルを使った近似検索

この例では、`ElasticsearchStore`を使ってElasticsearchにデプロイされた埋め込みモデルで近似検索を行う方法を示します。

これを使うには、`ElasticsearchStore`の`ApproxRetrievalStrategy`コンストラクタで`query_model_id`引数にモデルIDを指定します。

**注意** これにはElasticsearchのmlノードにモデルがデプロイされ、実行中である必要があります。モデルのデプロイ方法については[ノートブックの例](https://github.com/elastic/elasticsearch-labs/blob/main/notebooks/integrations/hugging-face/loading-model-from-hugging-face.md)を参照してください。

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

この戦略はElasticsearchのスパースベクトル検索を使って上位k件を取得します。現在はESLER埋め込みモデルのみをサポートしています。

**注意** ESLERモデルがElasticsearchのmlノードにデプロイされ、実行中である必要があります。

これを使うには、`ElasticsearchStore`コンストラクタで`SparseVectorRetrievalStrategy`を指定します。

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

この戦略はElasticsearchの完全一致検索(ブルートフォース)を使って上位k件を取得します。

これを使うには、`ElasticsearchStore`コンストラクタで`ExactRetrievalStrategy`を指定します。

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

この戦略により、ベクトル検索を使わずにピュアなBM25検索を行えます。

これを使うには、`ElasticsearchStore`コンストラクタで`BM25RetrievalStrategy`を指定します。

下の例では、埋め込みオプションが指定されていないことから、埋め込みを使わずにBM25検索が行われることがわかります。

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

## クエリのカスタマイズ

`custom_query`パラメータを使うと、Elasticsearchからドキュメントを取得するクエリを調整できます。フィールドの線形ブーストなど、より複雑なクエリを使いたい場合に便利です。

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

# ドキュメントビルダーのカスタマイズ

`doc_builder`パラメータを使うと、Elasticsearchから取得したデータからドキュメントを構築する方法を調整できます。Langchainを使って作成されていないインデックスを扱う場合に特に便利です。

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

## 質問: Elasticsearchにドキュメントをインデックスする際にタイムアウトエラーが発生します。どうすればいいですか?

考えられる問題点の1つは、ドキュメントのインデックス化に時間がかかっている可能性です。ElasticsearchStoreはElasticsearchのバルクAPIを使用しますが、タイムアウトを回避するためのデフォルト設定があります。

SparseVectorRetrievalStrategyを使う場合にも、これらの設定を調整するのが良いでしょう。

デフォルトの設定は以下の通りです:
- `chunk_size`: 500
- `max_chunk_bytes`: 100MB

これらの設定を調整するには、ElasticsearchStoreの`add_texts`メソッドで`chunk_size`と`max_chunk_bytes`パラメータを渡します。

```python
    vector_store.add_texts(
        texts,
        bulk_kwargs={
            "chunk_size": 50,
            "max_chunk_bytes": 200000000
        }
    )
```

# ElasticsearchStoreへのアップグレード

LangchainベースのプロジェクトでElasticsearchを既に使っている場合、古い実装の`ElasticVectorSearch`と`ElasticKNNSearch`を使っている可能性があります。これらは現在非推奨となっており、より柔軟で使いやすい新しい実装の`ElasticsearchStore`が導入されました。このノートブックでは、新しい実装への移行プロセスを説明します。

## 新しい点は何ですか?

新しい実装では、`ApproxRetrievalStrategy`、`ExactRetrievalStrategy`、`SparseVectorRetrievalStrategy`などの戦略を使い分けられる単一のクラス`ElasticsearchStore`が提供されています。

## ElasticKNNSearchを使っている場合

古い実装:

```python

from langchain_community.vectorstores.elastic_vector_search import ElasticKNNSearch

db = ElasticKNNSearch(
  elasticsearch_url="http://localhost:9200",
  index_name="test_index",
  embedding=embedding
)

```

新しい実装:

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

## ElasticVectorSearchを使っている場合

古い実装:

```python

from langchain_community.vectorstores.elastic_vector_search import ElasticVectorSearch

db = ElasticVectorSearch(
  elasticsearch_url="http://localhost:9200",
  index_name="test_index",
  embedding=embedding
)

```

新しい実装:

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
