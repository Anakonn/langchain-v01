---
sidebar_label: Nomic
translated: true
---

# Embeddings Nomic

Ce cahier couvre comment se lancer avec les modèles d'embeddings Nomic.

## Installation

```python
# install package
!pip install -U langchain-nomic
```

## Configuration de l'environnement

Assurez-vous de définir les variables d'environnement suivantes :

- `NOMIC_API_KEY`

## Utilisation

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

### Dimensionnalité personnalisée

Le modèle `nomic-embed-text-v1.5` de Nomic a été [formé avec l'apprentissage Matryoshka](https://blog.nomic.ai/posts/nomic-embed-matryoshka) pour permettre des embeddings de longueur variable avec un seul modèle. Cela signifie que vous pouvez spécifier la dimensionnalité des embeddings au moment de l'inférence. Le modèle prend en charge une dimensionnalité de 64 à 768.

```python
embeddings = NomicEmbeddings(model="nomic-embed-text-v1.5", dimensionality=256)

embeddings.embed_query("My query to look up")
```
