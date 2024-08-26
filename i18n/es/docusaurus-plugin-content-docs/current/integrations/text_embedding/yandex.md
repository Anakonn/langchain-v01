---
translated: true
---

# YandexGPT

Este cuaderno repasa cómo usar Langchain con los modelos de incrustaciones [YandexGPT](https://cloud.yandex.com/en/services/yandexgpt).

Para usar, debe tener instalado el paquete de python `yandexcloud`.

```python
%pip install --upgrade --quiet  yandexcloud
```

Primero, debe [crear una cuenta de servicio](https://cloud.yandex.com/en/docs/iam/operations/sa/create) con el rol `ai.languageModels.user`.

Luego, tiene dos opciones de autenticación:
- [Token IAM](https://cloud.yandex.com/en/docs/iam/operations/iam-token/create-for-sa).
    Puede especificar el token en un parámetro de constructor `iam_token` o en una variable de entorno `YC_IAM_TOKEN`.
- [Clave API](https://cloud.yandex.com/en/docs/iam/operations/api-key/create)
    Puede especificar la clave en un parámetro de constructor `api_key` o en una variable de entorno `YC_API_KEY`.

Para especificar el modelo, puede usar el parámetro `model_uri`, consulte [la documentación](https://cloud.yandex.com/en/docs/yandexgpt/concepts/models#yandexgpt-embeddings) para más detalles.

De forma predeterminada, se usa la última versión de `text-search-query` de la carpeta especificada en el parámetro `folder_id` o la variable de entorno `YC_FOLDER_ID`.

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
