---
sidebar_label: Konko
translated: true
---

# ChatKonko

# Konko

>[Konko](https://www.konko.ai/) APIは、アプリケーション開発者を支援するために設計された完全に管理されたWebAPIです:

1. **選択** - 自社のアプリケーションに最適なオープンソースまたは独自のLLMを選択する
2. **構築** - 主要なアプリケーションフレームワークとの統合や完全に管理されたAPIを使って、アプリケーションをより迅速に構築する
3. **微調整** - 小規模なオープンソースLLMを微調整して、コストを大幅に抑えながら業界トップレベルのパフォーマンスを実現する
4. **本番環境での展開** - Konko AIのSOC 2準拠のマルチクラウドインフラストラクチャを使って、セキュリティ、プライバシー、スループット、レイテンシのSLAを満たすプロダクション規模のAPIを展開する

このサンプルでは、LangChainを使って`Konko`のChatCompletionモデル[models](https://docs.konko.ai/docs/list-of-models#konko-hosted-models-for-chatcompletion)を操作する方法を説明します。

このノートブックを実行するには、Konko APIキーが必要です。ウェブアプリにサインインして[APIキーを作成](https://platform.konko.ai/settings/api-keys)し、モデルにアクセスしてください。

```python
from langchain_community.chat_models import ChatKonko
from langchain_core.messages import HumanMessage, SystemMessage
```

#### 環境変数の設定

1. 以下の環境変数を設定できます:
   1. KONKO_API_KEY (必須)
   2. OPENAI_API_KEY (オプション)
2. 現在のシェルセッションで、exportコマンドを使用します:

```shell
export KONKO_API_KEY={your_KONKO_API_KEY_here}
export OPENAI_API_KEY={your_OPENAI_API_KEY_here} #Optional
```

## モデルの呼び出し

[Konkoの概要ページ](https://docs.konko.ai/docs/list-of-models)でモデルを見つけます。

Konkoインスタンスで実行中のモデルのリストを取得する別の方法は、この[エンドポイント](https://docs.konko.ai/reference/get-models)を使うことです。

ここから、モデルを初期化できます:

```python
chat = ChatKonko(max_tokens=400, model="meta-llama/llama-2-13b-chat")
```

```python
messages = [
    SystemMessage(content="You are a helpful assistant."),
    HumanMessage(content="Explain Big Bang Theory briefly"),
]
chat(messages)
```

```output
AIMessage(content="  Sure thing! The Big Bang Theory is a scientific theory that explains the origins of the universe. In short, it suggests that the universe began as an infinitely hot and dense point around 13.8 billion years ago and expanded rapidly. This expansion continues to this day, and it's what makes the universe look the way it does.\n\nHere's a brief overview of the key points:\n\n1. The universe started as a singularity, a point of infinite density and temperature.\n2. The singularity expanded rapidly, causing the universe to cool and expand.\n3. As the universe expanded, particles began to form, including protons, neutrons, and electrons.\n4. These particles eventually came together to form atoms, and later, stars and galaxies.\n5. The universe is still expanding today, and the rate of this expansion is accelerating.\n\nThat's the Big Bang Theory in a nutshell! It's a pretty mind-blowing idea when you think about it, and it's supported by a lot of scientific evidence. Do you have any other questions about it?")
```
