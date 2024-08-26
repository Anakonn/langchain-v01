---
translated: true
---

# MistralAI

Mistral AI est une plateforme qui propose l'hébergement de leurs puissants modèles open source.

Vous pouvez y accéder via leur [API](https://docs.mistral.ai/api/).

Une [clé API](https://console.mistral.ai/users/api-keys/) valide est nécessaire pour communiquer avec l'API.

Vous aurez également besoin du package `langchain-mistralai` :

```python
%pip install -qU langchain-core langchain-mistralai
```

```python
from langchain_mistralai import ChatMistralAI, MistralAIEmbeddings
```

Consultez la documentation pour leur

- [Modèle de chat](/docs/integrations/chat/mistralai)
- [Modèle d'embeddings](/docs/integrations/text_embedding/mistralai)
