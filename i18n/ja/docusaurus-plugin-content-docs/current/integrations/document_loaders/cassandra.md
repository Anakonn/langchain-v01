---
translated: true
---

# カサンドラ

[Cassandra](https://cassandra.apache.org/) は、NoSQL、行指向、高いスケーラビリティと高い可用性を持つデータベースです。バージョン5.0から、このデータベースは[ベクトル検索機能](https://cassandra.apache.org/doc/trunk/cassandra/vector-search/overview.html)を備えています。

## 概要

カサンドラドキュメントローダーは、CassandraデータベースからLangchainドキュメントのリストを返します。

ドキュメントを取得するには、CQLクエリまたはテーブル名を提供する必要があります。
ローダーは以下のパラメータを受け取ります:

* table: (任意) データをロードするテーブル。
* session: (任意) cassandraドライバーセッション。提供されていない場合、cassioによって解決されたセッションが使用されます。
* keyspace: (任意) テーブルのキースペース。提供されていない場合、cassioによって解決されたキースペースが使用されます。
* query: (任意) データをロードするために使用されるクエリ。
* page_content_mapper: (任意) 行を文字列ページコンテンツに変換する関数。デフォルトでは行をJSONに変換します。
* metadata_mapper: (任意) 行をメタデータ辞書に変換する関数。
* query_parameters: (任意) session.executeを呼び出すときに使用されるクエリパラメータ。
* query_timeout: (任意) session.executeを呼び出すときに使用されるクエリタイムアウト。
* query_custom_payload: (任意) `session.execute`を呼び出すときに使用されるクエリのcustom_payload。
* query_execution_profile: (任意) `session.execute`を呼び出すときに使用されるクエリのexecution_profile。
* query_host: (任意) `session.execute`を呼び出すときに使用されるクエリホスト。
* query_execute_as: (任意) `session.execute`を呼び出すときに使用されるクエリのexecute_as。

## ドキュメントローダーを使用してドキュメントをロードする

```python
from langchain_community.document_loaders import CassandraLoader
```

### cassandraドライバーセッションから初期化

`cassandra.cluster.Session`オブジェクトを作成する必要があります。詳細は[Cassandraドライバードキュメント](https://docs.datastax.com/en/developer/python-driver/latest/api/cassandra/cluster/#module-cassandra.cluster)に記載されています。詳細は（例：ネットワーク設定や認証によって）異なりますが、次のようなものになるかもしれません：

```python
from cassandra.cluster import Cluster

cluster = Cluster()
session = cluster.connect()
```

Cassandraインスタンスの既存のキースペースの名前を提供する必要があります：

```python
CASSANDRA_KEYSPACE = input("CASSANDRA_KEYSPACE = ")
```

ドキュメントローダーの作成：

```python
loader = CassandraLoader(
    table="movie_reviews",
    session=session,
    keyspace=CASSANDRA_KEYSPACE,
)
```

```python
docs = loader.load()
```

```python
docs[0]
```

```output
Document(page_content='Row(_id=\'659bdffa16cbc4586b11a423\', title=\'Dangerous Men\', reviewtext=\'"Dangerous Men,"  the picture\\\'s production notes inform, took 26 years to reach the big screen. After having seen it, I wonder: What was the rush?\')', metadata={'table': 'movie_reviews', 'keyspace': 'default_keyspace'})
```

### cassioから初期化

セッションとキースペースを構成するためにcassioを使用することも可能です。

```python
import cassio

cassio.init(contact_points="127.0.0.1", keyspace=CASSANDRA_KEYSPACE)

loader = CassandraLoader(
    table="movie_reviews",
)

docs = loader.load()
```

#### クレジット表記

> Apache Cassandra、CassandraおよびApacheは、米国および/または他の国における[Apache Software Foundation](http://www.apache.org/)の登録商標または商標です。
