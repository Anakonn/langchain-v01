---
canonical: https://python.langchain.com/v0.1/docs/integrations/text_embedding/sentence_transformers
translated: false
---

# Sentence Transformers on Hugging Face

>[Hugging Face sentence-transformers](https://huggingface.co/sentence-transformers) is a Python framework for state-of-the-art sentence, text and image embeddings.
>One of the embedding models is used in the `HuggingFaceEmbeddings` class.
>We have also added an alias for `SentenceTransformerEmbeddings` for users who are more familiar with directly using that package.

`sentence_transformers` package models are originating from [Sentence-BERT](https://arxiv.org/abs/1908.10084)

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