---
translated: true
---

# Llama-cpp

Ce notebook passe en revue comment utiliser les embeddings Llama-cpp dans LangChain

```python
%pip install --upgrade --quiet  llama-cpp-python
```

```python
from langchain_community.embeddings import LlamaCppEmbeddings
```

```python
llama = LlamaCppEmbeddings(model_path="/path/to/model/ggml-model-q4_0.bin")
```

```python
text = "This is a test document."
```

```python
query_result = llama.embed_query(text)
```

```python
doc_result = llama.embed_documents([text])
```
