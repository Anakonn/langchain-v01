---
translated: true
---

# DashVector

> [DashVector](https://help.aliyun.com/document_detail/2510225.html) एक पूरी तरह से प्रबंधित वेक्टरDB सेवा है जो उच्च आयाम घनत्व और स्पार्स वेक्टर, वास्तविक समय में इंसर्शन और फिल्टर किए गए खोज का समर्थन करती है। यह स्वचालित रूप से पैमाने पर बढ़ने के लिए बनाया गया है और विभिन्न अनुप्रयोग आवश्यकताओं के अनुकूल हो सकता है।

यह नोटबुक `DashVector` वेक्टर डेटाबेस से संबंधित कार्यक्षमता का उपयोग करने का तरीका दिखाता है।

DashVector का उपयोग करने के लिए, आपके पास एक API कुंजी होनी चाहिए।
यहां [स्थापना निर्देश](https://help.aliyun.com/document_detail/2510223.html) हैं।

## स्थापना

```python
%pip install --upgrade --quiet  dashvector dashscope
```

हम `DashScopeEmbeddings` का उपयोग करना चाहते हैं, इसलिए हमें Dashscope API कुंजी भी प्राप्त करनी होगी।

```python
import getpass
import os

os.environ["DASHVECTOR_API_KEY"] = getpass.getpass("DashVector API Key:")
os.environ["DASHSCOPE_API_KEY"] = getpass.getpass("DashScope API Key:")
```

## उदाहरण

```python
from langchain_community.embeddings.dashscope import DashScopeEmbeddings
from langchain_community.vectorstores import DashVector
from langchain_text_splitters import CharacterTextSplitter
```

```python
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = DashScopeEmbeddings()
```

हम दस्तावेजों से DashVector बना सकते हैं।

```python
dashvector = DashVector.from_documents(docs, embeddings)

query = "What did the president say about Ketanji Brown Jackson"
docs = dashvector.similarity_search(query)
print(docs)
```

हम मेटाडेटा और आईडी के साथ पाठ जोड़ सकते हैं और मेटा फ़िल्टर के साथ खोज कर सकते हैं।

```python
texts = ["foo", "bar", "baz"]
metadatas = [{"key": i} for i in range(len(texts))]
ids = ["0", "1", "2"]

dashvector.add_texts(texts, metadatas=metadatas, ids=ids)

docs = dashvector.similarity_search("foo", filter="key = 2")
print(docs)
```

```output
[Document(page_content='baz', metadata={'key': 2})]
```

### परिचालन बैंड `पार्टिशन` पैरामीटर

`पार्टिशन` पैरामीटर डिफ़ॉल्ट पर डिफ़ॉल्ट होता है, और यदि एक अमान्य `पार्टिशन` पैरामीटर पास किया जाता है, तो `पार्टिशन` स्वचालित रूप से बना दिया जाएगा।

```python
texts = ["foo", "bar", "baz"]
metadatas = [{"key": i} for i in range(len(texts))]
ids = ["0", "1", "2"]
partition = "langchain"

# add texts
dashvector.add_texts(texts, metadatas=metadatas, ids=ids, partition=partition)

# similarity search
query = "What did the president say about Ketanji Brown Jackson"
docs = dashvector.similarity_search(query, partition=partition)

# delete
dashvector.delete(ids=ids, partition=partition)
```
