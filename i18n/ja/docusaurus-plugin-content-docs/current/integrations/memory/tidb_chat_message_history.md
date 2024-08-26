---
translated: true
---

# TiDB

> [TiDB Cloud](https://tidbcloud.com/)は、専用およびサーバーレスのオプションを提供する包括的なデータベースアズアサービス(DBaaS)ソリューションです。TiDB Serverlessは、MySQL環境に組み込みのベクトル検索を統合しています。この機能強化により、新しいデータベースや追加の技術スタックを必要とせずに、TiDB Serverlessを使ってAIアプリケーションを簡単に開発できるようになりました。プライベートベータに参加して、この機能を初めて体験してみてください。https://tidb.cloud/ai

このノートブックでは、TiDBを使ってチャットメッセージの履歴を保存する方法を紹介します。

## セットアップ

まず、以下の依存関係をインストールします:

```python
%pip install --upgrade --quiet langchain langchain_openai
```

OpenAIキーの設定

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("Input your OpenAI API key:")
```

最後に、TiDBへの接続を設定します。このノートブックでは、TiDB Cloudが提供する標準的な接続方法に従って、安全で効率的なデータベース接続を確立します。

```python
# copy from tidb cloud console
tidb_connection_string_template = "mysql+pymysql://<USER>:<PASSWORD>@<HOST>:4000/<DB>?ssl_ca=/etc/ssl/cert.pem&ssl_verify_cert=true&ssl_verify_identity=true"
tidb_password = getpass.getpass("Input your TiDB password:")
tidb_connection_string = tidb_connection_string_template.replace(
    "<PASSWORD>", tidb_password
)
```

## 履歴データの生成

これから行う実演の基礎となる、一連の履歴データを作成します。

```python
from datetime import datetime

from langchain_community.chat_message_histories import TiDBChatMessageHistory

history = TiDBChatMessageHistory(
    connection_string=tidb_connection_string,
    session_id="code_gen",
    earliest_time=datetime.utcnow(),  # Optional to set earliest_time to load messages after this time point.
)

history.add_user_message("How's our feature going?")
history.add_ai_message(
    "It's going well. We are working on testing now. It will be released in Feb."
)
```

```python
history.messages
```

```output
[HumanMessage(content="How's our feature going?"),
 AIMessage(content="It's going well. We are working on testing now. It will be released in Feb.")]
```

## 履歴データでチャットする

前に生成した履歴データを活用して、動的なチャットインタラクションを作成しましょう。

まず、LangChainでチャットチェーンを作成します:

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_openai import ChatOpenAI

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You're an assistant who's good at coding. You're helping a startup build",
        ),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{question}"),
    ]
)
chain = prompt | ChatOpenAI()
```

履歴に基づいて実行可能なものを構築します:

```python
from langchain_core.runnables.history import RunnableWithMessageHistory

chain_with_history = RunnableWithMessageHistory(
    chain,
    lambda session_id: TiDBChatMessageHistory(
        session_id=session_id, connection_string=tidb_connection_string
    ),
    input_messages_key="question",
    history_messages_key="history",
)
```

チャットを開始します:

```python
response = chain_with_history.invoke(
    {"question": "Today is Jan 1st. How many days until our feature is released?"},
    config={"configurable": {"session_id": "code_gen"}},
)
response
```

```output
AIMessage(content='There are 31 days in January, so there are 30 days until our feature is released in February.')
```

## 履歴データの確認

```python
history.reload_cache()
history.messages
```

```output
[HumanMessage(content="How's our feature going?"),
 AIMessage(content="It's going well. We are working on testing now. It will be released in Feb."),
 HumanMessage(content='Today is Jan 1st. How many days until our feature is released?'),
 AIMessage(content='There are 31 days in January, so there are 30 days until our feature is released in February.')]
```
