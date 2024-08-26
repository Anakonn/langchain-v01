---
translated: true
---

# メッセージ履歴(メモリ)の追加

`RunnableWithMessageHistory`を使うと、特定のタイプのチェーンにメッセージ履歴を追加できます。これは別のRunnableをラップし、そのチャットメッセージ履歴を管理します。

具体的には、以下のいずれかを入力として受け取るRunnableに使用できます。

* `BaseMessage`のシーケンス
* `BaseMessage`のシーケンスを値に持つキーを持つ辞書
* 最新のメッセージを文字列またはBaseMessageのシーケンスとして持つキーと、履歴メッセージを持つ別のキーを持つ辞書

そして、以下のいずれかを出力します。

* `AIMessage`の内容として扱える文字列
* `BaseMessage`のシーケンス
* `BaseMessage`のシーケンスを値に持つキーを持つ辞書

いくつかの例を見て、動作を確認しましょう。まず、入力が辞書で出力がメッセージの1つのRunnableを構築します。

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_openai.chat_models import ChatOpenAI

model = ChatOpenAI()
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You're an assistant who's good at {ability}. Respond in 20 words or fewer",
        ),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{input}"),
    ]
)
runnable = prompt | model
```

メッセージ履歴を管理するには、以下が必要です。
1. このRunnable
2. `BaseChatMessageHistory`のインスタンスを返す呼び出し可能なもの

[メモリ統合](https://integrations.langchain.com/memory)ページでは、Redisやその他のプロバイダを使ったチャットメッセージ履歴の実装例を確認できます。ここでは、メモリ内の`ChatMessageHistory`と、より永続的なストレージである`RedisChatMessageHistory`の使用例を示します。

## メモリ内

以下は、チャット履歴がメモリ内のグローバルPythonの辞書に保存される簡単な例です。

`get_session_history`という呼び出し可能なものを構築し、この辞書を参照して`ChatMessageHistory`のインスタンスを返します。呼び出し可能なものへの引数は、`RunnableWithMessageHistory`に設定を渡すことで指定できます。デフォルトでは、設定パラメータは単一の文字列`session_id`が期待されます。これは`history_factory_config`キーワード引数で調整できます。

デフォルトの単一パラメータを使う場合:

```python
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory

store = {}


def get_session_history(session_id: str) -> BaseChatMessageHistory:
    if session_id not in store:
        store[session_id] = ChatMessageHistory()
    return store[session_id]


with_message_history = RunnableWithMessageHistory(
    runnable,
    get_session_history,
    input_messages_key="input",
    history_messages_key="history",
)
```

`input_messages_key`(最新の入力メッセージとして扱うキー)と`history_messages_key`(履歴メッセージを追加するキー)を指定しています。

このRunnableを呼び出す際は、設定パラメータでそれに対応するチャット履歴を指定します。

```python
with_message_history.invoke(
    {"ability": "math", "input": "What does cosine mean?"},
    config={"configurable": {"session_id": "abc123"}},
)
```

```output
AIMessage(content='Cosine is a trigonometric function that calculates the ratio of the adjacent side to the hypotenuse of a right triangle.')
```

```python
# Remembers
with_message_history.invoke(
    {"ability": "math", "input": "What?"},
    config={"configurable": {"session_id": "abc123"}},
)
```

```output
AIMessage(content='Cosine is a mathematical function used to calculate the length of a side in a right triangle.')
```

```python
# New session_id --> does not remember.
with_message_history.invoke(
    {"ability": "math", "input": "What?"},
    config={"configurable": {"session_id": "def234"}},
)
```

```output
AIMessage(content='I can help with math problems. What do you need assistance with?')
```

メッセージ履歴を追跡するための設定パラメータは、`history_factory_config`パラメータに`ConfigurableFieldSpec`オブジェクトのリストを渡すことで、カスタマイズできます。以下では、`user_id`と`conversation_id`の2つのパラメータを使用しています。

```python
from langchain_core.runnables import ConfigurableFieldSpec

store = {}


def get_session_history(user_id: str, conversation_id: str) -> BaseChatMessageHistory:
    if (user_id, conversation_id) not in store:
        store[(user_id, conversation_id)] = ChatMessageHistory()
    return store[(user_id, conversation_id)]


with_message_history = RunnableWithMessageHistory(
    runnable,
    get_session_history,
    input_messages_key="input",
    history_messages_key="history",
    history_factory_config=[
        ConfigurableFieldSpec(
            id="user_id",
            annotation=str,
            name="User ID",
            description="Unique identifier for the user.",
            default="",
            is_shared=True,
        ),
        ConfigurableFieldSpec(
            id="conversation_id",
            annotation=str,
            name="Conversation ID",
            description="Unique identifier for the conversation.",
            default="",
            is_shared=True,
        ),
    ],
)
```

```python
with_message_history.invoke(
    {"ability": "math", "input": "Hello"},
    config={"configurable": {"user_id": "123", "conversation_id": "1"}},
)
```

### 異なる署名のRunnableの例

上記のRunnableは入力が辞書で出力が`BaseMessage`です。以下にいくつかの代替例を示します。

#### メッセージ入力、辞書出力

```python
from langchain_core.messages import HumanMessage
from langchain_core.runnables import RunnableParallel

chain = RunnableParallel({"output_message": ChatOpenAI()})


def get_session_history(session_id: str) -> BaseChatMessageHistory:
    if session_id not in store:
        store[session_id] = ChatMessageHistory()
    return store[session_id]


with_message_history = RunnableWithMessageHistory(
    chain,
    get_session_history,
    output_messages_key="output_message",
)

with_message_history.invoke(
    [HumanMessage(content="What did Simone de Beauvoir believe about free will")],
    config={"configurable": {"session_id": "baz"}},
)
```

```output
{'output_message': AIMessage(content="Simone de Beauvoir believed in the existence of free will. She argued that individuals have the ability to make choices and determine their own actions, even in the face of social and cultural constraints. She rejected the idea that individuals are purely products of their environment or predetermined by biology or destiny. Instead, she emphasized the importance of personal responsibility and the need for individuals to actively engage in creating their own lives and defining their own existence. De Beauvoir believed that freedom and agency come from recognizing one's own freedom and actively exercising it in the pursuit of personal and collective liberation.")}
```

```python
with_message_history.invoke(
    [HumanMessage(content="How did this compare to Sartre")],
    config={"configurable": {"session_id": "baz"}},
)
```

```output
{'output_message': AIMessage(content='Simone de Beauvoir\'s views on free will were closely aligned with those of her contemporary and partner Jean-Paul Sartre. Both de Beauvoir and Sartre were existentialist philosophers who emphasized the importance of individual freedom and the rejection of determinism. They believed that human beings have the capacity to transcend their circumstances and create their own meaning and values.\n\nSartre, in his famous work "Being and Nothingness," argued that human beings are condemned to be free, meaning that we are burdened with the responsibility of making choices and defining ourselves in a world that lacks inherent meaning. Like de Beauvoir, Sartre believed that individuals have the ability to exercise their freedom and make choices in the face of external and internal constraints.\n\nWhile there may be some nuanced differences in their philosophical writings, overall, de Beauvoir and Sartre shared a similar belief in the existence of free will and the importance of individual agency in shaping one\'s own life.')}
```

#### メッセージ入力、メッセージ出力

```python
RunnableWithMessageHistory(
    ChatOpenAI(),
    get_session_history,
)
```

#### 全メッセージを1つのキーに持つ辞書入力、メッセージ出力

```python
from operator import itemgetter

RunnableWithMessageHistory(
    itemgetter("input_messages") | ChatOpenAI(),
    get_session_history,
    input_messages_key="input_messages",
)
```

## 永続的なストレージ

多くの場合、会話履歴を永続化することが望ましいです。`RunnableWithMessageHistory`は、`get_session_history`呼び出し可能なものがチャットメッセージ履歴をどのように取得するかに依存しません。[こちら](https://github.com/langchain-ai/langserve/blob/main/examples/chat_with_persistence_and_user/server.py)にファイルシステムの例があります。以下では、Redisを使う方法を示します。その他のプロバイダを使ったチャットメッセージ履歴の実装例は[メモリ統合](https://integrations.langchain.com/memory)ページを参照してください。

### 設定

Redisがまだインストールされていない場合は、インストールする必要があります。

```python
%pip install --upgrade --quiet redis
```

ローカルのRedis Stackサーバーを起動します(既存のRedisデプロイメントに接続する場合は不要です)。

```bash
docker run -d -p 6379:6379 -p 8001:8001 redis/redis-stack:latest
```

```python
REDIS_URL = "redis://localhost:6379/0"
```

### [LangSmith](/docs/langsmith)

LangSmithは、入力がどのようなものかを理解するのが難しい場合、メッセージ履歴の注入などに特に役立ちます。

LangSmithは必須ではありませんが、便利です。
LangSmithを使う場合は、上記のリンクでサインアップした後、以下のコードをアンコメントし、環境変数を設定してトレースのログ記録を開始してください。

```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

メッセージ履歴の実装を更新するには、`RedisChatMessageHistory`のインスタンスを返す新しい呼び出し可能なものを定義するだけです。

```python
from langchain_community.chat_message_histories import RedisChatMessageHistory


def get_message_history(session_id: str) -> RedisChatMessageHistory:
    return RedisChatMessageHistory(session_id, url=REDIS_URL)


with_message_history = RunnableWithMessageHistory(
    runnable,
    get_message_history,
    input_messages_key="input",
    history_messages_key="history",
)
```

前と同様に呼び出すことができます。

```python
with_message_history.invoke(
    {"ability": "math", "input": "What does cosine mean?"},
    config={"configurable": {"session_id": "foobar"}},
)
```

```output
AIMessage(content='Cosine is a trigonometric function that represents the ratio of the adjacent side to the hypotenuse in a right triangle.')
```

```python
with_message_history.invoke(
    {"ability": "math", "input": "What's its inverse"},
    config={"configurable": {"session_id": "foobar"}},
)
```

```output
AIMessage(content='The inverse of cosine is the arccosine function, denoted as acos or cos^-1, which gives the angle corresponding to a given cosine value.')
```

:::tip

[Langsmith trace](https://smith.langchain.com/public/bd73e122-6ec1-48b2-82df-e6483dc9cb63/r)

:::

2回目の呼び出しのLangSmithトレースを見ると、プロンプトを構築する際に"history"変数が注入されており、これは2つのメッセージ(最初の入力と最初の出力)のリストになっていることがわかります。
