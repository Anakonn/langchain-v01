---
sidebar_label: YandexGPT
translated: true
---

# ChatYandexGPT

Ce notebook explique comment utiliser Langchain avec le modèle de chat [YandexGPT](https://cloud.yandex.com/en/services/yandexgpt).

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
from langchain_community.chat_models import ChatYandexGPT
from langchain_core.messages import HumanMessage, SystemMessage
```

```python
chat_model = ChatYandexGPT()
```

```python
answer = chat_model.invoke(
    [
        SystemMessage(
            content="You are a helpful assistant that translates English to French."
        ),
        HumanMessage(content="I love programming."),
    ]
)
answer
```

```output
AIMessage(content='Je adore le programmement.')
```
