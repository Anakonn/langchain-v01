---
canonical: https://python.langchain.com/v0.1/docs/modules/model_io/output_parsers/types/enum
translated: false
---

# Enum parser

This notebook shows how to use an Enum output parser.

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

Find out api documentation for [EnumOutputParser](https://api.python.langchain.com/en/latest/output_parsers/langchain.output_parsers.enum.EnumOutputParser.html#langchain.output_parsers.enum.EnumOutputParser).