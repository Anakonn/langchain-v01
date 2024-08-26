---
translated: true
---

# John Snow Labs

>[John Snow Labs](https://nlp.johnsnowlabs.com/) NLP & LLM 생태계에는 대규모 최첨단 AI, 책임감 있는 AI, No-Code AI, 그리고 의료, 법률, 금융 등 20,000개 이상의 모델에 대한 액세스를 위한 소프트웨어 라이브러리가 포함되어 있습니다.
>
>[nlp.load](https://nlp.johnsnowlabs.com/docs/en/jsl/load_api)를 사용하여 모델을 로드하고 [nlp.start()](https://nlp.johnsnowlabs.com/docs/en/jsl/start-a-sparksession)를 사용하여 Spark 세션을 시작합니다.
>[John Snow Labs Model Models Hub](https://nlp.johnsnowlabs.com/models)에서 24,000개 이상의 모델을 확인할 수 있습니다.

## 설정

```python
%pip install --upgrade --quiet  johnsnowlabs
```

```python
# If you have a enterprise license, you can run this to install enterprise features
# from johnsnowlabs import nlp
# nlp.install()
```

## 예시

```python
from langchain_community.embeddings.johnsnowlabs import JohnSnowLabsEmbeddings
```

JohnSnowLabs Embeddings와 Spark Session 초기화

```python
embedder = JohnSnowLabsEmbeddings("en.embed_sentence.biobert.clinical_base_cased")
```

분석할 예제 텍스트 정의. 이는 뉴스 기사, 소셜 미디어 게시물 또는 제품 리뷰와 같은 문서가 될 수 있습니다.

```python
texts = ["Cancer is caused by smoking", "Antibiotics aren't painkiller"]
```

텍스트에 대한 임베딩 생성 및 출력. JohnSnowLabsEmbeddings 클래스는 각 문서에 대한 임베딩을 생성하며, 이는 문서 내용의 숫자 표현입니다. 이러한 임베딩은 문서 유사성 비교 또는 텍스트 분류와 같은 다양한 자연어 처리 작업에 사용될 수 있습니다.

```python
embeddings = embedder.embed_documents(texts)
for i, embedding in enumerate(embeddings):
    print(f"Embedding for document {i+1}: {embedding}")
```

단일 텍스트에 대한 임베딩 생성 및 출력. 검색 쿼리와 같은 단일 텍스트에 대한 임베딩을 생성할 수도 있습니다. 이는 정보 검색과 같은 작업에 유용할 수 있습니다.

```python
query = "Cancer is caused by smoking"
query_embedding = embedder.embed_query(query)
print(f"Embedding for query: {query_embedding}")
```
