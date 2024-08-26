---
translated: true
---

# IBM watsonx.ai

>WatsonxEmbeddings は IBM [watsonx.ai](https://www.ibm.com/products/watsonx-ai) ファウンデーションモデルのラッパーです。

この例では、`LangChain` を使用して `watsonx.ai` モデルとコミュニケーションをとる方法を示します。

## 設定

`langchain-ibm` パッケージをインストールします。

```python
!pip install -qU langchain-ibm
```

このセルでは、watsonx Embeddings を使用するために必要な WML 資格情報を定義しています。

**アクション:** IBM Cloud ユーザー API キーを提供してください。詳細については、[ドキュメント](https://cloud.ibm.com/docs/account?topic=account-userapikey&interface=ui)を参照してください。

```python
import os
from getpass import getpass

watsonx_api_key = getpass()
os.environ["WATSONX_APIKEY"] = watsonx_api_key
```

さらに、環境変数として追加のシークレットを渡すことができます。

```python
import os

os.environ["WATSONX_URL"] = "your service instance url"
os.environ["WATSONX_TOKEN"] = "your token for accessing the CPD cluster"
os.environ["WATSONX_PASSWORD"] = "your password for accessing the CPD cluster"
os.environ["WATSONX_USERNAME"] = "your username for accessing the CPD cluster"
os.environ["WATSONX_INSTANCE_ID"] = "your instance_id for accessing the CPD cluster"
```

## モデルの読み込み

異なるモデルに対して `parameters` を調整する必要があるかもしれません。

```python
from ibm_watsonx_ai.metanames import EmbedTextParamsMetaNames

embed_params = {
    EmbedTextParamsMetaNames.TRUNCATE_INPUT_TOKENS: 3,
    EmbedTextParamsMetaNames.RETURN_OPTIONS: {"input_text": True},
}
```

前述のパラメーターを使用して `WatsonxEmbeddings` クラスを初期化します。

**注意:**

- API 呼び出しのコンテキストを提供するには、`project_id` または `space_id` を追加する必要があります。詳細については、[ドキュメント](https://www.ibm.com/docs/en/watsonx-as-a-service?topic=projects)を参照してください。
- プロビジョニングされたサービスインスタンスのリージョンに応じて、[ここ](https://ibm.github.io/watsonx-ai-python-sdk/setup_cloud.html#authentication)に記載されているURLの1つを使用してください。

この例では、`project_id` とダラスの URL を使用します。

推論に使用する `model_id` を指定する必要があります。

```python
from langchain_ibm import WatsonxEmbeddings

watsonx_embedding = WatsonxEmbeddings(
    model_id="ibm/slate-125m-english-rtrvr",
    url="https://us-south.ml.cloud.ibm.com",
    project_id="PASTE YOUR PROJECT_ID HERE",
    params=embed_params,
)
```

または、Cloud Pak for Data の資格情報を使用することもできます。詳細については、[ドキュメント](https://ibm.github.io/watsonx-ai-python-sdk/setup_cpd.html)を参照してください。

```python
watsonx_embedding = WatsonxEmbeddings(
    model_id="ibm/slate-125m-english-rtrvr",
    url="PASTE YOUR URL HERE",
    username="PASTE YOUR USERNAME HERE",
    password="PASTE YOUR PASSWORD HERE",
    instance_id="openshift",
    version="5.0",
    project_id="PASTE YOUR PROJECT_ID HERE",
    params=embed_params,
)
```

## 使用方法

### クエリーのエンベディング

```python
text = "This is a test document."

query_result = watsonx_embedding.embed_query(text)
query_result[:5]
```

```output
[0.0094472, -0.024981909, -0.026013248, -0.040483925, -0.057804465]
```

### ドキュメントのエンベディング

```python
texts = ["This is a content of the document", "This is another document"]

doc_result = watsonx_embedding.embed_documents(texts)
doc_result[0][:5]
```

```output
[0.009447193, -0.024981918, -0.026013244, -0.040483937, -0.057804447]
```
