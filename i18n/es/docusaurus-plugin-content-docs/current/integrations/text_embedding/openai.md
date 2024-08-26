---
translated: true
---

# OpenAI

Vamos a cargar la clase OpenAI Embedding.

## Configuración

Primero instalamos langchain-openai y establecemos las variables de entorno requeridas.

```python
%pip install -qU langchain-openai
```

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()
```

```python
from langchain_openai import OpenAIEmbeddings
```

```python
embeddings = OpenAIEmbeddings(model="text-embedding-3-large")
```

```python
text = "This is a test document."
```

## Uso

### Incrustar consulta

```python
query_result = embeddings.embed_query(text)
```

```output
Warning: model not found. Using cl100k_base encoding.
```

```python
query_result[:5]
```

```output
[-0.014380056377383358,
 -0.027191711627651764,
 -0.020042716111860304,
 0.057301379620345545,
 -0.022267658631828974]
```

## Incrustar documentos

```python
doc_result = embeddings.embed_documents([text])
```

```output
Warning: model not found. Using cl100k_base encoding.
```

```python
doc_result[0][:5]
```

```output
[-0.014380056377383358,
 -0.027191711627651764,
 -0.020042716111860304,
 0.057301379620345545,
 -0.022267658631828974]
```

## Especificar dimensiones

Con la clase de modelos `text-embedding-3`, puede especificar el tamaño de los incrustaciones que desea que se devuelvan. Por ejemplo, de forma predeterminada, `text-embedding-3-large` devolvió incrustaciones de dimensión 3072:

```python
len(doc_result[0])
```

```output
3072
```

Pero al pasar `dimensions=1024` podemos reducir el tamaño de nuestras incrustaciones a 1024:

```python
embeddings_1024 = OpenAIEmbeddings(model="text-embedding-3-large", dimensions=1024)
```

```python
len(embeddings_1024.embed_documents([text])[0])
```

```output
Warning: model not found. Using cl100k_base encoding.
```

```output
1024
```
