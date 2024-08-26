---
translated: true
---

# एनएलपी क्लाउड

>[एनएलपी क्लाउड](https://docs.nlpcloud.com/#introduction) एक कृत्रिम बुद्धिमत्ता प्लेटफॉर्म है जो आपको सबसे उन्नत एआई इंजनों का उपयोग करने और अपने डेटा के साथ अपने खुद के इंजनों को प्रशिक्षित करने की अनुमति देता है।

[एम्बेडिंग](https://docs.nlpcloud.com/#embeddings) एंडपॉइंट निम्नलिखित मॉडल प्रदान करता है:

* `paraphrase-multilingual-mpnet-base-v2`: पैराफ्रेज मल्टीलिंगुअल एमपीनेट बेस वी2 एक बहुत तेज़ मॉडल है जो सेंटेंस ट्रांसफॉर्मर्स पर आधारित है और 50 से अधिक भाषाओं में एम्बेडिंग्स निकालने के लिए बिल्कुल उपयुक्त है (पूरी सूची यहां देखें)।

```python
%pip install --upgrade --quiet  nlpcloud
```

```python
from langchain_community.embeddings import NLPCloudEmbeddings
```

```python
import os

os.environ["NLPCLOUD_API_KEY"] = "xxx"
nlpcloud_embd = NLPCloudEmbeddings()
```

```python
text = "This is a test document."
```

```python
query_result = nlpcloud_embd.embed_query(text)
```

```python
doc_result = nlpcloud_embd.embed_documents([text])
```
