---
translated: true
---

# YAML पार्सर

यह आउटपुट पार्सर उपयोगकर्ताओं को एक임의的 स्कीमा निर्दिष्ट करने और YAML का उपयोग करके अपने प्रतिक्रिया को प्रारूपित करते हुए उस स्कीमा के अनुरूप आउटपुट जेनरेट करने के लिए LLM का उपयोग करने की अनुमति देता है।

ध्यान रखें कि बड़े भाषा मॉडल रिसाव अवधारणाएं हैं! आप एक ऐसे LLM का उपयोग करना होगा जिसकी क्षमता पर्याप्त हो ताकि अच्छी तरह से गठित YAML जेनरेट किया जा सके। OpenAI परिवार में, DaVinci विश्वसनीय रूप से कर सकता है लेकिन Curie की क्षमता काफी कम हो जाती है।

आप वैकल्पिक रूप से Pydantic का उपयोग करके अपने डेटा मॉडल को घोषित कर सकते हैं।

```python
from typing import List

from langchain.output_parsers import YamlOutputParser
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
parser = YamlOutputParser(pydantic_object=Joke)

prompt = PromptTemplate(
    template="Answer the user query.\n{format_instructions}\n{query}\n",
    input_variables=["query"],
    partial_variables={"format_instructions": parser.get_format_instructions()},
)

chain = prompt | model | parser

chain.invoke({"query": joke_query})
```

```output
Joke(setup="Why don't scientists trust atoms?", punchline='Because they make up everything!')
```

[YamlOutputParser](https://api.python.langchain.com/en/latest/output_parsers/langchain.output_parsers.yaml.YamlOutputParser.html#langchain.output_parsers.yaml.YamlOutputParser) के लिए API प्रलेखन देखें।
