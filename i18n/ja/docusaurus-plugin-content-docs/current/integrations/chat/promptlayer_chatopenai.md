---
sidebar_label: PromptLayer ChatOpenAI
translated: true
---

# PromptLayerChatOpenAI

このサンプルでは、[PromptLayer](https://www.promptlayer.com)に接続して、ChatOpenAIリクエストの記録を開始する方法を紹介します。

## PromptLayerのインストール

OpenAIでPromptLayerを使用するには、`promptlayer`パッケージが必要です。pipを使って`promptlayer`をインストールしてください。

```python
pip install promptlayer
```

## インポート

```python
import os

from langchain_community.chat_models import PromptLayerChatOpenAI
from langchain_core.messages import HumanMessage
```

## 環境API Keyの設定

[www.promptlayer.com](https://www.promptlayer.com)のナビゲーションバーにある設定アイコンをクリックして、PromptLayer APIキーを作成できます。

それを`PROMPTLAYER_API_KEY`という環境変数として設定してください。

```python
os.environ["PROMPTLAYER_API_KEY"] = "**********"
```

## PromptLayerOpenAIのLLMを通常どおりに使用する

*オプションで`pl_tags`を渡して、PromptLayerのタグ付け機能でリクエストを追跡できます。*

```python
chat = PromptLayerChatOpenAI(pl_tags=["langchain"])
chat([HumanMessage(content="I am a cat and I want")])
```

```output
AIMessage(content='to take a nap in a cozy spot. I search around for a suitable place and finally settle on a soft cushion on the window sill. I curl up into a ball and close my eyes, relishing the warmth of the sun on my fur. As I drift off to sleep, I can hear the birds chirping outside and feel the gentle breeze blowing through the window. This is the life of a contented cat.', additional_kwargs={})
```

**上記のリクエストは、[PromptLayerダッシュボード](https://www.promptlayer.com)に表示されるはずです。**

## PromptLayerトラッキングの使用

[PromptLayerのトラッキング機能](https://magniv.notion.site/Track-4deee1b1f7a34c1680d085f82567dab9)を使用したい場合は、リクエストIDを取得するために、PromptLayerのLLMをインスタンス化する際に`return_pl_id`引数を渡す必要があります。

```python
import promptlayer

chat = PromptLayerChatOpenAI(return_pl_id=True)
chat_results = chat.generate([[HumanMessage(content="I am a cat and I want")]])

for res in chat_results.generations:
    pl_request_id = res[0].generation_info["pl_request_id"]
    promptlayer.track.score(request_id=pl_request_id, score=100)
```

これを使うことで、PromptLayerダッシュボードでモデルのパフォーマンスを追跡できます。プロンプトテンプレートを使用している場合は、リクエストにテンプレートを添付することもできます。
これにより、PromptLayerダッシュボードで、さまざまなテンプレートやモデルのパフォーマンスを追跡できるようになります。
