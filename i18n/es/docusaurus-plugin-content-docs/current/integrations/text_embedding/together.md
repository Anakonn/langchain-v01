---
sidebar_label: Together AI
translated: true
---

# TogetherEmbeddings

Este cuaderno cubre cómo comenzar con los modelos de incrustación de código abierto alojados en la API de Together AI.

## Instalación

```python
# install package
%pip install --upgrade --quiet  langchain-together
```

## Configuración del entorno

Asegúrese de establecer las siguientes variables de entorno:

- `TOGETHER_API_KEY`

## Uso

Primero, seleccione un modelo compatible de [esta lista](https://docs.together.ai/docs/embedding-models). En el siguiente ejemplo, usaremos `togethercomputer/m2-bert-80M-8k-retrieval`.

```python
from langchain_together.embeddings import TogetherEmbeddings

embeddings = TogetherEmbeddings(model="togethercomputer/m2-bert-80M-8k-retrieval")
```

```python
embeddings.embed_query("My query to look up")
```

```python
embeddings.embed_documents(
    ["This is a content of the document", "This is another document"]
)
```

```python
# async embed query
await embeddings.aembed_query("My query to look up")
```

```python
# async embed documents
await embeddings.aembed_documents(
    ["This is a content of the document", "This is another document"]
)
```
