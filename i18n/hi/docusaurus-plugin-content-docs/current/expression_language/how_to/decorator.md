---
translated: true
---

# `@chain` डिकोरेटर के साथ एक रनेबल बनाएं

आप किसी भी फ़ंक्शन को `@chain` डिकोरेटर जोड़कर भी एक श्रृंखला में बदल सकते हैं। यह [`RunnableLambda`](/docs/expression_language/primitives/functions) में लपेटने के समान कार्य करता है।

इससे आपकी श्रृंखला को सही ढंग से ट्रेस करके बेहतर पर्यवेक्षणीयता प्राप्त होगी। इस फ़ंक्शन के अंदर किए गए किसी भी रनेबल कॉल को अवरोही बच्चों के रूप में ट्रेस किया जाएगा।

यह आपको इसका उपयोग किसी अन्य रनेबल के रूप में करने, श्रृंखला में जोड़ने आदि की अनुमति भी देगा।

चलो इसे कार्य में देखते हैं!

```python
%pip install --upgrade --quiet  langchain langchain-openai
```

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import chain
from langchain_openai import ChatOpenAI
```

```python
prompt1 = ChatPromptTemplate.from_template("Tell me a joke about {topic}")
prompt2 = ChatPromptTemplate.from_template("What is the subject of this joke: {joke}")
```

```python
@chain
def custom_chain(text):
    prompt_val1 = prompt1.invoke({"topic": text})
    output1 = ChatOpenAI().invoke(prompt_val1)
    parsed_output1 = StrOutputParser().invoke(output1)
    chain2 = prompt2 | ChatOpenAI() | StrOutputParser()
    return chain2.invoke({"joke": parsed_output1})
```

`custom_chain` अब एक रनेबल है, इसका मतलब है कि आपको `invoke` का उपयोग करना होगा।

```python
custom_chain.invoke("bears")
```

```output
'The subject of this joke is bears.'
```

यदि आप अपने LangSmith ट्रेस को देखते हैं, तो आपको `custom_chain` ट्रेस दिखाई देगा, जिसके नीचे OpenAI के कॉल होंगे।
