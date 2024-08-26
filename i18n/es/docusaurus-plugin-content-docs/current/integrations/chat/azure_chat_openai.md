---
sidebar_label: Azure OpenAI
translated: true
---

# AzureChatOpenAI

>[Servicio Azure OpenAI](https://learn.microsoft.com/en-us/azure/ai-services/openai/overview) proporciona acceso a la API REST a los poderosos modelos de lenguaje de OpenAI, incluidas las series de modelos GPT-4, GPT-3.5-Turbo y Embeddings. Estos modelos se pueden adaptar fácilmente a tu tarea específica, que incluye, entre otras, la generación de contenido, el resumen, la búsqueda semántica y la traducción de lenguaje natural a código. Los usuarios pueden acceder al servicio a través de las API REST, el SDK de Python o una interfaz web en Azure OpenAI Studio.

Este cuaderno explica cómo conectarse a un punto final de OpenAI hospedado en Azure. Primero, necesitamos instalar el paquete `langchain-openai`.
%pip install -qU langchain-openai
A continuación, configuremos algunas variables de entorno para ayudarnos a conectarnos al servicio Azure OpenAI. Puedes encontrar estos valores en el portal de Azure.

```python
import os

os.environ["AZURE_OPENAI_API_KEY"] = "..."
os.environ["AZURE_OPENAI_ENDPOINT"] = "https://<your-endpoint>.openai.azure.com/"
os.environ["AZURE_OPENAI_API_VERSION"] = "2023-06-01-preview"
os.environ["AZURE_OPENAI_CHAT_DEPLOYMENT_NAME"] = "chat"
```

A continuación, construyamos nuestro modelo y charlemos con él:

```python
from langchain_core.messages import HumanMessage
from langchain_openai import AzureChatOpenAI

model = AzureChatOpenAI(
    openai_api_version=os.environ["AZURE_OPENAI_API_VERSION"],
    azure_deployment=os.environ["AZURE_OPENAI_CHAT_DEPLOYMENT_NAME"],
)
```

```python
message = HumanMessage(
    content="Translate this sentence from English to French. I love programming."
)
model.invoke([message])
```

```output
AIMessage(content="J'adore programmer.", response_metadata={'token_usage': {'completion_tokens': 6, 'prompt_tokens': 19, 'total_tokens': 25}, 'model_name': 'gpt-35-turbo', 'system_fingerprint': None, 'prompt_filter_results': [{'prompt_index': 0, 'content_filter_results': {'hate': {'filtered': False, 'severity': 'safe'}, 'self_harm': {'filtered': False, 'severity': 'safe'}, 'sexual': {'filtered': False, 'severity': 'safe'}, 'violence': {'filtered': False, 'severity': 'safe'}}}], 'finish_reason': 'stop', 'logprobs': None, 'content_filter_results': {'hate': {'filtered': False, 'severity': 'safe'}, 'self_harm': {'filtered': False, 'severity': 'safe'}, 'sexual': {'filtered': False, 'severity': 'safe'}, 'violence': {'filtered': False, 'severity': 'safe'}}}, id='run-25ed88db-38f2-4b0c-a943-a03f217711a9-0')
```

## Versión del modelo

Las respuestas de Azure OpenAI contienen la propiedad `model`, que es el nombre del modelo utilizado para generar la respuesta. Sin embargo, a diferencia de las respuestas nativas de OpenAI, no contiene la versión del modelo, que se establece en el despliegue en Azure. Esto hace que sea difícil saber qué versión del modelo se utilizó para generar la respuesta, lo que puede provocar, por ejemplo, un cálculo incorrecto del costo total con `OpenAICallbackHandler`.

Para resolver este problema, puedes pasar el parámetro `model_version` a la clase `AzureChatOpenAI`, que se agregará al nombre del modelo en la salida del llm. De esta manera, puedes distinguir fácilmente entre diferentes versiones del modelo.

```python
from langchain.callbacks import get_openai_callback
```

```python
model = AzureChatOpenAI(
    openai_api_version=os.environ["AZURE_OPENAI_API_VERSION"],
    azure_deployment=os.environ[
        "AZURE_OPENAI_CHAT_DEPLOYMENT_NAME"
    ],  # in Azure, this deployment has version 0613 - input and output tokens are counted separately
)
with get_openai_callback() as cb:
    model.invoke([message])
    print(
        f"Total Cost (USD): ${format(cb.total_cost, '.6f')}"
    )  # without specifying the model version, flat-rate 0.002 USD per 1k input and output tokens is used
```

```output
Total Cost (USD): $0.000041
```

Podemos proporcionar la versión del modelo al constructor de `AzureChatOpenAI`. Se agregará al nombre del modelo devuelto por Azure OpenAI y el costo se contará correctamente.

```python
model0301 = AzureChatOpenAI(
    openai_api_version=os.environ["AZURE_OPENAI_API_VERSION"],
    azure_deployment=os.environ["AZURE_OPENAI_CHAT_DEPLOYMENT_NAME"],
    model_version="0301",
)
with get_openai_callback() as cb:
    model0301.invoke([message])
    print(f"Total Cost (USD): ${format(cb.total_cost, '.6f')}")
```

```output
Total Cost (USD): $0.000044
```
