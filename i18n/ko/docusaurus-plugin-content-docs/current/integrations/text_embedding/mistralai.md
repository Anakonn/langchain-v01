---
translated: true
---

# MistralAI

이 노트북은 langchain_mistralai 패키지에 포함된 MistralAIEmbeddings를 사용하여 langchain에서 텍스트를 임베딩하는 방법을 설명합니다.

```python
# pip install -U langchain-mistralai
```

## 라이브러리 가져오기

```python
from langchain_mistralai import MistralAIEmbeddings
```

```python
embedding = MistralAIEmbeddings(api_key="your-api-key")
```

# 임베딩 모델 사용하기

`MistralAIEmbeddings`를 사용하면 기본 모델 'mistral-embed'를 직접 사용하거나 사용 가능한 다른 모델을 설정할 수 있습니다.

```python
embedding.model = "mistral-embed"  # or your preferred model if available
```

```python
res_query = embedding.embed_query("The test information")
res_document = embedding.embed_documents(["test1", "another test"])
```
