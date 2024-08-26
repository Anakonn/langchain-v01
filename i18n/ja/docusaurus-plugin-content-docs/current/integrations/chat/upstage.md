---
sidebar_label: アップステージ
translated: true
---

# ChatUpstage

このノートブックでは、Upstageチャットモデルの使い始め方を説明します。

## インストール

`langchain-upstage`パッケージをインストールします。

```bash
pip install -U langchain-upstage
```

## 環境設定

以下の環境変数を設定してください:

- `UPSTAGE_API_KEY`: [Upstage console](https://console.upstage.ai/)から取得したUpstage APIキー。

## 使用方法

```python
import os

os.environ["UPSTAGE_API_KEY"] = "YOUR_API_KEY"
```

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_upstage import ChatUpstage

chat = ChatUpstage()
```

```python
# using chat invoke
chat.invoke("Hello, how are you?")
```

```python
# using chat stream
for m in chat.stream("Hello, how are you?"):
    print(m)
```

## チェーニング

```python
# using chain
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful assistant that translates English to French."),
        ("human", "Translate this sentence from English to French. {english_text}."),
    ]
)
chain = prompt | chat

chain.invoke({"english_text": "Hello, how are you?"})
```
