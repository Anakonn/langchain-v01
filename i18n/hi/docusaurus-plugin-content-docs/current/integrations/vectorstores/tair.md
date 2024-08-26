---
translated: true
---

# टेयर

>[टेयर](https://www.alibabacloud.com/help/en/tair/latest/what-is-tair) `अलीबाबा क्लाउड` द्वारा विकसित एक क्लाउड नेटिव इन-मेमोरी डेटाबेस सेवा है।
यह आपके रियल-टाइम ऑनलाइन सценारियो को समर्थन देने के लिए समृद्ध डेटा मॉडल और उद्यम-स्तरीय क्षमताएं प्रदान करता है, जबकि ओपन-सोर्स `Redis` के साथ पूर्ण संगतता बनाए रखता है। `टेयर` नॉन-वोलेटाइल मेमोरी (एनवीएम) स्टोरेज माध्यम पर आधारित स्थायी मेमोरी-अनुकूलित उदाहरण भी पेश करता है।

यह नोटबुक `टेयर` वेक्टर डेटाबेस से संबंधित कार्यक्षमता का उपयोग करने का तरीका दिखाता है।

चलाने के लिए, आपके पास एक `टेयर` उदाहरण चालू और चल रहा होना चाहिए।

```python
from langchain_community.embeddings.fake import FakeEmbeddings
from langchain_community.vectorstores import Tair
from langchain_text_splitters import CharacterTextSplitter
```

```python
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = FakeEmbeddings(size=128)
```

`TAIR_URL` पर्यावरण चर का उपयोग करके टेयर से कनेक्ट करें

```bash
export TAIR_URL="redis://{username}:{password}@{tair_address}:{tair_port}"
```

या कीवर्ड तर्क `tair_url`।

फिर दस्तावेज और एम्बेडिंग को टेयर में संग्रहीत करें।

```python
tair_url = "redis://localhost:6379"

# drop first if index already exists
Tair.drop_index(tair_url=tair_url)

vector_store = Tair.from_documents(docs, embeddings, tair_url=tair_url)
```

समान दस्तावेजों की खोज करें।

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = vector_store.similarity_search(query)
docs[0]
```

टेयर हाइब्रिड सर्च इंडेक्स बनाएं

```python
# drop first if index already exists
Tair.drop_index(tair_url=tair_url)

vector_store = Tair.from_documents(
    docs, embeddings, tair_url=tair_url, index_params={"lexical_algorithm": "bm25"}
)
```

टेयर हाइब्रिड सर्च

```python
query = "What did the president say about Ketanji Brown Jackson"
# hybrid_ratio: 0.5 hybrid search, 0.9999 vector search, 0.0001 text search
kwargs = {"TEXT": query, "hybrid_ratio": 0.5}
docs = vector_store.similarity_search(query, **kwargs)
docs[0]
```
