---
translated: true
---

# WhatsApp チャット

>[WhatsApp](https://www.whatsapp.com/) (「WhatsApp Messenger」とも呼ばれる) は、無料のクロスプラットフォームの集中型インスタントメッセージング (IM) およびVoIP (Voice over IP) サービスです。ユーザーはテキストメッセージや音声メッセージを送信し、音声通話やビデオ通話を行い、画像、文書、ユーザーの位置情報、その他のコンテンツを共有することができます。

このノートブックでは、「WhatsApp チャット」からデータをロードし、LangChainで取り込めるフォーマットにする方法を説明します。

```python
from langchain_community.document_loaders import WhatsAppChatLoader
```

```python
loader = WhatsAppChatLoader("example_data/whatsapp_chat.txt")
```

```python
loader.load()
```
