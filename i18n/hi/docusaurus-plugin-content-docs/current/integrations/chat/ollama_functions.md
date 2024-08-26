---
sidebar_label: Ollama Functions
translated: true
---

# OllamaFunctions

यह नोटबुक दिखाता है कि कैसे एक प्रयोगात्मक रैपर का उपयोग करके Ollama को OpenAI Functions के समान API प्रदान किया जा सकता है।

ध्यान दें कि अधिक शक्तिशाली और सक्षम मॉडल जटिल स्कीमा और/या कई कार्यों के साथ बेहतर प्रदर्शन करेंगे। नीचे दिए गए उदाहरण llama3 और phi3 मॉडल का उपयोग करते हैं।
समर्थित मॉडल और मॉडल वेरिएंट की पूर्ण सूची के लिए, [Ollama मॉडल लाइब्रेरी](https://ollama.ai/library) देखें।

## सेटअप

स्थानीय Ollama इंस्टेंस सेट अप और चलाने के लिए [इन निर्देशों](https://github.com/jmorganca/ollama) का पालन करें।

## उपयोग

आप OllamaFunctions को एक मानक ChatOllama इंस्टेंस को इनिशियलाइज़ करने की तरह ही इनिशियलाइज़ कर सकते हैं:

```python
from langchain_experimental.llms.ollama_functions import OllamaFunctions

model = OllamaFunctions(model="llama3", format="json")
```

फिर आप JSON स्कीमा पैरामीटर और `function_call` पैरामीटर के साथ परिभाषित कार्यों को बाइंड कर सकते हैं जो मॉडल को दिए गए कार्य को कॉल करने के लिए मजबूर करता है:

```python
model = model.bind_tools(
    tools=[
        {
            "name": "get_current_weather",
            "description": "Get the current weather in a given location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The city and state, " "e.g. San Francisco, CA",
                    },
                    "unit": {
                        "type": "string",
                        "enum": ["celsius", "fahrenheit"],
                    },
                },
                "required": ["location"],
            },
        }
    ],
    function_call={"name": "get_current_weather"},
)
```

इस मॉडल के साथ कार्य को कॉल करने से प्रदान की गई स्कीमा के अनुरूप JSON आउटपुट प्राप्त होता है:

```python
from langchain_core.messages import HumanMessage

model.invoke("what is the weather in Boston?")
```

```output
AIMessage(content='', additional_kwargs={'function_call': {'name': 'get_current_weather', 'arguments': '{"location": "Boston, MA"}'}}, id='run-1791f9fe-95ad-4ca4-bdf7-9f73eab31e6f-0')
```

## संरचित आउटपुट

`with_structured_output()` कार्य का उपयोग करके कार्य कॉलिंग का एक उपयोगी काम है कि किसी दिए गए इनपुट से गुण को संरचित प्रारूप में निकाला जा सकता है:

```python
from langchain_core.prompts import PromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field


# Schema for structured response
class Person(BaseModel):
    name: str = Field(description="The person's name", required=True)
    height: float = Field(description="The person's height", required=True)
    hair_color: str = Field(description="The person's hair color")


# Prompt template
prompt = PromptTemplate.from_template(
    """Alex is 5 feet tall.
Claudia is 1 feet taller than Alex and jumps higher than him.
Claudia is a brunette and Alex is blonde.

Human: {question}
AI: """
)

# Chain
llm = OllamaFunctions(model="phi3", format="json", temperature=0)
structured_llm = llm.with_structured_output(Person)
chain = prompt | structured_llm
```

### Alex के बारे में डेटा निकालना

```python
alex = chain.invoke("Describe Alex")
alex
```

```output
Person(name='Alex', height=5.0, hair_color='blonde')
```

### Claudia के बारे में डेटा निकालना

```python
claudia = chain.invoke("Describe Claudia")
claudia
```

```output
Person(name='Claudia', height=6.0, hair_color='brunette')
```
