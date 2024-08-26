---
translated: true
---

# kNN

>En statistique, l'[algorithme des k plus proches voisins (k-NN)](https://en.wikipedia.org/wiki/K-nearest_neighbors_algorithm) est une méthode d'apprentissage supervisé non paramétrique développée pour la première fois par `Evelyn Fix` et `Joseph Hodges` en 1951, puis développée davantage par `Thomas Cover`. Elle est utilisée pour la classification et la régression.

Ce notebook explique comment utiliser un récupérateur qui, sous le capot, utilise un kNN.

Largement basé sur le code d'[Andrej Karpathy](https://github.com/karpathy/randomfun/blob/master/knn_vs_svm.html).

```python
from langchain_community.retrievers import KNNRetriever
from langchain_openai import OpenAIEmbeddings
```

## Créer un nouveau récupérateur avec des textes

```python
retriever = KNNRetriever.from_texts(
    ["foo", "bar", "world", "hello", "foo bar"], OpenAIEmbeddings()
)
```

## Utiliser le récupérateur

Nous pouvons maintenant utiliser le récupérateur !

```python
result = retriever.invoke("foo")
```

```python
result
```

```output
[Document(page_content='foo', metadata={}),
 Document(page_content='foo bar', metadata={}),
 Document(page_content='hello', metadata={}),
 Document(page_content='bar', metadata={})]
```
