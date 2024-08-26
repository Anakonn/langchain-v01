---
keywords:
- RunnableParallel
- RunnableMap
- LCEL
sidebar_position: 1
title: 'समानांतर: डेटा प्रारूपण'
translated: true
---

# इनपुट और आउटपुट का प्रारूपण

`RunnableParallel` प्राथमिक एक ऐसा डिक्शनरी है जिसके मूल्य रनेबल्स (या रनेबल्स में रूपांतरित किए जा सकने वाली चीज़ें, जैसे कि फ़ंक्शन) हैं। यह अपने सभी मूल्यों को समानांतर रूप से चलाता है, और प्रत्येक मूल्य को `RunnableParallel` के समग्र इनपुट के साथ कॉल किया जाता है। अंतिम रिटर्न मान एक ऐसा डिक्शनरी है जिसमें प्रत्येक मूल्य के परिणाम उसके उचित कुंजी के तहत हैं।

यह कार्यों को समानांतर करने के लिए उपयोगी है, लेकिन एक Runnable के आउटपुट को अगले Runnable के इनपुट प्रारूप से मेल खाने के लिए भी उपयोगी हो सकता है।

यहाँ प्रॉम्प्ट के इनपुट में "context" और "question" कुंजियों वाला एक मैप होने की उम्मीद है। उपयोगकर्ता इनपुट केवल प्रश्न है। इसलिए हमें अपने रिट्रीवर का उपयोग करके संदर्भ प्राप्त करना है और उपयोगकर्ता इनपुट को "question" कुंजी के तहत पारित करना है।

```python
%pip install --upgrade --quiet  langchain langchain-openai
```

```python
from langchain_community.vectorstores import FAISS
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI, OpenAIEmbeddings

vectorstore = FAISS.from_texts(
    ["harrison worked at kensho"], embedding=OpenAIEmbeddings()
)
retriever = vectorstore.as_retriever()
template = """Answer the question based only on the following context:
{context}

Question: {question}
"""
prompt = ChatPromptTemplate.from_template(template)
model = ChatOpenAI()

retrieval_chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | model
    | StrOutputParser()
)

retrieval_chain.invoke("where did harrison work?")
```

```output
'Harrison worked at Kensho.'
```

::: {.callout-tip}
ध्यान दें कि जब हम किसी अन्य Runnable के साथ RunnableParallel को संयोजित करते हैं, तो हमें अपने डिक्शनरी को RunnableParallel वर्ग में भी लपेटने की आवश्यकता नहीं है - प्रकार रूपांतरण हमारे लिए संभाल लिया जाता है। एक श्रृंखला के संदर्भ में, ये समकक्ष हैं:
:::

```python
{"context": retriever, "question": RunnablePassthrough()}
```

```python
RunnableParallel({"context": retriever, "question": RunnablePassthrough()})
```

```python
RunnableParallel(context=retriever, question=RunnablePassthrough())
```

## itemgetter का संक्षिप्त रूप के रूप में उपयोग करना

ध्यान दें कि आप Python के `itemgetter` का उपयोग मैप से डेटा निकालने के लिए संक्षिप्त रूप के रूप में कर सकते हैं। आप [Python प्रलेखन](https://docs.python.org/3/library/operator.html#operator.itemgetter) में itemgetter के बारे में अधिक जानकारी प्राप्त कर सकते हैं।

नीचे दिए गए उदाहरण में, हम मैप से विशिष्ट कुंजियों को निकालने के लिए itemgetter का उपयोग करते हैं:

```python
from operator import itemgetter

from langchain_community.vectorstores import FAISS
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI, OpenAIEmbeddings

vectorstore = FAISS.from_texts(
    ["harrison worked at kensho"], embedding=OpenAIEmbeddings()
)
retriever = vectorstore.as_retriever()

template = """Answer the question based only on the following context:
{context}

Question: {question}

Answer in the following language: {language}
"""
prompt = ChatPromptTemplate.from_template(template)

chain = (
    {
        "context": itemgetter("question") | retriever,
        "question": itemgetter("question"),
        "language": itemgetter("language"),
    }
    | prompt
    | model
    | StrOutputParser()
)

chain.invoke({"question": "where did harrison work", "language": "italian"})
```

```output
'Harrison ha lavorato a Kensho.'
```

## चरणों को समानांतर करना

RunnableParallel (या RunnableMap) कई Runnables को समानांतर रूप से निष्पादित करने और इन Runnables के आउटपुट को एक मैप के रूप में लौटाने में आसान बनाता है।

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableParallel
from langchain_openai import ChatOpenAI

model = ChatOpenAI()
joke_chain = ChatPromptTemplate.from_template("tell me a joke about {topic}") | model
poem_chain = (
    ChatPromptTemplate.from_template("write a 2-line poem about {topic}") | model
)

map_chain = RunnableParallel(joke=joke_chain, poem=poem_chain)

map_chain.invoke({"topic": "bear"})
```

```output
{'joke': AIMessage(content="Why don't bears wear shoes?\n\nBecause they have bear feet!"),
 'poem': AIMessage(content="In the wild's embrace, bear roams free,\nStrength and grace, a majestic decree.")}
```

## समानांतरता

RunnableParallel स्वतंत्र प्रक्रियाओं को समानांतर रूप से चलाने के लिए भी उपयोगी हैं, क्योंकि मैप में प्रत्येक Runnable समानांतर रूप से निष्पादित किया जाता है। उदाहरण के लिए, हम अपने पहले `joke_chain`, `poem_chain` और `map_chain` देख सकते हैं जिनका रनटाइम लगभग समान है, भले ही `map_chain` अन्य दो को भी निष्पादित करता है।

```python
%%timeit

joke_chain.invoke({"topic": "bear"})
```

```output
958 ms ± 402 ms per loop (mean ± std. dev. of 7 runs, 1 loop each)
```

```python
%%timeit

poem_chain.invoke({"topic": "bear"})
```

```output
1.22 s ± 508 ms per loop (mean ± std. dev. of 7 runs, 1 loop each)
```

```python
%%timeit

map_chain.invoke({"topic": "bear"})
```

```output
1.15 s ± 119 ms per loop (mean ± std. dev. of 7 runs, 1 loop each)
```
