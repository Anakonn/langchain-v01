---
translated: true
---

# 딥인프라

[딥인프라](https://deepinfra.com/?utm_source=langchain)는 다양한 [LLM](https://deepinfra.com/models?utm_source=langchain)과 [임베딩 모델](https://deepinfra.com/models?type=embeddings&utm_source=langchain)에 대한 액세스를 제공하는 서버리스 추론 서비스입니다. 이 노트북은 텍스트 임베딩을 위해 LangChain과 딥인프라를 사용하는 방법을 설명합니다.

```python
# sign up for an account: https://deepinfra.com/login?utm_source=langchain

from getpass import getpass

DEEPINFRA_API_TOKEN = getpass()
```

```output
 ········
```

```python
import os

os.environ["DEEPINFRA_API_TOKEN"] = DEEPINFRA_API_TOKEN
```

```python
from langchain_community.embeddings import DeepInfraEmbeddings
```

```python
embeddings = DeepInfraEmbeddings(
    model_id="sentence-transformers/clip-ViT-B-32",
    query_instruction="",
    embed_instruction="",
)
```

```python
docs = ["Dog is not a cat", "Beta is the second letter of Greek alphabet"]
document_result = embeddings.embed_documents(docs)
```

```python
query = "What is the first letter of Greek alphabet"
query_result = embeddings.embed_query(query)
```

```python
import numpy as np

query_numpy = np.array(query_result)
for doc_res, doc in zip(document_result, docs):
    document_numpy = np.array(doc_res)
    similarity = np.dot(query_numpy, document_numpy) / (
        np.linalg.norm(query_numpy) * np.linalg.norm(document_numpy)
    )
    print(f'Cosine similarity between "{doc}" and query: {similarity}')
```

```output
Cosine similarity between "Dog is not a cat" and query: 0.7489097144129355
Cosine similarity between "Beta is the second letter of Greek alphabet" and query: 0.9519380640702013
```
