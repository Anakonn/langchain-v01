---
translated: true
---

# SQLite

>[SQLite](https://en.wikipedia.org/wiki/SQLite)は、C言語で書かれたデータベースエンジンです。それは単独のアプリではなく、ソフトウェア開発者がアプリに組み込むライブラリです。そのため、組み込みデータベースのファミリーに属しています。それは最も広く展開されているデータベースエンジンで、主要なウェブブラウザ、オペレーティングシステム、携帯電話、その他の組み込みシステムで使用されています。

このウォークスルーでは、`SqliteEntityStore`を使用する`ConversationEntityMemory`によってサポートされる簡単な会話チェーンを作成します。

```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## 使用方法

ストレージを使用するには、2つのものを提供するだけで良いです:

1. セッションID - セッションの一意の識別子、ユーザー名、メールアドレス、チャットIDなど。
2. 接続文字列 - データベース接続を指定する文字列。SQLiteの場合、その文字列は `slqlite:///`に続いてデータベースファイルの名前です。そのファイルが存在しない場合は、作成されます。

```python
from langchain_community.chat_message_histories import SQLChatMessageHistory

chat_message_history = SQLChatMessageHistory(
    session_id="test_session_id", connection_string="sqlite:///sqlite.db"
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

[LCEL Runnables](/docs/expression_language/how_to/message_history)と一緒にこのメッセージ履歴クラスを簡単に組み合わせることができます。

これを行うには、OpenAIを使用する必要があります。そのためには、OpenAIをインストールする必要があります。また、OPENAI_API_KEYの環境変数をOpenAIのキーに設定する必要があります。

```bash
pip install -U langchain-openai

export OPENAI_API_KEY='sk-xxxxxxx'
```

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_openai import ChatOpenAI
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
    lambda session_id: SQLChatMessageHistory(
        session_id=session_id, connection_string="sqlite:///sqlite.db"
    ),
    input_messages_key="question",
    history_messages_key="history",
)
```

```python
# This is where we configure the session id
config = {"configurable": {"session_id": "<SQL_SESSION_ID>"}}
```

```python
chain_with_history.invoke({"question": "Hi! I'm bob"}, config=config)
```

```output
AIMessage(content='Hello Bob! How can I assist you today?')
```

```python
chain_with_history.invoke({"question": "Whats my name"}, config=config)
```

```output
AIMessage(content='Your name is Bob! Is there anything specific you would like assistance with, Bob?')
```
