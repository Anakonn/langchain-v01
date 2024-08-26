---
translated: true
---

# TF-IDF

>[TF-IDF](https://scikit-learn.org/stable/modules/feature_extraction.html#tfidf-term-weighting) signifie fréquence du terme fois fréquence inverse du document.

Ce notebook explique comment utiliser un récupérateur qui utilise [TF-IDF](https://en.wikipedia.org/wiki/Tf%E2%80%93idf) sous le capot en utilisant le package `scikit-learn`.

Pour plus d'informations sur les détails de TF-IDF, consultez [cet article de blog](https://medium.com/data-science-bootcamp/tf-idf-basics-of-information-retrieval-48de122b2a4c).

```python
%pip install --upgrade --quiet  scikit-learn
```

```python
from langchain_community.retrievers import TFIDFRetriever
```

## Créer un nouveau récupérateur avec des textes

```python
retriever = TFIDFRetriever.from_texts(["foo", "bar", "world", "hello", "foo bar"])
```

## Créer un nouveau récupérateur avec des documents

Vous pouvez maintenant créer un nouveau récupérateur avec les documents que vous avez créés.

```python
from langchain_core.documents import Document

retriever = TFIDFRetriever.from_documents(
    [
        Document(page_content="foo"),
        Document(page_content="bar"),
        Document(page_content="world"),
        Document(page_content="hello"),
        Document(page_content="foo bar"),
    ]
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

## Enregistrer et charger

Vous pouvez facilement enregistrer et charger ce récupérateur, ce qui le rend pratique pour le développement local !

```python
retriever.save_local("testing.pkl")
```

```python
retriever_copy = TFIDFRetriever.load_local("testing.pkl")
```

```python
retriever_copy.invoke("foo")
```

```output
[Document(page_content='foo', metadata={}),
 Document(page_content='foo bar', metadata={}),
 Document(page_content='hello', metadata={}),
 Document(page_content='world', metadata={})]
```
