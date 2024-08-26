---
translated: true
---

# YandexGPT

Ce notebook explique comment utiliser Langchain avec [YandexGPT](https://cloud.yandex.com/en/services/yandexgpt).

Pour l'utiliser, vous devez avoir le package python `yandexcloud` installé.

```python
%pip install --upgrade --quiet  yandexcloud
```

Tout d'abord, vous devez [créer un compte de service](https://cloud.yandex.com/en/docs/iam/operations/sa/create) avec le rôle `ai.languageModels.user`.

Ensuite, vous avez deux options d'authentification :
- [Jeton IAM](https://cloud.yandex.com/en/docs/iam/operations/iam-token/create-for-sa).
    Vous pouvez spécifier le jeton dans un paramètre de constructeur `iam_token` ou dans une variable d'environnement `YC_IAM_TOKEN`.

- [Clé API](https://cloud.yandex.com/en/docs/iam/operations/api-key/create)
    Vous pouvez spécifier la clé dans un paramètre de constructeur `api_key` ou dans une variable d'environnement `YC_API_KEY`.

Pour spécifier le modèle, vous pouvez utiliser le paramètre `model_uri`, consultez [la documentation](https://cloud.yandex.com/en/docs/yandexgpt/concepts/models#yandexgpt-generation) pour plus de détails.

Par défaut, la dernière version de `yandexgpt-lite` est utilisée à partir du dossier spécifié dans le paramètre `folder_id` ou la variable d'environnement `YC_FOLDER_ID`.

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
