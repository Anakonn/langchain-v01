---
translated: true
---

# Conjunto de Recuperadores

El `EnsembleRetriever` toma una lista de recuperadores como entrada y combina los resultados de sus métodos `get_relevant_documents()` y reordena los resultados en función del algoritmo [Reciprocal Rank Fusion](https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf).

Al aprovechar las fortalezas de diferentes algoritmos, el `EnsembleRetriever` puede lograr un mejor rendimiento que cualquier algoritmo individual.

El patrón más común es combinar un recuperador disperso (como BM25) con un recuperador denso (como la similitud de incrustación), porque sus fortalezas son complementarias. También se conoce como "búsqueda híbrida". El recuperador disperso es bueno para encontrar documentos relevantes en función de las palabras clave, mientras que el recuperador denso es bueno para encontrar documentos relevantes en función de la similitud semántica.

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

## Configuración en Tiempo de Ejecución

También podemos configurar los recuperadores en tiempo de ejecución. Para hacer esto, necesitamos marcar los campos como configurables

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

Tenga en cuenta que esto solo devuelve una fuente del recuperador FAISS, porque pasamos la configuración relevante en tiempo de ejecución
