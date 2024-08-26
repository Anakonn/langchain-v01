---
translated: true
---

# YandexGPT

Ce cahier de laboratoire explique comment utiliser Langchain avec les modèles d'intégration [YandexGPT](https://cloud.yandex.com/en/services/yandexgpt).

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

Pour spécifier le modèle, vous pouvez utiliser le paramètre `model_uri`, consultez [la documentation](https://cloud.yandex.com/en/docs/yandexgpt/concepts/models#yandexgpt-embeddings) pour plus de détails.

Par défaut, la dernière version de `text-search-query` est utilisée à partir du dossier spécifié dans le paramètre `folder_id` ou la variable d'environnement `YC_FOLDER_ID`.

```python
from langchain_community.embeddings.yandex import YandexGPTEmbeddings
```

```python
embeddings = YandexGPTEmbeddings()
```

```python
text = "This is a test document."
```

```python
query_result = embeddings.embed_query(text)
```

```python
doc_result = embeddings.embed_documents([text])
```

```python
query_result[:5]
```

```output
[-0.021392822265625,
 0.096435546875,
 -0.046966552734375,
 -0.0183258056640625,
 -0.00555419921875]
```

```python
doc_result[0][:5]
```

```output
[-0.021392822265625,
 0.096435546875,
 -0.046966552734375,
 -0.0183258056640625,
 -0.00555419921875]
```
