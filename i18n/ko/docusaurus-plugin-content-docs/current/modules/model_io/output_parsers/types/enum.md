---
translated: true
---

# Enum 파서

이 노트북은 Enum 출력 파서를 사용하는 방법을 보여줍니다.

```python
from langchain.output_parsers.enum import EnumOutputParser
```

```python
from enum import Enum


class Colors(Enum):
    RED = "red"
    GREEN = "green"
    BLUE = "blue"
```

```python
parser = EnumOutputParser(enum=Colors)
```

```python
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI

prompt = PromptTemplate.from_template(
    """What color eyes does this person have?

> Person: {person}

Instructions: {instructions}"""
).partial(instructions=parser.get_format_instructions())
chain = prompt | ChatOpenAI() | parser
```

```python
chain.invoke({"person": "Frank Sinatra"})
```

```output
<Colors.BLUE: 'blue'>
```

[EnumOutputParser](https://api.python.langchain.com/en/latest/output_parsers/langchain.output_parsers.enum.EnumOutputParser.html#langchain.output_parsers.enum.EnumOutputParser)의 API 문서를 확인하세요.
