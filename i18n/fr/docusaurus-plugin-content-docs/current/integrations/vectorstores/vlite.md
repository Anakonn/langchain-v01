---
translated: true
---

# vlite

VLite est une base de données vectorielle simple et ultra-rapide qui vous permet de stocker et de récupérer des données de manière sémantique à l'aide d'embeddings. Conçu avec numpy, vlite est une base de données légère tout-en-un pour implémenter RAG, la recherche de similarité et les embeddings dans vos projets.

## Installation

Pour utiliser VLite dans LangChain, vous devez installer le package `vlite` :

```bash
!pip install vlite
```

## Importer VLite

```python
from langchain.vectorstores import VLite
```

## Exemple de base

Dans cet exemple de base, nous chargeons un document texte et les stockons dans la base de données vectorielle VLite. Ensuite, nous effectuons une recherche de similarité pour récupérer les documents pertinents en fonction d'une requête.

VLite gère le découpage en morceaux et l'embedding du texte pour vous, et vous pouvez modifier ces paramètres en pré-découpant le texte et/ou en embarquant ces morceaux dans la base de données VLite.

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

## Ajouter des textes et des documents

Vous pouvez ajouter des textes ou des documents à la base de données vectorielle VLite à l'aide des méthodes `add_texts` et `add_documents`, respectivement.

```python
# Add texts to the VLite vector database
texts = ["This is the first text.", "This is the second text."]
vlite.add_texts(texts)

# Add documents to the VLite vector database
documents = [Document(page_content="This is a document.", metadata={"source": "example.txt"})]
vlite.add_documents(documents)
```

## Recherche de similarité

VLite fournit des méthodes pour effectuer des recherches de similarité sur les documents stockés.

```python
# Perform a similarity search
query = "What is the main topic of the document?"
docs = vlite.similarity_search(query, k=3)

# Perform a similarity search with scores
docs_with_scores = vlite.similarity_search_with_score(query, k=3)
```

## Recherche de pertinence marginale maximale

VLite prend également en charge la recherche de pertinence marginale maximale (MMR), qui optimise à la fois la similarité avec la requête et la diversité parmi les documents récupérés.

```python
# Perform an MMR search
docs = vlite.max_marginal_relevance_search(query, k=3)
```

## Mise à jour et suppression de documents

Vous pouvez mettre à jour ou supprimer des documents dans la base de données vectorielle VLite à l'aide des méthodes `update_document` et `delete`.

```python
# Update a document
document_id = "doc_id_1"
updated_document = Document(page_content="Updated content", metadata={"source": "updated.txt"})
vlite.update_document(document_id, updated_document)

# Delete documents
document_ids = ["doc_id_1", "doc_id_2"]
vlite.delete(document_ids)
```

## Récupération de documents

Vous pouvez récupérer des documents de la base de données vectorielle VLite en fonction de leurs identifiants ou de leurs métadonnées à l'aide de la méthode `get`.

```python
# Retrieve documents by IDs
document_ids = ["doc_id_1", "doc_id_2"]
docs = vlite.get(ids=document_ids)

# Retrieve documents by metadata
metadata_filter = {"source": "example.txt"}
docs = vlite.get(where=metadata_filter)
```

## Création d'instances VLite

Vous pouvez créer des instances VLite à l'aide de diverses méthodes :

```python
# Create a VLite instance from texts
vlite = VLite.from_texts(texts)

# Create a VLite instance from documents
vlite = VLite.from_documents(documents)

# Create a VLite instance from an existing index
vlite = VLite.from_existing_index(collection="existing_collection")
```

## Fonctionnalités supplémentaires

VLite fournit des fonctionnalités supplémentaires pour gérer la base de données vectorielle :

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
