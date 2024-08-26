---
translated: true
---

# Sentence Transformers en Hugging Face

>[Hugging Face sentence-transformers](https://huggingface.co/sentence-transformers) es un marco de trabajo de Python para incrustaciones de oraciones, texto e imágenes de vanguardia.
>Uno de los modelos de incrustación se utiliza en la clase `HuggingFaceEmbeddings`.
>También hemos agregado un alias para `SentenceTransformerEmbeddings` para los usuarios que están más familiarizados con el uso directo de ese paquete.

Los modelos del paquete `sentence_transformers` se originan de [Sentence-BERT](https://arxiv.org/abs/1908.10084)

```python
%pip install --upgrade --quiet  sentence_transformers > /dev/null
```

```output

[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m A new release of pip is available: [0m[31;49m23.0.1[0m[39;49m -> [0m[32;49m23.1.1[0m
[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m To update, run: [0m[32;49mpip install --upgrade pip[0m
```

```python
from langchain_community.embeddings import HuggingFaceEmbeddings
```

```python
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
# Equivalent to SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")
```

```python
text = "This is a test document."
```

```python
query_result = embeddings.embed_query(text)
```

```python
doc_result = embeddings.embed_documents([text, "This is not a test document."])
```
