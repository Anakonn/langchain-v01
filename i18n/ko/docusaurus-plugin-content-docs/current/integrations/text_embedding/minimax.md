---
translated: true
---

# 미니맥스

[미니맥스](https://api.minimax.chat/document/guides/embeddings?id=6464722084cdc277dfaa966a)는 임베딩 서비스를 제공합니다.

이 예제에서는 LangChain을 사용하여 미니맥스 추론과 상호 작용하는 방법을 살펴봅니다.

```python
import os

os.environ["MINIMAX_GROUP_ID"] = "MINIMAX_GROUP_ID"
os.environ["MINIMAX_API_KEY"] = "MINIMAX_API_KEY"
```

```python
from langchain_community.embeddings import MiniMaxEmbeddings
```

```python
embeddings = MiniMaxEmbeddings()
```

```python
query_text = "This is a test query."
query_result = embeddings.embed_query(query_text)
```

```python
document_text = "This is a test document."
document_result = embeddings.embed_documents([document_text])
```

```python
import numpy as np

query_numpy = np.array(query_result)
document_numpy = np.array(document_result[0])
similarity = np.dot(query_numpy, document_numpy) / (
    np.linalg.norm(query_numpy) * np.linalg.norm(document_numpy)
)
print(f"Cosine similarity between document and query: {similarity}")
```

```output
Cosine similarity between document and query: 0.1573236279277012
```
