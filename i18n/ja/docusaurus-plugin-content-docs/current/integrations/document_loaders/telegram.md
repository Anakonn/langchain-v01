---
translated: true
---

# テレグラム

>[Telegram Messenger](https://web.telegram.org/a/) は、グローバルにアクセス可能なフリーミアム、クロスプラットフォーム、暗号化、クラウドベースで中央集権化されたインスタントメッセージングサービスです。このアプリケーションは、オプションでエンドツーエンド暗号化チャットおよびビデオ通話、VoIP、ファイル共有、およびその他のいくつかの機能も提供します。

このノートブックでは、`Telegram` からデータをロードし、LangChain に取り込める形式に変換する方法を説明します。

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

`TelegramChatApiLoader` は、Telegram の任意の指定されたチャットから直接データをロードします。データをエクスポートするには、Telegram アカウントを認証する必要があります。

API_HASH および API_ID は https://my.telegram.org/auth?to=apps から取得できます。

chat_entity – チャンネルの [entity](https://docs.telethon.dev/en/stable/concepts/entities.html?highlight=Entity#what-is-an-entity) を推奨します。

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
