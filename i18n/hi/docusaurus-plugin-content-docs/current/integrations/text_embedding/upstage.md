---
sidebar_label: Upstage
translated: true
---

# UpstageEmbeddings

यह नोटबुक Upstage एम्बेडिंग मॉडल्स का उपयोग शुरू करने के बारे में कवर करता है।

## इंस्टॉलेशन

`langchain-upstage` पैकेज इंस्टॉल करें।

```bash
pip install -U langchain-upstage
```

## पर्यावरण सेटअप

निम्नलिखित पर्यावरण चर सेट करना सुनिश्चित करें:

- `UPSTAGE_API_KEY`: [Upstage कंसोल](https://console.upstage.ai/) से आपका Upstage API कुंजी।

```python
import os

os.environ["UPSTAGE_API_KEY"] = "YOUR_API_KEY"
```

## उपयोग

`UpstageEmbeddings` क्लास को इनिशियलाइज़ करें।

```python
from langchain_upstage import UpstageEmbeddings

embeddings = UpstageEmbeddings()
```

सूची के पाठ या दस्तावेजों को एम्बेड करने के लिए `embed_documents` का उपयोग करें।

```python
doc_result = embeddings.embed_documents(
    ["Sam is a teacher.", "This is another document"]
)
print(doc_result)
```

क्वेरी स्ट्रिंग को एम्बेड करने के लिए `embed_query` का उपयोग करें।

```python
query_result = embeddings.embed_query("What does Sam do?")
print(query_result)
```

असिंक्रोनस ऑपरेशनों के लिए `aembed_documents` और `aembed_query` का उपयोग करें।

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

## वेक्टर स्टोर के साथ उपयोग करना

आप `UpstageEmbeddings` को वेक्टर स्टोर घटक के साथ उपयोग कर सकते हैं। निम्नलिखित एक सरल उदाहरण दिखाता है।

```python
from langchain_community.vectorstores import DocArrayInMemorySearch

vectorstore = DocArrayInMemorySearch.from_texts(
    ["harrison worked at kensho", "bears like to eat honey"],
    embedding=UpstageEmbeddings(),
)
retriever = vectorstore.as_retriever()
docs = retriever.invoke("Where did Harrison work?")
print(docs)
```
