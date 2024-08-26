---
traducido: falso
translated: true
---

# Incrustaciones de IA generativa de Google

Conéctese al servicio de incrustaciones de IA generativa de Google usando la clase `GoogleGenerativeAIEmbeddings`, que se encuentra en el paquete [langchain-google-genai](https://pypi.org/project/langchain-google-genai/).

## Instalación

```python
%pip install --upgrade --quiet  langchain-google-genai
```

## Credenciales

```python
import getpass
import os

if "GOOGLE_API_KEY" not in os.environ:
    os.environ["GOOGLE_API_KEY"] = getpass("Provide your Google API key here")
```

## Uso

```python
from langchain_google_genai import GoogleGenerativeAIEmbeddings

embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
vector = embeddings.embed_query("hello, world!")
vector[:5]
```

```output
[0.05636945, 0.0048285457, -0.0762591, -0.023642512, 0.05329321]
```

## Lote

También puede incrustar múltiples cadenas a la vez para obtener una mayor velocidad de procesamiento:

```python
vectors = embeddings.embed_documents(
    [
        "Today is Monday",
        "Today is Tuesday",
        "Today is April Fools day",
    ]
)
len(vectors), len(vectors[0])
```

```output
(3, 768)
```

## Tipo de tarea

`GoogleGenerativeAIEmbeddings` admite opcionalmente un `task_type`, que actualmente debe ser uno de los siguientes:

- task_type_unspecified
- retrieval_query
- retrieval_document
- semantic_similarity
- classification
- clustering

De forma predeterminada, usamos `retrieval_document` en el método `embed_documents` y `retrieval_query` en el método `embed_query`. Si proporciona un tipo de tarea, lo usaremos para todos los métodos.

```python
%pip install --upgrade --quiet  matplotlib scikit-learn
```

```output
Note: you may need to restart the kernel to use updated packages.
```

```python
query_embeddings = GoogleGenerativeAIEmbeddings(
    model="models/embedding-001", task_type="retrieval_query"
)
doc_embeddings = GoogleGenerativeAIEmbeddings(
    model="models/embedding-001", task_type="retrieval_document"
)
```

Todos estos se incrustarán con la tarea 'retrieval_query' establecida

```python
query_vecs = [query_embeddings.embed_query(q) for q in [query, query_2, answer_1]]
```

Todos estos se incrustarán con la tarea 'retrieval_document' establecida

```python
doc_vecs = [doc_embeddings.embed_query(q) for q in [query, query_2, answer_1]]
```

En la recuperación, la distancia relativa es importante. En la imagen anterior, puede ver la diferencia en las puntuaciones de similitud entre el "documento relevante" y el "más similar", con una mayor diferencia delta entre la consulta similar y el documento relevante en el último caso.

## Configuración adicional

Puede pasar los siguientes parámetros a ChatGoogleGenerativeAI para personalizar el comportamiento del SDK:

- `client_options`: [Opciones de cliente](https://googleapis.dev/python/google-api-core/latest/client_options.html#module-google.api_core.client_options) para pasar al cliente de la API de Google, como una `client_options["api_endpoint"]` personalizada.
- `transport`: El método de transporte a utilizar, como `rest`, `grpc` o `grpc_asyncio`.
