---
sidebar_position: 4
title: पार्सिंग
translated: true
---

प्रॉम्प्ट निर्देशों का अच्छा पालन करने वाले एलएलएम को दिए गए प्रारूप में जानकारी प्रदान करने के लिए कार्य दिया जा सकता है।

यह दृष्टिकोण अच्छे प्रॉम्प्ट को डिज़ाइन करने और फिर एलएलएम के आउटपुट को पार्स करने पर निर्भर करता है ताकि वे जानकारी को अच्छी तरह से निकाल सकें।

यहां, हम क्लॉड का उपयोग करेंगे जो निर्देशों का पालन करने में महान है! देखें [Anthropic models](https://www.anthropic.com/api)।

```python
from langchain_anthropic.chat_models import ChatAnthropic

model = ChatAnthropic(model_name="claude-3-sonnet-20240229", temperature=0)
```

:::tip
निकालने की गुणवत्ता के लिए सभी समान विचार पार्सिंग दृष्टिकोण के लिए लागू होते हैं। निकालने की गुणवत्ता के लिए [दिशानिर्देश](/docs/use_cases/extraction/guidelines) की समीक्षा करें।

यह ट्यूटोरियल सरल होने के लिए है, लेकिन आमतौर पर प्रदर्शन को बढ़ाने के लिए संदर्भ उदाहरण शामिल होने चाहिए!
:::

## PydanticOutputParser का उपयोग करना

निम्नलिखित उदाहरण चैट मॉडल के आउटपुट को पार्स करने के लिए बिल्ट-इन `PydanticOutputParser` का उपयोग करता है।

```python
from typing import List, Optional

from langchain.output_parsers import PydanticOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field, validator


class Person(BaseModel):
    """Information about a person."""

    name: str = Field(..., description="The name of the person")
    height_in_meters: float = Field(
        ..., description="The height of the person expressed in meters."
    )


class People(BaseModel):
    """Identifying information about all people in a text."""

    people: List[Person]


# Set up a parser
parser = PydanticOutputParser(pydantic_object=People)

# Prompt
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "Answer the user query. Wrap the output in `json` tags\n{format_instructions}",
        ),
        ("human", "{query}"),
    ]
).partial(format_instructions=parser.get_format_instructions())
```

मॉडल को भेजी जाने वाली जानकारी क्या है, इस पर एक नज़र डालते हैं।

```python
query = "Anna is 23 years old and she is 6 feet tall"
```

```python
print(prompt.format_prompt(query=query).to_string())
```

```output
System: Answer the user query. Wrap the output in `json` tags
The output should be formatted as a JSON instance that conforms to the JSON schema below.

As an example, for the schema {"properties": {"foo": {"title": "Foo", "description": "a list of strings", "type": "array", "items": {"type": "string"}}}, "required": ["foo"]}
the object {"foo": ["bar", "baz"]} is a well-formatted instance of the schema. The object {"properties": {"foo": ["bar", "baz"]}} is not well-formatted.

Here is the output schema:

{"description": "Identifying information about all people in a text.", "properties": {"people": {"title": "People", "type": "array", "items": {"$ref": "#/definitions/Person"}}}, "required": ["people"], "definitions": {"Person": {"title": "Person", "description": "Information about a person.", "type": "object", "properties": {"name": {"title": "Name", "description": "The name of the person", "type": "string"}, "height_in_meters": {"title": "Height In Meters", "description": "The height of the person expressed in meters.", "type": "number"}}, "required": ["name", "height_in_meters"]}}}

Human: Anna is 23 years old and she is 6 feet tall
```

```python
chain = prompt | model | parser
chain.invoke({"query": query})
```

```output
People(people=[Person(name='Anna', height_in_meters=1.83)])
```

## कस्टम पार्सिंग

`LangChain` और `LCEL` के साथ कस्टम प्रॉम्प्ट और पार्सर बनाना आसान है।

आप मॉडल से आउटपुट को पार्स करने के लिए एक सरल फ़ंक्शन का उपयोग कर सकते हैं!

```python
import json
import re
from typing import List, Optional

from langchain_anthropic.chat_models import ChatAnthropic
from langchain_core.messages import AIMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field, validator


class Person(BaseModel):
    """Information about a person."""

    name: str = Field(..., description="The name of the person")
    height_in_meters: float = Field(
        ..., description="The height of the person expressed in meters."
    )


class People(BaseModel):
    """Identifying information about all people in a text."""

    people: List[Person]


# Prompt
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "Answer the user query. Output your answer as JSON that  "
            "matches the given schema: ```json\n{schema}\n```. "
            "Make sure to wrap the answer in ```json and ``` tags",
        ),
        ("human", "{query}"),
    ]
).partial(schema=People.schema())


# Custom parser
def extract_json(message: AIMessage) -> List[dict]:
    """Extracts JSON content from a string where JSON is embedded between ```json and ``` tags.

    Parameters:
        text (str): The text containing the JSON content.

    Returns:
        list: A list of extracted JSON strings.
    """
    text = message.content
    # Define the regular expression pattern to match JSON blocks
    pattern = r"```json(.*?)```"

    # Find all non-overlapping matches of the pattern in the string
    matches = re.findall(pattern, text, re.DOTALL)

    # Return the list of matched JSON strings, stripping any leading or trailing whitespace
    try:
        return [json.loads(match.strip()) for match in matches]
    except Exception:
        raise ValueError(f"Failed to parse: {message}")
```

```python
query = "Anna is 23 years old and she is 6 feet tall"
print(prompt.format_prompt(query=query).to_string())
```

```output
System: Answer the user query. Output your answer as JSON that  matches the given schema: ```json
{'title': 'People', 'description': 'Identifying information about all people in a text.', 'type': 'object', 'properties': {'people': {'title': 'People', 'type': 'array', 'items': {'$ref': '#/definitions/Person'}}}, 'required': ['people'], 'definitions': {'Person': {'title': 'Person', 'description': 'Information about a person.', 'type': 'object', 'properties': {'name': {'title': 'Name', 'description': 'The name of the person', 'type': 'string'}, 'height_in_meters': {'title': 'Height In Meters', 'description': 'The height of the person expressed in meters.', 'type': 'number'}}, 'required': ['name', 'height_in_meters']}}}
    ```. Make sure to wrap the answer in ```json and ``` tags
Human: Anna is 23 years old and she is 6 feet tall
```

```python
chain = prompt | model | extract_json
chain.invoke({"query": query})
```

```output
[{'people': [{'name': 'Anna', 'height_in_meters': 1.83}]}]
```

## अन्य लाइब्रेरी

यदि आप पार्सिंग दृष्टिकोण का उपयोग करके निकालने पर नज़र डाल रहे हैं, तो [Kor](https://eyurtsev.github.io/kor/) लाइब्रेरी देखें। यह `LangChain` के एक मेंटेनर द्वारा लिखा गया है और यह प्रॉम्प्ट को बनाने में मदद करता है जो उदाहरणों को ध्यान में रखता है, प्रारूपों (जैसे JSON या CSV) को नियंत्रित करने और TypeScript में स्कीमा को व्यक्त करने की अनुमति देता है। यह काफी अच्छा काम करता है!
