---
translated: true
---

# Redis

>[Redis vector database](https://redis.io/docs/get-started/vector-database/) の紹介と langchain 統合ガイド。

## Redis とは？

ほとんどのウェブサービス開発者は `Redis` に精通しています。基本的に、`Redis` はオープンソースのキー・バリュー・ストアで、キャッシュ、メッセージ・ブローカー、データベースとして使用されます。開発者が `Redis` を選ぶ理由は、それが高速であり、多くのクライアントライブラリのエコシステムを持ち、大企業によって長年にわたって導入されてきたからです。

これらの従来の使用ケースに加えて、`Redis` は検索およびクエリ機能などの追加機能を提供し、ユーザーが `Redis` 内で二次インデックス構造を作成できるようにします。これにより、`Redis` はキャッシュの速度でベクターデータベースとして機能します。

## ベクターデータベースとしての Redis

`Redis` は、低メモリフットプリントで高速なインデックス作成を実現するために圧縮された逆インデックスを使用します。また、以下のような高度な機能をサポートしています：

* Redis ハッシュおよび `JSON` の複数フィールドのインデックス作成
* ベクター類似性検索 (`HNSW` (ANN) または `FLAT` (KNN) を使用)
* ベクター範囲検索（例：クエリベクターの半径内のすべてのベクターを見つける）
* パフォーマンスの低下なしにインクリメンタルインデックス作成
* ドキュメントのランキング（[tf-idf](https://en.wikipedia.org/wiki/Tf%E2%80%93idf) を使用し、オプションでユーザー提供の重み付け）
* フィールドの重み付け
* `AND`、`OR`、`NOT` 演算子を使用した複雑なブールクエリ
* プレフィックスマッチング、ファジーマッチング、および正確なフレーズクエリ
* [ダブルメタフォン音声マッチング](https://redis.io/docs/stack/search/reference/phonetic_matching/) のサポート
* オートコンプリートサジェスチョン（ファジープレフィックスサジェスチョンを含む）
* [多くの言語](https://redis.io/docs/stack/search/reference/stemming/) でのステミングベースのクエリ拡張（[Snowball](http://snowballstem.org/)) を使用）
* [Friso](https://github.com/lionsoul2014/friso)) を使用した中国語のトークン化とクエリのサポート
* 数値フィルターと範囲
* Redis の地理空間インデックスを使用した地理空間検索
* 強力な集約エンジン
* すべての `utf-8` エンコードされたテキストのサポート
* フルドキュメント、選択されたフィールド、またはドキュメント ID のみの取得
* 結果のソート（例えば、作成日による）

## クライアント

`Redis` は単なるベクターデータベース以上のものであるため、`LangChain` 統合以外にも `Redis` クライアントの使用を要求するユースケースがしばしばあります。標準的な `Redis` クライアントライブラリを使用して検索およびクエリコマンドを実行できますが、検索およびクエリア API をラップするライブラリを使用するのが最も簡単です。以下はいくつかの例ですが、他のクライアントライブラリは[こちら](https://redis.io/resources/clients/)にあります。

| プロジェクト | 言語 | ライセンス | 著者 | スター |
|--------------|------|------------|------|--------|
| [jedis][jedis-url] | Java | MIT | [Redis][redis-url] | ![Stars][jedis-stars] |
| [redisvl][redisvl-url] | Python | MIT | [Redis][redis-url] | ![Stars][redisvl-stars] |
| [redis-py][redis-py-url] | Python | MIT | [Redis][redis-url] | ![Stars][redis-py-stars] |
| [node-redis][node-redis-url] | Node.js | MIT | [Redis][redis-url] | ![Stars][node-redis-stars] |
| [nredisstack][nredisstack-url] | .NET | MIT | [Redis][redis-url] | ![Stars][nredisstack-stars] |

[redis-url]: https://redis.com

[redisvl-url]: https://github.com/RedisVentures/redisvl
[redisvl-stars]: https://img.shields.io/github/stars/RedisVentures/redisvl.svg?style=social&amp;label=Star&amp;maxAge=2592000
[redisvl-package]: https://pypi.python.org/pypi/redisvl

[redis-py-url]: https://github.com/redis/redis-py
[redis-py-stars]: https://img.shields.io/github/stars/redis/redis-py.svg?style=social&amp;label=Star&amp;maxAge=2592000
[redis-py-package]: https://pypi.python.org/pypi/redis

[jedis-url]: https://github.com/redis/jedis
[jedis-stars]: https://img.shields.io/github/stars/redis/jedis.svg?style=social&amp;label=Star&amp;maxAge=2592000
[Jedis-package]: https://search.maven.org/artifact/redis.clients/jedis

[nredisstack-url]: https://github.com/redis/nredisstack
[nredisstack-stars]: https://img.shields.io/github/stars/redis/nredisstack.svg?style=social&amp;label=Star&amp;maxAge=2592000
[nredisstack-package]: https://www.nuget.org/packages/nredisstack/

[node-redis-url]: https://github.com/redis/node-redis
[node-redis-stars]: https://img.shields.io/github/stars/redis/node-redis.svg?style=social&amp;label=Star&amp;maxAge=2592000
[node-redis-package]: https://www.npmjs.com/package/redis

[redis-om-python-url]: https://github.com/redis/redis-om-python
[redis-om-python-author]: https://redis.com
[redis-om-python-stars]: https://img.shields.io/github/stars/redis/redis-om-python.svg?style=social&amp;label=Star&amp;maxAge=2592000

[redisearch-go-url]: https://github.com/RediSearch/redisearch-go
[redisearch-go-author]: https://redis.com
[redisearch-go-stars]: https://img.shields.io/github/stars/RediSearch/redisearch-go.svg?style=social&amp;label=Star&amp;maxAge=2592000

[redisearch-api-rs-url]: https://github.com/RediSearch/redisearch-api-rs
[redisearch-api-rs-author]: https://redis.com
[redisearch-api-rs-stars]: https://img.shields.io/github/stars/RediSearch/redisearch-api-rs.svg?style=social&amp;label=Star&amp;maxAge=2592000

## デプロイオプション

RediSearch と共に Redis をデプロイする方法は多岐にわたります。最も簡単な方法は Docker を使用することですが、他にも多くのデプロイオプションがあります。

- [Redis Cloud](https://redis.com/redis-enterprise-cloud/overview/)
- [Docker (Redis Stack)](https://hub.docker.com/r/redis/redis-stack)
- クラウドマーケットプレイス: [AWS Marketplace](https://aws.amazon.com/marketplace/pp/prodview-e6y7ork67pjwg?sr=0-2&ref_=beagle&applicationId=AWSMPContessa)、[Google Marketplace](https://console.cloud.google.com/marketplace/details/redislabs-public/redis-enterprise?pli=1)、または [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps/garantiadata.redis_enterprise_1sp_public_preview?tab=Overview)
- オンプレミス: [Redis Enterprise Software](https://redis.com/redis-enterprise-software/overview/)
- Kubernetes: [Redis Enterprise Software on Kubernetes](https://docs.redis.com/latest/kubernetes/)

## 追加の例

多くの例が [Redis AI チームの GitHub](https://github.com/RedisVentures/) にあります。

- [Awesome Redis AI Resources](https://github.com/RedisVentures/redis-ai-resources) - AI ワークロードでの Redis の使用例のリスト
- [Azure OpenAI Embeddings Q&A](https://github.com/ruoccofabrizio/azure-open-ai-embeddings-qna) - Azure 上での Q&A サービスとしての OpenAI と Redis。
- [ArXiv Paper Search](https://github.com/RedisVentures/redis-arXiv-search) - arXiv 学術論文のセマンティック検索
- [Vector Search on Azure](https://learn.microsoft.com/azure/azure-cache-for-redis/cache-tutorial-vector-similarity) - Azure Cache for Redis と Azure OpenAI を使用した Azure 上のベクター検索

## その他のリソース

Redis をベクターデータベースとして使用する方法についての詳細は、以下のリソースを参照してください。

- [RedisVL Documentation](https://redisvl.com) - Redis Vector Library クライアントのドキュメント
- [Redis Vector Similarity Docs](https://redis.io/docs/stack/search/reference/vectors/) - ベクター検索に関する Redis の公式ドキュメント。
- [Redis-py Search Docs](https://redis.readthedocs.io/en/latest/redismodules.html#redisearch-commands) - redis-py クライアントライブラリのドキュメント
- [Vector Similarity Search: From Basics to Production](https://mlops.community/vector-similarity-search-from-basics-to-production/) - VSS としての Redis をベクタデータベースとして紹介するブログ記事。

## セットアップ

### Redis Python クライアントのインストール

`Redis-py` は Redis によって公式にサポートされているクライアントです。最近リリースされた `RedisVL` クライアントは、ベクターデータベースのユースケースに特化して構築されています。どちらも pip でインストールできます。

```python
%pip install --upgrade --quiet  redis redisvl langchain-openai tiktoken
```

`OpenAIEmbeddings` を使用したいので、OpenAI API キーを取得する必要があります。

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```python
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings()
```

### ローカルでの Redis のデプロイ

ローカルで Redis をデプロイするには、次を実行します：

```console
docker run -d -p 6379:6379 -p 8001:8001 redis/redis-stack:latest
```

すべてが正しく動作している場合、`http://localhost:8001` に素敵な Redis UI が表示されるはずです。他のデプロイ方法については、上記の [デプロイオプション](#deployment-options) セクションを参照してください。

### Redis 接続 URL スキーマ

有効な Redis URL スキーマは以下の通りです：
1. `redis://`  - Redis スタンドアローンへの接続、暗号化なし
2. `rediss://` - TLS 暗号化を使用した Redis スタンドアローンへの接続
3. `redis+sentinel://`  - Redis Sentinel 経由で Redis サーバーへの接続、暗号化なし
4. `rediss+sentinel://` - Redis Sentinel 経由での Redis サーバーへの接続、TLS 暗号化付き

追加の接続パラメータについての詳細は、[redis-py ドキュメント](https://redis-py.readthedocs.io/en/stable/connections.html) を参照してください。

```python
# connection to redis standalone at localhost, db 0, no password
redis_url = "redis://localhost:6379"
# connection to host "redis" port 7379 with db 2 and password "secret" (old style authentication scheme without username / pre 6.x)
redis_url = "redis://:secret@redis:7379/2"
# connection to host redis on default port with user "joe", pass "secret" using redis version 6+ ACLs
redis_url = "redis://joe:secret@redis/0"

# connection to sentinel at localhost with default group mymaster and db 0, no password
redis_url = "redis+sentinel://localhost:26379"
# connection to sentinel at host redis with default port 26379 and user "joe" with password "secret" with default group mymaster and db 0
redis_url = "redis+sentinel://joe:secret@redis"
# connection to sentinel, no auth with sentinel monitoring group "zone-1" and database 2
redis_url = "redis+sentinel://redis:26379/zone-1/2"

# connection to redis standalone at localhost, db 0, no password but with TLS support
redis_url = "rediss://localhost:6379"
# connection to redis sentinel at localhost and default port, db 0, no password
# but with TLS support for booth Sentinel and Redis server
redis_url = "rediss+sentinel://localhost"
```

### サンプルデータ

まず、Redis ベクターストアのさまざまな属性を示すために、いくつかのサンプルデータを説明します。

```python
metadata = [
    {
        "user": "john",
        "age": 18,
        "job": "engineer",
        "credit_score": "high",
    },
    {
        "user": "derrick",
        "age": 45,
        "job": "doctor",
        "credit_score": "low",
    },
    {
        "user": "nancy",
        "age": 94,
        "job": "doctor",
        "credit_score": "high",
    },
    {
        "user": "tyler",
        "age": 100,
        "job": "engineer",
        "credit_score": "high",
    },
    {
        "user": "joe",
        "age": 35,
        "job": "dentist",
        "credit_score": "medium",
    },
]
texts = ["foo", "foo", "foo", "bar", "bar"]
```

### Redis vector store を作成する

Redis VectorStore インスタンスは、さまざまな方法で初期化できます。Redis VectorStore インスタンスを初期化するためのクラスメソッドが複数あります。

- ``Redis.__init__`` - 直接初期化
- ``Redis.from_documents`` - ``Langchain.docstore.Document`` オブジェクトのリストから初期化
- ``Redis.from_texts`` - テキストのリストから初期化（オプションでメタデータ付き）
- ``Redis.from_texts_return_keys`` - テキストのリストから初期化（オプションでメタデータ付き）し、キーを返す
- ``Redis.from_existing_index`` - 既存の Redis インデックスから初期化

以下では ``Redis.from_texts`` メソッドを使用します。

```python
from langchain_community.vectorstores.redis import Redis

rds = Redis.from_texts(
    texts,
    embeddings,
    metadatas=metadata,
    redis_url="redis://localhost:6379",
    index_name="users",
)
```

```python
rds.index_name
```

```output
'users'
```

## 作成されたインデックスの検査

``Redis`` VectorStore オブジェクトが構築されると、まだ存在しない場合は Redis にインデックスが作成されます。インデックスは ``rvl`` と ``redis-cli`` コマンドラインツールの両方で検査できます。上記で ``redisvl`` をインストールした場合、``rvl`` コマンドラインツールを使用してインデックスを検査できます。

```python
# assumes you're running Redis locally (use --host, --port, --password, --username, to change this)
!rvl index listall
```

```output
[32m16:58:26[0m [34m[RedisVL][0m [1;30mINFO[0m   Indices:
[32m16:58:26[0m [34m[RedisVL][0m [1;30mINFO[0m   1. users
```

``Redis`` VectorStore 実装は、``from_texts``, ``from_texts_return_keys``, ``from_documents`` メソッドを介して渡された任意のメタデータに対してインデックススキーマ（フィルタリング用フィールド）を生成しようとします。これにより、渡されたメタデータが Redis 検索インデックスにインデックスされ、そのフィールドでフィルタリングできるようになります。

以下に、上記で定義したメタデータから作成されたフィールドを示します。

```python
!rvl index info -i users
```

```output


Index Information:
╭──────────────┬────────────────┬───────────────┬─────────────────┬────────────╮
│ Index Name   │ Storage Type   │ Prefixes      │ Index Options   │   Indexing │
├──────────────┼────────────────┼───────────────┼─────────────────┼────────────┤
│ users        │ HASH           │ ['doc:users'] │ []              │          0 │
╰──────────────┴────────────────┴───────────────┴─────────────────┴────────────╯
Index Fields:
╭────────────────┬────────────────┬─────────┬────────────────┬────────────────╮
│ Name           │ Attribute      │ Type    │ Field Option   │   Option Value │
├────────────────┼────────────────┼─────────┼────────────────┼────────────────┤
│ user           │ user           │ TEXT    │ WEIGHT         │              1 │
│ job            │ job            │ TEXT    │ WEIGHT         │              1 │
│ credit_score   │ credit_score   │ TEXT    │ WEIGHT         │              1 │
│ content        │ content        │ TEXT    │ WEIGHT         │              1 │
│ age            │ age            │ NUMERIC │                │                │
│ content_vector │ content_vector │ VECTOR  │                │                │
╰────────────────┴────────────────┴─────────┴────────────────┴────────────────╯
```

```python
!rvl stats -i users
```

```output

Statistics:
╭─────────────────────────────┬─────────────╮
│ Stat Key                    │ Value       │
├─────────────────────────────┼─────────────┤
│ num_docs                    │ 5           │
│ num_terms                   │ 15          │
│ max_doc_id                  │ 5           │
│ num_records                 │ 33          │
│ percent_indexed             │ 1           │
│ hash_indexing_failures      │ 0           │
│ number_of_uses              │ 4           │
│ bytes_per_record_avg        │ 4.60606     │
│ doc_table_size_mb           │ 0.000524521 │
│ inverted_sz_mb              │ 0.000144958 │
│ key_table_size_mb           │ 0.000193596 │
│ offset_bits_per_record_avg  │ 8           │
│ offset_vectors_sz_mb        │ 2.19345e-05 │
│ offsets_per_term_avg        │ 0.69697     │
│ records_per_doc_avg         │ 6.6         │
│ sortable_values_size_mb     │ 0           │
│ total_indexing_time         │ 0.32        │
│ total_inverted_index_blocks │ 16          │
│ vector_index_sz_mb          │ 6.0126      │
╰─────────────────────────────┴─────────────╯
```

重要なのは、メタデータの ``user``, ``job``, ``credit_score``, ``age`` がインデックス内のフィールドであるべきだと指定していないことです。これは、``Redis`` VectorStore オブジェクトが渡されたメタデータから自動的にインデックススキーマを生成するためです。インデックスフィールドの生成に関する詳細は、API ドキュメントを参照してください。

## クエリ

``Redis`` VectorStore 実装には、使用ケースに基づいて複数のクエリ方法があります：

- ``similarity_search``: 与えられたベクトルに最も類似したベクトルを見つける。
- ``similarity_search_with_score``: 与えられたベクトルに最も類似したベクトルを見つけ、ベクトル距離を返す。
- ``similarity_search_limit_score``: 与えられたベクトルに最も類似したベクトルを見つけ、結果の数を ``score_threshold`` に制限する。
- ``similarity_search_with_relevance_scores``: 与えられたベクトルに最も類似したベクトルを見つけ、ベクトルの類似度を返す。
- ``max_marginal_relevance_search``: 分散性を最適化しながら、与えられたベクトルに最も類似したベクトルを見つける。

```python
results = rds.similarity_search("foo")
print(results[0].page_content)
```

```output
foo
```

```python
# return metadata
results = rds.similarity_search("foo", k=3)
meta = results[1].metadata
print("Key of the document in Redis: ", meta.pop("id"))
print("Metadata of the document: ", meta)
```

```output
Key of the document in Redis:  doc:users:a70ca43b3a4e4168bae57c78753a200f
Metadata of the document:  {'user': 'derrick', 'job': 'doctor', 'credit_score': 'low', 'age': '45'}
```

```python
# with scores (distances)
results = rds.similarity_search_with_score("foo", k=5)
for result in results:
    print(f"Content: {result[0].page_content} --- Score: {result[1]}")
```

```output
Content: foo --- Score: 0.0
Content: foo --- Score: 0.0
Content: foo --- Score: 0.0
Content: bar --- Score: 0.1566
Content: bar --- Score: 0.1566
```

```python
# limit the vector distance that can be returned
results = rds.similarity_search_with_score("foo", k=5, distance_threshold=0.1)
for result in results:
    print(f"Content: {result[0].page_content} --- Score: {result[1]}")
```

```output
Content: foo --- Score: 0.0
Content: foo --- Score: 0.0
Content: foo --- Score: 0.0
```

```python
# with scores
results = rds.similarity_search_with_relevance_scores("foo", k=5)
for result in results:
    print(f"Content: {result[0].page_content} --- Similiarity: {result[1]}")
```

```output
Content: foo --- Similiarity: 1.0
Content: foo --- Similiarity: 1.0
Content: foo --- Similiarity: 1.0
Content: bar --- Similiarity: 0.8434
Content: bar --- Similiarity: 0.8434
```

```python
# limit scores (similarities have to be over .9)
results = rds.similarity_search_with_relevance_scores("foo", k=5, score_threshold=0.9)
for result in results:
    print(f"Content: {result[0].page_content} --- Similarity: {result[1]}")
```

```output
Content: foo --- Similarity: 1.0
Content: foo --- Similarity: 1.0
Content: foo --- Similarity: 1.0
```

```python
# you can also add new documents as follows
new_document = ["baz"]
new_metadata = [{"user": "sam", "age": 50, "job": "janitor", "credit_score": "high"}]
# both the document and metadata must be lists
rds.add_texts(new_document, new_metadata)
```

```output
['doc:users:b9c71d62a0a34241a37950b448dafd38']
```

```python
# now query the new document
results = rds.similarity_search("baz", k=3)
print(results[0].metadata)
```

```output
{'id': 'doc:users:b9c71d62a0a34241a37950b448dafd38', 'user': 'sam', 'job': 'janitor', 'credit_score': 'high', 'age': '50'}
```

```python
# use maximal marginal relevance search to diversify results
results = rds.max_marginal_relevance_search("foo")
```

```python
# the lambda_mult parameter controls the diversity of the results, the lower the more diverse
results = rds.max_marginal_relevance_search("foo", lambda_mult=0.1)
```

## 既存のインデックスに接続する

``Redis`` VectorStore を使用する際に同じメタデータをインデックス化するためには、``index_schema`` を yaml ファイルのパスまたは辞書として渡す必要があります。以下に、インデックスからスキーマを取得し、既存のインデックスに接続する方法を示します。

```python
# write the schema to a yaml file
rds.write_schema("redis_schema.yaml")
```

この例のスキーマファイルは次のようになります：

```yaml
numeric:
- name: age
  no_index: false
  sortable: false
text:
- name: user
  no_index: false
  no_stem: false
  sortable: false
  weight: 1
  withsuffixtrie: false
- name: job
  no_index: false
  no_stem: false
  sortable: false
  weight: 1
  withsuffixtrie: false
- name: credit_score
  no_index: false
  no_stem: false
  sortable: false
  weight: 1
  withsuffixtrie: false
- name: content
  no_index: false
  no_stem: false
  sortable: false
  weight: 1
  withsuffixtrie: false
vector:
- algorithm: FLAT
  block_size: 1000
  datatype: FLOAT32
  dims: 1536
  distance_metric: COSINE
  initial_cap: 20000
  name: content_vector
```

**注意**、これはスキーマの **すべて** の可能なフィールドを含んでいます。必要のないフィールドは削除できます。

```python
# now we can connect to our existing index as follows

new_rds = Redis.from_existing_index(
    embeddings,
    index_name="users",
    redis_url="redis://localhost:6379",
    schema="redis_schema.yaml",
)
results = new_rds.similarity_search("foo", k=3)
print(results[0].metadata)
```

```output
{'id': 'doc:users:8484c48a032d4c4cbe3cc2ed6845fabb', 'user': 'john', 'job': 'engineer', 'credit_score': 'high', 'age': '18'}
```

```python
# see the schemas are the same
new_rds.schema == rds.schema
```

```output
True
```

## カスタムメタデータのインデックス化

場合によっては、メタデータがマップされるフィールドを制御したいことがあります。たとえば、``credit_score`` フィールドをテキストフィールドではなくカテゴリフィールドにしたい場合があります（これはすべての文字列フィールドのデフォルト動作です）。この場合、各初期化メソッドで ``index_schema`` パラメータを使用してインデックスのスキーマを指定できます。カスタムインデックススキーマは、辞書として渡すか YAML ファイルのパスとして渡すことができます。

スキーマのすべての引数にはデフォルト値があり、名前を除くすべてのフィールドを変更する必要はありません。すべての名前は、コマンドラインで ``redis-cli`` または ``redis-py`` を使用する際の引数のスネークケース/小文字バージョンに対応しています。各フィールドの引数の詳細については、[ドキュメント](https://redis.io/docs/interact/search-and-query/basic-constructs/field-and-type-options/) を参照してください。

以下の例は、``credit_score`` フィールドをテキストフィールドではなくタグ（カテゴリ）フィールドとして指定する方法を示しています。

```yaml
# index_schema.yml
tag:
    - name: credit_score
text:
    - name: user
    - name: job
numeric:
    - name: age
```

Python では、次のようになります：

```python

index_schema = {
    "tag": [{"name": "credit_score"}],
    "text": [{"name": "user"}, {"name": "job"}],
    "numeric": [{"name": "age"}],
}

```

指定する必要があるのは ``name`` フィールドだけです。他のすべてのフィールドにはデフォルト値があります。

```python
# create a new index with the new schema defined above
index_schema = {
    "tag": [{"name": "credit_score"}],
    "text": [{"name": "user"}, {"name": "job"}],
    "numeric": [{"name": "age"}],
}

rds, keys = Redis.from_texts_return_keys(
    texts,
    embeddings,
    metadatas=metadata,
    redis_url="redis://localhost:6379",
    index_name="users_modified",
    index_schema=index_schema,  # pass in the new index schema
)
```

```output
`index_schema` does not match generated metadata schema.
If you meant to manually override the schema, please ignore this message.
index_schema: {'tag': [{'name': 'credit_score'}], 'text': [{'name': 'user'}, {'name': 'job'}], 'numeric': [{'name': 'age'}]}
generated_schema: {'text': [{'name': 'user'}, {'name': 'job'}, {'name': 'credit_score'}], 'numeric': [{'name': 'age'}], 'tag': []}
```

上記の警告は、デフォルトの動作を上書きしているときにユーザーに通知するためのものです。意図的に動作を上書きしている場合は無視してください。

## ハイブリッドフィルタリング

LangChain に組み込まれている Redis Filter Expression 言語を使用すると、検索結果をフィルタリングするための任意の長さのハイブリッドフィルタチェーンを作成できます。式言語は [RedisVL Expression Syntax](https://redisvl.com) に由来し、使いやすく理解しやすいように設計されています。

利用可能なフィルタタイプは次のとおりです：
- ``RedisText``: メタデータフィールドに対する全文検索でフィルタリングします。正確一致、あいまい一致、ワイルドカード一致をサポートします。
- ``RedisNum``: メタデータフィールドに対する数値範囲でフィルタリングします。
- ``RedisTag``: 文字列ベースのカテゴリメタデータフィールドに対する正確一致でフィルタリングします。複数のタグを "tag1,tag2,tag3" のように指定できます。

以下はこれらのフィルタを利用する例です。

```python

from langchain_community.vectorstores.redis import RedisText, RedisNum, RedisTag

# exact matching
has_high_credit = RedisTag("credit_score") == "high"
does_not_have_high_credit = RedisTag("credit_score") != "low"

# fuzzy matching
job_starts_with_eng = RedisText("job") % "eng*"
job_is_engineer = RedisText("job") == "engineer"
job_is_not_engineer = RedisText("job") != "engineer"

# numeric filtering
age_is_18 = RedisNum("age") == 18
age_is_not_18 = RedisNum("age") != 18
age_is_greater_than_18 = RedisNum("age") > 18
age_is_less_than_18 = RedisNum("age") < 18
age_is_greater_than_or_equal_to_18 = RedisNum("age") >= 18
age_is_less_than_or_equal_to_18 = RedisNum("age") <= 18

```

``RedisFilter`` クラスを使用して、これらのフィルタのインポートを簡素化できます

```python

from langchain_community.vectorstores.redis import RedisFilter

# same examples as above
has_high_credit = RedisFilter.tag("credit_score") == "high"
does_not_have_high_credit = RedisFilter.num("age") > 8
job_starts_with_eng = RedisFilter.text("job") % "eng*"
```

以下は検索にハイブリッドフィルタを使用する例です

```python
from langchain_community.vectorstores.redis import RedisText

is_engineer = RedisText("job") == "engineer"
results = rds.similarity_search("foo", k=3, filter=is_engineer)

print("Job:", results[0].metadata["job"])
print("Engineers in the dataset:", len(results))
```

```output
Job: engineer
Engineers in the dataset: 2
```

```python
# fuzzy match
starts_with_doc = RedisText("job") % "doc*"
results = rds.similarity_search("foo", k=3, filter=starts_with_doc)

for result in results:
    print("Job:", result.metadata["job"])
print("Jobs in dataset that start with 'doc':", len(results))
```

```output
Job: doctor
Job: doctor
Jobs in dataset that start with 'doc': 2
```

```python
from langchain_community.vectorstores.redis import RedisNum

is_over_18 = RedisNum("age") > 18
is_under_99 = RedisNum("age") < 99
age_range = is_over_18 & is_under_99
results = rds.similarity_search("foo", filter=age_range)

for result in results:
    print("User:", result.metadata["user"], "is", result.metadata["age"])
```

```output
User: derrick is 45
User: nancy is 94
User: joe is 35
```

```python
# make sure to use parenthesis around FilterExpressions
# if initializing them while constructing them
age_range = (RedisNum("age") > 18) & (RedisNum("age") < 99)
results = rds.similarity_search("foo", filter=age_range)

for result in results:
    print("User:", result.metadata["user"], "is", result.metadata["age"])
```

```output
User: derrick is 45
User: nancy is 94
User: joe is 35
```

## Redis をリトリーバーとして使用する

ここでは、ベクトルストアをリトリーバーとして使用するためのさまざまなオプションについて説明します。

取得を行うために使用できる3つの異なる検索方法があります。デフォルトではセマンティック類似性を使用します。

```python
query = "foo"
results = rds.similarity_search_with_score(query, k=3, return_metadata=True)

for result in results:
    print("Content:", result[0].page_content, " --- Score: ", result[1])
```

```output
Content: foo  --- Score:  0.0
Content: foo  --- Score:  0.0
Content: foo  --- Score:  0.0
```

```python
retriever = rds.as_retriever(search_type="similarity", search_kwargs={"k": 4})
```

```python
docs = retriever.invoke(query)
docs
```

```output
[Document(page_content='foo', metadata={'id': 'doc:users_modified:988ecca7574048e396756efc0e79aeca', 'user': 'john', 'job': 'engineer', 'credit_score': 'high', 'age': '18'}),
 Document(page_content='foo', metadata={'id': 'doc:users_modified:009b1afeb4084cc6bdef858c7a99b48e', 'user': 'derrick', 'job': 'doctor', 'credit_score': 'low', 'age': '45'}),
 Document(page_content='foo', metadata={'id': 'doc:users_modified:7087cee9be5b4eca93c30fbdd09a2731', 'user': 'nancy', 'job': 'doctor', 'credit_score': 'high', 'age': '94'}),
 Document(page_content='bar', metadata={'id': 'doc:users_modified:01ef6caac12b42c28ad870aefe574253', 'user': 'tyler', 'job': 'engineer', 'credit_score': 'high', 'age': '100'})]
```

また、ユーザーがベクトル距離を指定できる `similarity_distance_threshold` リトリーバーもあります

```python
retriever = rds.as_retriever(
    search_type="similarity_distance_threshold",
    search_kwargs={"k": 4, "distance_threshold": 0.1},
)
```

```python
docs = retriever.invoke(query)
docs
```

```output
[Document(page_content='foo', metadata={'id': 'doc:users_modified:988ecca7574048e396756efc0e79aeca', 'user': 'john', 'job': 'engineer', 'credit_score': 'high', 'age': '18'}),
 Document(page_content='foo', metadata={'id': 'doc:users_modified:009b1afeb4084cc6bdef858c7a99b48e', 'user': 'derrick', 'job': 'doctor', 'credit_score': 'low', 'age': '45'}),
 Document(page_content='foo', metadata={'id': 'doc:users_modified:7087cee9be5b4eca93c30fbdd09a2731', 'user': 'nancy', 'job': 'doctor', 'credit_score': 'high', 'age': '94'})]
```

最後に、``similarity_score_threshold`` はユーザーが類似ドキュメントの最低スコアを定義できるようにします

```python
retriever = rds.as_retriever(
    search_type="similarity_score_threshold",
    search_kwargs={"score_threshold": 0.9, "k": 10},
)
```

```python
retriever.invoke("foo")
```

```output
[Document(page_content='foo', metadata={'id': 'doc:users_modified:988ecca7574048e396756efc0e79aeca', 'user': 'john', 'job': 'engineer', 'credit_score': 'high', 'age': '18'}),
 Document(page_content='foo', metadata={'id': 'doc:users_modified:009b1afeb4084cc6bdef858c7a99b48e', 'user': 'derrick', 'job': 'doctor', 'credit_score': 'low', 'age': '45'}),
 Document(page_content='foo', metadata={'id': 'doc:users_modified:7087cee9be5b4eca93c30fbdd09a2731', 'user': 'nancy', 'job': 'doctor', 'credit_score': 'high', 'age': '94'})]
```

```python
retriever = rds.as_retriever(
    search_type="mmr", search_kwargs={"fetch_k": 20, "k": 4, "lambda_mult": 0.1}
)
```

```python
retriever.invoke("foo")
```

```output
[Document(page_content='foo', metadata={'id': 'doc:users:8f6b673b390647809d510112cde01a27', 'user': 'john', 'job': 'engineer', 'credit_score': 'high', 'age': '18'}),
 Document(page_content='bar', metadata={'id': 'doc:users:93521560735d42328b48c9c6f6418d6a', 'user': 'tyler', 'job': 'engineer', 'credit_score': 'high', 'age': '100'}),
 Document(page_content='foo', metadata={'id': 'doc:users:125ecd39d07845eabf1a699d44134a5b', 'user': 'nancy', 'job': 'doctor', 'credit_score': 'high', 'age': '94'}),
 Document(page_content='foo', metadata={'id': 'doc:users:d6200ab3764c466082fde3eaab972a2a', 'user': 'derrick', 'job': 'doctor', 'credit_score': 'low', 'age': '45'})]
```

## キーとインデックスの削除

エントリを削除するには、キーによってそれらを指定する必要があります。

```python
Redis.delete(keys, redis_url="redis://localhost:6379")
```

```output
True
```

```python
# delete the indices too
Redis.drop_index(
    index_name="users", delete_documents=True, redis_url="redis://localhost:6379"
)
Redis.drop_index(
    index_name="users_modified",
    delete_documents=True,
    redis_url="redis://localhost:6379",
)
```

```output
True
```
