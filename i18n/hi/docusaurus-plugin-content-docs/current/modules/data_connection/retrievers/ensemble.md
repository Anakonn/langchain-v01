---
translated: true
---

# संयुक्त रिट्रीवर

`EnsembleRetriever` इनपुट के रूप में रिट्रीवर की एक सूची लेता है और उनके `get_relevant_documents()` मेथड के परिणामों को एंसेंबल करता है और [Reciprocal Rank Fusion](https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf) एल्गोरिदम के आधार पर परिणामों को पुनः रैंक करता है।

विभिन्न एल्गोरिदमों की ताकतों का लाभ उठाकर, `EnsembleRetriever` किसी भी एकल एल्गोरिदम से बेहतर प्रदर्शन प्राप्त कर सकता है।

सबसे आम पैटर्न है कि एक स्पार्स रिट्रीवर (जैसे BM25) को एक घनत्व रिट्रीवर (जैसे एम्बेडिंग समानता) के साथ संयुक्त करना, क्योंकि उनकी ताकतें पूरक हैं। इसे "हाइब्रिड खोज" के रूप में भी जाना जाता है। स्पार्स रिट्रीवर कीवर्ड के आधार पर प्रासंगिक दस्तावेज़ों को खोजने में अच्छा है, जबकि घनत्व रिट्रीवर语义समानता के आधार पर प्रासंगिक दस्तावेज़ों को खोजने में अच्छा है।

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

## रन-टाइम कॉन्फ़िगरेशन

हम रन-टाइम पर भी रिट्रीवर कॉन्फ़िगर कर सकते हैं। ऐसा करने के लिए, हमें फ़ील्ड को कॉन्फ़िगरेबल के रूप में चिह्नित करना होगा।

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

ध्यान दें कि यह केवल FAISS रिट्रीवर से एक स्रोत लौटाता है, क्योंकि हम रन-टाइम पर प्रासंगिक कॉन्फ़िगरेशन पास करते हैं।
