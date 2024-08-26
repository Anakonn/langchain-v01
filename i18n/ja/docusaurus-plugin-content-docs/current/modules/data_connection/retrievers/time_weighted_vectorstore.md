---
translated: true
---

# 時間加重ベクトルストア検索

このリトリーバーは、意味的類似性と時間減衰の組み合わせを使用しています。

スコアリングアルゴリズムは次のとおりです:

```text
semantic_similarity + (1.0 - decay_rate) ^ hours_passed
```

特に、`hours_passed`は、オブジェクトが**最後にアクセスされた**時間からの経過時間を指しており、作成時からの時間ではありません。これは、頻繁にアクセスされるオブジェクトが「新鮮」な状態を維持することを意味します。

```python
from datetime import datetime, timedelta

import faiss
from langchain.retrievers import TimeWeightedVectorStoreRetriever
from langchain_community.docstore import InMemoryDocstore
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings
```

## 低減衰率

低い`減衰率`(この例では極端に0に近い値)では、メモリが長期間保持されます。`減衰率`が0の場合、メモリは決して忘れられず、このリトリーバーはベクトルルックアップと同等になります。

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

## 高減衰率

高い`減衰率`(例えば、数個の9)では、`recency score`がすぐに0になります。これを1まで設定すると、`recency`はすべてのオブジェクトで0になり、再びこのリトリーバーはベクトルルックアップと同等になります。

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

## 仮想時間

LangChainのユーティリティを使用して、時間要素をモックアウトすることができます。

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
