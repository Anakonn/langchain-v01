---
translated: true
---

# Xata

>[Xata](https://xata.io)は、`PostgreSQL`と`Elasticsearch`をベースにしたサーバーレスのデータプラットフォームです。PythonのSDKを使ってデータベースと対話したり、UIでデータを管理したりできます。`XataChatMessageHistory`クラスを使えば、Xataデータベースでチャットセッションの長期的な保持ができます。

このノートブックでは以下を扱います:

* `XataChatMessageHistory`の簡単な使用例
* 知識ベースやドキュメント(Xataのベクトルストアに保存)に基づいて質問に答えるREACTエージェントと、過去のメッセージ履歴(Xataのメモリストアに保存)を長期的に検索できる、より複雑な例

## セットアップ

### データベースの作成

[Xata UI](https://app.xata.io)で新しいデータベースを作成してください。好きな名前をつけられます。このノートブックでは`langchain`を使います。Langchainのインテグレーションは、メモリ保存用のテーブルを自動的に作成してくれます。それを使うことにします。事前にテーブルを作成したい場合は、正しいスキーマを持っていることを確認し、クラスの作成時に`create_table`を`False`に設定してください。事前にテーブルを作成すると、セッション初期化時の1ラウンドトリップが省略できます。

まずは依存関係をインストールしましょう:

```python
%pip install --upgrade --quiet  xata langchain-openai langchain
```

次に、Xataの環境変数を取得する必要があります。[アカウント設定](https://app.xata.io/settings)からAPIキーを作成できます。データベースのURLは、作成したデータベースの設定ページで確認できます。データベースのURLは`https://demo-uni3q8.eu-west-1.xata.sh/db/langchain`のような形式になります。

```python
import getpass

api_key = getpass.getpass("Xata API key: ")
db_url = input("Xata database URL (copy it from your DB settings):")
```

## 簡単なメモリストアの作成

メモリストアの機能を単独でテストするには、以下のコードスニペットを使います:

```python
from langchain_community.chat_message_histories import XataChatMessageHistory

history = XataChatMessageHistory(
    session_id="session-1", api_key=api_key, db_url=db_url, table_name="memory"
)

history.add_user_message("hi!")

history.add_ai_message("whats up?")
```

上記のコードは`session-1`というIDのセッションを作成し、2つのメッセージを保存します。上記を実行すると、Xata UIにテーブル名`memory`が表示され、2つのメッセージが追加されているはずです。

特定のセッションのメッセージ履歴を取得するには、以下のコードを使います:

```python
history.messages
```

## メモリを持つ会話型Q&Aチェーン

次は、OpenAI、Xataベクトルストアインテグレーション、Xataメモリストアインテグレーションを組み合わせた、より複雑な例を見てみましょう。これにより、データに基づいたQ&Aチャットボットを作成し、フォローアップの質問と履歴を持つことができます。

OpenAI APIにアクセスする必要があるので、APIキーを設定しましょう:

```python
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

チャットボットが検索する答えを格納するために、Xata UIで`langchain`データベースに`docs`というテーブルを追加し、以下の列を設定してください:

* `content`(テキスト型)。`Document.pageContent`の値を格納します。
* `embedding`(ベクトル型)。使用するモデルの次元数に合わせてください。このノートブックではOpenAIの埋め込みを使用しており、1536次元です。

ベクトルストアを作成し、サンプルドキュメントを追加しましょう:

```python
from langchain_community.vectorstores.xata import XataVectorStore
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings()

texts = [
    "Xata is a Serverless Data platform based on PostgreSQL",
    "Xata offers a built-in vector type that can be used to store and query vectors",
    "Xata includes similarity search",
]

vector_store = XataVectorStore.from_texts(
    texts, embeddings, api_key=api_key, db_url=db_url, table_name="docs"
)
```

上記のコマンドを実行すると、Xata UIに`docs`テーブルにドキュメントとその埋め込みが表示されるはずです。

次に、ユーザーとAIのチャットメッセージを保存するためのConversationBufferMemoryを作成しましょう。

```python
from uuid import uuid4

from langchain.memory import ConversationBufferMemory

chat_memory = XataChatMessageHistory(
    session_id=str(uuid4()),  # needs to be unique per user session
    api_key=api_key,
    db_url=db_url,
    table_name="memory",
)
memory = ConversationBufferMemory(
    memory_key="chat_history", chat_memory=chat_memory, return_messages=True
)
```

最後に、ベクトルストアとチャットメモリの両方を使うエージェントを作成します。

```python
from langchain.agents import AgentType, initialize_agent
from langchain.agents.agent_toolkits import create_retriever_tool
from langchain_openai import ChatOpenAI

tool = create_retriever_tool(
    vector_store.as_retriever(),
    "search_docs",
    "Searches and returns documents from the Xata manual. Useful when you need to answer questions about Xata.",
)
tools = [tool]

llm = ChatOpenAI(temperature=0)

agent = initialize_agent(
    tools,
    llm,
    agent=AgentType.CHAT_CONVERSATIONAL_REACT_DESCRIPTION,
    verbose=True,
    memory=memory,
)
```

テストとして、エージェントに自分の名前を伝えてみましょう:

```python
agent.run(input="My name is bob")
```

次に、Xataについて質問してみましょう:

```python
agent.run(input="What is xata?")
```

ドキュメントストアに保存されたデータに基づいて回答していることがわかります。続けて質問してみましょう:

```python
agent.run(input="Does it support similarity search?")
```

最後に、メモリをテストしてみます:

```python
agent.run(input="Did I tell you my name? What is it?")
```
