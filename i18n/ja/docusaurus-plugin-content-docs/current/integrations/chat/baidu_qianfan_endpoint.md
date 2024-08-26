---
sidebar_label: Baidu Qianfan
translated: true
---

# QianfanChatEndpoint

Baidu AI Cloud Qianfan Platformは、企業の開発者向けのワンストップ大規模モデル開発およびサービス運用プラットフォームです。Qianfanは、Wenxin Yiyan（ERNIE-Bot）のモデルやサードパーティのオープンソースモデルを含む様々なAI開発ツールと開発環境を提供し、顧客が大規模モデルアプリケーションを簡単に使用および開発できるようにします。

基本的に、これらのモデルは以下のタイプに分かれています：

- 埋め込み（Embedding）
- チャット（Chat）
- 完了（Completion）

このノートブックでは、主に`langchain/chat_models`パッケージに対応する`Chat`で[Qianfan](https://cloud.baidu.com/doc/WENXINWORKSHOP/index.html)を使用する方法を紹介します：

## APIの初期化

Baidu Qianfanに基づくLLMサービスを使用するには、これらのパラメータを初期化する必要があります：

環境変数でAK,SKを初期化するか、パラメータを初期化することができます：

```base
export QIANFAN_AK=XXX
export QIANFAN_SK=XXX
```

## 現在サポートされているモデル：

- ERNIE-Bot-turbo（デフォルトモデル）
- ERNIE-Bot
- BLOOMZ-7B
- Llama-2-7b-chat
- Llama-2-13b-chat
- Llama-2-70b-chat
- Qianfan-BLOOMZ-7B-compressed
- Qianfan-Chinese-Llama-2-7B
- ChatGLM2-6B-32K
- AquilaChat-7B

## セットアップ

```python
"""For basic init and call"""
import os

from langchain_community.chat_models import QianfanChatEndpoint
from langchain_core.language_models.chat_models import HumanMessage

os.environ["QIANFAN_AK"] = "Your_api_key"
os.environ["QIANFAN_SK"] = "You_secret_Key"
```

## 使用方法

```python
chat = QianfanChatEndpoint(streaming=True)
messages = [HumanMessage(content="Hello")]
chat.invoke(messages)
```

```output
AIMessage(content='您好！请问您需要什么帮助？我将尽力回答您的问题。')
```

```python
await chat.ainvoke(messages)
```

```output
AIMessage(content='您好！有什么我可以帮助您的吗？')
```

```python
chat.batch([messages])
```

```output
[AIMessage(content='您好！有什么我可以帮助您的吗？')]
```

### ストリーミング

```python
try:
    for chunk in chat.stream(messages):
        print(chunk.content, end="", flush=True)
except TypeError as e:
    print("")
```

```output
您好！有什么我可以帮助您的吗？
```

## Qianfanで異なるモデルを使用する

デフォルトモデルはERNIE-Bot-turboです。Ernie Botまたはサードパーティのオープンソースモデルに基づいて独自のモデルをデプロイしたい場合は、次の手順に従ってください：

1. （オプション、モデルがデフォルトモデルに含まれている場合はスキップ）Qianfanコンソールでモデルをデプロイし、独自のカスタマイズされたデプロイエンドポイントを取得します。
2. 初期化時に`endpoint`というフィールドを設定します：

```python
chatBot = QianfanChatEndpoint(
    streaming=True,
    model="ERNIE-Bot",
)

messages = [HumanMessage(content="Hello")]
chatBot.invoke(messages)
```

```output
AIMessage(content='Hello，可以回答问题了，我会竭尽全力为您解答，请问有什么问题吗？')
```

## モデルパラメータ：

現在、以下のモデルパラメータをサポートしているのは`ERNIE-Bot`と`ERNIE-Bot-turbo`のみです。今後、他のモデルもサポートする予定です。

- temperature
- top_p
- penalty_score

```python
chat.invoke(
    [HumanMessage(content="Hello")],
    **{"top_p": 0.4, "temperature": 0.1, "penalty_score": 1},
)
```

```output
AIMessage(content='您好！有什么我可以帮助您的吗？')
```
