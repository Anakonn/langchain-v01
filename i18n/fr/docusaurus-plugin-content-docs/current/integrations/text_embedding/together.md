---
sidebar_label: Ensemble AI
translated: true
---

# TogetherEmbeddings

Ce cahier couvre comment commencer avec les modèles d'intégration open source hébergés dans l'API Together AI.

## Installation

```python
# install package
%pip install --upgrade --quiet  langchain-together
```

## Configuration de l'environnement

Assurez-vous de définir les variables d'environnement suivantes :

- `TOGETHER_API_KEY`

## Utilisation

Tout d'abord, sélectionnez un modèle pris en charge dans [cette liste](https://docs.together.ai/docs/embedding-models). Dans l'exemple suivant, nous utiliserons `togethercomputer/m2-bert-80M-8k-retrieval`.

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
