---
translated: true
---

# JSON parser

यह आउटपुट पार्सर उपयोगकर्ताओं को एक임의的 JSON स्कीमा निर्दिष्ट करने और उस स्कीमा के अनुरूप आउटपुट जनरेट करने के लिए एलएलएम का उपयोग करने की अनुमति देता है।

ध्यान रखें कि बड़े भाषा मॉडल एक रिसाव वाली अवधारणा हैं! आप एक ऐसे एलएलएम का उपयोग करेंगे जिसकी क्षमता पर्याप्त हो ताकि अच्छी तरह से गठित JSON जनरेट किया जा सके। ओपनएआई परिवार में, डाविंची विश्वसनीय रूप से कर सकता है लेकिन क्यूरी की क्षमता काफी कम हो जाती है।

आप वैकल्पिक रूप से Pydantic का उपयोग करके अपना डेटा मॉडल घोषित कर सकते हैं।

```python
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_openai import ChatOpenAI
```

```python
model = ChatOpenAI(temperature=0)
```

```python
# Define your desired data structure.
class Joke(BaseModel):
    setup: str = Field(description="question to set up a joke")
    punchline: str = Field(description="answer to resolve the joke")
```

```python
# And a query intented to prompt a language model to populate the data structure.
joke_query = "Tell me a joke."

# Set up a parser + inject instructions into the prompt template.
parser = JsonOutputParser(pydantic_object=Joke)

prompt = PromptTemplate(
    template="Answer the user query.\n{format_instructions}\n{query}\n",
    input_variables=["query"],
    partial_variables={"format_instructions": parser.get_format_instructions()},
)

chain = prompt | model | parser

chain.invoke({"query": joke_query})
```

```output
{'setup': "Why don't scientists trust atoms?",
 'punchline': 'Because they make up everything!'}
```

## स्ट्रीमिंग

यह आउटपुट पार्सर स्ट्रीमिंग का समर्थन करता है।

```python
for s in chain.stream({"query": joke_query}):
    print(s)
```

```output
{'setup': ''}
{'setup': 'Why'}
{'setup': 'Why don'}
{'setup': "Why don't"}
{'setup': "Why don't scientists"}
{'setup': "Why don't scientists trust"}
{'setup': "Why don't scientists trust atoms"}
{'setup': "Why don't scientists trust atoms?", 'punchline': ''}
{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because'}
{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they'}
{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make'}
{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make up'}
{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make up everything'}
{'setup': "Why don't scientists trust atoms?", 'punchline': 'Because they make up everything!'}
```

## Pydantic के बिना

आप इसका उपयोग Pydantic के बिना भी कर सकते हैं। यह उसे JSON लौटाने के लिए प्रेरित करेगा, लेकिन स्कीमा के बारे में विशिष्ट जानकारी नहीं देगा।

```python
joke_query = "Tell me a joke."

parser = JsonOutputParser()

prompt = PromptTemplate(
    template="Answer the user query.\n{format_instructions}\n{query}\n",
    input_variables=["query"],
    partial_variables={"format_instructions": parser.get_format_instructions()},
)

chain = prompt | model | parser

chain.invoke({"query": joke_query})
```

```output
{'joke': "Why don't scientists trust atoms? Because they make up everything!"}
```

[JsonOutputParser](https://api.python.langchain.com/en/latest/output_parsers/langchain_core.output_parsers.json.JsonOutputParser.html#langchain_core.output_parsers.json.JsonOutputParser) के लिए API दस्तावेज़ीकरण देखें।
