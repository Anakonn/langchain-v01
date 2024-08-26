---
translated: true
---

# TF-IDF

>[TF-IDF](https://scikit-learn.org/stable/modules/feature_extraction.html#tfidf-term-weighting) significa frecuencia de términos por frecuencia inversa de documentos.

Este cuaderno explica cómo usar un buscador que usa [TF-IDF](https://en.wikipedia.org/wiki/Tf%E2%80%93idf) bajo el capó utilizando el paquete `scikit-learn`.

Para más información sobre los detalles de TF-IDF, consulta [este artículo del blog](https://medium.com/data-science-bootcamp/tf-idf-basics-of-information-retrieval-48de122b2a4c).

```python
%pip install --upgrade --quiet  scikit-learn
```

```python
from langchain_community.retrievers import TFIDFRetriever
```

## Crear un nuevo buscador con textos

```python
retriever = TFIDFRetriever.from_texts(["foo", "bar", "world", "hello", "foo bar"])
```

## Crear un nuevo buscador con documentos

Ahora puedes crear un nuevo buscador con los documentos que has creado.

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

## Usar el buscador

¡Ahora podemos usar el buscador!

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

## Guardar y cargar

¡Puedes guardar y cargar fácilmente este buscador, lo que lo hace útil para el desarrollo local!

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
