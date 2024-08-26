---
translated: true
---

# Azure OpenAI

このノートブックでは、[Azure OpenAI](https://aka.ms/azure-openai)を使用してLangChainを使用する方法について説明します。

Azure OpenAI APIはOpenAIのAPIと互換性があります。 `openai`Pythonパッケージを使うと、OpenAIとAzure OpenAIの両方を簡単に使えます。 以下の例外を除いて、OpenAIと同じ方法でAzure OpenAIを呼び出すことができます。

## APIの構成

環境変数を使って、`openai`パッケージをAzure OpenAIで使うように設定できます。 以下は`bash`の場合です:

```bash
# The API version you want to use: set this to `2023-12-01-preview` for the released version.
export OPENAI_API_VERSION=2023-12-01-preview
# The base URL for your Azure OpenAI resource.  You can find this in the Azure portal under your Azure OpenAI resource.
export AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com
# The API key for your Azure OpenAI resource.  You can find this in the Azure portal under your Azure OpenAI resource.
export AZURE_OPENAI_API_KEY=<your Azure OpenAI API key>
```

または、実行中のPython環境内でAPIを直接設定することもできます:

```python
import os
os.environ["OPENAI_API_VERSION"] = "2023-12-01-preview"
```

## Azure Active Directory認証

Azure OpenAIに認証する方法は2つあります:
- APIキー
- Azure Active Directory (AAD)

APIキーを使うのが始めるのに最も簡単な方法です。 APIキーはAzureポータルのAzure OpenAIリソースから取得できます。

ただし、セキュリティ要件が複雑な場合は、Azure Active Directoryを使用することをお勧めします。 Azure OpenAIでAzure Active Directoryを使う方法については[こちら](https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/managed-identity)をご覧ください。

ローカルで開発する場合は、Azure CLIがインストールされ、ログインしている必要があります。 Azure CLIのインストールは[こちら](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)から行えます。 その後、`az login`を実行してログインします。

Azure OpenAIリソースに対して`Cognitive Services OpenAI User`ロールを割り当ててください。 これにより、AzureADからトークンを取得して、Azure OpenAIで使用できるようになります。 このロール割り当ては、ユーザー、グループ、サービスプリンシパル、マネージドIDに付与できます。 Azure OpenAI RBACロールの詳細については[こちら](https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/role-based-access-control)をご覧ください。

LangChainでAADを使用するには、`azure-identity`パッケージをインストールします。 次に、`OPENAI_API_TYPE`を`azure_ad`に設定します。 その後、`DefaultAzureCredential`クラスを使ってAzureADからトークンを取得し、`get_token`を呼び出します。 最後に、`OPENAI_API_KEY`環境変数にトークンの値を設定します。

```python
import os
from azure.identity import DefaultAzureCredential

# Get the Azure Credential
credential = DefaultAzureCredential()

# Set the API type to `azure_ad`
os.environ["OPENAI_API_TYPE"] = "azure_ad"
# Set the API_KEY to the token from the Azure credential
os.environ["OPENAI_API_KEY"] = credential.get_token("https://cognitiveservices.azure.com/.default").token
```

`DefaultAzureCredential`クラスは、AAD認証を始めるのに簡単な方法です。 必要に応じて、資格情報チェーンをカスタマイズすることもできます。 以下の例では、まずマネージドIDを試し、失敗した場合はAzure CLIにフォールバックしています。 これは、Azureで実行しているが、ローカルで開発したい場合に便利です。

```python
from azure.identity import ChainedTokenCredential, ManagedIdentityCredential, AzureCliCredential

credential = ChainedTokenCredential(
    ManagedIdentityCredential(),
    AzureCliCredential()
)
```

## デプロイメント

Azure OpenAIでは、一般的なGPT-3やCodexモデルのデプロイメントを自分で設定する必要があります。 APIを呼び出す際は、使用するデプロイメントを指定する必要があります。

_**注意**: これらのドキュメントはAzureテキスト補完モデル用です。 GPT-4のようなチャットモデルは、インターフェイスが少し異なり、`AzureChatOpenAI`クラスでアクセスできます。 Azureチャットについては[Azure Chat OpenAI documentation](/docs/integrations/chat/azure_chat_openai)をご覧ください。_

デプロイメント名が`gpt-35-turbo-instruct-prod`だとします。 `openai`PythonAPIでは、`engine`パラメーターを使ってこのデプロイメントを指定できます。 例:

```python
import openai

client = AzureOpenAI(
    api_version="2023-12-01-preview",
)

response = client.completions.create(
    model="gpt-35-turbo-instruct-prod",
    prompt="Test prompt"
)
```

```python
%pip install --upgrade --quiet  langchain-openai
```

```python
import os

os.environ["OPENAI_API_VERSION"] = "2023-12-01-preview"
os.environ["AZURE_OPENAI_ENDPOINT"] = "..."
os.environ["AZURE_OPENAI_API_KEY"] = "..."
```

```python
# Import Azure OpenAI
from langchain_openai import AzureOpenAI
```

```python
# Create an instance of Azure OpenAI
# Replace the deployment name with your own
llm = AzureOpenAI(
    deployment_name="gpt-35-turbo-instruct-0914",
)
```

```python
# Run the LLM
llm.invoke("Tell me a joke")
```

```output
" Why couldn't the bicycle stand up by itself?\n\nBecause it was two-tired!"
```

LLMを出力して、カスタムの出力を確認することもできます。

```python
print(llm)
```

```output
[1mAzureOpenAI[0m
Params: {'deployment_name': 'gpt-35-turbo-instruct-0914', 'model_name': 'gpt-3.5-turbo-instruct', 'temperature': 0.7, 'top_p': 1, 'frequency_penalty': 0, 'presence_penalty': 0, 'n': 1, 'logit_bias': {}, 'max_tokens': 256}
```
