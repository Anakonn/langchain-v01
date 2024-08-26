---
sidebar_label: YandexGPT
translated: true
---

# ChatYandexGPT

Este cuaderno explica cómo usar Langchain con el modelo de chat [YandexGPT](https://cloud.yandex.com/en/services/yandexgpt).

Para usar, debe tener instalado el paquete de Python `yandexcloud`.

```python
%pip install --upgrade --quiet  yandexcloud
```

Primero, debe [crear una cuenta de servicio](https://cloud.yandex.com/en/docs/iam/operations/sa/create) con el rol `ai.languageModels.user`.

Luego, tiene dos opciones de autenticación:
- [Token IAM](https://cloud.yandex.com/en/docs/iam/operations/iam-token/create-for-sa).
    Puede especificar el token en un parámetro de constructor `iam_token` o en una variable de entorno `YC_IAM_TOKEN`.

- [Clave API](https://cloud.yandex.com/en/docs/iam/operations/api-key/create)
    Puede especificar la clave en un parámetro de constructor `api_key` o en una variable de entorno `YC_API_KEY`.

Para especificar el modelo, puede usar el parámetro `model_uri`, consulte [la documentación](https://cloud.yandex.com/en/docs/yandexgpt/concepts/models#yandexgpt-generation) para más detalles.

De forma predeterminada, se usa la última versión de `yandexgpt-lite` de la carpeta especificada en el parámetro `folder_id` o la variable de entorno `YC_FOLDER_ID`.

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
