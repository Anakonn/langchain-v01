---
translated: true
---

# नोमिक

नोमिक वर्तमान में दो उत्पाद प्रदान करता है:

- एटलस: उनका विजुअल डेटा इंजन
- GPT4All: उनका ओपन सोर्स एज लैंग्वेज मॉडल इकोसिस्टम

नोमिक एकीकरण अपने ही [साझेदार पैकेज](https://pypi.org/project/langchain-nomic/) में मौजूद है। आप इसे निम्न प्रकार से स्थापित कर सकते हैं:

```python
%pip install -qU langchain-nomic
```

वर्तमान में, आप उनके होस्ट किए गए [एम्बेडिंग मॉडल](/docs/integrations/text_embedding/nomic) को निम्न प्रकार से आयात कर सकते हैं:

```python
from langchain_nomic import NomicEmbeddings
```
