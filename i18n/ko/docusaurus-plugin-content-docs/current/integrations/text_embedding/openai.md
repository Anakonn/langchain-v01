---
translated: true
---

# OpenAI

OpenAI 임베딩 클래스를 로드해 보겠습니다.

## 설정

먼저 langchain-openai를 설치하고 필요한 환경 변수를 설정합니다.

```python
%pip install -qU langchain-openai
```

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()
```

```python
from langchain_openai import OpenAIEmbeddings
```

```python
embeddings = OpenAIEmbeddings(model="text-embedding-3-large")
```

```python
text = "This is a test document."
```

## 사용법

### 쿼리 임베딩

```python
query_result = embeddings.embed_query(text)
```

```output
Warning: model not found. Using cl100k_base encoding.
```

```python
query_result[:5]
```

```output
[-0.014380056377383358,
 -0.027191711627651764,
 -0.020042716111860304,
 0.057301379620345545,
 -0.022267658631828974]
```

## 문서 임베딩

```python
doc_result = embeddings.embed_documents([text])
```

```output
Warning: model not found. Using cl100k_base encoding.
```

```python
doc_result[0][:5]
```

```output
[-0.014380056377383358,
 -0.027191711627651764,
 -0.020042716111860304,
 0.057301379620345545,
 -0.022267658631828974]
```

## 차원 지정

`text-embedding-3` 클래스의 모델을 사용하면 반환되는 임베딩의 크기를 지정할 수 있습니다. 예를 들어 기본적으로 `text-embedding-3-large`는 3072 차원의 임베딩을 반환합니다:

```python
len(doc_result[0])
```

```output
3072
```

그러나 `dimensions=1024`를 전달하면 임베딩의 크기를 1024로 줄일 수 있습니다:

```python
embeddings_1024 = OpenAIEmbeddings(model="text-embedding-3-large", dimensions=1024)
```

```python
len(embeddings_1024.embed_documents([text])[0])
```

```output
Warning: model not found. Using cl100k_base encoding.
```

```output
1024
```
