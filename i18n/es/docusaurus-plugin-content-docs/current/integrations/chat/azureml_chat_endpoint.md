---
sidebar_label: Azure ML Endpoint
translated: true
---

# AzureMLChatOnlineEndpoint

>[Azure Machine Learning](https://azure.microsoft.com/en-us/products/machine-learning/) es una plataforma utilizada para construir, entrenar y desplegar modelos de aprendizaje automático. Los usuarios pueden explorar los tipos de modelos a desplegar en el Catálogo de modelos, que proporciona modelos fundamentales y de propósito general de diferentes proveedores.

>En general, es necesario desplegar modelos para consumir sus predicciones (inferencia). En `Azure Machine Learning`, los [Endpoints en línea](https://learn.microsoft.com/en-us/azure/machine-learning/concept-endpoints) se utilizan para desplegar estos modelos con un servicio en tiempo real. Se basan en las ideas de `Endpoints` y `Deployments` que le permiten separar la interfaz de su carga de trabajo de producción de la implementación que la atiende.

Este cuaderno analiza cómo usar un modelo de chat alojado en un `Endpoint de Azure Machine Learning`.

```python
from langchain_community.chat_models.azureml_endpoint import AzureMLChatOnlineEndpoint
```

## Configuración

Debe [implementar un modelo en Azure ML](https://learn.microsoft.com/en-us/azure/machine-learning/how-to-use-foundation-models?view=azureml-api-2#deploying-foundation-models-to-endpoints-for-inferencing) o [en Azure AI Studio](https://learn.microsoft.com/en-us/azure/ai-studio/how-to/deploy-models-open) y obtener los siguientes parámetros:

* `endpoint_url`: La URL del punto final REST proporcionada por el endpoint.
* `endpoint_api_type`: Use `endpoint_type='dedicated'` al implementar modelos en **Endpoints dedicados** (infraestructura administrada hospedada). Use `endpoint_type='serverless'` al implementar modelos utilizando la oferta **Pago por uso** (modelo como servicio).
* `endpoint_api_key`: La clave API proporcionada por el endpoint

## Formateador de contenido

El parámetro `content_formatter` es una clase controladora para transformar la solicitud y la respuesta de un endpoint de AzureML para que coincidan con el esquema requerido. Dado que hay una amplia gama de modelos en el catálogo de modelos, cada uno de los cuales puede procesar los datos de manera diferente entre sí, se proporciona una clase `ContentFormatterBase` para permitir a los usuarios transformar los datos a su gusto. Se proporcionan los siguientes formateadores de contenido:

* `CustomOpenAIChatContentFormatter`: Formatea los datos de solicitud y respuesta para modelos como LLaMa2-chat que siguen la especificación de la API de OpenAI para solicitud y respuesta.

*Nota: `langchain.chat_models.azureml_endpoint.LlamaChatContentFormatter` se está deprecando y se reemplaza con `langchain.chat_models.azureml_endpoint.CustomOpenAIChatContentFormatter`.*

Puede implementar formateadores de contenido personalizados específicos para su modelo derivando de la clase `langchain_community.llms.azureml_endpoint.ContentFormatterBase`.

## Ejemplos

La siguiente sección contiene ejemplos sobre cómo usar esta clase:

### Ejemplo: Completar chat con endpoints en tiempo real

```python
from langchain_community.chat_models.azureml_endpoint import (
    AzureMLEndpointApiType,
    CustomOpenAIChatContentFormatter,
)
from langchain_core.messages import HumanMessage

chat = AzureMLChatOnlineEndpoint(
    endpoint_url="https://<your-endpoint>.<your_region>.inference.ml.azure.com/score",
    endpoint_api_type=AzureMLEndpointApiType.dedicated,
    endpoint_api_key="my-api-key",
    content_formatter=CustomOpenAIChatContentFormatter(),
)
response = chat.invoke(
    [HumanMessage(content="Will the Collatz conjecture ever be solved?")]
)
response
```

```output
AIMessage(content='  The Collatz Conjecture is one of the most famous unsolved problems in mathematics, and it has been the subject of much study and research for many years. While it is impossible to predict with certainty whether the conjecture will ever be solved, there are several reasons why it is considered a challenging and important problem:\n\n1. Simple yet elusive: The Collatz Conjecture is a deceptively simple statement that has proven to be extraordinarily difficult to prove or disprove. Despite its simplicity, the conjecture has eluded some of the brightest minds in mathematics, and it remains one of the most famous open problems in the field.\n2. Wide-ranging implications: The Collatz Conjecture has far-reaching implications for many areas of mathematics, including number theory, algebra, and analysis. A solution to the conjecture could have significant impacts on these fields and potentially lead to new insights and discoveries.\n3. Computational evidence: While the conjecture remains unproven, extensive computational evidence supports its validity. In fact, no counterexample to the conjecture has been found for any starting value up to 2^64 (a number', additional_kwargs={}, example=False)
```

### Ejemplo: Completar chat con implementaciones de pago por uso (modelo como servicio)

```python
chat = AzureMLChatOnlineEndpoint(
    endpoint_url="https://<your-endpoint>.<your_region>.inference.ml.azure.com/v1/chat/completions",
    endpoint_api_type=AzureMLEndpointApiType.serverless,
    endpoint_api_key="my-api-key",
    content_formatter=CustomOpenAIChatContentFormatter,
)
response = chat.invoke(
    [HumanMessage(content="Will the Collatz conjecture ever be solved?")]
)
response
```

Si necesita pasar parámetros adicionales al modelo, use el argumento `model_kwargs`:

```python
chat = AzureMLChatOnlineEndpoint(
    endpoint_url="https://<your-endpoint>.<your_region>.inference.ml.azure.com/v1/chat/completions",
    endpoint_api_type=AzureMLEndpointApiType.serverless,
    endpoint_api_key="my-api-key",
    content_formatter=CustomOpenAIChatContentFormatter,
    model_kwargs={"temperature": 0.8},
)
```

Los parámetros también se pueden pasar durante la invocación:

```python
response = chat.invoke(
    [HumanMessage(content="Will the Collatz conjecture ever be solved?")],
    max_tokens=512,
)
response
```
