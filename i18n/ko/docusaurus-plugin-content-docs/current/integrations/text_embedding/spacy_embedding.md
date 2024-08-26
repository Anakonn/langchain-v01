---
translated: true
---

# SpaCy

>[spaCy](https://spacy.io/)는 Python과 Cython 프로그래밍 언어로 작성된 고급 자연어 처리를 위한 오픈 소스 소프트웨어 라이브러리입니다.

## 설치 및 설정

```python
%pip install --upgrade --quiet  spacy
```

필요한 클래스 가져오기

```python
from langchain_community.embeddings.spacy_embeddings import SpacyEmbeddings
```

## 예시

SpacyEmbeddings를 초기화합니다. 이렇게 하면 Spacy 모델이 메모리에 로드됩니다.

```python
embedder = SpacyEmbeddings(model_name="en_core_web_sm")
```

예제 텍스트 정의하기. 이는 분석하고자 하는 문서일 수 있습니다 - 예를 들어, 뉴스 기사, 소셜 미디어 게시물 또는 제품 리뷰 등입니다.

```python
texts = [
    "The quick brown fox jumps over the lazy dog.",
    "Pack my box with five dozen liquor jugs.",
    "How vexingly quick daft zebras jump!",
    "Bright vixens jump; dozy fowl quack.",
]
```

텍스트의 임베딩 생성 및 출력하기. SpacyEmbeddings 클래스는 각 문서의 임베딩을 생성합니다. 이는 문서 내용의 숫자 표현입니다. 이러한 임베딩은 문서 유사성 비교 또는 텍스트 분류와 같은 다양한 자연어 처리 작업에 사용될 수 있습니다.

```python
embeddings = embedder.embed_documents(texts)
for i, embedding in enumerate(embeddings):
    print(f"Embedding for document {i+1}: {embedding}")
```

단일 텍스트의 임베딩 생성 및 출력하기. 단일 텍스트(예: 검색 쿼리)의 임베딩을 생성할 수도 있습니다. 이는 정보 검색과 같은 작업에 유용할 수 있습니다. 여기서는 주어진 쿼리와 유사한 문서를 찾고자 합니다.

```python
query = "Quick foxes and lazy dogs."
query_embedding = embedder.embed_query(query)
print(f"Embedding for query: {query_embedding}")
```
