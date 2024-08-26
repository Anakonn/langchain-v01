---
translated: true
---

# Bedrock

>[Amazon Bedrock](https://aws.amazon.com/bedrock/) es un servicio totalmente administrado que ofrece una variedad de modelos de fundación (FMs) de alto rendimiento de empresas líderes en IA como `AI21 Labs`, `Anthropic`, `Cohere`, `Meta`, `Stability AI` y `Amazon` a través de una sola API, junto con un amplio conjunto de capacidades que necesitas para construir aplicaciones de IA generativa con seguridad, privacidad y IA responsable. Usando `Amazon Bedrock`, puedes experimentar y evaluar fácilmente los principales FMs para tu caso de uso, personalizarlos de forma privada con tus datos utilizando técnicas como el fine-tuning y la `Generación Aumentada por Recuperación` (`RAG`), y construir agentes que ejecuten tareas utilizando tus sistemas empresariales y fuentes de datos. Dado que `Amazon Bedrock` es sin servidor, no tienes que administrar ninguna infraestructura, y puedes integrar y implementar de forma segura las capacidades de IA generativa en tus aplicaciones utilizando los servicios de AWS con los que ya estás familiarizado.

```python
%pip install --upgrade --quiet  boto3
```

```python
from langchain_community.llms import Bedrock

llm = Bedrock(
    credentials_profile_name="bedrock-admin", model_id="amazon.titan-text-express-v1"
)
```

### Uso en una cadena de conversación

```python
from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory

conversation = ConversationChain(
    llm=llm, verbose=True, memory=ConversationBufferMemory()
)

conversation.predict(input="Hi there!")
```

### Cadena de conversación con streaming

```python
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain_community.llms import Bedrock

llm = Bedrock(
    credentials_profile_name="bedrock-admin",
    model_id="amazon.titan-text-express-v1",
    streaming=True,
    callbacks=[StreamingStdOutCallbackHandler()],
)
```

```python
conversation = ConversationChain(
    llm=llm, verbose=True, memory=ConversationBufferMemory()
)

conversation.predict(input="Hi there!")
```

### Modelos personalizados

```python
custom_llm = Bedrock(
    credentials_profile_name="bedrock-admin",
    provider="cohere",
    model_id="<Custom model ARN>",  # ARN like 'arn:aws:bedrock:...' obtained via provisioning the custom model
    model_kwargs={"temperature": 1},
    streaming=True,
    callbacks=[StreamingStdOutCallbackHandler()],
)

conversation = ConversationChain(
    llm=custom_llm, verbose=True, memory=ConversationBufferMemory()
)
conversation.predict(input="What is the recipe of mayonnaise?")
```

### Guardrails para el ejemplo de Amazon Bedrock

## Guardrails para Amazon Bedrock (Preview)

[Guardrails para Amazon Bedrock](https://aws.amazon.com/bedrock/guardrails/) evalúa las entradas de los usuarios y las respuestas de los modelos en función de políticas específicas del caso de uso, y proporciona una capa adicional de salvaguardas independientemente del modelo subyacente. Los Guardrails se pueden aplicar a través de modelos, incluidos Anthropic Claude, Meta Llama 2, Cohere Command, AI21 Labs Jurassic y Amazon Titan Text, así como a modelos con fine-tuning.
**Nota**: Guardrails para Amazon Bedrock está actualmente en vista previa y no está disponible de forma general. Comunícate a través de tus contactos de soporte de AWS habituales si deseas acceder a esta función.
En esta sección, vamos a configurar un modelo de lenguaje Bedrock con guardrails específicos que incluyan capacidades de seguimiento.

```python
from typing import Any

from langchain_core.callbacks import AsyncCallbackHandler


class BedrockAsyncCallbackHandler(AsyncCallbackHandler):
    # Async callback handler that can be used to handle callbacks from langchain.

    async def on_llm_error(self, error: BaseException, **kwargs: Any) -> Any:
        reason = kwargs.get("reason")
        if reason == "GUARDRAIL_INTERVENED":
            print(f"Guardrails: {kwargs}")


# Guardrails for Amazon Bedrock with trace
llm = Bedrock(
    credentials_profile_name="bedrock-admin",
    model_id="<Model_ID>",
    model_kwargs={},
    guardrails={"id": "<Guardrail_ID>", "version": "<Version>", "trace": True},
    callbacks=[BedrockAsyncCallbackHandler()],
)
```
