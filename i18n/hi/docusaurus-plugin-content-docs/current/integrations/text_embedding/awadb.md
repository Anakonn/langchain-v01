---
translated: true
---

# AwaDB

>[AwaDB](https://github.com/awa-ai/awadb) एक एलएलएम एप्लिकेशन द्वारा उपयोग किए जाने वाले एम्बेडिंग वेक्टर के खोज और संग्रहण के लिए एक एआई नेटिव डेटाबेस है।

यह नोटबुक `AwaEmbeddings` का LangChain में उपयोग करने की व्याख्या करता है।

```python
# pip install awadb
```

## पुस्तकालय आयात करें

```python
from langchain_community.embeddings import AwaEmbeddings
```

```python
Embedding = AwaEmbeddings()
```

# एम्बेडिंग मॉडल सेट करें

उपयोगकर्ता `Embedding.set_model()` का उपयोग कर मॉडल का नाम निर्दिष्ट कर सकते हैं। \
इस फ़ंक्शन का इनपुट मॉडल का नाम दर्शाता है। \
वर्तमान में समर्थित मॉडलों की सूची [यहाँ](https://github.com/awa-ai/awadb) प्राप्त की जा सकती है। \

**डिफ़ॉल्ट मॉडल** `all-mpnet-base-v2` है, इसका उपयोग बिना सेट किए किया जा सकता है।

```python
text = "our embedding test"

Embedding.set_model("all-mpnet-base-v2")
```

```python
res_query = Embedding.embed_query("The test information")
res_document = Embedding.embed_documents(["test1", "another test"])
```
