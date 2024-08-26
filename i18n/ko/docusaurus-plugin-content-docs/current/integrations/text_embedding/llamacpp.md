---
translated: true
---

# Llama-cpp

이 노트북은 LangChain 내에서 Llama-cpp 임베딩을 사용하는 방법을 다룹니다.

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
