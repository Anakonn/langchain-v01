---
translated: true
---

# kNN

>En estadística, el [algoritmo de los k-vecinos más cercanos (k-NN)](https://en.wikipedia.org/wiki/K-nearest_neighbors_algorithm) es un método de aprendizaje supervisado no paramétrico desarrollado por primera vez por `Evelyn Fix` y `Joseph Hodges` en 1951, y posteriormente ampliado por `Thomas Cover`. Se utiliza para clasificación y regresión.

Este cuaderno explica cómo utilizar un buscador que, bajo el capó, utiliza un kNN.

En gran medida basado en el código de [Andrej Karpathy](https://github.com/karpathy/randomfun/blob/master/knn_vs_svm.html).

```python
from langchain_community.retrievers import KNNRetriever
from langchain_openai import OpenAIEmbeddings
```

## Crear un nuevo buscador con textos

```python
retriever = KNNRetriever.from_texts(
    ["foo", "bar", "world", "hello", "foo bar"], OpenAIEmbeddings()
)
```

## Utilizar el buscador

¡Ahora podemos utilizar el buscador!

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
