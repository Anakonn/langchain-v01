---
translated: true
---

# कैशिंग

एम्बेडिंग्स को संग्रहित या अस्थायी रूप से कैश किया जा सकता है ताकि उन्हें पुनः कंप्यूट करने की आवश्यकता न हो।

एम्बेडिंग्स को कैश करने के लिए `CacheBackedEmbeddings` का उपयोग किया जा सकता है। कैश बैक्ड एम्बेडर एक एम्बेडर का एक रैपर है जो एम्बेडिंग्स को कुंजी-मूल्य स्टोर में कैश करता है। पाठ को हैश किया जाता है और हैश को कैश में कुंजी के रूप में उपयोग किया जाता है।

`CacheBackedEmbeddings` को प्रारंभ करने का प्रमुख समर्थित तरीका `from_bytes_store` है। यह निम्नलिखित पैरामीटर लेता है:

- underlying_embedder: एम्बेडिंग के लिए उपयोग किया जाने वाला एम्बेडर।
- document_embedding_cache: दस्तावेज़ एम्बेडिंग्स को कैश करने के लिए कोई भी [`ByteStore`](/docs/integrations/stores/)।
- batch_size: (वैकल्पिक, डिफ़ॉल्ट `None`) स्टोर अपडेट के बीच एम्बेड किए जाने वाले दस्तावेज़ों की संख्या।
- namespace: (वैकल्पिक, डिफ़ॉल्ट `""`) दस्तावेज़ कैश के लिए उपयोग किया जाने वाला namespace। यह namespace अन्य कैशों के साथ टकराव से बचने के लिए उपयोग किया जाता है। उदाहरण के लिए, इसे उपयोग किए जाने वाले एम्बेडिंग मॉडल के नाम पर सेट करें।

**ध्यान दें**:

- टकराव से बचने के लिए `namespace` पैरामीटर को सेट करना सुनिश्चित करें।
- वर्तमान में `CacheBackedEmbeddings` `embed_query()` और `aembed_query()` विधियों द्वारा बनाई गई एम्बेडिंग्स को कैश नहीं करता है।

```python
from langchain.embeddings import CacheBackedEmbeddings
```

## वेक्टर स्टोर के साथ उपयोग

पहले, हम एक उदाहरण देखते हैं जो एम्बेडिंग्स को संग्रहित करने के लिए स्थानीय फ़ाइल सिस्टम का उपयोग करता है और पुनः प्राप्ति के लिए FAISS वेक्टर स्टोर का उपयोग करता है।

```python
%pip install --upgrade --quiet  langchain-openai faiss-cpu
```

```python
from langchain.storage import LocalFileStore
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

underlying_embeddings = OpenAIEmbeddings()

store = LocalFileStore("./cache/")

cached_embedder = CacheBackedEmbeddings.from_bytes_store(
    underlying_embeddings, store, namespace=underlying_embeddings.model
)
```

एम्बेडिंग करने से पहले कैश खाली है:

```python
list(store.yield_keys())
```

```output
[]
```

दस्तावेज़ लोड करें, इसे टुकड़ों में विभाजित करें, प्रत्येक टुकड़े को एम्बेड करें और इसे वेक्टर स्टोर में लोड करें।

```python
raw_documents = TextLoader("../../state_of_the_union.txt").load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
documents = text_splitter.split_documents(raw_documents)
```

वेक्टर स्टोर बनाएं:

```python
%%time
db = FAISS.from_documents(documents, cached_embedder)
```

```output
CPU times: user 218 ms, sys: 29.7 ms, total: 248 ms
Wall time: 1.02 s
```

यदि हम वेक्टर स्टोर को फिर से बनाने का प्रयास करते हैं, तो यह बहुत तेज़ होगा क्योंकि इसे किसी भी एम्बेडिंग को पुनः कंप्यूट करने की आवश्यकता नहीं होगी।

```python
%%time
db2 = FAISS.from_documents(documents, cached_embedder)
```

```output
CPU times: user 15.7 ms, sys: 2.22 ms, total: 18 ms
Wall time: 17.2 ms
```

और यहाँ कुछ एम्बेडिंग्स हैं जो बनाई गई थीं:

```python
list(store.yield_keys())[:5]
```

```output
['text-embedding-ada-00217a6727d-8916-54eb-b196-ec9c9d6ca472',
 'text-embedding-ada-0025fc0d904-bd80-52da-95c9-441015bfb438',
 'text-embedding-ada-002e4ad20ef-dfaa-5916-9459-f90c6d8e8159',
 'text-embedding-ada-002ed199159-c1cd-5597-9757-f80498e8f17b',
 'text-embedding-ada-0021297d37a-2bc1-5e19-bf13-6c950f075062']
```

# `ByteStore` को बदलना

किसी अलग `ByteStore` का उपयोग करने के लिए, बस अपने `CacheBackedEmbeddings` बनाते समय इसका उपयोग करें। नीचे, हम एक समकक्ष कैश्ड एम्बेडिंग्स ऑब्जेक्ट बनाते हैं, लेकिन गैर-स्थायी `InMemoryByteStore` का उपयोग करते हैं:

```python
from langchain.embeddings import CacheBackedEmbeddings
from langchain.storage import InMemoryByteStore

store = InMemoryByteStore()

cached_embedder = CacheBackedEmbeddings.from_bytes_store(
    underlying_embeddings, store, namespace=underlying_embeddings.model
)
```
