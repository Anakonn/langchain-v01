---
translated: true
---

# OCI データサイエンス モデルデプロイメントエンドポイント

[OCI データサイエンス](https://docs.oracle.com/en-us/iaas/data-science/using/home.htm)は、データサイエンスチームがOracle Cloud Infrastructureでマシンラーニングモデルを構築、トレーニング、管理するための完全に管理されたサーバーレスプラットフォームです。

このノートブックでは、[OCI データサイエンス モデルデプロイメント](https://docs.oracle.com/en-us/iaas/data-science/using/model-dep-about.htm)でホストされているLLMを使用する方法について説明します。

認証には、[oracle-ads](https://accelerated-data-science.readthedocs.io/en/latest/user_guide/cli/authentication.html)を使用して、エンドポイントを呼び出すための資格情報を自動的にロードしています。

```python
!pip3 install oracle-ads
```

## 前提条件

### モデルのデプロイ

[Oracle GitHub サンプルリポジトリ](https://github.com/oracle-samples/oci-data-science-ai-samples/tree/main/model-deployment/containers/llama2)を確認して、OCI データサイエンス モデルデプロイメントにLLMをデプロイする方法を確認してください。

### ポリシー

OCI データサイエンス モデルデプロイメントエンドポイントにアクセスするための必要な[ポリシー](https://docs.oracle.com/en-us/iaas/data-science/using/model-dep-policies-auth.htm#model_dep_policies_auth__predict-endpoint)があることを確認してください。

## セットアップ

### vLLM

モデルをデプロイした後、`OCIModelDeploymentVLLM`呼び出しに必要な以下のパラメーターを設定する必要があります:

- **`endpoint`**: デプロイされたモデルのモデルHTTPエンドポイント、例: `https://<MD_OCID>/predict`.
- **`model`**: モデルの場所。

### テキスト生成推論 (TGI)

`OCIModelDeploymentTGI`呼び出しに必要な以下のパラメーターを設定する必要があります:

- **`endpoint`**: デプロイされたモデルのモデルHTTPエンドポイント、例: `https://<MD_OCID>/predict`.

### 認証

adsまたは環境変数を通じて認証を設定できます。OCI データサイエンスノートブックセッションで作業している場合は、リソースプリンシパルを活用して他のOCIリソースにアクセスできます。詳細については[こちら](https://accelerated-data-science.readthedocs.io/en/latest/user_guide/cli/authentication.html)を確認してください。

## 例

```python
import ads
from langchain_community.llms import OCIModelDeploymentVLLM

# Set authentication through ads
# Use resource principal are operating within a
# OCI service that has resource principal based
# authentication configured
ads.set_auth("resource_principal")

# Create an instance of OCI Model Deployment Endpoint
# Replace the endpoint uri and model name with your own
llm = OCIModelDeploymentVLLM(endpoint="https://<MD_OCID>/predict", model="model_name")

# Run the LLM
llm.invoke("Who is the first president of United States?")
```

```python
import os

from langchain_community.llms import OCIModelDeploymentTGI

# Set authentication through environment variables
# Use API Key setup when you are working from a local
# workstation or on platform which does not support
# resource principals.
os.environ["OCI_IAM_TYPE"] = "api_key"
os.environ["OCI_CONFIG_PROFILE"] = "default"
os.environ["OCI_CONFIG_LOCATION"] = "~/.oci"

# Set endpoint through environment variables
# Replace the endpoint uri with your own
os.environ["OCI_LLM_ENDPOINT"] = "https://<MD_OCID>/predict"

# Create an instance of OCI Model Deployment Endpoint
llm = OCIModelDeploymentTGI()

# Run the LLM
llm.invoke("Who is the first president of United States?")
```
