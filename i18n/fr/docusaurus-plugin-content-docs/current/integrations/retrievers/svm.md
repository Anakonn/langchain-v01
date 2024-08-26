---
translated: true
---

# SVM

>[Les machines à vecteurs de support (SVM)](https://scikit-learn.org/stable/modules/svm.html#support-vector-machines) sont un ensemble de méthodes d'apprentissage supervisé utilisées pour la classification, la régression et la détection des valeurs aberrantes.

Ce notebook explique comment utiliser un récupérateur qui, sous le capot, utilise un `SVM` à l'aide du package `scikit-learn`.

Largement basé sur https://github.com/karpathy/randomfun/blob/master/knn_vs_svm.html

```python
%pip install --upgrade --quiet  scikit-learn
```

```python
%pip install --upgrade --quiet  lark
```

Nous voulons utiliser `OpenAIEmbeddings`, donc nous devons obtenir la clé API OpenAI.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```output
OpenAI API Key: ········
```

```python
from langchain_community.retrievers import SVMRetriever
from langchain_openai import OpenAIEmbeddings
```

## Créer un nouveau récupérateur avec des textes

```python
retriever = SVMRetriever.from_texts(
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
 Document(page_content='world', metadata={})]
```
