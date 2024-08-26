---
translated: true
---

# Pydantic पार्सर

यह आउटपुट पार्सर उपयोगकर्ताओं को किसी भी Pydantic मॉडल को निर्दिष्ट करने और उस स्कीमा के अनुरूप आउटपुट जेनरेट करने के लिए एलएलएम का उपयोग करने की अनुमति देता है।

याद रखें कि बड़े भाषा मॉडल रिसाव अवधारणाएं हैं! आप एक ऐसे एलएलएम का उपयोग करेंगे जिसकी क्षमता पर्याप्त हो ताकि अच्छी तरह से गठित JSON जेनरेट किया जा सके। OpenAI परिवार में, DaVinci विश्वसनीय रूप से कर सकता है लेकिन [Curie](https://wiprotechblogs.medium.com/davinci-vs-curie-a-comparison-between-gpt-3-engines-for-extractive-summarization-b568d4633b3b) की क्षमता काफी कम हो जाती है।

अपने डेटा मॉडल को घोषित करने के लिए Pydantic का उपयोग करें। Pydantic का BaseModel एक Python dataclass की तरह है, लेकिन वास्तविक प्रकार जांच + coercion के साथ।

```python
from typing import List

from langchain.output_parsers import PydanticOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field, validator
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

    # You can add custom validation logic easily with Pydantic.
    @validator("setup")
    def question_ends_with_question_mark(cls, field):
        if field[-1] != "?":
            raise ValueError("Badly formed question!")
        return field


# And a query intented to prompt a language model to populate the data structure.
joke_query = "Tell me a joke."

# Set up a parser + inject instructions into the prompt template.
parser = PydanticOutputParser(pydantic_object=Joke)

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

```python
# Here's another example, but with a compound typed field.
class Actor(BaseModel):
    name: str = Field(description="name of an actor")
    film_names: List[str] = Field(description="list of names of films they starred in")


actor_query = "Generate the filmography for a random actor."

parser = PydanticOutputParser(pydantic_object=Actor)

prompt = PromptTemplate(
    template="Answer the user query.\n{format_instructions}\n{query}\n",
    input_variables=["query"],
    partial_variables={"format_instructions": parser.get_format_instructions()},
)

chain = prompt | model | parser

chain.invoke({"query": actor_query})
```

```output
Actor(name='Tom Hanks', film_names=['Forrest Gump', 'Cast Away', 'Saving Private Ryan', 'Toy Story', 'The Green Mile'])
```

[PydanticOutputParser](https://api.python.langchain.com/en/latest/output_parsers/langchain_core.output_parsers.pydantic.PydanticOutputParser.html#langchain_core.output_parsers.pydantic.PydanticOutputParser) के लिए API दस्तावेज़ीकरण देखें।
