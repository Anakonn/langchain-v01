---
translated: true
---

# Embaas

[embaas](https://embaas.io)는 임베딩 생성, 문서 텍스트 추출, 문서를 임베딩으로 변환하는 등의 기능을 제공하는 완전히 관리되는 NLP API 서비스입니다. [다양한 사전 학습된 모델](https://embaas.io/docs/models/embeddings)을 선택할 수 있습니다.

이 튜토리얼에서는 embaas Embeddings API를 사용하여 주어진 텍스트에 대한 임베딩을 생성하는 방법을 보여드리겠습니다.

### 사전 요구 사항

[https://embaas.io/register](https://embaas.io/register)에서 무료 embaas 계정을 만들고 [API 키](https://embaas.io/dashboard/api-keys)를 생성하세요.

```python
import os

# Set API key
embaas_api_key = "YOUR_API_KEY"
# or set environment variable
os.environ["EMBAAS_API_KEY"] = "YOUR_API_KEY"
```

```python
from langchain_community.embeddings import EmbaasEmbeddings
```

```python
embeddings = EmbaasEmbeddings()
```

```python
# Create embeddings for a single document
doc_text = "This is a test document."
doc_text_embedding = embeddings.embed_query(doc_text)
```

```python
# Print created embedding
print(doc_text_embedding)
```

```python
# Create embeddings for multiple documents
doc_texts = ["This is a test document.", "This is another test document."]
doc_texts_embeddings = embeddings.embed_documents(doc_texts)
```

```python
# Print created embeddings
for i, doc_text_embedding in enumerate(doc_texts_embeddings):
    print(f"Embedding for document {i + 1}: {doc_text_embedding}")
```

```python
# Using a different model and/or custom instruction
embeddings = EmbaasEmbeddings(
    model="instructor-large",
    instruction="Represent the Wikipedia document for retrieval",
)
```

embaas Embeddings API에 대한 자세한 정보는 [공식 embaas API 문서](https://embaas.io/api-reference)를 참조하세요.
