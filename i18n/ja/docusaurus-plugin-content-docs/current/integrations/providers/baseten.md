---
translated: true
---

# Baseten

>[Baseten](https://baseten.co)は、MLモデルを高性能、スケーラブル、そしてコスト効率的に展開およびサービングするために必要なすべてのインフラストラクチャを提供するプロバイダーです。

>モデル推論プラットフォームとして、`Baseten`はLangChainエコシステムの`Provider`です。
`Baseten`インテグレーションは現在、LLMsという単一の`Component`を実装していますが、さらに多くのものが計画されています。

>`Baseten`では、Llama 2やMistralなどのオープンソースモデルを実行したり、専用のGPUで独自のモデルやファインチューンされたモデルを実行したりできます。OpenAIなどのプロバイダーを使い慣れている場合、Baseten使用には以下のような違いがあります:

>* トークンごとの支払いではなく、使用したGPUの分単位で支払います。
>* Baseten上のすべてのモデルは、最大限のカスタマイズ性のために[Truss](https://truss.baseten.co/welcome)、当社のオープンソースモデルパッケージングフレームワークを使用しています。
>* [OpenAI ChatCompletions互換のモデル](https://docs.baseten.co/api-reference/openai)もいくつか用意していますが、`Truss`を使ってご自身のI/Oスペックを定義することもできます。

>[モデルIDとデプロイメントの詳細](https://docs.baseten.co/deploy/lifecycle)をご覧ください。

>Baseten の詳細は[Baseten ドキュメント](https://docs.baseten.co/)をご覧ください。

## インストールとセットアップ

Baseten モデルを LangChain で使用するには、以下の2つが必要です:

- [Baseten アカウント](https://baseten.co)
- [API キー](https://docs.baseten.co/observability/api-keys)

API キーを `BASETEN_API_KEY` という環境変数としてエクスポートしてください。

```sh
export BASETEN_API_KEY="paste_your_api_key_here"
```

## LLMs

[使用例](/docs/integrations/llms/baseten)をご覧ください。

```python
<!--IMPORTS:[{"imported": "Baseten", "source": "langchain_community.llms", "docs": "https://api.python.langchain.com/en/latest/llms/langchain_community.llms.baseten.Baseten.html", "title": "Baseten"}]-->
from langchain_community.llms import Baseten
```
