---
translated: true
---

# Amazon Kendra

> [Amazon Kendra](https://docs.aws.amazon.com/kendra/latest/dg/what-is-kendra.html)는 `Amazon Web Services`(`AWS`)가 제공하는 지능형 검색 서비스입니다. 고급 자연어 처리(NLP) 및 기계 학습 알고리즘을 활용하여 조직 내 다양한 데이터 소스에 걸쳐 강력한 검색 기능을 제공합니다. `Kendra`는 사용자가 신속하고 정확하게 필요한 정보를 찾을 수 있도록 설계되어 생산성과 의사 결정을 향상시킵니다.

> `Kendra`를 통해 사용자는 문서, FAQ, 지식베이스, 매뉴얼, 웹사이트 등 다양한 콘텐츠 유형을 검색할 수 있습니다. 다국어를 지원하며 복잡한 쿼리, 동의어, 상황적 의미를 이해하여 매우 관련성 높은 검색 결과를 제공합니다.

## Amazon Kendra Index Retriever 사용하기

```python
%pip install --upgrade --quiet  boto3
```

```python
from langchain_community.retrievers import AmazonKendraRetriever
```

새 Retriever 생성하기

```python
retriever = AmazonKendraRetriever(index_id="c0806df7-e76b-4bce-9b5c-d5582f6b1a03")
```

이제 Kendra 인덱스에서 검색된 문서를 사용할 수 있습니다.

```python
retriever.invoke("what is langchain")
```
