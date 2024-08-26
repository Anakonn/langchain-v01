---
translated: true
---

# Redis

>[Redis (Remote Dictionary Server)](https://en.wikipedia.org/wiki/Redis) は、分散型のインメモリキーバリューデータベース、キャッシュ、メッセージブローカーとして使用される、オープンソースのインメモリストレージです。設計上、Redisはメモリ内にすべてのデータを保持しており、低レイテンシの読み書きを提供するため、キャッシュを必要とするユースケースに特に適しています。Redisは最も人気のあるNoSQLデータベースの1つであり、全体的にも最も人気のあるデータベースの1つです。

このノートブックでは、Redisを使ってチャットメッセージの履歴を保存する方法について説明します。

## セットアップ

まず、依存関係をインストールし、`redis-server`のようなコマンドを使ってRedisインスタンスを起動する必要があります。

```python
pip install -U langchain-community redis
```

```python
from langchain_community.chat_message_histories import RedisChatMessageHistory
```

## メッセージの保存と取得

```python
history = RedisChatMessageHistory("foo", url="redis://localhost:6379")

history.add_user_message("hi!")

history.add_ai_message("whats up?")
```

```python
history.messages
```

```output
[HumanMessage(content='hi!'), AIMessage(content='whats up?')]
```

## Chainsでの使用

```python
pip install -U langchain-openai
```

```python
from typing import Optional

from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_openai import ChatOpenAI
```

```python
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You're an assistant。"),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{question}"),
    ]
)

chain = prompt | ChatOpenAI()

chain_with_history = RunnableWithMessageHistory(
    chain,
    lambda session_id: RedisChatMessageHistory(
        session_id, url="redis://localhost:6379"
    ),
    input_messages_key="question",
    history_messages_key="history",
)

config = {"configurable": {"session_id": "foo"}}

chain_with_history.invoke({"question": "Hi! I'm bob"}, config=config)

chain_with_history.invoke({"question": "Whats my name"}, config=config)
```

```output
AIMessage(content='Your name is Bob, as you mentioned earlier. Is there anything specific you would like assistance with, Bob?')
```
