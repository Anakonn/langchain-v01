---
translated: true
---

# 로컬 AI

로컬 AI Embedding 클래스를 로드해 보겠습니다. 로컬 AI Embedding 클래스를 사용하려면 로컬 AI 서비스를 호스팅하고 임베딩 모델을 구성해야 합니다. https://localai.io/basics/getting_started/index.html 및 https://localai.io/features/embeddings/index.html의 문서를 참조하세요.

```python
from langchain_community.embeddings import LocalAIEmbeddings
```

```python
embeddings = LocalAIEmbeddings(
    openai_api_base="http://localhost:8080", model="embedding-model-name"
)
```

```python
text = "This is a test document."
```

```python
query_result = embeddings.embed_query(text)
```

```python
doc_result = embeddings.embed_documents([text])
```

첫 세대 모델(예: text-search-ada-doc-001/text-search-ada-query-001)을 사용하여 로컬 AI Embedding 클래스를 로드해 보겠습니다. 참고: 이러한 모델은 권장되지 않습니다 - [여기](https://platform.openai.com/docs/guides/embeddings/what-are-embeddings)를 참조하세요.

```python
from langchain_community.embeddings import LocalAIEmbeddings
```

```python
embeddings = LocalAIEmbeddings(
    openai_api_base="http://localhost:8080", model="embedding-model-name"
)
```

```python
text = "This is a test document."
```

```python
query_result = embeddings.embed_query(text)
```

```python
doc_result = embeddings.embed_documents([text])
```

```python
import os

# if you are behind an explicit proxy, you can use the OPENAI_PROXY environment variable to pass through
os.environ["OPENAI_PROXY"] = "http://proxy.yourcompany.com:8080"
```
