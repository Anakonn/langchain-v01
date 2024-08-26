---
translated: true
---

# SpaCy

>[spaCy](https://spacy.io/) es una biblioteca de software de código abierto para el procesamiento avanzado del lenguaje natural, escrita en los lenguajes de programación Python y Cython.

## Instalación y configuración

```python
%pip install --upgrade --quiet  spacy
```

Importar las clases necesarias

```python
from langchain_community.embeddings.spacy_embeddings import SpacyEmbeddings
```

## Ejemplo

Inicializar SpacyEmbeddings. Esto cargará el modelo Spacy en la memoria.

```python
embedder = SpacyEmbeddings(model_name="en_core_web_sm")
```

Definir algunos textos de ejemplo. Estos podrían ser cualquier documento que desee analizar, por ejemplo, artículos de noticias, publicaciones en redes sociales o reseñas de productos.

```python
texts = [
    "The quick brown fox jumps over the lazy dog.",
    "Pack my box with five dozen liquor jugs.",
    "How vexingly quick daft zebras jump!",
    "Bright vixens jump; dozy fowl quack.",
]
```

Generar e imprimir incrustaciones para los textos. La clase SpacyEmbeddings genera una incrustación para cada documento, que es una representación numérica del contenido del documento. Estas incrustaciones se pueden utilizar para diversas tareas de procesamiento del lenguaje natural, como la comparación de similitud de documentos o la clasificación de textos.

```python
embeddings = embedder.embed_documents(texts)
for i, embedding in enumerate(embeddings):
    print(f"Embedding for document {i+1}: {embedding}")
```

Generar e imprimir una incrustación para un solo fragmento de texto. También puede generar una incrustación para un solo fragmento de texto, como una consulta de búsqueda. Esto puede ser útil para tareas como la recuperación de información, donde desea encontrar documentos que sean similares a una consulta dada.

```python
query = "Quick foxes and lazy dogs."
query_embedding = embedder.embed_query(query)
print(f"Embedding for query: {query_embedding}")
```
