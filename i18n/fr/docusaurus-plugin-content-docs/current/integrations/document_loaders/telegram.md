---
translated: true
---

# Telegram

>[Telegram Messenger](https://web.telegram.org/a/) est un service de messagerie instantanée gratuit, multiplateforme, chiffré, basé sur le cloud et centralisé. L'application fournit également des discussions chiffrées de bout en bout en option, ainsi que de l'appel vidéo, de la VoIP, du partage de fichiers et plusieurs autres fonctionnalités.

Ce notebook couvre comment charger des données de `Telegram` dans un format qui peut être ingéré dans LangChain.

```python
from langchain_community.document_loaders import (
    TelegramChatApiLoader,
    TelegramChatFileLoader,
)
```

```python
loader = TelegramChatFileLoader("example_data/telegram.json")
```

```python
loader.load()
```

```output
[Document(page_content="Henry on 2020-01-01T00:00:02: It's 2020...\n\nHenry on 2020-01-01T00:00:04: Fireworks!\n\nGrace ðŸ§¤ ðŸ\x8d’ on 2020-01-01T00:00:05: You're a minute late!\n\n", metadata={'source': 'example_data/telegram.json'})]
```

`TelegramChatApiLoader` charge directement les données de n'importe quel chat spécifié sur Telegram. Pour exporter les données, vous devrez authentifier votre compte Telegram.

Vous pouvez obtenir l'API_HASH et l'API_ID à partir de https://my.telegram.org/auth?to=apps

chat_entity – il est recommandé d'être l'[entité](https://docs.telethon.dev/en/stable/concepts/entities.html?highlight=Entity#what-is-an-entity) d'un canal.

```python
loader = TelegramChatApiLoader(
    chat_entity="<CHAT_URL>",  # recommended to use Entity here
    api_hash="<API HASH >",
    api_id="<API_ID>",
    username="",  # needed only for caching the session.
)
```

```python
loader.load()
```
