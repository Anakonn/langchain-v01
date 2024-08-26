---
translated: true
---

# YandexGPT

このノートブックでは、[YandexGPT](https://cloud.yandex.com/en/services/yandexgpt)を使用する方法について説明します。

使用するには、`yandexcloud`Pythonパッケージがインストールされている必要があります。

```python
%pip install --upgrade --quiet  yandexcloud
```

まず、`ai.languageModels.user`ロールを持つ[サービスアカウントを作成](https://cloud.yandex.com/en/docs/iam/operations/sa/create)する必要があります。

次に、2つの認証オプションがあります:
- [IAMトークン](https://cloud.yandex.com/en/docs/iam/operations/iam-token/create-for-sa)
    トークンを`iam_token`コンストラクターパラメーターまたは`YC_IAM_TOKEN`環境変数で指定できます。

- [APIキー](https://cloud.yandex.com/en/docs/iam/operations/api-key/create)
    キーを`api_key`コンストラクターパラメーターまたは`YC_API_KEY`環境変数で指定できます。

使用するモデルを指定するには、`model_uri`パラメーターを使用します。詳細は[ドキュメント](https://cloud.yandex.com/en/docs/yandexgpt/concepts/models#yandexgpt-generation)を参照してください。

デフォルトでは、`folder_id`パラメーターまたは`YC_FOLDER_ID`環境変数で指定されたフォルダーから最新バージョンの`yandexgpt-lite`が使用されます。

```python
from langchain.chains import LLMChain
from langchain_community.llms import YandexGPT
from langchain_core.prompts import PromptTemplate
```

```python
template = "What is the capital of {country}?"
prompt = PromptTemplate.from_template(template)
```

```python
llm = YandexGPT()
```

```python
llm_chain = LLMChain(prompt=prompt, llm=llm)
```

```python
country = "Russia"

llm_chain.invoke(country)
```

```output
'The capital of Russia is Moscow.'
```
