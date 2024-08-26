---
translated: true
---

# AwaDB

>[AwaDB](https://github.com/awa-ai/awadb) एक एलएलएम एप्लिकेशन द्वारा उपयोग किए जाने वाले एम्बेडिंग वेक्टर के खोज और संग्रह के लिए एक एआई नेटिव डेटाबेस है।

## इंस्टॉलेशन और सेटअप

```bash
pip install awadb
```

## वेक्टर स्टोर

```python
<!--IMPORTS:[{"imported": "AwaDB", "source": "langchain_community.vectorstores", "docs": "https://api.python.langchain.com/en/latest/vectorstores/langchain_community.vectorstores.awadb.AwaDB.html", "title": "AwaDB"}]-->
from langchain_community.vectorstores import AwaDB
```

एक [उपयोग उदाहरण](/docs/integrations/vectorstores/awadb) देखें।

## एम्बेडिंग मॉडल

```python
<!--IMPORTS:[{"imported": "AwaEmbeddings", "source": "langchain_community.embeddings", "docs": "https://api.python.langchain.com/en/latest/embeddings/langchain_community.embeddings.awa.AwaEmbeddings.html", "title": "AwaDB"}]-->
from langchain_community.embeddings import AwaEmbeddings
```

एक [उपयोग उदाहरण](/docs/integrations/text_embedding/awadb) देखें।
