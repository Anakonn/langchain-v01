---
translated: true
---

# 텔레그램

>[텔레그램 메신저](https://web.telegram.org/a/)는 전 세계적으로 사용 가능한 프리미엄, 크로스 플랫폼, 암호화, 클라우드 기반 및 중앙 집중식 인스턴트 메신저 서비스입니다. 이 애플리케이션은 또한 선택적인 엔드-투-엔드 암호화 채팅, 비디오 통화, VoIP, 파일 공유 및 여러 가지 다른 기능을 제공합니다.

이 노트북에서는 `Telegram`에서 데이터를 로드하여 LangChain에 수집할 수 있는 형식으로 만드는 방법을 다룹니다.

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

`TelegramChatApiLoader`는 지정된 채팅에서 직접 데이터를 로드합니다. 데이터를 내보내려면 텔레그램 계정을 인증해야 합니다.

API_HASH와 API_ID는 https://my.telegram.org/auth?to=apps에서 얻을 수 있습니다.

chat_entity - 채널의 [entity](https://docs.telethon.dev/en/stable/concepts/entities.html?highlight=Entity#what-is-an-entity)로 추천됩니다.

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
