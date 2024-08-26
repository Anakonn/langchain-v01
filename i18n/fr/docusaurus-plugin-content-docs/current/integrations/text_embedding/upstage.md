---
sidebar_label: Upstage
translated: true
---

# Upstage Embeddings

Ce cahier couvre comment commencer avec les modèles d'embeddings Upstage.

## Installation

Installez le package `langchain-upstage`.

```bash
pip install -U langchain-upstage
```

## Configuration de l'environnement

Assurez-vous de définir les variables d'environnement suivantes :

- `UPSTAGE_API_KEY` : Votre clé d'API Upstage depuis la [console Upstage](https://console.upstage.ai/).

```python
import os

os.environ["UPSTAGE_API_KEY"] = "YOUR_API_KEY"
```

## Utilisation

Initialisez la classe `UpstageEmbeddings`.

```python
from langchain_upstage import UpstageEmbeddings

embeddings = UpstageEmbeddings()
```

Utilisez `embed_documents` pour incorporer une liste de textes ou de documents.

```python
doc_result = embeddings.embed_documents(
    ["Sam is a teacher.", "This is another document"]
)
print(doc_result)
```

Utilisez `embed_query` pour incorporer une chaîne de requête.

```python
query_result = embeddings.embed_query("What does Sam do?")
print(query_result)
```

Utilisez `aembed_documents` et `aembed_query` pour les opérations asynchrones.

```python
# async embed query
await embeddings.aembed_query("My query to look up")
```

```python
# async embed documents
await embeddings.aembed_documents(
    ["This is a content of the document", "This is another document"]
)
```

## Utilisation avec un magasin de vecteurs

Vous pouvez utiliser `UpstageEmbeddings` avec le composant de magasin de vecteurs. L'exemple suivant montre un exemple simple.

```python
from langchain_community.vectorstores import DocArrayInMemorySearch

vectorstore = DocArrayInMemorySearch.from_texts(
    ["harrison worked at kensho", "bears like to eat honey"],
    embedding=UpstageEmbeddings(),
)
retriever = vectorstore.as_retriever()
docs = retriever.invoke("Where did Harrison work?")
print(docs)
```
