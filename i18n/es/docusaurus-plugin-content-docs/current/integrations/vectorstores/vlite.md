---
translated: true
---

# vlite

VLite es una base de datos vectorial simple y extremadamente rápida que permite almacenar y recuperar datos semánticamente utilizando incrustaciones. Hecho con numpy, vlite es una base de datos ligera con todo incluido para implementar RAG, búsqueda de similitud e incrustaciones en tus proyectos.

## Instalación

Para usar VLite en LangChain, necesitas instalar el paquete `vlite`:

```bash
!pip install vlite
```

## Importando VLite

```python
from langchain.vectorstores import VLite
```

## Ejemplo básico

En este ejemplo básico, cargamos un documento de texto y los almacenamos en la base de datos vectorial VLite. Luego, realizamos una búsqueda de similitud para recuperar los documentos relevantes en función de una consulta.

VLite se encarga del chunking y la incrustación del texto por ti, y puedes cambiar estos parámetros pre-chunking el texto y/o incrustando esos fragmentos en la base de datos VLite.

```python
from langchain.document_loaders import TextLoader
from langchain.text_splitter import CharacterTextSplitter

# Load the document and split it into chunks
loader = TextLoader("path/to/document.txt")
documents = loader.load()

# Create a VLite instance
vlite = VLite(collection="my_collection")

# Add documents to the VLite vector database
vlite.add_documents(documents)

# Perform a similarity search
query = "What is the main topic of the document?"
docs = vlite.similarity_search(query)

# Print the most relevant document
print(docs[0].page_content)
```

## Agregar textos y documentos

Puedes agregar textos o documentos a la base de datos vectorial VLite utilizando los métodos `add_texts` y `add_documents`, respectivamente.

```python
# Add texts to the VLite vector database
texts = ["This is the first text.", "This is the second text."]
vlite.add_texts(texts)

# Add documents to the VLite vector database
documents = [Document(page_content="This is a document.", metadata={"source": "example.txt"})]
vlite.add_documents(documents)
```

## Búsqueda de similitud

VLite proporciona métodos para realizar búsquedas de similitud en los documentos almacenados.

```python
# Perform a similarity search
query = "What is the main topic of the document?"
docs = vlite.similarity_search(query, k=3)

# Perform a similarity search with scores
docs_with_scores = vlite.similarity_search_with_score(query, k=3)
```

## Búsqueda de relevancia marginal máxima

VLite también admite la búsqueda de relevancia marginal máxima (MMR), que optimiza tanto la similitud con la consulta como la diversidad entre los documentos recuperados.

```python
# Perform an MMR search
docs = vlite.max_marginal_relevance_search(query, k=3)
```

## Actualizar y eliminar documentos

Puedes actualizar o eliminar documentos en la base de datos vectorial VLite utilizando los métodos `update_document` y `delete`.

```python
# Update a document
document_id = "doc_id_1"
updated_document = Document(page_content="Updated content", metadata={"source": "updated.txt"})
vlite.update_document(document_id, updated_document)

# Delete documents
document_ids = ["doc_id_1", "doc_id_2"]
vlite.delete(document_ids)
```

## Recuperar documentos

Puedes recuperar documentos de la base de datos vectorial VLite en función de sus ID o metadatos utilizando el método `get`.

```python
# Retrieve documents by IDs
document_ids = ["doc_id_1", "doc_id_2"]
docs = vlite.get(ids=document_ids)

# Retrieve documents by metadata
metadata_filter = {"source": "example.txt"}
docs = vlite.get(where=metadata_filter)
```

## Crear instancias de VLite

Puedes crear instancias de VLite utilizando varios métodos:

```python
# Create a VLite instance from texts
vlite = VLite.from_texts(texts)

# Create a VLite instance from documents
vlite = VLite.from_documents(documents)

# Create a VLite instance from an existing index
vlite = VLite.from_existing_index(collection="existing_collection")
```

## Características adicionales

VLite proporciona características adicionales para administrar la base de datos vectorial:

```python
from langchain.vectorstores import VLite
vlite = VLite(collection="my_collection")

# Get the number of items in the collection
count = vlite.count()

# Save the collection
vlite.save()

# Clear the collection
vlite.clear()

# Get collection information
vlite.info()

# Dump the collection data
data = vlite.dump()
```
