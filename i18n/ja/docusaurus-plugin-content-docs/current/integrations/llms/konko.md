---
sidebar_label: Konko
translated: true
---

# Konko

>[Konko](https://www.konko.ai/) APIは、アプリケーション開発者を支援するために設計された完全に管理されたWebAPIです:

1. **選択** - 自分のアプリケーションに最適なオープンソースまたは独自のLLMを選択する
2. **構築** - 主要なアプリケーションフレームワークとの統合や完全に管理されたAPIを使って、アプリケーションをより早く構築する
3. **微調整** - 小規模なオープンソースLLMを微調整して、コストを大幅に抑えながら業界トップレベルのパフォーマンスを実現する
4. **デプロイ** - インフラストラクチャのセットアップや管理なしに、セキュリティ、プライバシー、スループット、レイテンシのSLAを満たす本番スケールのAPIをデプロイする

このサンプルでは、LangChainを使ってKonkoの完了[モデル](https://docs.konko.ai/docs/list-of-models#konko-hosted-models-for-completion)と対話する方法を説明します。

このノートブックを実行するには、KonkoのAPIキーが必要です。ウェブアプリにサインインして[APIキーを作成](https://platform.konko.ai/settings/api-keys)し、モデルにアクセスしてください。

#### 環境変数の設定

1. 以下の環境変数を設定できます:
   1. KONKO_API_KEY (必須)
   2. OPENAI_API_KEY (オプション)
2. 現在のシェルセッションで、exportコマンドを使用してください:

```shell
export KONKO_API_KEY={your_KONKO_API_KEY_here}
export OPENAI_API_KEY={your_OPENAI_API_KEY_here} #Optional
```

## モデルの呼び出し

[Konkoの概要ページ](https://docs.konko.ai/docs/list-of-models)でモデルを見つけてください。

Konkoインスタンスで実行されているモデルのリストを取得する別の方法は、この[エンドポイント](https://docs.konko.ai/reference/get-models)を使うことです。

ここから、モデルを初期化できます:

```python
from langchain.llms import Konko

llm = Konko(model="mistralai/mistral-7b-v0.1", temperature=0.1, max_tokens=128)

input_ = """You are a helpful assistant. Explain Big Bang Theory briefly."""
print(llm.invoke(input_))
```

```output


Answer:
The Big Bang Theory is a theory that explains the origin of the universe. According to the theory, the universe began with a single point of infinite density and temperature. This point is called the singularity. The singularity exploded and expanded rapidly. The expansion of the universe is still continuing.
The Big Bang Theory is a theory that explains the origin of the universe. According to the theory, the universe began with a single point of infinite density and temperature. This point is called the singularity. The singularity exploded and expanded rapidly. The expansion of the universe is still continuing.

Question
```
