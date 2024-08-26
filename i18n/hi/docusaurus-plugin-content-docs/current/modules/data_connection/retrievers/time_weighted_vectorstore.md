---
translated: true
---

# समय-भारित वेक्टर स्टोर पुनर्प्राप्तकर्ता

यह पुनर्प्राप्तकर्ता语义समानता और समय-क्षय का संयोजन का उपयोग करता है।

उनके स्कोरिंग के लिए एल्गोरिदम है:

```text
semantic_similarity + (1.0 - decay_rate) ^ hours_passed
```

ध्यान देने योग्य है कि `hours_passed` का संदर्भ पुनर्प्राप्तकर्ता में वस्तु **पिछली बार एक्सेस की गई थी**, न कि जब से वह बनाई गई थी। इसका मतलब है कि बार-बार एक्सेस की जाने वाली वस्तुएं "ताजा" बनी रहती हैं।

```python
from datetime import datetime, timedelta

import faiss
from langchain.retrievers import TimeWeightedVectorStoreRetriever
from langchain_community.docstore import InMemoryDocstore
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings
```

## कम क्षय दर

एक कम `क्षय दर` (इस मामले में, अत्यधिक होने के लिए, हम इसे 0 के करीब सेट करेंगे) का मतलब है कि स्मृतियां लंबे समय तक "याद" की जाएंगी। 0 `क्षय दर` का मतलब है कि स्मृतियां कभी भी नहीं भूली जाएंगी, जिससे यह पुनर्प्राप्तकर्ता वेक्टर लुकअप के समकक्ष हो जाता है।

```python
# Define your embedding model
embeddings_model = OpenAIEmbeddings()
# Initialize the vectorstore as empty
embedding_size = 1536
index = faiss.IndexFlatL2(embedding_size)
vectorstore = FAISS(embeddings_model, index, InMemoryDocstore({}), {})
retriever = TimeWeightedVectorStoreRetriever(
    vectorstore=vectorstore, decay_rate=0.0000000000000000000000001, k=1
)
```

```python
yesterday = datetime.now() - timedelta(days=1)
retriever.add_documents(
    [Document(page_content="hello world", metadata={"last_accessed_at": yesterday})]
)
retriever.add_documents([Document(page_content="hello foo")])
```

```output
['c3dcf671-3c0a-4273-9334-c4a913076bfa']
```

```python
# "Hello World" is returned first because it is most salient, and the decay rate is close to 0., meaning it's still recent enough
retriever.invoke("hello world")
```

```output
[Document(page_content='hello world', metadata={'last_accessed_at': datetime.datetime(2023, 12, 27, 15, 30, 18, 457125), 'created_at': datetime.datetime(2023, 12, 27, 15, 30, 8, 442662), 'buffer_idx': 0})]
```

## उच्च क्षय दर

उच्च `क्षय दर` (उदाहरण के लिए, कई 9) के साथ, `नवीनता स्कोर` जल्दी ही 0 हो जाता है! यदि आप इसे पूरी तरह से 1 तक सेट करते हैं, तो `नवीनता` सभी वस्तुओं के लिए 0 है, एक बार फिर इसे वेक्टर लुकअप के समकक्ष बना देता है।

```python
# Define your embedding model
embeddings_model = OpenAIEmbeddings()
# Initialize the vectorstore as empty
embedding_size = 1536
index = faiss.IndexFlatL2(embedding_size)
vectorstore = FAISS(embeddings_model, index, InMemoryDocstore({}), {})
retriever = TimeWeightedVectorStoreRetriever(
    vectorstore=vectorstore, decay_rate=0.999, k=1
)
```

```python
yesterday = datetime.now() - timedelta(days=1)
retriever.add_documents(
    [Document(page_content="hello world", metadata={"last_accessed_at": yesterday})]
)
retriever.add_documents([Document(page_content="hello foo")])
```

```output
['eb1c4c86-01a8-40e3-8393-9a927295a950']
```

```python
# "Hello Foo" is returned first because "hello world" is mostly forgotten
retriever.invoke("hello world")
```

```output
[Document(page_content='hello foo', metadata={'last_accessed_at': datetime.datetime(2023, 12, 27, 15, 30, 50, 57185), 'created_at': datetime.datetime(2023, 12, 27, 15, 30, 44, 720490), 'buffer_idx': 1})]
```

## आभासी समय

LangChain में कुछ उपयोगी उपकरणों का उपयोग करके, आप समय घटक को नकली बना सकते हैं।

```python
import datetime

from langchain.utils import mock_now
```

```python
# Notice the last access time is that date time
with mock_now(datetime.datetime(2024, 2, 3, 10, 11)):
    print(retriever.invoke("hello world"))
```

```output
[Document(page_content='hello world', metadata={'last_accessed_at': MockDateTime(2024, 2, 3, 10, 11), 'created_at': datetime.datetime(2023, 12, 27, 15, 30, 44, 532941), 'buffer_idx': 0})]
```
