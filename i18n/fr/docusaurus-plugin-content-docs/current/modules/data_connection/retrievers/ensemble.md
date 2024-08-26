---
translated: true
---

# Ensemble Retriever

Le `EnsembleRetriever` prend une liste de récupérateurs en entrée et rassemble les résultats de leurs méthodes `get_relevant_documents()` et reclasse les résultats en fonction de l'algorithme [Reciprocal Rank Fusion](https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf).

En tirant parti des forces de différents algorithmes, le `EnsembleRetriever` peut obtenir de meilleures performances qu'un seul algorithme.

Le modèle le plus courant consiste à combiner un récupérateur épars (comme BM25) avec un récupérateur dense (comme la similarité d'intégration), car leurs forces sont complémentaires. On parle aussi de "recherche hybride". Le récupérateur épars est bon pour trouver des documents pertinents en fonction des mots-clés, tandis que le récupérateur dense est bon pour trouver des documents pertinents en fonction de la similarité sémantique.

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

## Configuration d'exécution

Nous pouvons également configurer les récupérateurs au moment de l'exécution. Pour ce faire, nous devons marquer les champs comme configurables.

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

Notez que cela ne renvoie qu'une seule source du récupérateur FAISS, car nous passons la configuration pertinente au moment de l'exécution.
