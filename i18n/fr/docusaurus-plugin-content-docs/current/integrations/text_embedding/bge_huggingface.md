---
translated: true
---

# BGE sur Hugging Face

>[Les modèles BGE sur HuggingFace](https://huggingface.co/BAAI/bge-large-en) sont [les meilleurs modèles d'intégration open-source](https://huggingface.co/spaces/mteb/leaderboard).
>Le modèle BGE est créé par [l'Académie de l'intelligence artificielle de Pékin (BAAI)](https://en.wikipedia.org/wiki/Beijing_Academy_of_Artificial_Intelligence). `BAAI` est une organisation à but non lucratif privée engagée dans la recherche et le développement en IA.

Ce notebook montre comment utiliser les `Embeddings BGE` via `Hugging Face`

```python
%pip install --upgrade --quiet  sentence_transformers
```

```python
from langchain_community.embeddings import HuggingFaceBgeEmbeddings

model_name = "BAAI/bge-small-en"
model_kwargs = {"device": "cpu"}
encode_kwargs = {"normalize_embeddings": True}
hf = HuggingFaceBgeEmbeddings(
    model_name=model_name, model_kwargs=model_kwargs, encode_kwargs=encode_kwargs
)
```

```python
embedding = hf.embed_query("hi this is harrison")
len(embedding)
```

```output
384
```
