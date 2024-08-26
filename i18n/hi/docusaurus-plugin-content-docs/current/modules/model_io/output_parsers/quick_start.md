---
sidebar_position: 3
title: त्वरित शुरुआत
translated: true
---

भाषा मॉडल पाठ उत्पन्न करते हैं। लेकिन कई बार आप केवल पाठ के बजाय अधिक संरचित जानकारी प्राप्त करना चाहते हैं। यह वह जगह है जहां आउटपुट पार्सर आते हैं।

आउटपुट पार्सर ऐसे वर्ग हैं जो भाषा मॉडल प्रतिक्रियाओं को संरचित करने में मदद करते हैं। एक आउटपुट पार्सर को लागू करने के लिए दो प्रमुख तरीके हैं:

- "प्रारूप निर्देश प्राप्त करें": एक ऐसा तरीका जो भाषा मॉडल के आउटपुट को किस प्रकार प्रारूपित किया जाना चाहिए, उसके निर्देश लौटाता है।
- "पार्स करें": एक ऐसा तरीका जो एक स्ट्रिंग (जिसे भाषा मॉडल की प्रतिक्रिया माना जाता है) को लेता है और इसे किसी संरचना में पार्स करता है।

और फिर एक वैकल्पिक तरीका:

- "प्रॉम्प्ट के साथ पार्स करें": एक ऐसा तरीका जो एक स्ट्रिंग (जिसे भाषा मॉडल की प्रतिक्रिया माना जाता है) और एक प्रॉम्प्ट (जिसे उस प्रतिक्रिया को उत्पन्न करने वाला प्रॉम्प्ट माना जाता है) को लेता है और इसे किसी संरचना में पार्स करता है। प्रॉम्प्ट मुख्य रूप से इस मामले में प्रदान किया जाता है कि यदि OutputParser किसी तरह से आउटपुट को फिर से प्रयास या ठीक करना चाहता है, और ऐसा करने के लिए प्रॉम्प्ट से जानकारी की आवश्यकता है।

## शुरू करें

नीचे हम मुख्य प्रकार के आउटपुट पार्सर, `PydanticOutputParser` पर चर्चा करते हैं।

```python
from langchain.output_parsers import PydanticOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field, validator
from langchain_openai import OpenAI

model = OpenAI(model_name="gpt-3.5-turbo-instruct", temperature=0.0)


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


# Set up a parser + inject instructions into the prompt template.
parser = PydanticOutputParser(pydantic_object=Joke)

prompt = PromptTemplate(
    template="Answer the user query.\n{format_instructions}\n{query}\n",
    input_variables=["query"],
    partial_variables={"format_instructions": parser.get_format_instructions()},
)

# And a query intended to prompt a language model to populate the data structure.
prompt_and_model = prompt | model
output = prompt_and_model.invoke({"query": "Tell me a joke."})
parser.invoke(output)
```

```output
Joke(setup='Why did the chicken cross the road?', punchline='To get to the other side!')
```

## LCEL

आउटपुट पार्सर [Runnable interface](/docs/expression_language/interface) को लागू करते हैं, जो [LangChain Expression Language (LCEL)](/docs/expression_language/) का मूल भवन ब्लॉक है। इसका मतलब है कि वे `invoke`, `ainvoke`, `stream`, `astream`, `batch`, `abatch`, `astream_log` कॉल का समर्थन करते हैं।

आउटपुट पार्सर स्ट्रिंग या `BaseMessage` को इनपुट के रूप में स्वीकार करते हैं और कोई भी प्रकार का आउटपुट दे सकते हैं।

```python
parser.invoke(output)
```

```output
Joke(setup='Why did the chicken cross the road?', punchline='To get to the other side!')
```

पार्सर को मैन्युअल रूप से इन्वोक करने के बजाय, हम इसे अपने `Runnable` अनुक्रम में भी जोड़ सकते हैं:

```python
chain = prompt | model | parser
chain.invoke({"query": "Tell me a joke."})
```

```output
Joke(setup='Why did the chicken cross the road?', punchline='To get to the other side!')
```

सभी पार्सर स्ट्रीमिंग इंटरफ़ेस का समर्थन करते हैं, लेकिन केवल कुछ ही पार्सर आंशिक रूप से पार्स किए गए ऑब्जेक्ट्स के माध्यम से स्ट्रीम कर सकते हैं, क्योंकि यह आउटपुट प्रकार पर बहुत निर्भर करता है। जो पार्सर आंशिक ऑब्जेक्ट्स का निर्माण नहीं कर सकते, वे केवल पूरी तरह से पार्स किए गए आउटपुट को उत्पन्न करेंगे।

उदाहरण के लिए, `SimpleJsonOutputParser` आंशिक आउटपुट के माध्यम से स्ट्रीम कर सकता है:

```python
from langchain.output_parsers.json import SimpleJsonOutputParser

json_prompt = PromptTemplate.from_template(
    "Return a JSON object with an `answer` key that answers the following question: {question}"
)
json_parser = SimpleJsonOutputParser()
json_chain = json_prompt | model | json_parser
```

```python
list(json_chain.stream({"question": "Who invented the microscope?"}))
```

```output
[{},
 {'answer': ''},
 {'answer': 'Ant'},
 {'answer': 'Anton'},
 {'answer': 'Antonie'},
 {'answer': 'Antonie van'},
 {'answer': 'Antonie van Lee'},
 {'answer': 'Antonie van Leeu'},
 {'answer': 'Antonie van Leeuwen'},
 {'answer': 'Antonie van Leeuwenho'},
 {'answer': 'Antonie van Leeuwenhoek'}]
```

जबकि PydanticOutputParser नहीं कर सकता:

```python
list(chain.stream({"query": "Tell me a joke."}))
```

```output
[Joke(setup='Why did the chicken cross the road?', punchline='To get to the other side!')]
```
