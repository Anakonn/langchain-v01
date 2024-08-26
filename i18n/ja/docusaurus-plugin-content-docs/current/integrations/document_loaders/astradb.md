---
translated: true
---

# AstraDB

DataStax [Astra DB](https://docs.datastax.com/en/astra/home/astra.html) は、Cassandraに基づいて構築されたサーバーレスのベクター対応データベースで、使いやすいJSONAPIを通して便利に利用できます。

## 概要

AstraDBドキュメントローダーは、AstraDBデータベースからLangChainドキュメントのリストを返します。

ローダーは以下のパラメーターを受け取ります:

* `api_endpoint`: AstraDBのAPIエンドポイント。`https://01234567-89ab-cdef-0123-456789abcdef-us-east1.apps.astra.datastax.com`のような形式です。
* `token`: AstraDBのトークン。`AstraCS:6gBhNmsk135....`のような形式です。
* `collection_name`: AstraDBのコレクション名
* `namespace`: (オプション) AstraDBの名前空間
* `filter_criteria`: (オプション) 検索クエリで使用されるフィルター
* `projection`: (オプション) 検索クエリで使用されるプロジェクション
* `find_options`: (オプション) 検索クエリで使用されるオプション
* `nb_prefetched`: (オプション) ローダーによって事前にフェッチされるドキュメントの数
* `extraction_function`: (オプション) AstraDBドキュメントをLangChainの`page_content`文字列に変換する関数。デフォルトは`json.dumps`

LangChainドキュメントのメタデータには以下の情報が設定されます:

```python
{
    metadata : {
        "namespace": "...",
        "api_endpoint": "...",
        "collection": "..."
    }
}
```

## ドキュメントローダーでドキュメントをロードする

```python
from langchain_community.document_loaders import AstraDBLoader
```

```python
from getpass import getpass

ASTRA_DB_API_ENDPOINT = input("ASTRA_DB_API_ENDPOINT = ")
ASTRA_DB_APPLICATION_TOKEN = getpass("ASTRA_DB_APPLICATION_TOKEN = ")
```

```python
loader = AstraDBLoader(
    api_endpoint=ASTRA_DB_API_ENDPOINT,
    token=ASTRA_DB_APPLICATION_TOKEN,
    collection_name="movie_reviews",
    projection={"title": 1, "reviewtext": 1},
    find_options={"limit": 10},
)
```

```python
docs = loader.load()
```

```python
docs[0]
```

```output
Document(page_content='{"_id": "659bdffa16cbc4586b11a423", "title": "Dangerous Men", "reviewtext": "\\"Dangerous Men,\\" the picture\'s production notes inform, took 26 years to reach the big screen. After having seen it, I wonder: What was the rush?"}', metadata={'namespace': 'default_keyspace', 'api_endpoint': 'https://01234567-89ab-cdef-0123-456789abcdef-us-east1.apps.astra.datastax.com', 'collection': 'movie_reviews'})
```
