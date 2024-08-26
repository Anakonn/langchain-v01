---
translated: true
---

# API de KoboldAI

[KoboldAI](https://github.com/KoboldAI/KoboldAI-Client) es "un front-end basado en el navegador para la escritura asistida por IA con múltiples modelos de IA locales y remotos...". Tiene una API pública y local que se puede utilizar en langchain.

Este ejemplo explica cómo usar LangChain con esa API.

La documentación se puede encontrar en el navegador agregando /api al final de su punto final (es decir, http://127.0.0.1/:5000/api).

```python
from langchain_community.llms import KoboldApiLLM
```

Reemplace el punto final que se ve a continuación por el que se muestra en la salida después de iniciar el webui con --api o --public-api

Opcionalmente, puede pasar parámetros como temperatura o max_length

```python
llm = KoboldApiLLM(endpoint="http://192.168.1.144:5000", max_length=80)
```

```python
response = llm.invoke(
    "### Instruction:\nWhat is the first book of the bible?\n### Response:"
)
```
