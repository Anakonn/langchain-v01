---
translated: true
---

# AwaDB

>[AwaDB](https://github.com/awa-ai/awadb) est une base de données native IA pour la recherche et le stockage des vecteurs d'intégration utilisés par les applications LLM.

Ce notebook explique comment utiliser `AwaEmbeddings` dans LangChain.

```python
# pip install awadb
```

## importer la bibliothèque

```python
from langchain_community.embeddings import AwaEmbeddings
```

```python
Embedding = AwaEmbeddings()
```

# Définir le modèle d'intégration

Les utilisateurs peuvent utiliser `Embedding.set_model()` pour spécifier le modèle d'intégration. \
L'entrée de cette fonction est une chaîne de caractères qui représente le nom du modèle. \
La liste des modèles actuellement pris en charge peut être obtenue [ici](https://github.com/awa-ai/awadb) \ \

Le **modèle par défaut** est `all-mpnet-base-v2`, il peut être utilisé sans être défini.

```python
text = "our embedding test"

Embedding.set_model("all-mpnet-base-v2")
```

```python
res_query = Embedding.embed_query("The test information")
res_document = Embedding.embed_documents(["test1", "another test"])
```
