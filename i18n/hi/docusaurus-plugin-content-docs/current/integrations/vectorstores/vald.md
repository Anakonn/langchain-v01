---
translated: true
---

# वाल्ड

> [वाल्ड](https://github.com/vdaas/vald) एक अत्यधिक स्केलेबल वितरित तेज़ लगभग निकटतम पड़ोसी (एएनएन) घनत्व वेक्टर खोज इंजन है।

यह नोटबुक `वाल्ड` डेटाबेस से संबंधित कार्यक्षमता का उपयोग करने का तरीका दिखाता है।

इस नोटबुक को चलाने के लिए, एक चल रहा वाल्ड क्लस्टर की आवश्यकता है।
अधिक जानकारी के लिए [शुरू करें](https://github.com/vdaas/vald#get-started) देखें।

[स्थापना निर्देश](https://github.com/vdaas/vald-client-python#install) देखें।

```python
%pip install --upgrade --quiet  vald-client-python
```

## मूलभूत उदाहरण

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Vald
from langchain_text_splitters import CharacterTextSplitter

raw_documents = TextLoader("state_of_the_union.txt").load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
documents = text_splitter.split_documents(raw_documents)
embeddings = HuggingFaceEmbeddings()
db = Vald.from_documents(documents, embeddings, host="localhost", port=8080)
```

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query)
docs[0].page_content
```

### वेक्टर द्वारा समानता खोज

```python
embedding_vector = embeddings.embed_query(query)
docs = db.similarity_search_by_vector(embedding_vector)
docs[0].page_content
```

### स्कोर के साथ समानता खोज

```python
docs_and_scores = db.similarity_search_with_score(query)
docs_and_scores[0]
```

## अधिकतम सीमांत प्रासंगिकता खोज (एमएमआर)

रिट्रीवर ऑब्जेक्ट में समानता खोज का उपयोग करने के अलावा, आप `mmr` का भी उपयोग कर सकते हैं।

```python
retriever = db.as_retriever(search_type="mmr")
retriever.invoke(query)
```

या `max_marginal_relevance_search` का सीधा उपयोग करें:

```python
db.max_marginal_relevance_search(query, k=2, fetch_k=10)
```

## सुरक्षित कनेक्शन का उपयोग करने का उदाहरण

इस नोटबुक को चलाने के लिए, सुरक्षित कनेक्शन के साथ एक वाल्ड क्लस्टर चलाना आवश्यक है।

यहां [Athenz](https://github.com/AthenZ/athenz) प्रमाणीकरण का उपयोग करते हुए निम्नलिखित कॉन्फ़िगरेशन का उपयोग करके एक वाल्ड क्लस्टर का उदाहरण है।

इंग्रेस(TLS) -> [authorization-proxy](https://github.com/AthenZ/authorization-proxy)(athenz-role-auth को grpc मेटाडेटा में जांचें) -> वाल्ड-एलबी-गेटवे

```python
import grpc

with open("test_root_cacert.crt", "rb") as root:
    credentials = grpc.ssl_channel_credentials(root_certificates=root.read())

# Refresh is required for server use
with open(".ztoken", "rb") as ztoken:
    token = ztoken.read().strip()

metadata = [(b"athenz-role-auth", token)]
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Vald
from langchain_text_splitters import CharacterTextSplitter

raw_documents = TextLoader("state_of_the_union.txt").load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
documents = text_splitter.split_documents(raw_documents)
embeddings = HuggingFaceEmbeddings()

db = Vald.from_documents(
    documents,
    embeddings,
    host="localhost",
    port=443,
    grpc_use_secure=True,
    grpc_credentials=credentials,
    grpc_metadata=metadata,
)
```

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query, grpc_metadata=metadata)
docs[0].page_content
```

### वेक्टर द्वारा समानता खोज

```python
embedding_vector = embeddings.embed_query(query)
docs = db.similarity_search_by_vector(embedding_vector, grpc_metadata=metadata)
docs[0].page_content
```

### स्कोर के साथ समानता खोज

```python
docs_and_scores = db.similarity_search_with_score(query, grpc_metadata=metadata)
docs_and_scores[0]
```

### अधिकतम सीमांत प्रासंगिकता खोज (एमएमआर)

```python
retriever = db.as_retriever(
    search_kwargs={"search_type": "mmr", "grpc_metadata": metadata}
)
retriever.invoke(query, grpc_metadata=metadata)
```

या:

```python
db.max_marginal_relevance_search(query, k=2, fetch_k=10, grpc_metadata=metadata)
```
