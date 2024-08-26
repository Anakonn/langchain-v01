---
sidebar_label: 花火
translated: true
---

# ChatFireworks

>[Fireworks](https://app.fireworks.ai/) は、革新的な AI 実験およびプロダクション プラットフォームを作成することで、ジェネレーティブ AI の製品開発を加速させます。

この例では、LangChain を使って `ChatFireworks` モデルとやり取りする方法を説明します。
%pip install langchain-fireworks

```python
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_fireworks import ChatFireworks
```

# セットアップ

1. `langchain-fireworks` パッケージがお使いの環境にインストールされていることを確認してください。
2. [Fireworks AI](http://fireworks.ai) にサインインし、モデルにアクセスするための API キーを取得し、`FIREWORKS_API_KEY` 環境変数に設定してください。
3. モデル ID を使ってモデルを設定してください。モデルが設定されていない場合は、デフォルトのモデルは fireworks-llama-v2-7b-chat になります。最新のモデル一覧は [app.fireworks.ai](https://app.fireworks.ai) でご確認ください。

```python
import getpass
import os

if "FIREWORKS_API_KEY" not in os.environ:
    os.environ["FIREWORKS_API_KEY"] = getpass.getpass("Fireworks API Key:")

# Initialize a Fireworks chat model
chat = ChatFireworks(model="accounts/fireworks/models/mixtral-8x7b-instruct")
```

# モデルを直接呼び出す

システムメッセージとユーザーメッセージを渡してモデルを直接呼び出し、回答を得ることができます。

```python
# ChatFireworks Wrapper
system_message = SystemMessage(content="You are to chat with the user.")
human_message = HumanMessage(content="Who are you?")

chat.invoke([system_message, human_message])
```

```output
AIMessage(content="Hello! I'm an AI language model, a helpful assistant designed to chat and assist you with any questions or information you might need. I'm here to make your experience as smooth and enjoyable as possible. How can I assist you today?")
```

```python
# Setting additional parameters: temperature, max_tokens, top_p
chat = ChatFireworks(
    model="accounts/fireworks/models/mixtral-8x7b-instruct",
    temperature=1,
    max_tokens=20,
)
system_message = SystemMessage(content="You are to chat with the user.")
human_message = HumanMessage(content="How's the weather today?")
chat.invoke([system_message, human_message])
```

```output
AIMessage(content="I'm an AI and do not have the ability to experience the weather firsthand. However,")
```

# ツールの呼び出し

Fireworks では [`FireFunction-v1` ツール呼び出しモデル](https://fireworks.ai/blog/firefunction-v1-gpt-4-level-function-calling)を提供しています。構造化された出力や関数呼び出しのユースケースに使用できます。

```python
from pprint import pprint

from langchain_core.pydantic_v1 import BaseModel


class ExtractFields(BaseModel):
    name: str
    age: int


chat = ChatFireworks(
    model="accounts/fireworks/models/firefunction-v1",
).bind_tools([ExtractFields])

result = chat.invoke("I am a 27 year old named Erick")

pprint(result.additional_kwargs["tool_calls"][0])
```

```output
{'function': {'arguments': '{"name": "Erick", "age": 27}',
              'name': 'ExtractFields'},
 'id': 'call_J0WYP2TLenaFw3UeVU0UnWqx',
 'index': 0,
 'type': 'function'}
```
