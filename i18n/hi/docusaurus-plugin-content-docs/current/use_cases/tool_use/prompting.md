---
sidebar_position: 3
translated: true
---

यह गाइड में हम एक ऐसी श्रृंखला बनाएंगे जो किसी विशेष मॉडल एपीआई (जैसे टूल कॉलिंग, जिसे हमने [त्वरित शुरुआत](/docs/use_cases/tool_use/quickstart) में दिखाया था) पर निर्भर नहीं है और बस मॉडल को सीधे उपकरणों को आमंत्रित करने के लिए प्रोत्साहित करता है।

## सेटअप

हमें निम्नलिखित पैकेज इंस्टॉल करने होंगे:

```python
%pip install --upgrade --quiet langchain langchain-openai
```

और इन पर्यावरण चर सेट करने होंगे:

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()

# If you'd like to use LangSmith, uncomment the below:
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## एक उपकरण बनाएं

पहले, हमें एक उपकरण बनाना होगा जिसे कॉल किया जा सके। इस उदाहरण के लिए, हम एक कस्टम उपकरण एक फ़ंक्शन से बनाएंगे। कस्टम उपकरण बनाने से संबंधित सभी विवरणों के लिए, कृपया [इस गाइड](/docs/modules/tools/) देखें।

```python
from langchain_core.tools import tool


@tool
def multiply(first_int: int, second_int: int) -> int:
    """Multiply two integers together."""
    return first_int * second_int
```

```python
print(multiply.name)
print(multiply.description)
print(multiply.args)
```

```output
multiply
multiply(first_int: int, second_int: int) -> int - Multiply two integers together.
{'first_int': {'title': 'First Int', 'type': 'integer'}, 'second_int': {'title': 'Second Int', 'type': 'integer'}}
```

```python
multiply.invoke({"first_int": 4, "second_int": 5})
```

```output
20
```

## हमारा प्रोम्प्ट बनाना

हमें एक प्रोम्प्ट लिखना होगा जो मॉडल को उपलब्ध उपकरणों, उनके तर्कों और मॉडल के वांछित आउटपुट प्रारूप को निर्दिष्ट करता है। इस मामले में, हम इसे निर्देश देंगे कि वह `{"name": "...", "arguments": {...}}` के रूप में एक JSON ब्लॉब आउटपुट करे।

```python
from langchain.tools.render import render_text_description

rendered_tools = render_text_description([multiply])
rendered_tools
```

```output
'multiply: multiply(first_int: int, second_int: int) -> int - Multiply two integers together.'
```

```python
from langchain_core.prompts import ChatPromptTemplate

system_prompt = f"""You are an assistant that has access to the following set of tools. Here are the names and descriptions for each tool:

{rendered_tools}

Given the user input, return the name and input of the tool to use. Return your response as a JSON blob with 'name' and 'arguments' keys."""

prompt = ChatPromptTemplate.from_messages(
    [("system", system_prompt), ("user", "{input}")]
)
```

## एक आउटपुट पार्सर जोड़ना

हम अपने मॉडल के आउटपुट को JSON में पार्स करने के लिए `JsonOutputParser` का उपयोग करेंगे।

```python
from langchain_core.output_parsers import JsonOutputParser
from langchain_openai import ChatOpenAI

model = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
chain = prompt | model | JsonOutputParser()
chain.invoke({"input": "what's thirteen times 4"})
```

```output
{'name': 'multiply', 'arguments': {'first_int': 13, 'second_int': 4}}
```

## उपकरण को आमंत्रित करना

हम श्रृंखला के हिस्से के रूप में उपकरण को आमंत्रित कर सकते हैं, मॉडल जनित "तर्क" को उसे पास करके:

```python
from operator import itemgetter

chain = prompt | model | JsonOutputParser() | itemgetter("arguments") | multiply
chain.invoke({"input": "what's thirteen times 4"})
```

```output
52
```

## कई उपकरणों से चुनना

मान लीजिए कि हमारे पास कई उपकरण हैं जिनका श्रृंखला को चुनने की क्षमता होनी चाहिए:

```python
@tool
def add(first_int: int, second_int: int) -> int:
    "Add two integers."
    return first_int + second_int


@tool
def exponentiate(base: int, exponent: int) -> int:
    "Exponentiate the base to the exponent power."
    return base**exponent
```

फ़ंक्शन कॉलिंग के साथ, हम इसे इस तरह कर सकते हैं:

यदि हम मॉडल चयनित उपकरण को चलाना चाहते हैं, तो हम मॉडल आउटपुट के "तर्क" हिस्से को पास करने वाली अपनी उपश्रृंखला का उपयोग करके ऐसा कर सकते हैं:

```python
tools = [add, exponentiate, multiply]


def tool_chain(model_output):
    tool_map = {tool.name: tool for tool in tools}
    chosen_tool = tool_map[model_output["name"]]
    return itemgetter("arguments") | chosen_tool
```

```python
rendered_tools = render_text_description(tools)
system_prompt = f"""You are an assistant that has access to the following set of tools. Here are the names and descriptions for each tool:

{rendered_tools}

Given the user input, return the name and input of the tool to use. Return your response as a JSON blob with 'name' and 'arguments' keys."""

prompt = ChatPromptTemplate.from_messages(
    [("system", system_prompt), ("user", "{input}")]
)

chain = prompt | model | JsonOutputParser() | tool_chain
chain.invoke({"input": "what's 3 plus 1132"})
```

```output
1135
```

## उपकरण इनपुट लौटाना

यह मददगार हो सकता है कि न केवल उपकरण आउटपुट बल्कि उपकरण इनपुट भी लौटाया जाए। हम LCEL के साथ आसानी से ऐसा कर सकते हैं `RunnablePassthrough.assign` करके। यह उस इनपुट को लेगा जो RunnablePassrthrough घटकों (एक डिक्शनरी माना जाता है) के लिए इनपुट है और इसमें एक कुंजी जोड़ देगा, लेकिन अभी भी सब कुछ को पास कर देगा जो इनपुट में मौजूद है:

```python
from langchain_core.runnables import RunnablePassthrough

chain = (
    prompt | model | JsonOutputParser() | RunnablePassthrough.assign(output=tool_chain)
)
chain.invoke({"input": "what's 3 plus 1132"})
```

```output
{'name': 'add',
 'arguments': {'first_int': 3, 'second_int': 1132},
 'output': 1135}
```
