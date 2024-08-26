---
sidebar_label: Bedrock
translated: true
---

# ChatBedrock

>[Amazon Bedrock](https://aws.amazon.com/bedrock/) es un servicio totalmente administrado que ofrece una variedad de
> modelos de fundación de alto rendimiento (FMs) de empresas líderes en IA como `AI21 Labs`, `Anthropic`, `Cohere`,
> `Meta`, `Stability AI` y `Amazon` a través de una sola API, junto con un amplio conjunto de capacidades que necesitas para
> construir aplicaciones de IA generativa con seguridad, privacidad y IA responsable. Usando `Amazon Bedrock`,
> puedes experimentar y evaluar fácilmente los principales FMs para tu caso de uso, personalizarlos de forma privada con
> tus datos utilizando técnicas como el fine-tuning y `Retrieval Augmented Generation` (`RAG`), y construir
> agentes que ejecuten tareas utilizando tus sistemas empresariales y fuentes de datos. Dado que `Amazon Bedrock` es
> sin servidor, no tienes que administrar ninguna infraestructura, y puedes integrar y implementar de forma segura
> capacidades de IA generativa en tus aplicaciones utilizando los servicios de AWS con los que ya estás familiarizado.

```python
%pip install --upgrade --quiet  langchain-aws
```

```output
Note: you may need to restart the kernel to use updated packages.
```

```python
from langchain_aws import ChatBedrock
from langchain_core.messages import HumanMessage
```

```python
chat = ChatBedrock(
    model_id="anthropic.claude-3-sonnet-20240229-v1:0",
    model_kwargs={"temperature": 0.1},
)
```

```python
messages = [
    HumanMessage(
        content="Translate this sentence from English to French. I love programming."
    )
]
chat.invoke(messages)
```

```output
AIMessage(content="Voici la traduction en français :\n\nJ'aime la programmation.", additional_kwargs={'usage': {'prompt_tokens': 20, 'completion_tokens': 21, 'total_tokens': 41}}, response_metadata={'model_id': 'anthropic.claude-3-sonnet-20240229-v1:0', 'usage': {'prompt_tokens': 20, 'completion_tokens': 21, 'total_tokens': 41}}, id='run-994f0362-0e50-4524-afad-3c4f5bb11328-0')
```

### Streaming

Para transmitir respuestas, puedes usar el método ejecutable `.stream()`.

```python
for chunk in chat.stream(messages):
    print(chunk.content, end="", flush=True)
```

```output
Voici la traduction en français :

J'aime la programmation.
```
