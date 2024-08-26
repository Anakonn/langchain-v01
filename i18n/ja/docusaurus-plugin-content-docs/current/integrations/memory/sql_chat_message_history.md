---
translated: true
---

# SQL (SQLAlchemy)

>[構造化問い合わせ言語 (SQL)](https://en.wikipedia.org/wiki/SQL) は、プログラミングで使用されるドメイン固有言語であり、リレーショナルデータベース管理システム (RDBMS) に保持されているデータを管理するため、またはリレーショナルデータストリーム管理システム (RDSMS) でストリーム処理を行うために設計されています。特に、エンティティと変数の間の関係を組み込んだ構造化データを処理するのに便利です。

>[SQLAlchemy](https://github.com/sqlalchemy/sqlalchemy) は、MITライセンスの下でリリースされたPythonプログラミング言語用のオープンソースの `SQL` ツールキットおよびオブジェクトリレーショナルマッパー (ORM) です。

このノートブックでは、`SQLAlchemy` がサポートする任意のデータベースにチャット履歴を保存する `SQLChatMessageHistory` クラスについて説明します。

`SQLite` 以外のデータベースで使用するには、対応するデータベースドライバをインストールする必要があることに注意してください。

## セットアップ

統合は `langchain-community` パッケージに含まれているため、それをインストールする必要があります。また、`SQLAlchemy` パッケージもインストールする必要があります。

```bash
pip install -U langchain-community SQLAlchemy langchain-openai
```

一流の可観測性を確保するために [LangSmith](https://smith.langchain.com/) を設定することも役立ちます (必須ではありません)

```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## 使用方法

ストレージを使用するには、次の2つの情報を提供する必要があります：

1. セッションID - ユーザー名、メール、チャットIDなどのセッションの一意識別子。
2. 接続文字列 - データベース接続を指定する文字列。これをSQLAlchemyの create_engine 関数に渡します。

```python
from langchain_community.chat_message_histories import SQLChatMessageHistory

chat_message_history = SQLChatMessageHistory(
    session_id="test_session", connection_string="sqlite:///sqlite.db"
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

## チェイニング

このメッセージ履歴クラスを [LCEL Runnables](/docs/expression_language/how_to/message_history) と簡単に組み合わせることができます。

これを行うためにOpenAIを使用したいので、それをインストールする必要があります。

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
config = {"configurable": {"session_id": "<SESSION_ID>"}}
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
