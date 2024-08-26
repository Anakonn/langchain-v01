---
translated: true
---

# Cassandra

>[Apache Cassandra®](https://cassandra.apache.org)は、大量のデータを保存するのに適した、NoSQL、行指向型、高スケーラブルで高可用性のデータベースです。

>`Cassandra`は、スケーラビリティが高く、多数の書き込みに対応できるため、チャットメッセージの履歴を保存するのに適しています。

このノートブックでは、Cassandraを使ってチャットメッセージの履歴を保存する方法について説明します。

## 設定

このノートブックを実行するには、稼働中の`Cassandra`クラスターか、クラウド上で稼働中の`DataStax Astra DB`インスタンスが必要です(無料で利用できる[datastax.com](https://astra.datastax.com))をチェックしてください。詳細は[cassio.org](https://cassio.org/start_here/)を参照してください)。

```python
%pip install --upgrade --quiet  "cassio>=0.1.0"
```

### データベース接続パラメーターとシークレットを設定する

```python
import getpass

database_mode = (input("\n(C)assandra or (A)stra DB? ")).upper()

keyspace_name = input("\nKeyspace name? ")

if database_mode == "A":
    ASTRA_DB_APPLICATION_TOKEN = getpass.getpass('\nAstra DB Token ("AstraCS:...") ')
    #
    ASTRA_DB_SECURE_BUNDLE_PATH = input("Full path to your Secure Connect Bundle? ")
elif database_mode == "C":
    CASSANDRA_CONTACT_POINTS = input(
        "Contact points? (comma-separated, empty for localhost) "
    ).strip()
```

ローカルまたはクラウドベースのAstra DBのいずれかに応じて、対応するデータベース接続「Session」オブジェクトを作成します。

```python
from cassandra.auth import PlainTextAuthProvider
from cassandra.cluster import Cluster

if database_mode == "C":
    if CASSANDRA_CONTACT_POINTS:
        cluster = Cluster(
            [cp.strip() for cp in CASSANDRA_CONTACT_POINTS.split(",") if cp.strip()]
        )
    else:
        cluster = Cluster()
    session = cluster.connect()
elif database_mode == "A":
    ASTRA_DB_CLIENT_ID = "token"
    cluster = Cluster(
        cloud={
            "secure_connect_bundle": ASTRA_DB_SECURE_BUNDLE_PATH,
        },
        auth_provider=PlainTextAuthProvider(
            ASTRA_DB_CLIENT_ID,
            ASTRA_DB_APPLICATION_TOKEN,
        ),
    )
    session = cluster.connect()
else:
    raise NotImplementedError
```

## 例

```python
from langchain_community.chat_message_histories import (
    CassandraChatMessageHistory,
)

message_history = CassandraChatMessageHistory(
    session_id="test-session",
    session=session,
    keyspace=keyspace_name,
)

message_history.add_user_message("hi!")

message_history.add_ai_message("whats up?")
```

```python
message_history.messages
```

#### 帰属声明

> Apache Cassandra、CassandraおよびApacheは、[Apache Software Foundation](http://www.apache.org/)が米国およびその他の国で登録商標または商標を保有しています。
