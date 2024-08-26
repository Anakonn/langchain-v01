---
translated: true
---

# MistralAI

MistralAI es una plataforma que ofrece alojamiento para sus potentes modelos de código abierto.

Puedes acceder a ellos a través de su [API](https://docs.mistral.ai/api/).

Se necesita una [clave API](https://console.mistral.ai/users/api-keys/) válida para comunicarse con la API.

También necesitarás el paquete `langchain-mistralai`:

```python
%pip install -qU langchain-core langchain-mistralai
```

```python
from langchain_mistralai import ChatMistralAI, MistralAIEmbeddings
```

Consulta la documentación para su

- [Modelo de chat](/docs/integrations/chat/mistralai)
- [Modelo de incrustaciones](/docs/integrations/text_embedding/mistralai)
