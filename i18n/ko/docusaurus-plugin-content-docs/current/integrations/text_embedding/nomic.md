---
sidebar_label: Nomic
translated: true
---

# Nomic Embeddings

이 노트북은 Nomic 임베딩 모델 사용 시작하는 방법을 다룹니다.

## 설치

```python
# install package
!pip install -U langchain-nomic
```

## 환경 설정

다음 환경 변수를 설정해야 합니다:

- `NOMIC_API_KEY`

## 사용

```python
from langchain_nomic.embeddings import NomicEmbeddings

embeddings = NomicEmbeddings(model="nomic-embed-text-v1.5")
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

### 사용자 정의 차원

Nomic의 `nomic-embed-text-v1.5` 모델은 [Matryoshka learning](https://blog.nomic.ai/posts/nomic-embed-matryoshka)을 통해 학습되어 단일 모델로 가변 길이 임베딩을 지원합니다. 이는 추론 시 임베딩의 차원을 지정할 수 있다는 의미입니다. 이 모델은 64에서 768 사이의 차원을 지원합니다.

```python
embeddings = NomicEmbeddings(model="nomic-embed-text-v1.5", dimensionality=256)

embeddings.embed_query("My query to look up")
```
