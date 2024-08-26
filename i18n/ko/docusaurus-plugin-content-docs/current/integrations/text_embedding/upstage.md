---
sidebar_label: Upstage
translated: true
---

# UpstageEmbeddings

이 노트북은 Upstage 임베딩 모델 사용 방법을 다룹니다.

## 설치

`langchain-upstage` 패키지를 설치하세요.

```bash
pip install -U langchain-upstage
```

## 환경 설정

다음과 같은 환경 변수를 설정해야 합니다:

- `UPSTAGE_API_KEY`: [Upstage 콘솔](https://console.upstage.ai/)에서 받은 Upstage API 키입니다.

```python
import os

os.environ["UPSTAGE_API_KEY"] = "YOUR_API_KEY"
```

## 사용법

`UpstageEmbeddings` 클래스를 초기화합니다.

```python
from langchain_upstage import UpstageEmbeddings

embeddings = UpstageEmbeddings()
```

`embed_documents`를 사용하여 텍스트 또는 문서 목록을 임베딩합니다.

```python
doc_result = embeddings.embed_documents(
    ["Sam is a teacher.", "This is another document"]
)
print(doc_result)
```

`embed_query`를 사용하여 쿼리 문자열을 임베딩합니다.

```python
query_result = embeddings.embed_query("What does Sam do?")
print(query_result)
```

`aembed_documents`와 `aembed_query`를 사용하여 비동기 작업을 수행합니다.

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

## 벡터 저장소와 함께 사용하기

`UpstageEmbeddings`를 벡터 저장소 구성 요소와 함께 사용할 수 있습니다. 다음은 간단한 예제입니다.

```python
from langchain_community.vectorstores import DocArrayInMemorySearch

vectorstore = DocArrayInMemorySearch.from_texts(
    ["harrison worked at kensho", "bears like to eat honey"],
    embedding=UpstageEmbeddings(),
)
retriever = vectorstore.as_retriever()
docs = retriever.invoke("Where did Harrison work?")
print(docs)
```
