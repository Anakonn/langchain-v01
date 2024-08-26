---
sidebar_position: 6
translated: true
---

# फ़िल्टर बनाना

हम क्वेरी विश्लेषण करना चाह सकते हैं ताकि रिट्रीवर में पास किए जाने वाले फ़िल्टर निकाले जा सकें। इन फ़िल्टरों को प्रस्तुत करने का एक तरीका Pydantic मॉडल का उपयोग करना है। फिर, उस Pydantic मॉडल को रिट्रीवर में पास किए जा सकने वाले फ़िल्टर में बदलने का मुद्दा है।

यह मैनुअल रूप से किया जा सकता है, लेकिन LangChain भी कुछ "अनुवादक" प्रदान करता है जो प्रत्येक रिट्रीवर के लिए विशिष्ट फ़िल्टर में एक सामान्य वाक्यविन्यास से अनुवाद करने में सक्षम हैं। यहां, हम उन अनुवादकों का उपयोग करने के बारे में बताएंगे।

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

इस उदाहरण में, `year` और `author` दोनों फ़िल्टर करने के लिए गुण हैं।

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
