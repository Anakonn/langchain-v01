---
translated: true
---

# WhatsApp 채팅

>[WhatsApp](https://www.whatsapp.com/) (또한 `WhatsApp Messenger`라고 함)은 무료 크로스 플랫폼 중앙 집중식 인스턴트 메신저(IM) 및 VoIP(Voice over IP) 서비스입니다. 사용자가 텍스트 및 음성 메시지를 보내고, 음성 및 비디오 통화를 하며, 이미지, 문서, 사용자 위치 및 기타 콘텐츠를 공유할 수 있습니다.

이 노트북에서는 `WhatsApp Chats`에서 데이터를 로드하여 LangChain에서 사용할 수 있는 형식으로 변환하는 방법을 다룹니다.

```python
from langchain_community.document_loaders import WhatsAppChatLoader
```

```python
loader = WhatsAppChatLoader("example_data/whatsapp_chat.txt")
```

```python
loader.load()
```
