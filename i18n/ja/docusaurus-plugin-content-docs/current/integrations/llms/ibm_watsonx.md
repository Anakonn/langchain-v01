---
translated: true
---

# IBM watsonx.ai

>[WatsonxLLM](https://ibm.github.io/watsonx-ai-python-sdk/fm_extensions.html#langchain)は、IBM [watsonx.ai](https://www.ibm.com/products/watsonx-ai)基盤モデルのラッパーです。

このサンプルでは、`LangChain`を使用して`watsonx.ai`モデルとコミュニケーションをとる方法を示します。

## 設定

`langchain-ibm`パッケージをインストールします。

```python
!pip install -qU langchain-ibm
```

このセルでは、watsonx Foundation Modelの推論に必要なWML資格情報を定義しています。

**アクション:** IBM CloudユーザーのAPIキーを提供してください。詳細については、[ドキュメント](https://cloud.ibm.com/docs/account?topic=account-userapikey&interface=ui)を参照してください。

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

モデルのパラメータは、異なるモデルやタスクに合わせて調整する必要があります。詳細については、[ドキュメント](https://ibm.github.io/watsonx-ai-python-sdk/fm_model.html#metanames.GenTextParamsMetaNames)を参照してください。

```python
parameters = {
    "decoding_method": "sample",
    "max_new_tokens": 100,
    "min_new_tokens": 1,
    "temperature": 0.5,
    "top_k": 50,
    "top_p": 1,
}
```

前述のパラメータを使用して`WatsonxLLM`クラスを初期化します。

**注意:**

- APIコールのコンテキストを提供するには、`project_id`または`space_id`を追加する必要があります。詳細については、[ドキュメント](https://www.ibm.com/docs/en/watsonx-as-a-service?topic=projects)を参照してください。
- プロビジョニングされたサービスインスタンスのリージョンに応じて、[ここ](https://ibm.github.io/watsonx-ai-python-sdk/setup_cloud.html#authentication)に記載されているURLの1つを使用してください。

この例では、`project_id`とDallasのURLを使用します。

推論に使用する`model_id`を指定する必要があります。利用可能なすべてのモデルは、[ドキュメント](https://ibm.github.io/watsonx-ai-python-sdk/fm_model.html#ibm_watsonx_ai.foundation_models.utils.enums.ModelTypes)で確認できます。

```python
from langchain_ibm import WatsonxLLM

watsonx_llm = WatsonxLLM(
    model_id="ibm/granite-13b-instruct-v2",
    url="https://us-south.ml.cloud.ibm.com",
    project_id="PASTE YOUR PROJECT_ID HERE",
    params=parameters,
)
```

Cloud Pak for Dataの資格情報を使用することもできます。詳細については、[ドキュメント](https://ibm.github.io/watsonx-ai-python-sdk/setup_cpd.html)を参照してください。

```python
watsonx_llm = WatsonxLLM(
    model_id="ibm/granite-13b-instruct-v2",
    url="PASTE YOUR URL HERE",
    username="PASTE YOUR USERNAME HERE",
    password="PASTE YOUR PASSWORD HERE",
    instance_id="openshift",
    version="4.8",
    project_id="PASTE YOUR PROJECT_ID HERE",
    params=parameters,
)
```

`model_id`の代わりに、以前にチューニングされたモデルの`deployment_id`を渡すこともできます。モデルのチューニングワークフロー全体は、[ここ](https://ibm.github.io/watsonx-ai-python-sdk/pt_working_with_class_and_prompt_tuner.html)で説明されています。

```python
watsonx_llm = WatsonxLLM(
    deployment_id="PASTE YOUR DEPLOYMENT_ID HERE",
    url="https://us-south.ml.cloud.ibm.com",
    project_id="PASTE YOUR PROJECT_ID HERE",
    params=parameters,
)
```

## チェーンの作成

ランダムな質問を作成する責任を持つ`PromptTemplate`オブジェクトを作成します。

```python
from langchain_core.prompts import PromptTemplate

template = "Generate a random question about {topic}: Question: "
prompt = PromptTemplate.from_template(template)
```

トピックを提供し、`LLMChain`を実行します。

```python
from langchain.chains import LLMChain

llm_chain = LLMChain(prompt=prompt, llm=watsonx_llm)
llm_chain.invoke("dog")
```

```output
{'topic': 'dog', 'text': 'Why do dogs howl?'}
```

## モデルを直接呼び出す

文字列プロンプトを使用して、直接モデルから補完を取得できます。

```python
# Calling a single prompt

watsonx_llm.invoke("Who is man's best friend?")
```

```output
"Man's best friend is his dog. "
```

```python
# Calling multiple prompts

watsonx_llm.generate(
    [
        "The fastest dog in the world?",
        "Describe your chosen dog breed",
    ]
)
```

```output
LLMResult(generations=[[Generation(text='The fastest dog in the world is the greyhound, which can run up to 45 miles per hour. This is about the same speed as a human running down a track. Greyhounds are very fast because they have long legs, a streamlined body, and a strong tail. They can run this fast for short distances, but they can also run for long distances, like a marathon. ', generation_info={'finish_reason': 'eos_token'})], [Generation(text='The Beagle is a scent hound, meaning it is bred to hunt by following a trail of scents.', generation_info={'finish_reason': 'eos_token'})]], llm_output={'token_usage': {'generated_token_count': 106, 'input_token_count': 13}, 'model_id': 'ibm/granite-13b-instruct-v2', 'deployment_id': ''}, run=[RunInfo(run_id=UUID('52cb421d-b63f-4c5f-9b04-d4770c664725')), RunInfo(run_id=UUID('df2ea606-1622-4ed7-8d5d-8f6e068b71c4'))])
```

## モデル出力のストリーミング

モデル出力をストリーミングできます。

```python
for chunk in watsonx_llm.stream(
    "Describe your favorite breed of dog and why it is your favorite."
):
    print(chunk, end="")
```

```output
My favorite breed of dog is a Labrador Retriever. Labradors are my favorite because they are extremely smart, very friendly, and love to be with people. They are also very playful and love to run around and have a lot of energy.
```
