---
keywords:
- RunnablePassthrough
- LCEL
sidebar_position: 5
title: 'पारगमन: इनपुट को पास करें'
translated: true
---

# डेटा को पारगमन करना

RunnablePassthrough अकेले में आपको इनपुट को बदलाव के बिना पास करने देता है। यह आमतौर पर RunnableParallel के साथ उपयोग किया जाता है ताकि डेटा को नए कुंजी में पास किया जा सके।

नीचे दिए गए उदाहरण देखें:

```python
%pip install --upgrade --quiet  langchain langchain-openai
```

```python
from langchain_core.runnables import RunnableParallel, RunnablePassthrough

runnable = RunnableParallel(
    passed=RunnablePassthrough(),
    modified=lambda x: x["num"] + 1,
)

runnable.invoke({"num": 1})
```

```output
{'passed': {'num': 1}, 'extra': {'num': 1, 'mult': 3}, 'modified': 2}
```

ऊपर दिखाए गए तरीके से, `passed` कुंजी को `RunnablePassthrough()` के साथ कॉल किया गया था, इसलिए यह सिर्फ `{'num': 1}` को पास कर दिया।

हमने `modified` के साथ मैप में एक दूसरी कुंजी भी सेट की। यह एक लैम्बडा का उपयोग करता है जो num में 1 जोड़कर एक मूल्य सेट करता है, जिसके परिणामस्वरूप `modified` कुंजी में मूल्य 2 हो गया।

## पुनर्प्राप्ति उदाहरण

नीचे दिए गए उदाहरण में, हम `RunnablePassthrough` का उपयोग `RunnableParallel` के साथ देखते हैं।

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

यहां प्रॉम्प्ट के लिए इनपुट एक मैप होने की उम्मीद है जिसमें "context" और "question" कुंजियां हैं। उपयोगकर्ता का इनपुट केवल प्रश्न है। इसलिए हमें अपने पुनर्प्राप्तकर्ता का उपयोग करके संदर्भ प्राप्त करना है और उपयोगकर्ता के इनपुट को "question" कुंजी के तहत पारगमन करना है। इस मामले में, RunnablePassthrough हमें उपयोगकर्ता के प्रश्न को प्रॉम्प्ट और मॉडल तक पहुंचाने देता है।
