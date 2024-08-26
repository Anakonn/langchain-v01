---
translated: true
---

# ElasticSearch BM25

>[Elasticsearch](https://www.elastic.co/elasticsearch/)는 분산된 RESTful 검색 및 분석 엔진입니다. 스키마 없는 JSON 문서와 HTTP 웹 인터페이스를 가진 분산된 멀티테넌트 지원 전문 검색 엔진을 제공합니다.

>정보 검색에서 [Okapi BM25](https://en.wikipedia.org/wiki/Okapi_BM25)(BM은 best matching의 약어)는 검색 엔진이 검색 쿼리에 대한 문서의 관련성을 추정하는 데 사용하는 순위 함수입니다. 1970년대와 1980년대에 Stephen E. Robertson, Karen Spärck Jones 등이 개발한 확률적 검색 프레임워크를 기반으로 합니다.

>실제 순위 함수의 이름은 BM25입니다. 더 긴 이름인 Okapi BM25에는 이 함수를 처음 사용한 Okapi 정보 검색 시스템의 이름이 포함되어 있습니다. Okapi 시스템은 1980년대와 1990년대에 런던 시티 대학교에서 구현되었습니다. BM25와 그 새로운 변형인 BM25F(문서 구조와 앵커 텍스트를 고려할 수 있는 BM25의 버전)는 문서 검색에 사용되는 TF-IDF와 유사한 검색 함수를 나타냅니다.

이 노트북은 `ElasticSearch`와 `BM25`를 사용하는 retriever를 사용하는 방법을 보여줍니다.

BM25에 대한 자세한 내용은 [이 블로그 게시물](https://www.elastic.co/blog/practical-bm25-part-2-the-bm25-algorithm-and-its-variables)을 참조하세요.

```python
%pip install --upgrade --quiet  elasticsearch
```

```python
from langchain_community.retrievers import (
    ElasticSearchBM25Retriever,
)
```

## 새 Retriever 생성

```python
elasticsearch_url = "http://localhost:9200"
retriever = ElasticSearchBM25Retriever.create(elasticsearch_url, "langchain-index-4")
```

```python
# Alternatively, you can load an existing index
# import elasticsearch
# elasticsearch_url="http://localhost:9200"
# retriever = ElasticSearchBM25Retriever(elasticsearch.Elasticsearch(elasticsearch_url), "langchain-index")
```

## 텍스트 추가(필요한 경우)

필요한 경우 retriever에 텍스트를 추가할 수 있습니다.

```python
retriever.add_texts(["foo", "bar", "world", "hello", "foo bar"])
```

```output
['cbd4cb47-8d9f-4f34-b80e-ea871bc49856',
 'f3bd2e24-76d1-4f9b-826b-ec4c0e8c7365',
 '8631bfc8-7c12-48ee-ab56-8ad5f373676e',
 '8be8374c-3253-4d87-928d-d73550a2ecf0',
 'd79f457b-2842-4eab-ae10-77aa420b53d7']
```

## Retriever 사용

이제 retriever를 사용할 수 있습니다!

```python
result = retriever.invoke("foo")
```

```python
result
```

```output
[Document(page_content='foo', metadata={}),
 Document(page_content='foo bar', metadata={})]
```
