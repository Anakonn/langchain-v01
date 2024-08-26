---
sidebar_position: 6
translated: true
---

# フィルターの構築

クエリ分析を行い、リトリーバーに渡すフィルターを抽出したい場合があります。 1つの方法は、LLMにPydanticモデルとして表現させることです。 その後の課題は、そのPydanticモデルをリトリーバーに渡せるフィルターに変換することです。

手動で行うこともできますが、LangChainにはそれぞれのリトリーバーに特化した「トランスレーター」も用意されています。 ここでは、それらのトランスレーターの使い方を説明します。

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

この例では、`year`と`author`の両方の属性でフィルタリングを行います。

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
