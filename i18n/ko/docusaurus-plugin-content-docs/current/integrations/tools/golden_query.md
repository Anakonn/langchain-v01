---
translated: true
---

# 골든 쿼리

>[골든](https://golden.com)은 골든 지식 그래프를 사용하여 쿼리하고 풍부하게 하는 자연어 API 세트를 제공합니다. 예를 들어 `OpenAI의 제품`, `시리즈 A 펀딩을 받은 생성형 AI 기업`, `투자하는 래퍼` 등의 쿼리를 사용하여 관련 엔티티에 대한 구조화된 데이터를 검색할 수 있습니다.

>`golden-query` langchain 도구는 [골든 쿼리 API](https://docs.golden.com/reference/query-api)를 기반으로 한 래퍼로, 이를 통해 프로그래밍 방식으로 이러한 결과에 액세스할 수 있습니다.
>[골든 쿼리 API 문서](https://docs.golden.com/reference/query-api)에서 자세한 정보를 확인하세요.

이 노트북에서는 `golden-query` 도구 사용 방법을 설명합니다.

- [골든 API 문서](https://docs.golden.com/)를 방문하여 골든 API에 대한 개요를 확인하세요.
- [골든 API 설정](https://golden.com/settings/api) 페이지에서 API 키를 가져오세요.
- GOLDEN_API_KEY 환경 변수에 API 키를 저장하세요.

```python
import os

os.environ["GOLDEN_API_KEY"] = ""
```

```python
from langchain_community.utilities.golden_query import GoldenQueryAPIWrapper
```

```python
golden_query = GoldenQueryAPIWrapper()
```

```python
import json

json.loads(golden_query.run("companies in nanotech"))
```

```output
{'results': [{'id': 4673886,
   'latestVersionId': 60276991,
   'properties': [{'predicateId': 'name',
     'instances': [{'value': 'Samsung', 'citations': []}]}]},
  {'id': 7008,
   'latestVersionId': 61087416,
   'properties': [{'predicateId': 'name',
     'instances': [{'value': 'Intel', 'citations': []}]}]},
  {'id': 24193,
   'latestVersionId': 60274482,
   'properties': [{'predicateId': 'name',
     'instances': [{'value': 'Texas Instruments', 'citations': []}]}]},
  {'id': 1142,
   'latestVersionId': 61406205,
   'properties': [{'predicateId': 'name',
     'instances': [{'value': 'Advanced Micro Devices', 'citations': []}]}]},
  {'id': 193948,
   'latestVersionId': 58326582,
   'properties': [{'predicateId': 'name',
     'instances': [{'value': 'Freescale Semiconductor', 'citations': []}]}]},
  {'id': 91316,
   'latestVersionId': 60387380,
   'properties': [{'predicateId': 'name',
     'instances': [{'value': 'Agilent Technologies', 'citations': []}]}]},
  {'id': 90014,
   'latestVersionId': 60388078,
   'properties': [{'predicateId': 'name',
     'instances': [{'value': 'Novartis', 'citations': []}]}]},
  {'id': 237458,
   'latestVersionId': 61406160,
   'properties': [{'predicateId': 'name',
     'instances': [{'value': 'Analog Devices', 'citations': []}]}]},
  {'id': 3941943,
   'latestVersionId': 60382250,
   'properties': [{'predicateId': 'name',
     'instances': [{'value': 'AbbVie Inc.', 'citations': []}]}]},
  {'id': 4178762,
   'latestVersionId': 60542667,
   'properties': [{'predicateId': 'name',
     'instances': [{'value': 'IBM', 'citations': []}]}]}],
 'next': 'https://golden.com/api/v2/public/queries/59044/results/?cursor=eyJwb3NpdGlvbiI6IFsxNzYxNiwgIklCTS04M1lQM1oiXX0%3D&pageSize=10',
 'previous': None}
```
