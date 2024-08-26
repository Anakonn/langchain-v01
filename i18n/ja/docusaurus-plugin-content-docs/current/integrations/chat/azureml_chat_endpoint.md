---
sidebar_label: Azure ML エンドポイント
translated: true
---

# AzureMLChatOnlineEndpoint

>[Azure Machine Learning](https://azure.microsoft.com/en-us/products/machine-learning/) は、機械学習モデルを構築、トレーニング、およびデプロイするためのプラットフォームです。ユーザーは、モデルカタログでデプロイするモデルの種類を探索できます。モデルカタログには、さまざまなプロバイダーから提供される基礎的および汎用的なモデルが含まれています。
>
>一般に、予測（推論）を利用するためには、モデルをデプロイする必要があります。`Azure Machine Learning` では、[オンラインエンドポイント](https://learn.microsoft.com/en-us/azure/machine-learning/concept-endpoints) を使用して、リアルタイムの提供でこれらのモデルをデプロイします。これらは、実稼働負荷のインターフェースをそれを提供する実装から分離することを可能にする `エンドポイント` と `デプロイメント` の概念に基づいています。

このノートブックでは、`Azure Machine Learning エンドポイント` にホストされているチャットモデルの使用方法について説明します。

```python
from langchain_community.chat_models.azureml_endpoint import AzureMLChatOnlineEndpoint
```

## セットアップ

[Azure ML にモデルをデプロイ](https://learn.microsoft.com/en-us/azure/machine-learning/how-to-use-foundation-models?view=azureml-api-2#deploying-foundation-models-to-endpoints-for-inferencing) するか、[Azure AI スタジオにデプロイ](https://learn.microsoft.com/en-us/azure/ai-studio/how-to/deploy-models-open) して、次のパラメータを取得する必要があります:

* `endpoint_url`: エンドポイントによって提供される REST エンドポイント URL。
* `endpoint_api_type`: **専用エンドポイント**（ホスト管理インフラストラクチャ）にモデルをデプロイする場合は `endpoint_type='dedicated'` を使用します。**従量課金制**（モデルアズアサービス）を使用してモデルをデプロイする場合は `endpoint_type='serverless'` を使用します。
* `endpoint_api_key`: エンドポイントによって提供される API キー

## コンテンツフォーマッタ

`content_formatter` パラメータは、AzureML エンドポイントのリクエストおよびレスポンスを必要なスキーマに一致させるためのハンドラークラスです。モデルカタログには広範なモデルが含まれており、それぞれがデータを異なる方法で処理する可能性があるため、データを好きなように変換できる `ContentFormatterBase` クラスが提供されています。次のコンテンツフォーマッタが提供されています:

* `CustomOpenAIChatContentFormatter`: LLaMa2-chat のような、リクエストおよびレスポンスのための OpenAI API 仕様に従うモデルのリクエストおよびレスポンスデータをフォーマットします。

*注: `langchain.chat_models.azureml_endpoint.LlamaChatContentFormatter` は廃止され、`langchain.chat_models.azureml_endpoint.CustomOpenAIChatContentFormatter` に置き換えられます。*

`langchain_community.llms.azureml_endpoint.ContentFormatterBase` クラスから派生して、モデル固有のカスタムコンテンツフォーマッタを実装することができます。

## 例

次のセクションには、このクラスの使用方法に関する例が含まれています:

### 例: リアルタイムエンドポイントを使用したチャット補完

```python
from langchain_community.chat_models.azureml_endpoint import (
    AzureMLEndpointApiType,
    CustomOpenAIChatContentFormatter,
)
from langchain_core.messages import HumanMessage

chat = AzureMLChatOnlineEndpoint(
    endpoint_url="https://<your-endpoint>.<your_region>.inference.ml.azure.com/score",
    endpoint_api_type=AzureMLEndpointApiType.dedicated,
    endpoint_api_key="my-api-key",
    content_formatter=CustomOpenAIChatContentFormatter(),
)
response = chat.invoke(
    [HumanMessage(content="Will the Collatz conjecture ever be solved?")]
)
response
```

```output
AIMessage(content='  The Collatz Conjecture is one of the most famous unsolved problems in mathematics, and it has been the subject of much study and research for many years. While it is impossible to predict with certainty whether the conjecture will ever be solved, there are several reasons why it is considered a challenging and important problem:\n\n1. Simple yet elusive: The Collatz Conjecture is a deceptively simple statement that has proven to be extraordinarily difficult to prove or disprove. Despite its simplicity, the conjecture has eluded some of the brightest minds in mathematics, and it remains one of the most famous open problems in the field.\n2. Wide-ranging implications: The Collatz Conjecture has far-reaching implications for many areas of mathematics, including number theory, algebra, and analysis. A solution to the conjecture could have significant impacts on these fields and potentially lead to new insights and discoveries.\n3. Computational evidence: While the conjecture remains unproven, extensive computational evidence supports its validity. In fact, no counterexample to the conjecture has been found for any starting value up to 2^64 (a number', additional_kwargs={}, example=False)
```

### 例: 従量課金制デプロイメント（モデルアズアサービス）を使用したチャット補完

```python
chat = AzureMLChatOnlineEndpoint(
    endpoint_url="https://<your-endpoint>.<your_region>.inference.ml.azure.com/v1/chat/completions",
    endpoint_api_type=AzureMLEndpointApiType.serverless,
    endpoint_api_key="my-api-key",
    content_formatter=CustomOpenAIChatContentFormatter,
)
response = chat.invoke(
    [HumanMessage(content="Will the Collatz conjecture ever be solved?")]
)
response
```

モデルに追加のパラメータを渡す必要がある場合は、`model_kwargs` 引数を使用します:

```python
chat = AzureMLChatOnlineEndpoint(
    endpoint_url="https://<your-endpoint>.<your_region>.inference.ml.azure.com/v1/chat/completions",
    endpoint_api_type=AzureMLEndpointApiType.serverless,
    endpoint_api_key="my-api-key",
    content_formatter=CustomOpenAIChatContentFormatter,
    model_kwargs={"temperature": 0.8},
)
```

呼び出し時にパラメータを渡すこともできます:

```python
response = chat.invoke(
    [HumanMessage(content="Will the Collatz conjecture ever be solved?")],
    max_tokens=512,
)
response
```
