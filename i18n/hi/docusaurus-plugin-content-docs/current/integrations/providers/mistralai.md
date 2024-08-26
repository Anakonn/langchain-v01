---
translated: true
---

# MistralAI

MistralAI एक प्लेटफॉर्म है जो उनके शक्तिशाली ओपन सोर्स मॉडल्स के लिए होस्टिंग प्रदान करता है।

आप उनके [API](https://docs.mistral.ai/api/) के माध्यम से उन्हें एक्सेस कर सकते हैं।

API के साथ संवाद करने के लिए एक वैध [API कुंजी](https://console.mistral.ai/users/api-keys/) की आवश्यकता होती है।

आपको `langchain-mistralai` पैकेज भी चाहिए:

```python
%pip install -qU langchain-core langchain-mistralai
```

```python
from langchain_mistralai import ChatMistralAI, MistralAIEmbeddings
```

उनके दस्तावेजों को देखें

- [Chat Model](/docs/integrations/chat/mistralai)
- [Embeddings Model](/docs/integrations/text_embedding/mistralai)
