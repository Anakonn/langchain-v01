---
translated: true
---

# Instruire les Embeddings sur Hugging Face

>[Hugging Face sentence-transformers](https://huggingface.co/sentence-transformers) est un cadre Python pour les embeddings d'état de l'art de phrases, de texte et d'images.
>L'un des modèles d'embedding d'instruction est utilisé dans la classe `HuggingFaceInstructEmbeddings`.

```python
from langchain_community.embeddings import HuggingFaceInstructEmbeddings
```

```python
embeddings = HuggingFaceInstructEmbeddings(
    query_instruction="Represent the query for retrieval: "
)
```

```output
load INSTRUCTOR_Transformer
max_seq_length  512
```

```python
text = "This is a test document."
```

```python
query_result = embeddings.embed_query(text)
```
