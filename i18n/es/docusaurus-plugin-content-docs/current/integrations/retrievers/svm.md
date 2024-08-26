---
translated: true
---

# SVM

>[Las máquinas de vectores de soporte (SVM)](https://scikit-learn.org/stable/modules/svm.html#support-vector-machines) son un conjunto de métodos de aprendizaje supervisado utilizados para clasificación, regresión y detección de valores atípicos.

Este cuaderno analiza cómo utilizar un buscador que, bajo el capó, utiliza un `SVM` usando el paquete `scikit-learn`.

Basado en gran medida en https://github.com/karpathy/randomfun/blob/master/knn_vs_svm.html

```python
%pip install --upgrade --quiet  scikit-learn
```

```python
%pip install --upgrade --quiet  lark
```

Queremos utilizar `OpenAIEmbeddings`, así que tenemos que obtener la clave API de OpenAI.

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

## Crear un nuevo buscador con textos

```python
retriever = SVMRetriever.from_texts(
    ["foo", "bar", "world", "hello", "foo bar"], OpenAIEmbeddings()
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
