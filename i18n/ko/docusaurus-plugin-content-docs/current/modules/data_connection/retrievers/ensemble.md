---
translated: true
---

# 앙상블 리트리버

`EnsembleRetriever`는 리트리버 목록을 입력으로 받아 `get_relevant_documents()` 메서드의 결과를 앙상블하고 [Reciprocal Rank Fusion](https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf) 알고리즘을 기반으로 결과를 다시 순위화합니다.

다양한 알고리즘의 강점을 활용하여 `EnsembleRetriever`는 단일 알고리즘보다 더 나은 성능을 달성할 수 있습니다.

가장 일반적인 패턴은 희소 리트리버(BM25 등)와 밀집 리트리버(임베딩 유사성 등)를 결합하는 것입니다. 이는 이들의 강점이 상호 보완적이기 때문입니다. 이것은 "하이브리드 검색"으로도 알려져 있습니다. 희소 리트리버는 키워드 기반으로 관련 문서를 찾는 데 강점이 있고, 밀집 리트리버는 의미적 유사성 기반으로 관련 문서를 찾는 데 강점이 있습니다.

```python
%pip install --upgrade --quiet  rank_bm25 > /dev/null
```

```python
from langchain.retrievers import EnsembleRetriever
from langchain_community.retrievers import BM25Retriever
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
```

```python
doc_list_1 = [
    "I like apples",
    "I like oranges",
    "Apples and oranges are fruits",
]

# initialize the bm25 retriever and faiss retriever
bm25_retriever = BM25Retriever.from_texts(
    doc_list_1, metadatas=[{"source": 1}] * len(doc_list_1)
)
bm25_retriever.k = 2

doc_list_2 = [
    "You like apples",
    "You like oranges",
]

embedding = OpenAIEmbeddings()
faiss_vectorstore = FAISS.from_texts(
    doc_list_2, embedding, metadatas=[{"source": 2}] * len(doc_list_2)
)
faiss_retriever = faiss_vectorstore.as_retriever(search_kwargs={"k": 2})

# initialize the ensemble retriever
ensemble_retriever = EnsembleRetriever(
    retrievers=[bm25_retriever, faiss_retriever], weights=[0.5, 0.5]
)
```

```python
docs = ensemble_retriever.invoke("apples")
docs
```

```output
[Document(page_content='You like apples', metadata={'source': 2}),
 Document(page_content='I like apples', metadata={'source': 1}),
 Document(page_content='You like oranges', metadata={'source': 2}),
 Document(page_content='Apples and oranges are fruits', metadata={'source': 1})]
```

## 런타임 구성

런타임에 리트리버를 구성할 수도 있습니다. 이를 위해서는 필드를 구성 가능하도록 표시해야 합니다.

```python
from langchain_core.runnables import ConfigurableField
```

```python
faiss_retriever = faiss_vectorstore.as_retriever(
    search_kwargs={"k": 2}
).configurable_fields(
    search_kwargs=ConfigurableField(
        id="search_kwargs_faiss",
        name="Search Kwargs",
        description="The search kwargs to use",
    )
)
```

```python
ensemble_retriever = EnsembleRetriever(
    retrievers=[bm25_retriever, faiss_retriever], weights=[0.5, 0.5]
)
```

```python
config = {"configurable": {"search_kwargs_faiss": {"k": 1}}}
docs = ensemble_retriever.invoke("apples", config=config)
docs
```

FAISS 리트리버에서 하나의 소스만 반환되는 것을 알 수 있습니다. 이는 런타임에 관련 구성을 전달했기 때문입니다.
