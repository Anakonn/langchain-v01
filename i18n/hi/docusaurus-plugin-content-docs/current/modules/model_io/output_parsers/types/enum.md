---
translated: true
---

# Enum parser

यह नोटबुक Enum आउटपुट पार्सर का उपयोग करने का प्रदर्शन करता है।

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

[EnumOutputParser](https://api.python.langchain.com/en/latest/output_parsers/langchain.output_parsers.enum.EnumOutputParser.html#langchain.output_parsers.enum.EnumOutputParser) के लिए API दस्तावेज़ीकरण देखें।
