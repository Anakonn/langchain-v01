---
sidebar_position: 6
translated: true
---

# Construire des filtres

Il est possible que nous voulions faire une analyse de requête pour extraire des filtres à passer dans les récupérateurs. Une façon de demander à l'LLM de représenter ces filtres est sous la forme d'un modèle Pydantic. Il y a ensuite la question de convertir ce modèle Pydantic en un filtre qui peut être passé dans un récupérateur.

Cela peut être fait manuellement, mais LangChain fournit également des "Traducteurs" qui sont capables de traduire à partir d'une syntaxe commune en des filtres spécifiques à chaque récupérateur. Ici, nous allons voir comment utiliser ces traducteurs.

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

Dans cet exemple, `year` et `author` sont tous deux des attributs à filtrer.

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
