---
translated: true
---

# Récupérateur de magasin de vecteurs pondéré dans le temps

Ce récupérateur utilise une combinaison de similarité sémantique et de décroissance temporelle.

L'algorithme de notation est le suivant :

```text
semantic_similarity + (1.0 - decay_rate) ^ hours_passed
```

Il est à noter que `hours_passed` fait référence aux heures écoulées depuis que l'objet du récupérateur **a été consulté pour la dernière fois**, et non depuis sa création. Cela signifie que les objets fréquemment consultés restent "frais".

```python
from datetime import datetime, timedelta

import faiss
from langchain.retrievers import TimeWeightedVectorStoreRetriever
from langchain_community.docstore import InMemoryDocstore
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings
```

## Faible taux de décroissance

Un `taux de décroissance` faible (dans ce cas, pour être extrême, nous le définirons proche de 0) signifie que les souvenirs seront "mémorisés" plus longtemps. Un `taux de décroissance` de 0 signifie que les souvenirs ne seront jamais oubliés, rendant ce récupérateur équivalent à la recherche de vecteurs.

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

## Taux de décroissance élevé

Avec un `taux de décroissance` élevé (par exemple, plusieurs 9), le `score de récence` passe rapidement à 0 ! Si vous le définissez à 1, la `récence` est 0 pour tous les objets, ce qui rend à nouveau ce récupérateur équivalent à une recherche de vecteurs.

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

## Temps virtuel

En utilisant quelques utilitaires dans LangChain, vous pouvez simuler la composante temporelle.

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
