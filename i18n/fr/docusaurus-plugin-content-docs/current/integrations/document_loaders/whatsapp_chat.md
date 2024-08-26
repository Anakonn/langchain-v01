---
translated: true
---

# WhatsApp Chat

>[WhatsApp](https://www.whatsapp.com/) (également appelé `WhatsApp Messenger`) est un service de messagerie instantanée (IM) et de voix sur IP (VoIP) gratuit, multiplateforme et centralisé. Il permet aux utilisateurs d'envoyer des messages texte et vocaux, de passer des appels vocaux et vidéo, et de partager des images, des documents, des emplacements d'utilisateurs et d'autres contenus.

Ce notebook couvre comment charger des données à partir des `WhatsApp Chats` dans un format qui peut être ingéré dans LangChain.

```python
from langchain_community.document_loaders import WhatsAppChatLoader
```

```python
loader = WhatsAppChatLoader("example_data/whatsapp_chat.txt")
```

```python
loader.load()
```
