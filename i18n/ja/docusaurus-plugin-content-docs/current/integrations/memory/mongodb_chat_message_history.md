---
translated: true
---

# MongoDB

>`MongoDB` は、オープンソースのクロスプラットフォームのドキュメント指向データベースプログラムです。NoSQLデータベースプログラムに分類され、`JSON`形式のドキュメントを使用し、オプションのスキーマを持ちます。

>`MongoDB` は MongoDB Inc.によって開発され、Server Side Public License (SSPL)の下でライセンスされています。- [Wikipedia](https://en.wikipedia.org/wiki/MongoDB)

このノートブックでは、`MongoDBChatMessageHistory`クラスを使ってチャットメッセージ履歴をMongodb データベースに保存する方法について説明します。

## セットアップ

このインテグレーションは`langchain-mongodb`パッケージに含まれているので、それをインストールする必要があります。

```bash
pip install -U --quiet langchain-mongodb
```

また、[LangSmith](https://smith.langchain.com/)を設定すると、最高レベルの可観測性が得られます(必須ではありません)。

```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## 使用方法

ストレージを使用するには、2つのことを提供する必要があります:

1. セッションID - ユーザー名、メールアドレス、チャットIDなどのセッションの一意の識別子
2. 接続文字列 - データベース接続を指定する文字列。MongoDB create_engine関数に渡されます。

チャット履歴の保存場所をカスタマイズしたい場合は、以下も指定できます:
1. *database_name* - 使用するデータベースの名前
1. *collection_name* - そのデータベース内のコレクション

```python
from langchain_mongodb.chat_message_histories import MongoDBChatMessageHistory

chat_message_history = MongoDBChatMessageHistory(
    session_id="test_session",
    connection_string="mongodb://mongo_user:password123@mongo:27017",
    database_name="my_db",
    collection_name="chat_histories",
)

chat_message_history.add_user_message("Hello")
chat_message_history.add_ai_message("Hi")
```

```python
chat_message_history.messages
```

```output
[HumanMessage(content='Hello'), AIMessage(content='Hi')]
```

## チェーニング

このメッセージ履歴クラスを[LCEL Runnables](/docs/expression_language/how_to/message_history)と簡単に組み合わせることができます。

これを行うには、OpenAIを使用する必要があります。そのためには、OpenAI APIキーを OPENAI_API_KEY 環境変数に設定する必要があります。

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_openai import ChatOpenAI
```

```python
import os

assert os.environ[
    "OPENAI_API_KEY"
], "Set the OPENAI_API_KEY environment variable with your OpenAI API key."
```

```python
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful assistant."),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{question}"),
    ]
)

chain = prompt | ChatOpenAI()
```

```python
chain_with_history = RunnableWithMessageHistory(
    chain,
    lambda session_id: MongoDBChatMessageHistory(
        session_id=session_id,
        connection_string="mongodb://mongo_user:password123@mongo:27017",
        database_name="my_db",
        collection_name="chat_histories",
    ),
    input_messages_key="question",
    history_messages_key="history",
)
```

```python
# This is where we configure the session id
config = {"configurable": {"session_id": "<SESSION_ID>"}}
```

```python
chain_with_history.invoke({"question": "Hi! I'm bob"}, config=config)
```

```output
AIMessage(content='Hi Bob! How can I assist you today?')
```

```python
chain_with_history.invoke({"question": "Whats my name"}, config=config)
```

```output
AIMessage(content='Your name is Bob. Is there anything else I can help you with, Bob?')
```
