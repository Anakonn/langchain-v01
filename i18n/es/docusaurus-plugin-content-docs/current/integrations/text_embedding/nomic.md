---
sidebar_label: Nomic
translated: true
---

# Incrustaciones de Nomic

Este cuaderno cubre cómo comenzar con los modelos de incrustación de Nomic.

## Instalación

```python
# install package
!pip install -U langchain-nomic
```

## Configuración del entorno

Asegúrese de establecer las siguientes variables de entorno:

- `NOMIC_API_KEY`

## Uso

```python
from langchain_nomic.embeddings import NomicEmbeddings

embeddings = NomicEmbeddings(model="nomic-embed-text-v1.5")
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

### Dimensionalidad personalizada

El modelo `nomic-embed-text-v1.5` de Nomic se [entrenó con el aprendizaje Matryoshka](https://blog.nomic.ai/posts/nomic-embed-matryoshka) para permitir incrustaciones de longitud variable con un solo modelo. Esto significa que puede especificar la dimensionalidad de las incrustaciones en el momento de la inferencia. El modelo admite dimensionalidad de 64 a 768.

```python
embeddings = NomicEmbeddings(model="nomic-embed-text-v1.5", dimensionality=256)

embeddings.embed_query("My query to look up")
```
