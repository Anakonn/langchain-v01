---
sidebar_label: MistralAI
translated: true
---

# MistralAI

このノートブックでは、[API](https://docs.mistral.ai/api/)を介してMistralAIチャットモデルの使い始め方について説明します。

有効な[API key](https://console.mistral.ai/users/api-keys/)が必要で、APIと通信するためには必要です。

すべての属性とメソッドの詳細なドキュメントについては、[API reference](https://api.python.langchain.com/en/latest/chat_models/langchain_mistralai.chat_models.ChatMistralAI.html)を参照してください。

## セットアップ

APIを使用するには、`langchain-core`と`langchain-mistralai`パッケージが必要です。これらはインストールできます:

```bash
pip install -U langchain-core langchain-mistralai
```

また、[Mistral API key](https://console.mistral.ai/users/api-keys/)を取得する必要があります。

```python
import getpass

api_key = getpass.getpass()
```

## 使用方法

```python
from langchain_core.messages import HumanMessage
from langchain_mistralai.chat_models import ChatMistralAI
```

```python
# If api_key is not passed, default behavior is to use the `MISTRAL_API_KEY` environment variable.
chat = ChatMistralAI(api_key=api_key)
```

```python
messages = [HumanMessage(content="knock knock")]
chat.invoke(messages)
```

```output
AIMessage(content="Who's there? I was just about to ask the same thing! How can I assist you today?")
```

### 非同期

```python
await chat.ainvoke(messages)
```

```output
AIMessage(content='Who\'s there?\n\n(You can then continue the "knock knock" joke by saying the name of the person or character who should be responding. For example, if I say "Banana," you could respond with "Banana who?" and I would say "Banana bunch! Get it? Because a group of bananas is called a \'bunch\'!" and then we would both laugh and have a great time. But really, you can put anything you want in the spot where I put "Banana" and it will still technically be a "knock knock" joke. The possibilities are endless!)')
```

### ストリーミング

```python
for chunk in chat.stream(messages):
    print(chunk.content, end="")
```

```output
Who's there?

(After this, the conversation can continue as a call and response "who's there" joke. Here is an example of how it could go:

You say: Orange.
I say: Orange who?
You say: Orange you glad I didn't say banana!?)

But since you asked for a knock knock joke specifically, here's one for you:

Knock knock.

Me: Who's there?

You: Lettuce.

Me: Lettuce who?

You: Lettuce in, it's too cold out here!

I hope this brings a smile to your face! Do you have a favorite knock knock joke you'd like to share? I'd love to hear it.
```

### バッチ

```python
chat.batch([messages])
```

```output
[AIMessage(content="Who's there? I was just about to ask the same thing! Go ahead and tell me who's there. I love a good knock-knock joke.")]
```

## チェーニング

また、ユーザー入力を簡単に構造化するためにプロンプトテンプレートと組み合わせることもできます。これは[LCEL](/docs/expression_language)を使って行うことができます。

```python
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_template("Tell me a joke about {topic}")
chain = prompt | chat
```

```python
chain.invoke({"topic": "bears"})
```

```output
AIMessage(content='Why do bears hate shoes so much? They like to run around in their bear feet.')
```
