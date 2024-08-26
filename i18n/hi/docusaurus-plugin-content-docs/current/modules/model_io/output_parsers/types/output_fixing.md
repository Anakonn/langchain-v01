---
translated: true
---

# आउटपुट-फिक्सिंग पार्सर

यह आउटपुट पार्सर एक अन्य आउटपुट पार्सर को लपेटता है, और यदि पहला विफल हो जाता है तो यह किसी अन्य LLM को त्रुटियों को ठीक करने के लिए कॉल करता है।

लेकिन हम त्रुटियों को फेंकने के अलावा भी कुछ और काम कर सकते हैं। विशेष रूप से, हम गलत प्रारूपित आउटपुट को, प्रारूपित निर्देशों के साथ, मॉडल को भेज सकते हैं और उससे इसे ठीक करने के लिए कह सकते हैं।

इस उदाहरण के लिए, हम उपरोक्त Pydantic आउटपुट पार्सर का उपयोग करेंगे। यहां क्या होता है अगर हम इसे एक ऐसा परिणाम पास करते हैं जो स्कीमा के अनुरूप नहीं है:

```python
from typing import List

from langchain.output_parsers import PydanticOutputParser
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_openai import ChatOpenAI
```

```python
class Actor(BaseModel):
    name: str = Field(description="name of an actor")
    film_names: List[str] = Field(description="list of names of films they starred in")


actor_query = "Generate the filmography for a random actor."

parser = PydanticOutputParser(pydantic_object=Actor)
```

```python
misformatted = "{'name': 'Tom Hanks', 'film_names': ['Forrest Gump']}"
```

```python
parser.parse(misformatted)
```

```output
---------------------------------------------------------------------------

JSONDecodeError                           Traceback (most recent call last)

File ~/workplace/langchain/libs/langchain/langchain/output_parsers/pydantic.py:29, in PydanticOutputParser.parse(self, text)
     28     json_str = match.group()
---> 29 json_object = json.loads(json_str, strict=False)
     30 return self.pydantic_object.parse_obj(json_object)

File ~/.pyenv/versions/3.10.1/lib/python3.10/json/__init__.py:359, in loads(s, cls, object_hook, parse_float, parse_int, parse_constant, object_pairs_hook, **kw)
    358     kw['parse_constant'] = parse_constant
--> 359 return cls(**kw).decode(s)

File ~/.pyenv/versions/3.10.1/lib/python3.10/json/decoder.py:337, in JSONDecoder.decode(self, s, _w)
    333 """Return the Python representation of ``s`` (a ``str`` instance
    334 containing a JSON document).
    335
    336 """
--> 337 obj, end = self.raw_decode(s, idx=_w(s, 0).end())
    338 end = _w(s, end).end()

File ~/.pyenv/versions/3.10.1/lib/python3.10/json/decoder.py:353, in JSONDecoder.raw_decode(self, s, idx)
    352 try:
--> 353     obj, end = self.scan_once(s, idx)
    354 except StopIteration as err:

JSONDecodeError: Expecting property name enclosed in double quotes: line 1 column 2 (char 1)


During handling of the above exception, another exception occurred:

OutputParserException                     Traceback (most recent call last)

Cell In[4], line 1
----> 1 parser.parse(misformatted)

File ~/workplace/langchain/libs/langchain/langchain/output_parsers/pydantic.py:35, in PydanticOutputParser.parse(self, text)
     33 name = self.pydantic_object.__name__
     34 msg = f"Failed to parse {name} from completion {text}. Got: {e}"
---> 35 raise OutputParserException(msg, llm_output=text)

OutputParserException: Failed to parse Actor from completion {'name': 'Tom Hanks', 'film_names': ['Forrest Gump']}. Got: Expecting property name enclosed in double quotes: line 1 column 2 (char 1)
```

अब हम एक `OutputFixingParser` का निर्माण और उपयोग कर सकते हैं। यह आउटपुट पार्सर एक अन्य आउटपुट पार्सर के रूप में तर्क लेता है, लेकिन साथ ही किसी भी प्रारूप त्रुटियों को ठीक करने के लिए एक LLM भी।

```python
from langchain.output_parsers import OutputFixingParser

new_parser = OutputFixingParser.from_llm(parser=parser, llm=ChatOpenAI())
```

```python
new_parser.parse(misformatted)
```

```output
Actor(name='Tom Hanks', film_names=['Forrest Gump'])
```

[OutputFixingParser](https://api.python.langchain.com/en/latest/output_parsers/langchain.output_parsers.fix.OutputFixingParser.html#langchain.output_parsers.fix.OutputFixingParser) के लिए API दस्तावेज़ीकरण खोजें।
