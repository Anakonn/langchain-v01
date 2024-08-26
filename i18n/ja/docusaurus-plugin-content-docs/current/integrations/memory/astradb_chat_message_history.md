---
translated: true
---

# Astra DB

> DataStax [Astra DB](https://docs.datastax.com/en/astra/home/astra.html) は、Cassandraに基づいて構築されたサーバーレスのベクター対応データベースで、使いやすいJSONAPIを通して提供されています。

このノートブックでは、Astra DBを使ってチャットメッセージの履歴を保存する方法について説明します。

## 設定

このノートブックを実行するには、稼働中のAstra DBが必要です。Astra ダッシュボードで接続シークレットを取得してください:

- API エンドポイントは `https://01234567-89ab-cdef-0123-456789abcdef-us-east1.apps.astra.datastax.com` のようになります。
- トークンは `AstraCS:6gBhNmsk135...` のようになります。

```python
%pip install --upgrade --quiet  "astrapy>=0.7.1"
```

### データベース接続パラメーターとシークレットを設定する

```python
import getpass

ASTRA_DB_API_ENDPOINT = input("ASTRA_DB_API_ENDPOINT = ")
ASTRA_DB_APPLICATION_TOKEN = getpass.getpass("ASTRA_DB_APPLICATION_TOKEN = ")
```

```output
ASTRA_DB_API_ENDPOINT =  https://01234567-89ab-cdef-0123-456789abcdef-us-east1.apps.astra.datastax.com
ASTRA_DB_APPLICATION_TOKEN =  ········
```

ローカルまたはクラウドベースのAstra DBに応じて、対応するデータベース接続「セッション」オブジェクトを作成します。

## 例

```python
from langchain_community.chat_message_histories import AstraDBChatMessageHistory

message_history = AstraDBChatMessageHistory(
    session_id="test-session",
    api_endpoint=ASTRA_DB_API_ENDPOINT,
    token=ASTRA_DB_APPLICATION_TOKEN,
)

message_history.add_user_message("hi!")

message_history.add_ai_message("whats up?")
```

```python
message_history.messages
```

```output
[HumanMessage(content='hi!'), AIMessage(content='whats up?')]
```
