---
sidebar_label: Astra DB
translated: true
---

# Astra DB

DataStax [Astra DB](https://docs.datastax.com/en/astra/home/astra.html) は、Cassandraに基づいて構築されたサーバーレスのベクトル対応データベースで、使いやすいJSONAPIを通して提供されています。

`AstraDBStore`と`AstraDBByteStore`には`astrapy`パッケージがインストールされている必要があります:

```python
%pip install --upgrade --quiet  astrapy
```

このストアには以下のパラメータが必要です:

* `api_endpoint`: Astra DB APIエンドポイント。例: `https://01234567-89ab-cdef-0123-456789abcdef-us-east1.apps.astra.datastax.com`
* `token`: Astra DBトークン。例: `AstraCS:6gBhNmsk135....`
* `collection_name`: Astra DBコレクション名
* `namespace`: (オプション) Astra DBネームスペース

## AstraDBStore

`AstraDBStore`は`BaseStore`の実装で、すべてがDataStax Astra DBインスタンスに保存されます。
ストアキーは文字列でなければならず、Astra DBドキュメントの`_id`フィールドにマッピングされます。
ストア値は`json.dumps`でシリアル化できるオブジェクトであれば何でも構いません。
データベース内のエントリは以下の形式になります:

```json
{
  "_id": "<key>",
  "value": <value>
}
```

```python
from langchain_community.storage import AstraDBStore
```

```python
from getpass import getpass

ASTRA_DB_API_ENDPOINT = input("ASTRA_DB_API_ENDPOINT = ")
ASTRA_DB_APPLICATION_TOKEN = getpass("ASTRA_DB_APPLICATION_TOKEN = ")
```

```python
store = AstraDBStore(
    api_endpoint=ASTRA_DB_API_ENDPOINT,
    token=ASTRA_DB_APPLICATION_TOKEN,
    collection_name="my_store",
)
```

```python
store.mset([("k1", "v1"), ("k2", [0.1, 0.2, 0.3])])
print(store.mget(["k1", "k2"]))
```

```output
['v1', [0.1, 0.2, 0.3]]
```

### CacheBackedEmbeddingsでの使用

[`CacheBackedEmbeddings`](/docs/modules/data_connection/text_embedding/caching_embeddings)と組み合わせて`AstraDBStore`を使用できます。
`AstraDBStore`はバイトに変換せずにエンベディングをリストのfloatとして保存するため、そこでは`fromByteStore`は使用しません。

```python
from langchain.embeddings import CacheBackedEmbeddings, OpenAIEmbeddings

embeddings = CacheBackedEmbeddings(
    underlying_embeddings=OpenAIEmbeddings(), document_embedding_store=store
)
```

## AstraDBByteStore

`AstraDBByteStore`は`ByteStore`の実装で、すべてがDataStax Astra DBインスタンスに保存されます。
ストアキーは文字列でなければならず、Astra DBドキュメントの`_id`フィールドにマッピングされます。
ストアの`bytes`値はBase64文字列に変換されてAstra DBに格納されます。
データベース内のエントリは以下の形式になります:

```json
{
  "_id": "<key>",
  "value": "bytes encoded in base 64"
}
```

```python
from langchain_community.storage import AstraDBByteStore
```

```python
from getpass import getpass

ASTRA_DB_API_ENDPOINT = input("ASTRA_DB_API_ENDPOINT = ")
ASTRA_DB_APPLICATION_TOKEN = getpass("ASTRA_DB_APPLICATION_TOKEN = ")
```

```python
store = AstraDBByteStore(
    api_endpoint=ASTRA_DB_API_ENDPOINT,
    token=ASTRA_DB_APPLICATION_TOKEN,
    collection_name="my_store",
)
```

```python
store.mset([("k1", b"v1"), ("k2", b"v2")])
print(store.mget(["k1", "k2"]))
```

```output
[b'v1', b'v2']
```
