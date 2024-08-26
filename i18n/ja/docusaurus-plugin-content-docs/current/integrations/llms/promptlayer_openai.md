---
translated: true
---

# PromptLayer OpenAI

`PromptLayer`は、GPTプロンプトエンジニアリングを追跡、管理、共有できる最初のプラットフォームです。`PromptLayer`は、コードと`OpenAI's`Pythonライブラリの間のミドルウェアとして機能します。

`PromptLayer`は、すべての`OpenAI API`リクエストを記録し、`PromptLayer`ダッシュボードでリクエスト履歴を検索および探索できるようにします。

この例では、[PromptLayer](https://www.promptlayer.com)に接続してOpenAIリクエストの記録を開始する方法を示します。

別の例は[こちら](/docs/integrations/providers/promptlayer)にあります。

## PromptLayerのインストール

OpenAIでPromptLayerを使用するには、`promptlayer`パッケージが必要です。pipを使って`promptlayer`をインストールします。

```python
%pip install --upgrade --quiet  promptlayer
```

## インポート

```python
import os

import promptlayer
from langchain_community.llms import PromptLayerOpenAI
```

## 環境API Keyの設定

[www.promptlayer.com](https://www.promptlayer.com)のナビゲーションバーの設定アイコンをクリックして、PromptLayer API Keyを作成できます。

これを`PROMPTLAYER_API_KEY`という環境変数として設定します。

また、`OPENAI_API_KEY`という名前のOpenAI Keyも必要です。

```python
from getpass import getpass

PROMPTLAYER_API_KEY = getpass()
```

```output
 ········
```

```python
os.environ["PROMPTLAYER_API_KEY"] = PROMPTLAYER_API_KEY
```

```python
from getpass import getpass

OPENAI_API_KEY = getpass()
```

```output
 ········
```

```python
os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY
```

## PromptLayerOpenAIのLLMを通常どおりに使用する

*オプションで`pl_tags`を渡して、PromptLayerのタグ付け機能でリクエストを追跡できます。*

```python
llm = PromptLayerOpenAI(pl_tags=["langchain"])
llm("I am a cat and I want")
```

**上記のリクエストは、[PromptLayerダッシュボード](https://www.promptlayer.com)に表示されるはずです。**

## PromptLayerトラッキングの使用

[PromptLayerトラッキング機能](https://magniv.notion.site/Track-4deee1b1f7a34c1680d085f82567dab9)を使用したい場合は、リクエストIDを取得するために`return_pl_id`引数をPromptLayerのLLMインスタンス化時に渡す必要があります。

```python
llm = PromptLayerOpenAI(return_pl_id=True)
llm_results = llm.generate(["Tell me a joke"])

for res in llm_results.generations:
    pl_request_id = res[0].generation_info["pl_request_id"]
    promptlayer.track.score(request_id=pl_request_id, score=100)
```

これを使用すると、PromptLayerダッシュボードでモデルのパフォーマンスを追跡できます。プロンプトテンプレートを使用している場合は、リクエストにテンプレートを添付することもできます。
全体として、これにより、PromptLayerダッシュボードで異なるテンプレートやモデルのパフォーマンスを追跡する機会が得られます。
