---
sidebar_position: 4
translated: true
---

# प्रति-उपयोगकर्ता पुनर्प्राप्ति

जब आप एक पुनर्प्राप्ति ऐप बना रहे हैं, तो आपको अक्सर कई उपयोगकर्ताओं को ध्यान में रखना होता है। इसका मतलब है कि आप केवल एक उपयोगकर्ता के लिए डेटा नहीं, बल्कि कई अलग-अलग उपयोगकर्ताओं के लिए डेटा भी संग्रहीत कर सकते हैं, और उन्हें एक-दूसरे के डेटा को देखने की अनुमति नहीं होनी चाहिए। इसका मतलब है कि आपको अपनी पुनर्प्राप्ति श्रृंखला को केवल कुछ जानकारी पुनर्प्राप्त करने के लिए कॉन्फ़िगर करने की क्षमता होनी चाहिए। इसमें आमतौर पर दो कदम शामिल होते हैं।

**कदम 1: सुनिश्चित करें कि आप उपयोग कर रहे रिट्रीवर कई उपयोगकर्ताओं का समर्थन करता है**

वर्तमान में, LangChain में इसके लिए कोई एकीकृत फ्लैग या फ़िल्टर नहीं है। बजाय इसके, प्रत्येक वेक्टर स्टोर और रिट्रीवर के पास अपना, और अलग-अलग नाम हो सकता है (नेमस्पेस, बहु-किराएदारी आदि)। वेक्टर स्टोर के लिए, यह आमतौर पर `similarity_search` के दौरान पारित किए जाने वाले कीवर्ड आर्गुमेंट के रूप में उजागर किया जाता है। दस्तावेज़ीकरण या सोर्स कोड को पढ़कर, पता लगाएं कि आप उपयोग कर रहे रिट्रीवर कई उपयोगकर्ताओं का समर्थन करता है, और यदि ऐसा है, तो इसका उपयोग कैसे करें।

नोट: LangChain में ऐसे रिट्रीवर के लिए बहु-उपयोगकर्ता समर्थन और/या दस्तावेज़ीकरण जोड़ना एक महान योगदान है (या दस्तावेज़ीकरण नहीं है)।

**कदम 2: उस पैरामीटर को श्रृंखला के लिए एक कॉन्फ़िगरेबल फ़ील्ड के रूप में जोड़ें**

यह आपको श्रृंखला को आसानी से कॉल करने और रन टाइम पर संबंधित फ्लैग कॉन्फ़िगर करने देगा। कॉन्फ़िगरेशन पर अधिक जानकारी के लिए [इस दस्तावेज़ीकरण](/docs/expression_language/primitives/configure) देखें।

**कदम 3: उस कॉन्फ़िगरेबल फ़ील्ड के साथ श्रृंखला को कॉल करें**

अब, रन टाइम पर आप इस श्रृंखला को कॉन्फ़िगरेबल फ़ील्ड के साथ कॉल कर सकते हैं।

## कोड उदाहरण

आइए कोड में इसका एक具体的 उदाहरण देखें। हम इसके लिए Pinecone का उपयोग करेंगे।

Pinecone को कॉन्फ़िगर करने के लिए, निम्नलिखित पर्यावरण चर सेट करें:

- `PINECONE_API_KEY`: आपका Pinecone API कुंजी

```python
from langchain_openai import OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore
```

```python
embeddings = OpenAIEmbeddings()
vectorstore = PineconeVectorStore(index_name="test-example", embedding=embeddings)

vectorstore.add_texts(["i worked at kensho"], namespace="harrison")
vectorstore.add_texts(["i worked at facebook"], namespace="ankush")
```

```output
['ce15571e-4e2f-44c9-98df-7e83f6f63095']
```

Pinecone में `namespace` kwarg का उपयोग दस्तावेजों को अलग करने के लिए किया जा सकता है।

```python
# This will only get documents for Ankush
vectorstore.as_retriever(search_kwargs={"namespace": "ankush"}).invoke(
    "where did i work?"
)
```

```output
[Document(page_content='i worked at facebook')]
```

```python
# This will only get documents for Harrison
vectorstore.as_retriever(search_kwargs={"namespace": "harrison"}).invoke(
    "where did i work?"
)
```

```output
[Document(page_content='i worked at kensho')]
```

अब हम वह श्रृंखला बना सकते हैं जिसका उपयोग हम प्रश्न-उत्तर के लिए करेंगे।

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import (
    ConfigurableField,
    RunnableBinding,
    RunnableLambda,
    RunnablePassthrough,
)
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
```

यह एक मूलभूत प्रश्न-उत्तर श्रृंखला सेटअप है।

```python
template = """Answer the question based only on the following context:
{context}
Question: {question}
"""
prompt = ChatPromptTemplate.from_template(template)

model = ChatOpenAI()

retriever = vectorstore.as_retriever()
```

यहां हम रिट्रीवर को एक कॉन्फ़िगरेबल फ़ील्ड के रूप में चिह्नित करते हैं। सभी वेक्टर स्टोर रिट्रीवर में `search_kwargs` एक फ़ील्ड है। यह केवल एक डिक्शनरी है, जिसमें वेक्टर स्टोर-विशिष्ट फ़ील्ड होते हैं।

```python
configurable_retriever = retriever.configurable_fields(
    search_kwargs=ConfigurableField(
        id="search_kwargs",
        name="Search Kwargs",
        description="The search kwargs to use",
    )
)
```

अब हम अपने कॉन्फ़िगरेबल रिट्रीवर का उपयोग करके श्रृंखला बना सकते हैं।

```python
chain = (
    {"context": configurable_retriever, "question": RunnablePassthrough()}
    | prompt
    | model
    | StrOutputParser()
)
```

अब हम कॉन्फ़िगरेबल विकल्पों के साथ श्रृंखला को कॉल कर सकते हैं। `search_kwargs` कॉन्फ़िगरेबल फ़ील्ड का आईडी है। मान Pinecone के लिए खोज kwargs है।

```python
chain.invoke(
    "where did the user work?",
    config={"configurable": {"search_kwargs": {"namespace": "harrison"}}},
)
```

```output
'The user worked at Kensho.'
```

```python
chain.invoke(
    "where did the user work?",
    config={"configurable": {"search_kwargs": {"namespace": "ankush"}}},
)
```

```output
'The user worked at Facebook.'
```

बहु-उपयोगकर्ता के लिए अन्य वेक्टर स्टोर कार्यान्वयनों के लिए, कृपया विशिष्ट पृष्ठों, जैसे [Milvus](/docs/integrations/vectorstores/milvus) देखें।
