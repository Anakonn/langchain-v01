---
translated: true
---

# DeepInfra

[DeepInfra](https://deepinfra.com/?utm_source=langchain)は、さまざまな[LLM](https://deepinfra.com/models?utm_source=langchain)と[埋め込みモデル](https://deepinfra.com/models?type=embeddings&utm_source=langchain)にアクセスできるサーバーレスのインファレンスサービスです。このノートブックでは、LangChainを使ってDeepInfraのチャットモデルを使う方法を説明します。

## 環境API Keyの設定

DeepInfraからAPIキーを取得してください。[ログイン](https://deepinfra.com/login?from=%2Fdash)して新しいトークンを取得する必要があります。

1時間分のサーバーレスGPUコンピューティングが無料で使えます。(詳細は[こちら](https://github.com/deepinfra/deepctl#deepctl))を参照)
`deepctl auth token`でトークンを表示できます。

```python
# get a new token: https://deepinfra.com/login?from=%2Fdash

import os
from getpass import getpass

from langchain_community.chat_models import ChatDeepInfra
from langchain_core.messages import HumanMessage

DEEPINFRA_API_TOKEN = getpass()

# or pass deepinfra_api_token parameter to the ChatDeepInfra constructor
os.environ["DEEPINFRA_API_TOKEN"] = DEEPINFRA_API_TOKEN

chat = ChatDeepInfra(model="meta-llama/Llama-2-7b-chat-hf")

messages = [
    HumanMessage(
        content="Translate this sentence from English to French. I love programming."
    )
]
chat.invoke(messages)
```

## `ChatDeepInfra`は非同期とストリーミングの機能もサポートしています:

```python
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
```

```python
await chat.agenerate([messages])
```

```python
chat = ChatDeepInfra(
    streaming=True,
    verbose=True,
    callbacks=[StreamingStdOutCallbackHandler()],
)
chat.invoke(messages)
```
