---
translated: true
---

# Together AI

[Together AI](https://www.together.ai/) ofrece una API para consultar [más de 50 modelos líderes de código abierto](https://docs.together.ai/docs/inference-models) en un par de líneas de código.

Este ejemplo explica cómo usar LangChain para interactuar con los modelos de Together AI.

## Instalación

```python
%pip install --upgrade langchain-together
```

## Entorno

Para usar Together AI, necesitarás una clave API que puedes encontrar aquí:
https://api.together.ai/settings/api-keys. Esto se puede pasar como un parámetro de inicialización
``together_api_key`` o establecerse como una variable de entorno ``TOGETHER_API_KEY``.

## Ejemplo

```python
# Querying chat models with Together AI

from langchain_together import ChatTogether

# choose from our 50+ models here: https://docs.together.ai/docs/inference-models
chat = ChatTogether(
    # together_api_key="YOUR_API_KEY",
    model="meta-llama/Llama-3-70b-chat-hf",
)

# stream the response back from the model
for m in chat.stream("Tell me fun things to do in NYC"):
    print(m.content, end="", flush=True)

# if you don't want to do streaming, you can use the invoke method
# chat.invoke("Tell me fun things to do in NYC")
```

```python
# Querying code and language models with Together AI

from langchain_together import Together

llm = Together(
    model="codellama/CodeLlama-70b-Python-hf",
    # together_api_key="..."
)

print(llm.invoke("def bubble_sort(): "))
```
