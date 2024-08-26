---
keywords:
- RunnablePassthrough
- assign
- LCEL
sidebar_position: 6
title: 'असाइन: स्टेट में मूल्य जोड़ें'
translated: true
---

# स्टेट में मूल्य जोड़ना

`RunnablePassthrough.assign(...)` स्टेटिक मेथड इनपुट मूल्य लेता है और असाइन फ़ंक्शन में पास किए गए अतिरिक्त तर्कों को जोड़ता है।

यह उपयोगी है जब एक बाद के चरण के लिए इनपुट के रूप में उपयोग करने के लिए एक डिक्शनरी को संचयी रूप से बनाने की आवश्यकता होती है, जो एक सामान्य LCEL पैटर्न है।

यहाँ एक उदाहरण है:

```python
%pip install --upgrade --quiet langchain langchain-openai
```

```output
[33mWARNING: You are using pip version 22.0.4; however, version 24.0 is available.
You should consider upgrading via the '/Users/jacoblee/.pyenv/versions/3.10.5/bin/python -m pip install --upgrade pip' command.[0m[33m
[0mNote: you may need to restart the kernel to use updated packages.
```

```python
from langchain_core.runnables import RunnableParallel, RunnablePassthrough

runnable = RunnableParallel(
    extra=RunnablePassthrough.assign(mult=lambda x: x["num"] * 3),
    modified=lambda x: x["num"] + 1,
)

runnable.invoke({"num": 1})
```

```output
{'extra': {'num': 1, 'mult': 3}, 'modified': 2}
```

यहाँ क्या हो रहा है, इसे समझते हैं।

- श्रृंखला का इनपुट `{"num": 1}` है। यह एक `RunnableParallel` में पास किया जाता है, जो उस इनपुट के साथ समानांतर रूप से चलाई जाने वाली रनेबल्स को कॉल करता है।
- `extra` कुंजी के तहत मूल्य कॉल किया जाता है। `RunnablePassthrough.assign()` मूल कुंजियों (`{"num": 1}`) को बरकरार रखता है और `mult` नामक एक नई कुंजी असाइन करता है। मूल्य `lambda x: x["num"] * 3)` है, जो `3` है। इस प्रकार, परिणाम `{"num": 1, "mult": 3}` है।
- `{"num": 1, "mult": 3}` को `RunnableParallel` कॉल को वापस भेजा जाता है और `extra` कुंजी के मूल्य के रूप में सेट किया जाता है।
- इसी समय, `modified` कुंजी कॉल की जाती है। परिणाम `2` है, क्योंकि लैम्बडा अपने इनपुट से `"num"` कुंजी निकालता है और एक जोड़ता है।

इस प्रकार, परिणाम `{'extra': {'num': 1, 'mult': 3}, 'modified': 2}` है।

## स्ट्रीमिंग

इस मेथड का एक अच्छा फ़ीचर यह है कि यह मूल्यों को तुरंत उपलब्ध होने पर पास करने की अनुमति देता है। इसे दिखाने के लिए, हम एक पुनर्प्राप्ति श्रृंखला में `RunnablePassthrough.assign()` का उपयोग करेंगे:

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

generation_chain = prompt | model | StrOutputParser()

retrieval_chain = {
    "context": retriever,
    "question": RunnablePassthrough(),
} | RunnablePassthrough.assign(output=generation_chain)

stream = retrieval_chain.stream("where did harrison work?")

for chunk in stream:
    print(chunk)
```

```output
{'question': 'where did harrison work?'}
{'context': [Document(page_content='harrison worked at kensho')]}
{'output': ''}
{'output': 'H'}
{'output': 'arrison'}
{'output': ' worked'}
{'output': ' at'}
{'output': ' Kens'}
{'output': 'ho'}
{'output': '.'}
{'output': ''}
```

हम देख सकते हैं कि पहला चंक मूल `"question"` को संदर्भित करता है, क्योंकि वह तुरंत उपलब्ध है। दूसरा चंक `"context"` को संदर्भित करता है, क्योंकि रिट्रीवर दूसरे स्थान पर समाप्त होता है। अंत में, `generation_chain` से आउटपुट तुरंत उपलब्ध होने के साथ-साथ चंकों में स्ट्रीम होता है।
