---
sidebar_position: 1
translated: true
---

# メモリ管理

チャットボットの主な特徴の1つは、前回の会話の内容をコンテキストとして使用できることです。このステート管理には以下のようないくつかの形式があります:

- 前のメッセージをチャットモデルのプロンプトに単に詰め込む。
- 上記の方法ですが、古いメッセージをトリミングして、モデルが扱う必要のある情報量を減らす。
- 長期にわたる会話の要約を合成するなどの、より複雑な修正。

以下でいくつかの手法について詳しく説明します。

## セットアップ

いくつかのパッケージをインストールする必要があり、`OPENAI_API_KEY`という名前の環境変数にOpenAIのAPIキーを設定する必要があります:

```python
%pip install --upgrade --quiet langchain langchain-openai

# Set env var OPENAI_API_KEY or load from a .env file:
import dotenv

dotenv.load_dotenv()
```

```output
[33mWARNING: You are using pip version 22.0.4; however, version 23.3.2 is available.
You should consider upgrading via the '/Users/jacoblee/.pyenv/versions/3.10.5/bin/python -m pip install --upgrade pip' command.[0m[33m
[0mNote: you may need to restart the kernel to use updated packages.
```

```output
True
```

次に、以下の例で使用するチャットモデルを設定しましょう。

```python
from langchain_openai import ChatOpenAI

chat = ChatOpenAI(model="gpt-3.5-turbo-1106")
```

## メッセージの受け渡し

メモリの最も単純な形式は、チャット履歴メッセージをチェーンに渡すことです。以下に例を示します:

```python
from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful assistant. Answer all questions to the best of your ability.",
        ),
        MessagesPlaceholder(variable_name="messages"),
    ]
)

chain = prompt | chat

chain.invoke(
    {
        "messages": [
            HumanMessage(
                content="Translate this sentence from English to French: I love programming."
            ),
            AIMessage(content="J'adore la programmation."),
            HumanMessage(content="What did you just say?"),
        ],
    }
)
```

```output
AIMessage(content='I said "J\'adore la programmation," which means "I love programming" in French.')
```

前の会話をチェーンに渡すことで、それをコンテキストとして使用して質問に答えることができます。これがチャットボットのメモリの基本的な概念です。このガイドの残りの部分では、メッセージを受け渡したり再フォーマットしたりするための便利な手法を紹介します。

## チャット履歴

メッセージを配列として直接保存して渡すのは問題ありませんが、LangChainの組み込み[メッセージ履歴クラス](/docs/modules/memory/chat_messages/)を使ってメッセージを保存およびロードすることもできます。このクラスのインスタンスは、永続ストレージからチャットメッセージを保存およびロードする責任を負います。LangChainは多くのプロバイダーと統合されていますが、このデモでは一時的なデモクラスを使用します。

APIの例は以下のとおりです:

```python
from langchain.memory import ChatMessageHistory

demo_ephemeral_chat_history = ChatMessageHistory()

demo_ephemeral_chat_history.add_user_message(
    "Translate this sentence from English to French: I love programming."
)

demo_ephemeral_chat_history.add_ai_message("J'adore la programmation.")

demo_ephemeral_chat_history.messages
```

```output
[HumanMessage(content='Translate this sentence from English to French: I love programming.'),
 AIMessage(content="J'adore la programmation.")]
```

これを直接使って、チェーンの会話ターンを保存することができます:

```python
demo_ephemeral_chat_history = ChatMessageHistory()

input1 = "Translate this sentence from English to French: I love programming."

demo_ephemeral_chat_history.add_user_message(input1)

response = chain.invoke(
    {
        "messages": demo_ephemeral_chat_history.messages,
    }
)

demo_ephemeral_chat_history.add_ai_message(response)

input2 = "What did I just ask you?"

demo_ephemeral_chat_history.add_user_message(input2)

chain.invoke(
    {
        "messages": demo_ephemeral_chat_history.messages,
    }
)
```

```output
AIMessage(content='You asked me to translate the sentence "I love programming" from English to French.')
```

## 自動履歴管理

前の例では、メッセージをチェーンに明示的に渡しています。これは完全に許容される方法ですが、新しいメッセージの外部管理が必要です。LangChainには、この処理を自動的に処理できるLCELチェーンのラッパーである`RunnableWithMessageHistory`も含まれています。

これがどのように機能するかを示すために、上記のプロンプトを少し修正して、最終的な`input`変数を`HumanMessage`テンプレートに入力するようにします。つまり、現在のメッセージの前のすべてのメッセージを含む`chat_history`パラメーターを期待することになります。

```python
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful assistant. Answer all questions to the best of your ability.",
        ),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}"),
    ]
)

chain = prompt | chat
```

最新の入力をここでチャット履歴に渡し、`RunnableWithMessageHistory`クラスがチェーンをラップして、その`input`変数をチャット履歴に追加する作業を行うようにします。

次に、ラップされたチェーンを宣言しましょう:

```python
from langchain_core.runnables.history import RunnableWithMessageHistory

demo_ephemeral_chat_history_for_chain = ChatMessageHistory()

chain_with_message_history = RunnableWithMessageHistory(
    chain,
    lambda session_id: demo_ephemeral_chat_history_for_chain,
    input_messages_key="input",
    history_messages_key="chat_history",
)
```

このクラスには、ラップするチェーンの他に、いくつかのパラメーターが必要です:

- 指定のセッションIDに対してメッセージ履歴を返す工場関数。これにより、チェーンが複数のユーザーを同時に処理できるようになります。
- `input_messages_key`は、入力のどの部分をトラックおよび保存するかを指定します。この例では、`input`として渡された文字列をトラックしたいです。
- `history_messages_key`は、前のメッセージをプロンプトにどのように挿入するかを指定します。プロンプトには`chat_history`という名前の`MessagesPlaceholder`があるので、この属性をそれに合わせて指定します。
- (複数の出力を持つチェーンの場合)履歴に保存する出力を指定する`output_messages_key`。これは`input_messages_key`の逆です。

通常どおりにこの新しいチェーンを呼び出すことができますが、特定の`session_id`を工場関数に渡す`configurable`フィールドを追加する必要があります。これはデモでは使用されませんが、実際のチェーンでは、渡されたセッションに対応するチャット履歴を返す必要があります:

```python
chain_with_message_history.invoke(
    {"input": "Translate this sentence from English to French: I love programming."},
    {"configurable": {"session_id": "unused"}},
)
```

```output
AIMessage(content='The translation of "I love programming" in French is "J\'adore la programmation."')
```

```python
chain_with_message_history.invoke(
    {"input": "What did I just ask you?"}, {"configurable": {"session_id": "unused"}}
)
```

```output
AIMessage(content='You just asked me to translate the sentence "I love programming" from English to French.')
```

## チャット履歴の修正

保存されたチャットメッセージを修正することで、チャットボットがさまざまな状況に対応できるようになります。以下に例を示します:

### トリミングメッセージ

LLMやチャットモデルには限られたコンテキストウィンドウがあり、直接制限に達していなくても、モデルの注意を散漫にしないように、表示するメッセージ数を制限したい場合があります。1つの解決策は、最新の `n` 件のメッセージのみを読み込んで保存することです。事前に読み込まれたメッセージを含むメッセージ履歴の例を見てみましょう:

```python
demo_ephemeral_chat_history = ChatMessageHistory()

demo_ephemeral_chat_history.add_user_message("Hey there! I'm Nemo.")
demo_ephemeral_chat_history.add_ai_message("Hello!")
demo_ephemeral_chat_history.add_user_message("How are you today?")
demo_ephemeral_chat_history.add_ai_message("Fine thanks!")

demo_ephemeral_chat_history.messages
```

```output
[HumanMessage(content="Hey there! I'm Nemo."),
 AIMessage(content='Hello!'),
 HumanMessage(content='How are you today?'),
 AIMessage(content='Fine thanks!')]
```

先ほど定義した `RunnableWithMessageHistory` チェーンを使ってこのメッセージ履歴を使ってみましょう:

```python
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful assistant. Answer all questions to the best of your ability.",
        ),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}"),
    ]
)

chain = prompt | chat

chain_with_message_history = RunnableWithMessageHistory(
    chain,
    lambda session_id: demo_ephemeral_chat_history,
    input_messages_key="input",
    history_messages_key="chat_history",
)

chain_with_message_history.invoke(
    {"input": "What's my name?"},
    {"configurable": {"session_id": "unused"}},
)
```

```output
AIMessage(content='Your name is Nemo.')
```

チェーンが事前に読み込まれた名前を覚えていることがわかります。

しかし、コンテキストウィンドウが非常に小さい場合は、チェーンに渡すメッセージ数を最新の2件のみに制限したいかもしれません。`clear` メソッドを使ってメッセージを削除し、履歴に再追加することができます。必須ではありませんが、常に呼び出されるようにするために、このメソッドをチェーンの先頭に置きます:

```python
from langchain_core.runnables import RunnablePassthrough


def trim_messages(chain_input):
    stored_messages = demo_ephemeral_chat_history.messages
    if len(stored_messages) <= 2:
        return False

    demo_ephemeral_chat_history.clear()

    for message in stored_messages[-2:]:
        demo_ephemeral_chat_history.add_message(message)

    return True


chain_with_trimming = (
    RunnablePassthrough.assign(messages_trimmed=trim_messages)
    | chain_with_message_history
)
```

この新しいチェーンを呼び出して、その後のメッセージを確認してみましょう:

```python
chain_with_trimming.invoke(
    {"input": "Where does P. Sherman live?"},
    {"configurable": {"session_id": "unused"}},
)
```

```output
AIMessage(content="P. Sherman's address is 42 Wallaby Way, Sydney.")
```

```python
demo_ephemeral_chat_history.messages
```

```output
[HumanMessage(content="What's my name?"),
 AIMessage(content='Your name is Nemo.'),
 HumanMessage(content='Where does P. Sherman live?'),
 AIMessage(content="P. Sherman's address is 42 Wallaby Way, Sydney.")]
```

履歴から最も古い2件のメッセージが削除され、最新の会話が末尾に追加されていることがわかります。次にチェーンが呼び出されると、`trim_messages` が再び呼び出され、最新の2件のメッセージのみがモデルに渡されます。この場合、次にチェーンを呼び出したときに、以前に与えた名前を忘れてしまうことになります:

```python
chain_with_trimming.invoke(
    {"input": "What is my name?"},
    {"configurable": {"session_id": "unused"}},
)
```

```output
AIMessage(content="I'm sorry, I don't have access to your personal information.")
```

```python
demo_ephemeral_chat_history.messages
```

```output
[HumanMessage(content='Where does P. Sherman live?'),
 AIMessage(content="P. Sherman's address is 42 Wallaby Way, Sydney."),
 HumanMessage(content='What is my name?'),
 AIMessage(content="I'm sorry, I don't have access to your personal information.")]
```

### サマリーメモリ

この同じパターンを他の用途にも使うことができます。例えば、チェーンを呼び出す前に、会話のサマリーを生成する追加のLLMコールを使うこともできます。チャット履歴とチャットボットチェーンを再作成してみましょう:

```python
demo_ephemeral_chat_history = ChatMessageHistory()

demo_ephemeral_chat_history.add_user_message("Hey there! I'm Nemo.")
demo_ephemeral_chat_history.add_ai_message("Hello!")
demo_ephemeral_chat_history.add_user_message("How are you today?")
demo_ephemeral_chat_history.add_ai_message("Fine thanks!")

demo_ephemeral_chat_history.messages
```

```output
[HumanMessage(content="Hey there! I'm Nemo."),
 AIMessage(content='Hello!'),
 HumanMessage(content='How are you today?'),
 AIMessage(content='Fine thanks!')]
```

LLMがチャット履歴ではなく要約を受け取ることを認識するように、プロンプトをわずかに変更します:

```python
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful assistant. Answer all questions to the best of your ability. The provided chat history includes facts about the user you are speaking with.",
        ),
        MessagesPlaceholder(variable_name="chat_history"),
        ("user", "{input}"),
    ]
)

chain = prompt | chat

chain_with_message_history = RunnableWithMessageHistory(
    chain,
    lambda session_id: demo_ephemeral_chat_history,
    input_messages_key="input",
    history_messages_key="chat_history",
)
```

そして今度は、過去の相互作用を要約する関数を作成しましょう。これもチェーンの先頭に追加できます:

```python
def summarize_messages(chain_input):
    stored_messages = demo_ephemeral_chat_history.messages
    if len(stored_messages) == 0:
        return False
    summarization_prompt = ChatPromptTemplate.from_messages(
        [
            MessagesPlaceholder(variable_name="chat_history"),
            (
                "user",
                "Distill the above chat messages into a single summary message. Include as many specific details as you can.",
            ),
        ]
    )
    summarization_chain = summarization_prompt | chat

    summary_message = summarization_chain.invoke({"chat_history": stored_messages})

    demo_ephemeral_chat_history.clear()

    demo_ephemeral_chat_history.add_message(summary_message)

    return True


chain_with_summarization = (
    RunnablePassthrough.assign(messages_summarized=summarize_messages)
    | chain_with_message_history
)
```

以前に与えた名前を覚えているかどうか確認してみましょう:

```python
chain_with_summarization.invoke(
    {"input": "What did I say my name was?"},
    {"configurable": {"session_id": "unused"}},
)
```

```output
AIMessage(content='You introduced yourself as Nemo. How can I assist you today, Nemo?')
```

```python
demo_ephemeral_chat_history.messages
```

```output
[AIMessage(content='The conversation is between Nemo and an AI. Nemo introduces himself and the AI responds with a greeting. Nemo then asks the AI how it is doing, and the AI responds that it is fine.'),
 HumanMessage(content='What did I say my name was?'),
 AIMessage(content='You introduced yourself as Nemo. How can I assist you today, Nemo?')]
```

チェーンを再度呼び出すと、最初の要約に新しいメッセージが追加された要約が生成されます。チャット履歴の一部をそのまま保持し、他の部分を要約するハイブリッドアプローチを設計することもできます。
