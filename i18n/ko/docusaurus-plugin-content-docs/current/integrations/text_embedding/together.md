---
sidebar_label: Together AI
translated: true
---

# TogetherEmbeddings

이 노트북에서는 Together AI API에서 호스팅되는 오픈 소스 임베딩 모델을 시작하는 방법을 다룹니다.

## 설치

```python
# install package
%pip install --upgrade --quiet  langchain-together
```

## 환경 설정

다음 환경 변수를 설정해야 합니다:

- `TOGETHER_API_KEY`

## 사용

먼저 [이 목록](https://docs.together.ai/docs/embedding-models)에서 지원되는 모델을 선택합니다. 다음 예에서는 `togethercomputer/m2-bert-80M-8k-retrieval`을 사용합니다.

```python
from langchain_together.embeddings import TogetherEmbeddings

embeddings = TogetherEmbeddings(model="togethercomputer/m2-bert-80M-8k-retrieval")
```

```python
embeddings.embed_query("My query to look up")
```

```python
embeddings.embed_documents(
    ["This is a content of the document", "This is another document"]
)
```

```python
# async embed query
await embeddings.aembed_query("My query to look up")
```

```python
# async embed documents
await embeddings.aembed_documents(
    ["This is a content of the document", "This is another document"]
)
```
