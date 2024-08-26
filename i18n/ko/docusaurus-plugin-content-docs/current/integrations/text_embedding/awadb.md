---
translated: true
---

# AwaDB

>[AwaDB](https://github.com/awa-ai/awadb)는 LLM 애플리케이션에서 사용되는 임베딩 벡터의 검색 및 저장을 위한 AI 네이티브 데이터베이스입니다.

이 노트북은 LangChain에서 `AwaEmbeddings`를 사용하는 방법을 설명합니다.

```python
# pip install awadb
```

## 라이브러리 가져오기

```python
from langchain_community.embeddings import AwaEmbeddings
```

```python
Embedding = AwaEmbeddings()
```

# 임베딩 모델 설정

사용자는 `Embedding.set_model()`을 사용하여 임베딩 모델을 지정할 수 있습니다. \
이 함수의 입력은 모델의 이름을 나타내는 문자열입니다. \
현재 지원되는 모델 목록은 [여기](https://github.com/awa-ai/awadb)에서 확인할 수 있습니다. \

**기본 모델**은 `all-mpnet-base-v2`이며, 설정하지 않고도 사용할 수 있습니다.

```python
text = "our embedding test"

Embedding.set_model("all-mpnet-base-v2")
```

```python
res_query = Embedding.embed_query("The test information")
res_document = Embedding.embed_documents(["test1", "another test"])
```
