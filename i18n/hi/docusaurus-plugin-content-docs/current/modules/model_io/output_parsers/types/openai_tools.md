---
translated: true
---

# OpenAI उपकरण

ये आउटपुट पार्सर OpenAI के फ़ंक्शन कॉलिंग API प्रतिक्रियाओं से उपकरण कॉल निकालते हैं। इसका मतलब है कि वे केवल उन मॉडलों के साथ उपयोग किए जा सकते हैं जो फ़ंक्शन कॉलिंग का समर्थन करते हैं, और विशेष रूप से नवीनतम `tools` और `tool_choice` पैरामीटर। हम आपको [फ़ंक्शन कॉलिंग](/docs/modules/model_io/chat/function_calling) से परिचित होने की सलाह देते हैं इस गाइड को पढ़ने से पहले।

आउटपुट पार्सर के कुछ अलग-अलग प्रकार हैं:

- [JsonOutputToolsParser](https://api.python.langchain.com/en/latest/output_parsers/langchain_core.output_parsers.openai_tools.JsonOutputToolsParser.html#langchain_core.output_parsers.openai_tools.JsonOutputToolsParser): फ़ंक्शन कॉल के तर्कों को JSON के रूप में वापस करता है
- [JsonOutputKeyToolsParser](https://api.python.langchain.com/en/latest/output_parsers/langchain_core.output_parsers.openai_tools.JsonOutputKeyToolsParser.html#langchain_core.output_parsers.openai_tools.JsonOutputKeyToolsParser): फ़ंक्शन कॉल में विशिष्ट कुंजी का मान JSON के रूप में वापस करता है
- [PydanticToolsParser](https://api.python.langchain.com/en/latest/output_parsers/langchain_core.output_parsers.openai_tools.PydanticToolsParser.html#langchain_core.output_parsers.openai_tools.PydanticToolsParser): फ़ंक्शन कॉल के तर्कों को एक Pydantic मॉडल के रूप में वापस करता है

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field, validator
from langchain_openai import ChatOpenAI
```

```python
class Joke(BaseModel):
    """Joke to tell user."""

    setup: str = Field(description="question to set up a joke")
    punchline: str = Field(description="answer to resolve the joke")
```

```python
model = ChatOpenAI(model="gpt-3.5-turbo", temperature=0).bind_tools([Joke])
```

```python
model.kwargs["tools"]
```

```output
[{'type': 'function',
  'function': {'name': 'Joke',
   'description': 'Joke to tell user.',
   'parameters': {'type': 'object',
    'properties': {'setup': {'description': 'question to set up a joke',
      'type': 'string'},
     'punchline': {'description': 'answer to resolve the joke',
      'type': 'string'}},
    'required': ['setup', 'punchline']}}}]
```

```python
prompt = ChatPromptTemplate.from_messages(
    [("system", "You are helpful assistant"), ("user", "{input}")]
)
```

## JsonOutputToolsParser

```python
from langchain.output_parsers.openai_tools import JsonOutputToolsParser
```

```python
parser = JsonOutputToolsParser()
```

```python
chain = prompt | model | parser
```

```python
chain.invoke({"input": "tell me a joke"})
```

```output
[{'type': 'Joke',
  'args': {'setup': "Why don't scientists trust atoms?",
   'punchline': 'Because they make up everything!'}}]
```

उपकरण कॉल आईडी को शामिल करने के लिए हम `return_id=True` निर्दिष्ट कर सकते हैं:

```python
parser = JsonOutputToolsParser(return_id=True)
chain = prompt | model | parser
chain.invoke({"input": "tell me a joke"})
```

```output
[{'type': 'Joke',
  'args': {'setup': "Why don't scientists trust atoms?",
   'punchline': 'Because they make up everything!'},
  'id': 'call_Isuoh0RTeQzzOKGg5QlQ7UqI'}]
```

## JsonOutputKeyToolsParser

यह केवल प्रतिक्रिया में वापस किए गए एक कुंजी को निकालता है। जब आप एक उपकरण को पास कर रहे हैं और केवल इसके तर्क चाहते हैं, तो यह उपयोगी है।

```python
from typing import List

from langchain.output_parsers.openai_tools import JsonOutputKeyToolsParser
```

```python
parser = JsonOutputKeyToolsParser(key_name="Joke")
```

```python
chain = prompt | model | parser
```

```python
chain.invoke({"input": "tell me a joke"})
```

```output
[{'setup': "Why don't scientists trust atoms?",
  'punchline': 'Because they make up everything!'}]
```

कुछ मॉडल प्रत्येक कॉल में कई उपकरण आह्वान कर सकते हैं, इसलिए डिफ़ॉल्ट रूप से आउटपुट एक सूची है। यदि हम केवल पहला उपकरण आह्वान वापस करना चाहते हैं, तो हम `first_tool_only=True` निर्दिष्ट कर सकते हैं।

```python
parser = JsonOutputKeyToolsParser(key_name="Joke", first_tool_only=True)
chain = prompt | model | parser
chain.invoke({"input": "tell me a joke"})
```

```output
{'setup': "Why don't scientists trust atoms?",
 'punchline': 'Because they make up everything!'}
```

## PydanticToolsParser

यह `JsonOutputToolsParser` पर आधारित है, लेकिन परिणामों को एक Pydantic मॉडल में पास करता है। यह आगे की मान्यता की अनुमति देता है, यदि आप चाहते हैं।

```python
from langchain.output_parsers.openai_tools import PydanticToolsParser
```

```python
class Joke(BaseModel):
    """Joke to tell user."""

    setup: str = Field(description="question to set up a joke")
    punchline: str = Field(description="answer to resolve the joke")

    # You can add custom validation logic easily with Pydantic.
    @validator("setup")
    def question_ends_with_question_mark(cls, field):
        if field[-1] != "?":
            raise ValueError("Badly formed question!")
        return field


parser = PydanticToolsParser(tools=[Joke])
```

```python
model = ChatOpenAI(model="gpt-3.5-turbo", temperature=0).bind_tools([Joke])
chain = prompt | model | parser
```

```python
chain.invoke({"input": "tell me a joke"})
```

```output
[Joke(setup="Why don't scientists trust atoms?", punchline='Because they make up everything!')]
```
