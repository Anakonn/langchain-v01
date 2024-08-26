---
translated: true
---

# Google 생성형 AI 임베딩

[langchain-google-genai](https://pypi.org/project/langchain-google-genai/) 패키지에 있는 `GoogleGenerativeAIEmbeddings` 클래스를 사용하여 Google의 생성형 AI 임베딩 서비스에 연결할 수 있습니다.

## 설치

```python
%pip install --upgrade --quiet  langchain-google-genai
```

## 자격 증명

```python
import getpass
import os

if "GOOGLE_API_KEY" not in os.environ:
    os.environ["GOOGLE_API_KEY"] = getpass("Provide your Google API key here")
```

## 사용법

```python
from langchain_google_genai import GoogleGenerativeAIEmbeddings

embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
vector = embeddings.embed_query("hello, world!")
vector[:5]
```

```output
[0.05636945, 0.0048285457, -0.0762591, -0.023642512, 0.05329321]
```

## 배치

한 번에 여러 문자열을 임베딩하여 처리 속도를 높일 수 있습니다:

```python
vectors = embeddings.embed_documents(
    [
        "Today is Monday",
        "Today is Tuesday",
        "Today is April Fools day",
    ]
)
len(vectors), len(vectors[0])
```

```output
(3, 768)
```

## 작업 유형

`GoogleGenerativeAIEmbeddings`는 선택적으로 `task_type`을 지원하며, 현재 다음 중 하나여야 합니다:

- task_type_unspecified
- retrieval_query
- retrieval_document
- semantic_similarity
- classification
- clustering

기본적으로 `embed_documents` 메서드에서는 `retrieval_document`를, `embed_query` 메서드에서는 `retrieval_query`를 사용합니다. 작업 유형을 제공하면 모든 메서드에서 해당 유형을 사용합니다.

```python
%pip install --upgrade --quiet  matplotlib scikit-learn
```

```output
Note: you may need to restart the kernel to use updated packages.
```

```python
query_embeddings = GoogleGenerativeAIEmbeddings(
    model="models/embedding-001", task_type="retrieval_query"
)
doc_embeddings = GoogleGenerativeAIEmbeddings(
    model="models/embedding-001", task_type="retrieval_document"
)
```

이 모든 것들은 'retrieval_query' 작업으로 임베딩됩니다.

```python
query_vecs = [query_embeddings.embed_query(q) for q in [query, query_2, answer_1]]
```

이 모든 것들은 'retrieval_document' 작업으로 임베딩됩니다.

```python
doc_vecs = [doc_embeddings.embed_query(q) for q in [query, query_2, answer_1]]
```

검색에서는 상대적 거리가 중요합니다. 위 이미지에서 볼 수 있듯이 "관련 문서"와 "유사 문서" 간의 유사성 점수 차이가 후자의 경우 더 크게 나타납니다.

## 추가 구성

ChatGoogleGenerativeAI에 다음 매개변수를 전달하여 SDK의 동작을 사용자 정의할 수 있습니다:

- `client_options`: Google API 클라이언트에 전달할 [클라이언트 옵션](https://googleapis.dev/python/google-api-core/latest/client_options.html#module-google.api_core.client_options), 예를 들어 사용자 정의 `client_options["api_endpoint"]`
- `transport`: 사용할 전송 방법, 예를 들어 `rest`, `grpc` 또는 `grpc_asyncio`.
