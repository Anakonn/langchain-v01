---
translated: true
---

# ClickHouse

> [ClickHouse](https://clickhouse.com/)は、フル SQL サポートと分析クエリの作成を支援する幅広い機能を備えた、リアルタイムアプリケーションとアナリティクスに最適な、最速かつリソース効率の良いオープンソースデータベースです。最近追加されたデータ構造と距離検索機能(L2Distance など)、および[近似最近傍検索インデックス](https://clickhouse.com/docs/en/engines/table-engines/mergetree-family/annindexes)により、ClickHouseはベクトルデータベースとしても高性能かつスケーラブルに使用できるようになりました。

このノートブックでは、ClickHouseのベクトル検索機能の使用方法を示します。

## 環境設定

(オプション) Dockerを使用してローカルのClickHouseサーバーを設定する

```python
! docker run -d -p 8123:8123 -p9000:9000 --name langchain-clickhouse-server --ulimit nofile=262144:262144 clickhouse/clickhouse-server:23.4.2.11
```

ClickHouseクライアントドライバーのセットアップ

```python
%pip install --upgrade --quiet  clickhouse-connect
```

OpenAIエンベディングを使用するには、OpenAI APIキーを取得する必要があります。

```python
import getpass
import os

if not os.environ["OPENAI_API_KEY"]:
    os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```python
from langchain_community.vectorstores import Clickhouse, ClickhouseSettings
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

```python
for d in docs:
    d.metadata = {"some": "metadata"}
settings = ClickhouseSettings(table="clickhouse_vector_search_example")
docsearch = Clickhouse.from_documents(docs, embeddings, config=settings)

query = "What did the president say about Ketanji Brown Jackson"
docs = docsearch.similarity_search(query)
```

```output
Inserting data...: 100%|██████████| 42/42 [00:00<00:00, 2801.49it/s]
```

```python
print(docs[0].page_content)
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

## 接続情報とデータスキーマの取得

```python
print(str(docsearch))
```

```output
[92m[1mdefault.clickhouse_vector_search_example @ localhost:8123[0m

[1musername: None[0m

Table Schema:
---------------------------------------------------
|[94mid                      [0m|[96mNullable(String)        [0m|
|[94mdocument                [0m|[96mNullable(String)        [0m|
|[94membedding               [0m|[96mArray(Float32)          [0m|
|[94mmetadata                [0m|[96mObject('json')          [0m|
|[94muuid                    [0m|[96mUUID                    [0m|
---------------------------------------------------
```

### ClickHouseテーブルスキーマ

> ClickHouseテーブルは、デフォルトで自動的に作成されます。高度なユーザーは、最適化された設定でテーブルを事前に作成できます。シャーディング付きの分散ClickHouseクラスターの場合、テーブルエンジンは `Distributed` として構成する必要があります。

```python
print(f"Clickhouse Table DDL:\n\n{docsearch.schema}")
```

```output
Clickhouse Table DDL:

CREATE TABLE IF NOT EXISTS default.clickhouse_vector_search_example(
    id Nullable(String),
    document Nullable(String),
    embedding Array(Float32),
    metadata JSON,
    uuid UUID DEFAULT generateUUIDv4(),
    CONSTRAINT cons_vec_len CHECK length(embedding) = 1536,
    INDEX vec_idx embedding TYPE annoy(100,'L2Distance') GRANULARITY 1000
) ENGINE = MergeTree ORDER BY uuid SETTINGS index_granularity = 8192
```

## フィルタリング

ClickHouseのSQL `WHERE`句に直接アクセスできます。標準SQLに従って `WHERE`句を記述できます。

**注意**: SQLインジェクションに気をつけてください。このインターフェイスは、エンドユーザーから直接呼び出してはいけません。

`column_map`をカスタマイズしている場合は、次のようにフィルタリングできます:

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Clickhouse, ClickhouseSettings

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()

for i, d in enumerate(docs):
    d.metadata = {"doc_id": i}

docsearch = Clickhouse.from_documents(docs, embeddings)
```

```output
Inserting data...: 100%|██████████| 42/42 [00:00<00:00, 6939.56it/s]
```

```python
meta = docsearch.metadata_column
output = docsearch.similarity_search_with_relevance_scores(
    "What did the president say about Ketanji Brown Jackson?",
    k=4,
    where_str=f"{meta}.doc_id<10",
)
for d, dist in output:
    print(dist, d.metadata, d.page_content[:20] + "...")
```

```output
0.6779101415357189 {'doc_id': 0} Madam Speaker, Madam...
0.6997970363474885 {'doc_id': 8} And so many families...
0.7044504914336727 {'doc_id': 1} Groups of citizens b...
0.7053558702165094 {'doc_id': 6} And I’m taking robus...
```

## データの削除

```python
docsearch.drop()
```
