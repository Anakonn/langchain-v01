---
sidebar_position: 0
translated: true
---

# Récupérateur basé sur le magasin de vecteurs

Un récupérateur de magasin de vecteurs est un récupérateur qui utilise un magasin de vecteurs pour récupérer des documents. C'est une enveloppe légère autour de la classe de magasin de vecteurs pour la faire correspondre à l'interface du récupérateur.
Il utilise les méthodes de recherche mises en œuvre par un magasin de vecteurs, comme la recherche de similarité et MMR, pour interroger les textes du magasin de vecteurs.

Une fois que vous avez construit un magasin de vecteurs, il est très facile de construire un récupérateur. Parcourons un exemple.

```python
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../state_of_the_union.txt")
```

```python
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
texts = text_splitter.split_documents(documents)
embeddings = OpenAIEmbeddings()
db = FAISS.from_documents(texts, embeddings)
```

```python
retriever = db.as_retriever()
```

```python
docs = retriever.invoke("what did he say about ketanji brown jackson")
```

## Récupération de la pertinence marginale maximale

Par défaut, le récupérateur de magasin de vecteurs utilise la recherche de similarité. Si le magasin de vecteurs sous-jacent prend en charge la recherche de pertinence marginale maximale, vous pouvez spécifier ce type de recherche.

```python
retriever = db.as_retriever(search_type="mmr")
```

```python
docs = retriever.invoke("what did he say about ketanji brown jackson")
```

## Récupération avec seuil de score de similarité

Vous pouvez également définir une méthode de récupération qui définit un seuil de score de similarité et ne renvoie que les documents dont le score est supérieur à ce seuil.

```python
retriever = db.as_retriever(
    search_type="similarity_score_threshold", search_kwargs={"score_threshold": 0.5}
)
```

```python
docs = retriever.invoke("what did he say about ketanji brown jackson")
```

## Spécification du top k

Vous pouvez également spécifier des paramètres de recherche comme `k` à utiliser lors de la récupération.

```python
retriever = db.as_retriever(search_kwargs={"k": 1})
```

```python
docs = retriever.invoke("what did he say about ketanji brown jackson")
len(docs)
```

```output
1
```
