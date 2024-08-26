---
sidebar_label: नोमिक
translated: true
---

# NomicEmbeddings

यह नोटबुक नोमिक एम्बेडिंग मॉडल्स का उपयोग शुरू करने के बारे में कवर करता है।

## इंस्टॉलेशन

```python
# install package
!pip install -U langchain-nomic
```

## पर्यावरण सेटअप

निम्नलिखित पर्यावरण चर सेट करना सुनिश्चित करें:

- `NOMIC_API_KEY`

## उपयोग

```python
from langchain_nomic.embeddings import NomicEmbeddings

embeddings = NomicEmbeddings(model="nomic-embed-text-v1.5")
```

```python
embeddings.embed_query("My query to look up")
```

```python
embeddings.embed_documents(
    ["This is a content of the document", "This is another document"]
)
```

```python
# async embed query
await embeddings.aembed_query("My query to look up")
```

```python
# async embed documents
await embeddings.aembed_documents(
    ["This is a content of the document", "This is another document"]
)
```

### कस्टम आयामिकता

नोमिक का `nomic-embed-text-v1.5` मॉडल [मैट्रियोश्का लर्निंग](https://blog.nomic.ai/posts/nomic-embed-matryoshka) के साथ प्रशिक्षित किया गया था ताकि एक ही मॉडल के साथ परिवर्तनशील लंबाई वाले एम्बेडिंग्स को सक्षम किया जा सके। इसका मतलब है कि आप अनुमान के समय एम्बेडिंग्स की आयामिकता निर्दिष्ट कर सकते हैं। मॉडल 64 से 768 तक की आयामिकता का समर्थन करता है।

```python
embeddings = NomicEmbeddings(model="nomic-embed-text-v1.5", dimensionality=256)

embeddings.embed_query("My query to look up")
```
