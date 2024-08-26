---
translated: true
---

# फिडलर

>[फिडलर](https://www.fiddler.ai/) एंटरप्राइज जनरेटिव और प्रेडिक्टिव सिस्टम ऑप्स में अग्रणी है, जो एक एकीकृत प्लेटफॉर्म प्रदान करता है जो डेटा विज्ञान, एमएलओप्स, जोखिम, अनुपालन, विश्लेषण और अन्य एलओबी टीमों को एंटरप्राइज स्केल पर एमएल तैनाती को मॉनिटर, समझाने, विश्लेषण और सुधारने में सक्षम बनाता है।

## 1. स्थापना और सेटअप

```python
#!pip install langchain langchain-community langchain-openai fiddler-client
```

## 2. फिडलर कनेक्शन विवरण

*फिडलर के साथ अपने मॉडल के बारे में जानकारी जोड़ने से पहले*

1. आप फिडलर से कनेक्ट करने के लिए उपयोग कर रहे यूआरएल
2. आपका संगठन आईडी
3. आपका प्राधिकरण टोकन

ये आपके फिडलर वातावरण के *सेटिंग्स* पृष्ठ पर नेविगेट करके पाए जा सकते हैं।

```python
URL = ""  # Your Fiddler instance URL, Make sure to include the full URL (including https://). For example: https://demo.fiddler.ai
ORG_NAME = ""
AUTH_TOKEN = ""  # Your Fiddler instance auth token

# Fiddler project and model names, used for model registration
PROJECT_NAME = ""
MODEL_NAME = ""  # Model name in Fiddler
```

## 3. एक फिडलर कॉलबैक हैंडलर इंस्टेंस बनाएं

```python
from langchain_community.callbacks.fiddler_callback import FiddlerCallbackHandler

fiddler_handler = FiddlerCallbackHandler(
    url=URL,
    org=ORG_NAME,
    project=PROJECT_NAME,
    model=MODEL_NAME,
    api_key=AUTH_TOKEN,
)
```

## उदाहरण 1: बेसिक श्रृंखला

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import OpenAI

# Note : Make sure openai API key is set in the environment variable OPENAI_API_KEY
llm = OpenAI(temperature=0, streaming=True, callbacks=[fiddler_handler])
output_parser = StrOutputParser()

chain = llm | output_parser

# Invoke the chain. Invocation will be logged to Fiddler, and metrics automatically generated
chain.invoke("How far is moon from earth?")
```

```python
# Few more invocations
chain.invoke("What is the temperature on Mars?")
chain.invoke("How much is 2 + 200000?")
chain.invoke("Which movie won the oscars this year?")
chain.invoke("Can you write me a poem about insomnia?")
chain.invoke("How are you doing today?")
chain.invoke("What is the meaning of life?")
```

## उदाहरण 2: प्रॉम्प्ट टेम्प्लेट के साथ श्रृंखला

```python
from langchain_core.prompts import (
    ChatPromptTemplate,
    FewShotChatMessagePromptTemplate,
)

examples = [
    {"input": "2+2", "output": "4"},
    {"input": "2+3", "output": "5"},
]

example_prompt = ChatPromptTemplate.from_messages(
    [
        ("human", "{input}"),
        ("ai", "{output}"),
    ]
)

few_shot_prompt = FewShotChatMessagePromptTemplate(
    example_prompt=example_prompt,
    examples=examples,
)

final_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a wondrous wizard of math."),
        few_shot_prompt,
        ("human", "{input}"),
    ]
)

# Note : Make sure openai API key is set in the environment variable OPENAI_API_KEY
llm = OpenAI(temperature=0, streaming=True, callbacks=[fiddler_handler])

chain = final_prompt | llm

# Invoke the chain. Invocation will be logged to Fiddler, and metrics automatically generated
chain.invoke({"input": "What's the square of a triangle?"})
```
