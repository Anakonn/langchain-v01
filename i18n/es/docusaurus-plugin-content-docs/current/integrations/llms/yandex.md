---
translated: true
---

# YandexGPT

Este cuaderno explica cómo usar Langchain con [YandexGPT](https://cloud.yandex.com/en/services/yandexgpt).

Para usar, debes tener instalado el paquete de Python `yandexcloud`.

```python
%pip install --upgrade --quiet  yandexcloud
```

Primero, debes [crear una cuenta de servicio](https://cloud.yandex.com/en/docs/iam/operations/sa/create) con el rol `ai.languageModels.user`.

Luego, tienes dos opciones de autenticación:
- [Token IAM](https://cloud.yandex.com/en/docs/iam/operations/iam-token/create-for-sa)
    Puedes especificar el token en un parámetro de constructor `iam_token` o en una variable de entorno `YC_IAM_TOKEN`.

- [Clave API](https://cloud.yandex.com/en/docs/iam/operations/api-key/create)
    Puedes especificar la clave en un parámetro de constructor `api_key` o en una variable de entorno `YC_API_KEY`.

Para especificar el modelo, puedes usar el parámetro `model_uri`, consulta [la documentación](https://cloud.yandex.com/en/docs/yandexgpt/concepts/models#yandexgpt-generation) para más detalles.

De forma predeterminada, se usa la última versión de `yandexgpt-lite` de la carpeta especificada en el parámetro `folder_id` o la variable de entorno `YC_FOLDER_ID`.

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
