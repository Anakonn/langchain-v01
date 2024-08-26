---
translated: true
---

# BGE en Hugging Face

>[Los modelos BGE en HuggingFace](https://huggingface.co/BAAI/bge-large-en) son [los mejores modelos de incrustación de código abierto](https://huggingface.co/spaces/mteb/leaderboard).
>El modelo BGE fue creado por el [Instituto de Inteligencia Artificial de Pekín (BAAI)](https://en.wikipedia.org/wiki/Beijing_Academy_of_Artificial_Intelligence). `BAAI` es una organización privada sin fines de lucro dedicada a la investigación y el desarrollo de IA.

Este cuaderno muestra cómo usar `BGE Embeddings` a través de `Hugging Face`

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
