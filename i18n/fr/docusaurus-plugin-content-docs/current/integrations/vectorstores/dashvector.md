---
translated: true
---

# DashVector

> [DashVector](https://help.aliyun.com/document_detail/2510225.html) est un service de vectorDB entièrement géré qui prend en charge les vecteurs denses et épars de haute dimension, l'insertion en temps réel et la recherche filtrée. Il est conçu pour évoluer automatiquement et peut s'adapter à différentes exigences d'application.

Ce notebook montre comment utiliser les fonctionnalités liées à la base de données vectorielle `DashVector`.

Pour utiliser DashVector, vous devez avoir une clé API.
Voici les [instructions d'installation](https://help.aliyun.com/document_detail/2510223.html).

## Installer

```python
%pip install --upgrade --quiet  dashvector dashscope
```

Nous voulons utiliser `DashScopeEmbeddings`, nous devons donc également obtenir la clé API Dashscope.

```python
import getpass
import os

os.environ["DASHVECTOR_API_KEY"] = getpass.getpass("DashVector API Key:")
os.environ["DASHSCOPE_API_KEY"] = getpass.getpass("DashScope API Key:")
```

## Exemple

```python
from langchain_community.embeddings.dashscope import DashScopeEmbeddings
from langchain_community.vectorstores import DashVector
from langchain_text_splitters import CharacterTextSplitter
```

```python
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = DashScopeEmbeddings()
```

Nous pouvons créer DashVector à partir de documents.

```python
dashvector = DashVector.from_documents(docs, embeddings)

query = "What did the president say about Ketanji Brown Jackson"
docs = dashvector.similarity_search(query)
print(docs)
```

Nous pouvons ajouter des textes avec des métadonnées et des identifiants, et rechercher avec un filtre de métadonnées.

```python
texts = ["foo", "bar", "baz"]
metadatas = [{"key": i} for i in range(len(texts))]
ids = ["0", "1", "2"]

dashvector.add_texts(texts, metadatas=metadatas, ids=ids)

docs = dashvector.similarity_search("foo", filter="key = 2")
print(docs)
```

```output
[Document(page_content='baz', metadata={'key': 2})]
```

### Paramètres de `partition` de la bande opérationnelle

Le paramètre `partition` est par défaut sur "default", et si un paramètre `partition` inexistant est passé, la `partition` sera créée automatiquement.

```python
texts = ["foo", "bar", "baz"]
metadatas = [{"key": i} for i in range(len(texts))]
ids = ["0", "1", "2"]
partition = "langchain"

# add texts
dashvector.add_texts(texts, metadatas=metadatas, ids=ids, partition=partition)

# similarity search
query = "What did the president say about Ketanji Brown Jackson"
docs = dashvector.similarity_search(query, partition=partition)

# delete
dashvector.delete(ids=ids, partition=partition)
```
