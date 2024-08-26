---
sidebar_position: 0
title: प्रॉम्प्ट + LLM
translated: true
---

सबसे आम और मूल्यवान संयोजन है:

``PromptTemplate`` / ``ChatPromptTemplate`` -> ``LLM`` / ``ChatModel`` -> ``OutputParser``

लगभग कोई भी अन्य श्रृंखला जो आप बनाते हैं इस बिल्डिंग ब्लॉक का उपयोग करेगी।

## PromptTemplate + LLM

सबसे सरल संयोजन केवल प्रॉम्प्ट और मॉडल को जोड़कर बनाना है जो उपयोगकर्ता इनपुट लेता है, उसे प्रॉम्प्ट में जोड़ता है, उसे मॉडल में पास करता है, और कच्चे मॉडल आउटपुट को वापस लौटाता है।

ध्यान दें, आप यहां PromptTemplate/ChatPromptTemplates और LLMs/ChatModels को मिक्स और मैच कर सकते हैं।
%pip install --upgrade --quiet  langchain langchain-openai

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

prompt = ChatPromptTemplate.from_template("tell me a joke about {foo}")
model = ChatOpenAI()
chain = prompt | model
```

```python
chain.invoke({"foo": "bears"})
```

```output
AIMessage(content="Why don't bears wear shoes?\n\nBecause they have bear feet!", additional_kwargs={}, example=False)
```

अक्सर हम प्रत्येक मॉडल कॉल में पारित किए जाने वाले kwargs को संलग्न करना चाहते हैं। यहाँ इसके कुछ उदाहरण हैं:

### स्टॉप अनुक्रमों को संलग्न करना

```python
chain = prompt | model.bind(stop=["\n"])
```

```python
chain.invoke({"foo": "bears"})
```

```output
AIMessage(content='Why did the bear never wear shoes?', additional_kwargs={}, example=False)
```

### फ़ंक्शन कॉल जानकारी संलग्न करना

```python
functions = [
    {
        "name": "joke",
        "description": "A joke",
        "parameters": {
            "type": "object",
            "properties": {
                "setup": {"type": "string", "description": "The setup for the joke"},
                "punchline": {
                    "type": "string",
                    "description": "The punchline for the joke",
                },
            },
            "required": ["setup", "punchline"],
        },
    }
]
chain = prompt | model.bind(function_call={"name": "joke"}, functions=functions)
```

```python
chain.invoke({"foo": "bears"}, config={})
```

```output
AIMessage(content='', additional_kwargs={'function_call': {'name': 'joke', 'arguments': '{\n  "setup": "Why don\'t bears wear shoes?",\n  "punchline": "Because they have bear feet!"\n}'}}, example=False)
```

## PromptTemplate + LLM + OutputParser

हम एक आउटपुट पार्सर को भी जोड़ सकते हैं ताकि कच्चे LLM/ChatModel आउटपुट को आसानी से एक अधिक कार्यात्मक प्रारूप में बदला जा सके।

```python
from langchain_core.output_parsers import StrOutputParser

chain = prompt | model | StrOutputParser()
```

ध्यान दें कि यह अब एक स्ट्रिंग को वापस करता है - डाउनस्ट्रीम कार्यों के लिए एक बहुत ही कार्यात्मक प्रारूप।

```python
chain.invoke({"foo": "bears"})
```

```output
"Why don't bears wear shoes?\n\nBecause they have bear feet!"
```

### फ़ंक्शन आउटपुट पार्सर

जब आप वापस करने के लिए फ़ंक्शन निर्दिष्ट करते हैं, तो आप उसे सीधे पार्स करना चाह सकते हैं।

```python
from langchain.output_parsers.openai_functions import JsonOutputFunctionsParser

chain = (
    prompt
    | model.bind(function_call={"name": "joke"}, functions=functions)
    | JsonOutputFunctionsParser()
)
```

```python
chain.invoke({"foo": "bears"})
```

```output
{'setup': "Why don't bears like fast food?",
 'punchline': "Because they can't catch it!"}
```

```python
from langchain.output_parsers.openai_functions import JsonKeyOutputFunctionsParser

chain = (
    prompt
    | model.bind(function_call={"name": "joke"}, functions=functions)
    | JsonKeyOutputFunctionsParser(key_name="setup")
)
```

```python
chain.invoke({"foo": "bears"})
```

```output
"Why don't bears wear shoes?"
```

## इनपुट को सरल बनाना

आमंत्रण को और भी सरल बनाने के लिए, हम प्रॉम्प्ट इनपुट डिक्शनरी बनाने की देखभाल करने के लिए एक `RunnableParallel` जोड़ सकते हैं:

```python
from langchain_core.runnables import RunnableParallel, RunnablePassthrough

map_ = RunnableParallel(foo=RunnablePassthrough())
chain = (
    map_
    | prompt
    | model.bind(function_call={"name": "joke"}, functions=functions)
    | JsonKeyOutputFunctionsParser(key_name="setup")
)
```

```python
chain.invoke("bears")
```

```output
"Why don't bears wear shoes?"
```

चूंकि हम अपने मैप को किसी अन्य Runnable के साथ संयोजित कर रहे हैं, इसलिए हम कुछ वाक्यविन्यास शर्करा का उपयोग कर सकते हैं और केवल एक डिक्शनरी का उपयोग कर सकते हैं:

```python
chain = (
    {"foo": RunnablePassthrough()}
    | prompt
    | model.bind(function_call={"name": "joke"}, functions=functions)
    | JsonKeyOutputFunctionsParser(key_name="setup")
)
```

```python
chain.invoke("bears")
```

```output
"Why don't bears like fast food?"
```
