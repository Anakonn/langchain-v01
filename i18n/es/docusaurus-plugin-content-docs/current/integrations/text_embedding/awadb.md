---
translated: true
---

# AwaDB

>[AwaDB](https://github.com/awa-ai/awadb) es una base de datos nativa de IA para la búsqueda y el almacenamiento de vectores de incrustación utilizados por las aplicaciones LLM.

Este cuaderno explica cómo usar `AwaEmbeddings` en LangChain.

```python
# pip install awadb
```

## importar la biblioteca

```python
from langchain_community.embeddings import AwaEmbeddings
```

```python
Embedding = AwaEmbeddings()
```

# Establecer el modelo de incrustación

Los usuarios pueden usar `Embedding.set_model()` para especificar el modelo de incrustación. \
La entrada de esta función es una cadena que representa el nombre del modelo. \
La lista de modelos actualmente compatibles se puede obtener [aquí](https://github.com/awa-ai/awadb) \ \

El **modelo predeterminado** es `all-mpnet-base-v2`, se puede usar sin establecerlo.

```python
text = "our embedding test"

Embedding.set_model("all-mpnet-base-v2")
```

```python
res_query = Embedding.embed_query("The test information")
res_document = Embedding.embed_documents(["test1", "another test"])
```
