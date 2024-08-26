---
translated: true
---

# पोस्टग्रेस एम्बेडिंग

> [पोस्टग्रेस एम्बेडिंग](https://github.com/neondatabase/pg_embedding) एक ओपन-सोर्स वेक्टर समानता खोज है जो `पोस्टग्रेस` के लिए है और `हायरार्किकल नेविगेबल स्मॉल वर्ल्ड्स (HNSW)` का उपयोग करता है लगभग निकटतम पड़ोसी खोज के लिए।

>यह समर्थन करता है:
>- HNSW का उपयोग करके सटीक और लगभग निकटतम पड़ोसी खोज
>- L2 दूरी

यह नोटबुक दिखाता है कि पोस्टग्रेस वेक्टर डेटाबेस (`PGEmbedding`) का उपयोग कैसे किया जाए।

> PGEmbedding एकीकरण आपके लिए pg_embedding एक्सटेंशन बनाता है, लेकिन आप इसे जोड़ने के लिए निम्नलिखित पोस्टग्रेस क्वेरी चलाते हैं:

```sql
CREATE EXTENSION embedding;
```

```python
# Pip install necessary package
%pip install --upgrade --quiet  langchain-openai
%pip install --upgrade --quiet  psycopg2-binary
%pip install --upgrade --quiet  tiktoken
```

`OpenAIEmbeddings` का उपयोग करने के लिए पर्यावरण चर में OpenAI API कुंजी जोड़ें।

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```output
OpenAI API Key:········
```

```python
## Loading Environment Variables
from typing import List, Tuple
```

```python
from langchain_community.docstore.document import Document
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import PGEmbedding
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

```python
os.environ["DATABASE_URL"] = getpass.getpass("Database Url:")
```

```output
Database Url:········
```

```python
loader = TextLoader("state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
connection_string = os.environ.get("DATABASE_URL")
collection_name = "state_of_the_union"
```

```python
db = PGEmbedding.from_documents(
    embedding=embeddings,
    documents=docs,
    collection_name=collection_name,
    connection_string=connection_string,
)

query = "What did the president say about Ketanji Brown Jackson"
docs_with_score: List[Tuple[Document, float]] = db.similarity_search_with_score(query)
```

```python
for doc, score in docs_with_score:
    print("-" * 80)
    print("Score: ", score)
    print(doc.page_content)
    print("-" * 80)
```

## पोस्टग्रेस में वेक्टरस्टोर के साथ काम करना

### पीजी में वेक्टरस्टोर अपलोड करना

```python
db = PGEmbedding.from_documents(
    embedding=embeddings,
    documents=docs,
    collection_name=collection_name,
    connection_string=connection_string,
    pre_delete_collection=False,
)
```

### HNSW इंडेक्स बनाएं

डिफ़ॉल्ट रूप से, एक्सटेंशन एक क्रमिक स्कैन खोज करता है, 100% रीकॉल के साथ। आप `similarity_search_with_score` निष्पादन समय को तेज़ करने के लिए लगभग निकटतम पड़ोसी (ANN) खोज के लिए एक HNSW इंडेक्स बनाने पर विचार कर सकते हैं। अपने वेक्टर कॉलम पर HNSW इंडेक्स बनाने के लिए, `create_hnsw_index` फ़ंक्शन का उपयोग करें:

```python
PGEmbedding.create_hnsw_index(
    max_elements=10000, dims=1536, m=8, ef_construction=16, ef_search=16
)
```

उपरोक्त फ़ंक्शन निम्नलिखित SQL क्वेरी चलाने के समतुल्य है:

```sql
CREATE INDEX ON vectors USING hnsw(vec) WITH (maxelements=10000, dims=1536, m=3, efconstruction=16, efsearch=16);
```

उपरोक्त बयान में उपयोग किए गए HNSW इंडेक्स विकल्प में शामिल हैं:

- maxelements: इंडेक्स किए गए अधिकतम तत्वों को परिभाषित करता है। यह एक आवश्यक पैरामीटर है। ऊपर दिखाया गया उदाहरण में इसका मान 3 है। एक वास्तविक दुनिया का उदाहरण में इसका मान बहुत बड़ा होगा, जैसे 1000000। एक "तत्व" डेटा बिंदु (एक वेक्टर) को संदर्भित करता है जो डेटासेट में प्रतिनिधित्व करता है, जिसे HNSW ग्राफ में एक नोड के रूप में प्रतिनिधित्व किया जाता है। आमतौर पर, आप इस विकल्प को अपने डेटासेट में पंक्तियों की संख्या समायोजित करने वाले मान पर सेट करेंगे।
- dims: आपके वेक्टर डेटा में आयामों की संख्या को परिभाषित करता है। यह एक आवश्यक पैरामीटर है। ऊपर दिए गए उदाहरण में एक छोटा मान का उपयोग किया गया है। यदि आप OpenAI के text-embedding-ada-002 मॉडल का उपयोग करके जनरेट किए गए डेटा को संग्रहीत कर रहे हैं, जो 1536 आयाम का समर्थन करता है, तो आप उदाहरण के लिए 1536 का मान परिभाषित करेंगे।
- m: ग्राफ निर्माण के दौरान प्रत्येक नोड के लिए बनाए गए द्विदिशात्मक लिंकों (जिन्हें "किनारों" के रूप में भी जाना जाता है) की अधिकतम संख्या को परिभाषित करता है।
निम्नलिखित अतिरिक्त इंडेक्स विकल्प समर्थित हैं:

- efConstruction: इंडेक्स निर्माण के दौरान विचार किए गए निकटतम पड़ोसियों की संख्या को परिभाषित करता है। डिफ़ॉल्ट मान 32 है।
- efsearch: खोज के दौरान विचार किए गए निकटतम पड़ोसियों की संख्या को परिभाषित करता है। डिफ़ॉल्ट मान 32 है।
HNSW एल्गोरिदम को प्रभावित करने के लिए इन विकल्पों को कैसे कॉन्फ़िगर किया जा सकता है, इस बारे में जानकारी के लिए, [HNSW एल्गोरिदम को ट्यून करना](https://neon.tech/docs/extensions/pg_embedding#tuning-the-hnsw-algorithm) देखें।

### पीजी में वेक्टरस्टोर पुनर्प्राप्त करना

```python
store = PGEmbedding(
    connection_string=connection_string,
    embedding_function=embeddings,
    collection_name=collection_name,
)

retriever = store.as_retriever()
```

```python
retriever
```

```output
VectorStoreRetriever(vectorstore=<langchain_community.vectorstores.pghnsw.HNSWVectoreStore object at 0x121d3c8b0>, search_type='similarity', search_kwargs={})
```

```python
db1 = PGEmbedding.from_existing_index(
    embedding=embeddings,
    collection_name=collection_name,
    pre_delete_collection=False,
    connection_string=connection_string,
)

query = "What did the president say about Ketanji Brown Jackson"
docs_with_score: List[Tuple[Document, float]] = db1.similarity_search_with_score(query)
```

```python
for doc, score in docs_with_score:
    print("-" * 80)
    print("Score: ", score)
    print(doc.page_content)
    print("-" * 80)
```
