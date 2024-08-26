---
translated: true
---

# रीट्राई पार्सर

कुछ मामलों में केवल आउटपुट को देखकर पार्सिंग गलतियों को ठीक करना संभव हो सकता है, लेकिन अन्य मामलों में ऐसा नहीं है। इसका एक उदाहरण है जब आउटपुट केवल गलत प्रारूप में नहीं है, बल्कि आंशिक रूप से पूर्ण है। नीचे दिए गए उदाहरण पर विचार करें।

```python
from langchain.output_parsers import (
    OutputFixingParser,
    PydanticOutputParser,
)
from langchain_core.prompts import (
    PromptTemplate,
)
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_openai import ChatOpenAI, OpenAI
```

```python
template = """Based on the user question, provide an Action and Action Input for what step should be taken.
{format_instructions}
Question: {query}
Response:"""


class Action(BaseModel):
    action: str = Field(description="action to take")
    action_input: str = Field(description="input to the action")


parser = PydanticOutputParser(pydantic_object=Action)
```

```python
prompt = PromptTemplate(
    template="Answer the user query.\n{format_instructions}\n{query}\n",
    input_variables=["query"],
    partial_variables={"format_instructions": parser.get_format_instructions()},
)
```

```python
prompt_value = prompt.format_prompt(query="who is leo di caprios gf?")
```

```python
bad_response = '{"action": "search"}'
```

यदि हम इस प्रतिक्रिया को पार्स करने का प्रयास करते हैं, तो हमें एक त्रुटि मिलेगी:

```python
parser.parse(bad_response)
```

```output
---------------------------------------------------------------------------

ValidationError                           Traceback (most recent call last)

File ~/workplace/langchain/libs/langchain/langchain/output_parsers/pydantic.py:30, in PydanticOutputParser.parse(self, text)
     29     json_object = json.loads(json_str, strict=False)
---> 30     return self.pydantic_object.parse_obj(json_object)
     32 except (json.JSONDecodeError, ValidationError) as e:

File ~/.pyenv/versions/3.10.1/envs/langchain/lib/python3.10/site-packages/pydantic/main.py:526, in pydantic.main.BaseModel.parse_obj()

File ~/.pyenv/versions/3.10.1/envs/langchain/lib/python3.10/site-packages/pydantic/main.py:341, in pydantic.main.BaseModel.__init__()

ValidationError: 1 validation error for Action
action_input
  field required (type=value_error.missing)


During handling of the above exception, another exception occurred:

OutputParserException                     Traceback (most recent call last)

Cell In[6], line 1
----> 1 parser.parse(bad_response)

File ~/workplace/langchain/libs/langchain/langchain/output_parsers/pydantic.py:35, in PydanticOutputParser.parse(self, text)
     33 name = self.pydantic_object.__name__
     34 msg = f"Failed to parse {name} from completion {text}. Got: {e}"
---> 35 raise OutputParserException(msg, llm_output=text)

OutputParserException: Failed to parse Action from completion {"action": "search"}. Got: 1 validation error for Action
action_input
  field required (type=value_error.missing)
```

यदि हम `OutputFixingParser` का उपयोग करके इस त्रुटि को ठीक करने का प्रयास करते हैं, तो यह भ्रमित हो जाएगा - यानी, यह वास्तव में क्या कार्रवाई इनपुट डालना है, इसका पता नहीं चलेगा।

```python
fix_parser = OutputFixingParser.from_llm(parser=parser, llm=ChatOpenAI())
```

```python
fix_parser.parse(bad_response)
```

```output
Action(action='search', action_input='input')
```

बजाय इसके, हम `RetryOutputParser` का उपयोग कर सकते हैं, जो प्रॉम्प्ट (साथ ही मूल आउटपुट) को पास करता है ताकि बेहतर प्रतिक्रिया प्राप्त करने के लिए फिर से प्रयास किया जा सके।

```python
from langchain.output_parsers import RetryOutputParser
```

```python
retry_parser = RetryOutputParser.from_llm(parser=parser, llm=OpenAI(temperature=0))
```

```python
retry_parser.parse_with_prompt(bad_response, prompt_value)
```

```output
Action(action='search', action_input='leo di caprio girlfriend')
```

हम एक कस्टम श्रृंखला के साथ भी `RetryOutputParser` को आसानी से जोड़ सकते हैं जो कच्चे LLM/ChatModel आउटपुट को एक अधिक कार्यात्मक प्रारूप में रूपांतरित करता है।

```python
from langchain_core.runnables import RunnableLambda, RunnableParallel

completion_chain = prompt | OpenAI(temperature=0)

main_chain = RunnableParallel(
    completion=completion_chain, prompt_value=prompt
) | RunnableLambda(lambda x: retry_parser.parse_with_prompt(**x))


main_chain.invoke({"query": "who is leo di caprios gf?"})
```

```output
Action(action='search', action_input='leo di caprio girlfriend')
```

[RetryOutputParser](https://api.python.langchain.com/en/latest/output_parsers/langchain.output_parsers.retry.RetryOutputParser.html#langchain.output_parsers.retry.RetryOutputParser) के लिए API दस्तावेज़ीकरण देखें।
