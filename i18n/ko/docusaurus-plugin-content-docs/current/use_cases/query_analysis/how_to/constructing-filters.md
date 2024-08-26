---
sidebar_position: 6
translated: true
---

# 필터 생성

쿼리 분석을 통해 필터를 추출하여 검색기에 전달할 수 있습니다. LLM이 이러한 필터를 Pydantic 모델로 표현하도록 요청할 수 있습니다. 그런 다음 해당 Pydantic 모델을 검색기에 전달할 수 있는 필터로 변환하는 문제가 발생합니다.

수동으로 수행할 수도 있지만, LangChain은 공통 구문에서 각 검색기별 필터로 번역할 수 있는 "번역기"를 제공합니다. 여기에서는 이러한 번역기를 사용하는 방법을 다룹니다.

```python
from typing import Optional

from langchain.chains.query_constructor.ir import (
    Comparator,
    Comparison,
    Operation,
    Operator,
    StructuredQuery,
)
from langchain.retrievers.self_query.chroma import ChromaTranslator
from langchain.retrievers.self_query.elasticsearch import ElasticsearchTranslator
from langchain_core.pydantic_v1 import BaseModel
```

이 예제에서는 `year`와 `author`가 필터링할 속성입니다.

```python
class Search(BaseModel):
    query: str
    start_year: Optional[int]
    author: Optional[str]
```

```python
search_query = Search(query="RAG", start_year=2022, author="LangChain")
```

```python
def construct_comparisons(query: Search):
    comparisons = []
    if query.start_year is not None:
        comparisons.append(
            Comparison(
                comparator=Comparator.GT,
                attribute="start_year",
                value=query.start_year,
            )
        )
    if query.author is not None:
        comparisons.append(
            Comparison(
                comparator=Comparator.EQ,
                attribute="author",
                value=query.author,
            )
        )
    return comparisons
```

```python
comparisons = construct_comparisons(search_query)
```

```python
_filter = Operation(operator=Operator.AND, arguments=comparisons)
```

```python
ElasticsearchTranslator().visit_operation(_filter)
```

```output
{'bool': {'must': [{'range': {'metadata.start_year': {'gt': 2022}}},
   {'term': {'metadata.author.keyword': 'LangChain'}}]}}
```

```python
ChromaTranslator().visit_operation(_filter)
```

```output
{'$and': [{'start_year': {'$gt': 2022}}, {'author': {'$eq': 'LangChain'}}]}
```