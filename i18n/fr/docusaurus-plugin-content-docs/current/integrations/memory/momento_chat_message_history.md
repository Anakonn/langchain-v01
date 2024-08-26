---
translated: true
---

# Momento Cache

>[Momento Cache](https://docs.momentohq.com/) est le premier service de mise en cache véritablement sans serveur au monde. Il offre une élasticité instantanée, une capacité de mise à l'échelle à zéro et des performances ultra-rapides.

Ce notebook explique comment utiliser [Momento Cache](https://www.gomomento.com/services/cache) pour stocker l'historique des messages de chat à l'aide de la classe `MomentoChatMessageHistory`. Consultez la documentation Momento [docs](https://docs.momentohq.com/getting-started) pour plus de détails sur la configuration de Momento.

Notez que, par défaut, nous créerons un cache s'il n'en existe pas déjà un avec le nom donné.

Vous devrez obtenir une clé d'API Momento pour utiliser cette classe. Celle-ci peut être transmise à un momento.CacheClient si vous souhaitez l'instancier directement, en tant que paramètre nommé `api_key` à `MomentoChatMessageHistory.from_client_params`, ou peut simplement être définie en tant que variable d'environnement `MOMENTO_API_KEY`.

```python
from datetime import timedelta

from langchain_community.chat_message_histories import MomentoChatMessageHistory

session_id = "foo"
cache_name = "langchain"
ttl = timedelta(days=1)
history = MomentoChatMessageHistory.from_client_params(
    session_id,
    cache_name,
    ttl,
)

history.add_user_message("hi!")

history.add_ai_message("whats up?")
```

```python
history.messages
```

```output
[HumanMessage(content='hi!', additional_kwargs={}, example=False),
 AIMessage(content='whats up?', additional_kwargs={}, example=False)]
```
