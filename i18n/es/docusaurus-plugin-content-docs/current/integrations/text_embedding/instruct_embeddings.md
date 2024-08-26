---
translated: true
---

# Instruir incrustaciones en Hugging Face

>[Hugging Face sentence-transformers](https://huggingface.co/sentence-transformers) es un marco de Python para incrustaciones de oraciones, texto e imágenes de última generación.
>Uno de los modelos de incrustación de instrucciones se utiliza en la clase `HuggingFaceInstructEmbeddings`.

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
