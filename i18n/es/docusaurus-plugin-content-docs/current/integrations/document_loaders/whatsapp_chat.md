---
translated: true
---

# WhatsApp Chat

>[WhatsApp](https://www.whatsapp.com/) (también llamado `WhatsApp Messenger`) es un servicio de mensajería instantánea (IM) y voz sobre IP (VoIP) gratuito, multiplataforma y centralizado. Permite a los usuarios enviar mensajes de texto y de voz, hacer llamadas de voz y video, y compartir imágenes, documentos, ubicaciones de usuarios y otro contenido.

Este cuaderno cubre cómo cargar datos de los `WhatsApp Chats` en un formato que se pueda ingerir en LangChain.

```python
from langchain_community.document_loaders import WhatsAppChatLoader
```

```python
loader = WhatsAppChatLoader("example_data/whatsapp_chat.txt")
```

```python
loader.load()
```
