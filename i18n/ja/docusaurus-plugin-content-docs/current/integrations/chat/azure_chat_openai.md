---
sidebar_label: Azure OpenAI
translated: true
---

# AzureChatOpenAI

>[Azure OpenAI Service](https://learn.microsoft.com/en-us/azure/ai-services/openai/overview)は、GPT-4、GPT-3.5-Turbo、EmbeddingsモデルシリーズなどのOpenAIの強力な言語モデルにRESTAPI経由でアクセスできるサービスです。これらのモデルは、コンテンツ生成、要約、セマンティック検索、自然言語からコードへの変換など、さまざまなタスクに簡単に適応できます。ユーザーはRESTAPI、Python SDK、またはAzure OpenAI Studioのウェブベースのインターフェイスを通じてこのサービスにアクセスできます。

このノートブックでは、Azure ホスティングのOpenAI エンドポイントに接続する方法を説明します。まず、`langchain-openai`パッケージをインストールする必要があります。
%pip install -qU langchain-openai
次に、Azure OpenAI サービスに接続するためのいくつかの環境変数を設定しましょう。これらの値はAzureポータルで確認できます。

```python
import os

os.environ["AZURE_OPENAI_API_KEY"] = "..."
os.environ["AZURE_OPENAI_ENDPOINT"] = "https://<your-endpoint>.openai.azure.com/"
os.environ["AZURE_OPENAI_API_VERSION"] = "2023-06-01-preview"
os.environ["AZURE_OPENAI_CHAT_DEPLOYMENT_NAME"] = "chat"
```

次に、モデルを構築して会話してみましょう:

```python
from langchain_core.messages import HumanMessage
from langchain_openai import AzureChatOpenAI

model = AzureChatOpenAI(
    openai_api_version=os.environ["AZURE_OPENAI_API_VERSION"],
    azure_deployment=os.environ["AZURE_OPENAI_CHAT_DEPLOYMENT_NAME"],
)
```

```python
message = HumanMessage(
    content="Translate this sentence from English to French. I love programming."
)
model.invoke([message])
```

```output
AIMessage(content="J'adore programmer.", response_metadata={'token_usage': {'completion_tokens': 6, 'prompt_tokens': 19, 'total_tokens': 25}, 'model_name': 'gpt-35-turbo', 'system_fingerprint': None, 'prompt_filter_results': [{'prompt_index': 0, 'content_filter_results': {'hate': {'filtered': False, 'severity': 'safe'}, 'self_harm': {'filtered': False, 'severity': 'safe'}, 'sexual': {'filtered': False, 'severity': 'safe'}, 'violence': {'filtered': False, 'severity': 'safe'}}}], 'finish_reason': 'stop', 'logprobs': None, 'content_filter_results': {'hate': {'filtered': False, 'severity': 'safe'}, 'self_harm': {'filtered': False, 'severity': 'safe'}, 'sexual': {'filtered': False, 'severity': 'safe'}, 'violence': {'filtered': False, 'severity': 'safe'}}}, id='run-25ed88db-38f2-4b0c-a943-a03f217711a9-0')
```

## モデルバージョン

Azure OpenAIの応答には `model` プロパティが含まれていますが、これはネイティブのOpenAI応答とは異なり、デプロイメントで設定されたモデルのバージョンは含まれていません。これにより、どのバージョンのモデルが使用されて応答が生成されたかを知ることが難しくなり、`OpenAICallbackHandler`を使ってコストを正しく計算できない可能性があります。

この問題を解決するために、`AzureChatOpenAI`クラスに `model_version` パラメーターを渡すことができます。これにより、Azure OpenAIによって返されるモデル名にバージョン情報が追加されるため、異なるバージョンのモデルを簡単に区別できるようになります。

```python
from langchain.callbacks import get_openai_callback
```

```python
model = AzureChatOpenAI(
    openai_api_version=os.environ["AZURE_OPENAI_API_VERSION"],
    azure_deployment=os.environ[
        "AZURE_OPENAI_CHAT_DEPLOYMENT_NAME"
    ],  # in Azure, this deployment has version 0613 - input and output tokens are counted separately
)
with get_openai_callback() as cb:
    model.invoke([message])
    print(
        f"Total Cost (USD): ${format(cb.total_cost, '.6f')}"
    )  # without specifying the model version, flat-rate 0.002 USD per 1k input and output tokens is used
```

```output
Total Cost (USD): $0.000041
```

`AzureChatOpenAI`コンストラクターにモデルバージョンを指定することで、Azure OpenAIによって返されるモデル名にバージョン情報が追加され、コストを正しく計算できるようになります。

```python
model0301 = AzureChatOpenAI(
    openai_api_version=os.environ["AZURE_OPENAI_API_VERSION"],
    azure_deployment=os.environ["AZURE_OPENAI_CHAT_DEPLOYMENT_NAME"],
    model_version="0301",
)
with get_openai_callback() as cb:
    model0301.invoke([message])
    print(f"Total Cost (USD): ${format(cb.total_cost, '.6f')}")
```

```output
Total Cost (USD): $0.000044
```
