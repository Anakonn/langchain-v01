---
translated: true
---

# 시간 가중 벡터 저장소 검색기

이 검색기는 의미론적 유사성과 시간 감쇠의 조합을 사용합니다.

점수 산정 알고리즘은 다음과 같습니다:

```text
semantic_similarity + (1.0 - decay_rate) ^ hours_passed
```

주목할 점은 `hours_passed`가 검색기에 **마지막으로 액세스된** 객체의 시간 경과를 나타내며, 생성된 시간이 아니라는 것입니다. 이는 자주 액세스되는 객체가 "신선"하게 유지됨을 의미합니다.

```python
from datetime import datetime, timedelta

import faiss
from langchain.retrievers import TimeWeightedVectorStoreRetriever
from langchain_community.docstore import InMemoryDocstore
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings
```

## 낮은 감쇠율

낮은 `decay rate`(이 경우 극단적으로 0에 가깝게 설정)는 메모리가 더 오래 "기억"됨을 의미합니다. `decay rate`가 0이면 메모리가 절대 잊혀지지 않아, 이 검색기가 벡터 조회와 동일해집니다.

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

## 높은 감쇠율

높은 `decay rate`(예: 여러 개의 9)에서는 `recency score`가 빠르게 0으로 떨어집니다! 이를 완전히 1로 설정하면 `recency`가 모든 객체에 대해 0이 되어, 다시 벡터 조회와 동일해집니다.

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

## 가상 시간

LangChain의 유틸리티를 사용하여 시간 구성 요소를 모방할 수 있습니다.

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
