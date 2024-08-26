---
translated: true
---

# MistralAI

Mistral AIは、強力なオープンソースモデルのホスティングを提供するプラットフォームです。

[API](https://docs.mistral.ai/api/)を介してアクセスできます。

APIと通信するには、有効な[API key](https://console.mistral.ai/users/api-keys/)が必要です。

また、`langchain-mistralai`パッケージも必要です:

```python
%pip install -qU langchain-core langchain-mistralai
```

```python
from langchain_mistralai import ChatMistralAI, MistralAIEmbeddings
```

ドキュメントを参照してください

- [Chat Model](/docs/integrations/chat/mistralai)
- [Embeddings Model](/docs/integrations/text_embedding/mistralai)
