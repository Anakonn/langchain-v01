---
translated: true
---

# Neo4j

[Neo4j](https://en.wikipedia.org/wiki/Neo4j)は、高度に接続されたデータを効率的に管理することで知られるオープンソースのグラフデータベース管理システムです。従来のデータベースがテーブルにデータを保存するのに対し、Neo4jはノード、エッジ、プロパティを使ったグラフ構造でデータを表現し、保存します。この設計により、複雑なデータ関係に対する高パフォーマンスなクエリが可能になります。

このノートブックでは、`Neo4j`を使ってチャットメッセージの履歴を保存する方法について説明します。

```python
from langchain_community.chat_message_histories import Neo4jChatMessageHistory

history = Neo4jChatMessageHistory(
    url="bolt://localhost:7687",
    username="neo4j",
    password="password",
    session_id="session_id_1",
)

history.add_user_message("hi!")

history.add_ai_message("whats up?")
```

```python
history.messages
```
