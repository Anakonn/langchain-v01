---
canonical: https://python.langchain.com/v0.1/docs/integrations/providers/mistralai
translated: false
---

# MistralAI

Mistral AI is a platform that offers hosting for their powerful open source models.

You can access them via their  [API](https://docs.mistral.ai/api/).

A valid [API key](https://console.mistral.ai/users/api-keys/) is needed to communicate with the API.

You will also need the `langchain-mistralai` package:

```python
%pip install -qU langchain-core langchain-mistralai
```

```python
from langchain_mistralai import ChatMistralAI, MistralAIEmbeddings
```

See the docs for their

- [Chat Model](/docs/integrations/chat/mistralai)
- [Embeddings Model](/docs/integrations/text_embedding/mistralai)