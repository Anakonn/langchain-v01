---
translated: true
---

# Telegram

>[Telegram Messenger](https://web.telegram.org/a/) es un servicio de mensajería instantánea gratuito, multiplataforma, cifrado, basado en la nube y centralizado. La aplicación también proporciona chats opcionales con cifrado de extremo a extremo y videollamadas, VoIP, intercambio de archivos y varias otras funciones.

Este cuaderno cubre cómo cargar datos de `Telegram` en un formato que se pueda ingerir en LangChain.

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

`TelegramChatApiLoader` carga datos directamente de cualquier chat especificado de Telegram. Para exportar los datos, deberá autenticar su cuenta de Telegram.

Puede obtener el API_HASH y API_ID desde https://my.telegram.org/auth?to=apps

chat_entity – se recomienda que sea la [entity](https://docs.telethon.dev/en/stable/concepts/entities.html?highlight=Entity#what-is-an-entity) de un canal.

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
