---
translated: true
---

# हाइब्रिड खोज

LangChain में मानक खोज वेक्टर समानता द्वारा की जाती है। हालांकि, कई वेक्टर स्टोर कार्यान्वयन (Astra DB, ElasticSearch, Neo4J, AzureSearch, ...) भी वेक्टर समानता खोज और अन्य खोज तकनीकों (पूर्ण-पाठ, BM25 और इसी तरह) का संयोजन करके अधिक उन्नत खोज का समर्थन करते हैं। इसे "हाइब्रिड" खोज के रूप में संदर्भित किया जाता है।

**चरण 1: सुनिश्चित करें कि आप उपयोग कर रहे वेक्टर स्टोर में हाइब्रिड खोज का समर्थन है**

वर्तमान में, LangChain में हाइब्रिड खोज करने का एकीकृत तरीका नहीं है। प्रत्येक वेक्टर स्टोर में इसे करने का अपना तरीका हो सकता है। यह आमतौर पर `similarity_search` के दौरान पारित किए जाने वाले कीवर्ड तर्क के रूप में उजागर किया जाता है। प्रलेखन या स्रोत कोड को पढ़कर, यह पता लगाएं कि क्या आप उपयोग कर रहे वेक्टर स्टोर में हाइब्रिड खोज का समर्थन है, और यदि है, तो इसका उपयोग कैसे करें।

**चरण 2: श्रृंखला के लिए एक कॉन्फ़िगरेशन फ़ील्ड के रूप में उस पैरामीटर को जोड़ें**

यह आपको श्रृंखला को आसानी से कॉल करने और रन टाइम पर संबंधित फ्लैग को कॉन्फ़िगर करने देगा। कॉन्फ़िगरेशन पर अधिक जानकारी के लिए [इस प्रलेखन](/docs/expression_language/primitives/configure) देखें।

**चरण 3: कॉन्फ़िगरेबल फ़ील्ड के साथ श्रृंखला को कॉल करें**

अब, रन टाइम पर आप इस श्रृंखला को कॉन्फ़िगरेबल फ़ील्ड के साथ कॉल कर सकते हैं।

## कोड उदाहरण

आइए कोड में इसका एक具体的 उदाहरण देखें। हम इस उदाहरण में Astra DB के Cassandra/CQL इंटरफ़ेस का उपयोग करेंगे।

निम्नलिखित Python पैकेज इंस्टॉल करें:

```python
!pip install "cassio>=0.1.7"
```

[कनेक्शन गोपनीयता](https://docs.datastax.com/en/astra/astra-db-vector/get-started/quickstart.html) प्राप्त करें।

cassio को इनिशियलाइज़ करें:

```python
import cassio

cassio.init(
    database_id="Your database ID",
    token="Your application token",
    keyspace="Your key space",
)
```

एक मानक [इंडेक्स एनालाइज़र](https://docs.datastax.com/en/astra/astra-db-vector/cql/use-analyzers-with-cql.html) के साथ Cassandra VectorStore बनाएं। इंडेक्स एनालाइज़र को पदों की मैचिंग सक्षम करने के लिए आवश्यक है।

```python
from cassio.table.cql import STANDARD_ANALYZER
from langchain_community.vectorstores import Cassandra
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings()
vectorstore = Cassandra(
    embedding=embeddings,
    table_name="test_hybrid",
    body_index_options=[STANDARD_ANALYZER],
    session=None,
    keyspace=None,
)

vectorstore.add_texts(
    [
        "In 2023, I visited Paris",
        "In 2022, I visited New York",
        "In 2021, I visited New Orleans",
    ]
)
```

यदि हम एक मानक समानता खोज करते हैं, तो हम सभी दस्तावेज़ प्राप्त करते हैं:

```python
vectorstore.as_retriever().invoke("What city did I visit last?")
```

```output
[Document(page_content='In 2022, I visited New York'),
Document(page_content='In 2023, I visited Paris'),
Document(page_content='In 2021, I visited New Orleans')]
```

Astra DB वेक्टर स्टोर `body_search` तर्क का उपयोग पद `new` पर फ़िल्टर करने के लिए किया जा सकता है।

```python
vectorstore.as_retriever(search_kwargs={"body_search": "new"}).invoke(
    "What city did I visit last?"
)
```

```output
[Document(page_content='In 2022, I visited New York'),
Document(page_content='In 2021, I visited New Orleans')]
```

अब हम वह श्रृंखला बनाएंगे जिसका उपयोग हम प्रश्न-उत्तर के लिए करेंगे

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import (
    ConfigurableField,
    RunnablePassthrough,
)
from langchain_openai import ChatOpenAI
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

यहां हम रिट्रीवर को एक कॉन्फ़िगरेबल फ़ील्ड के रूप में चिह्नित करते हैं। सभी वेक्टर स्टोर रिट्रीवर में `search_kwargs` एक फ़ील्ड है। यह एक डिक्शनरी है, जिसमें वेक्टर स्टोर विशिष्ट फ़ील्ड होते हैं।

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

```python
chain.invoke("What city did I visit last?")
```

```output
Paris
```

अब हम कॉन्फ़िगरेबल विकल्पों के साथ श्रृंखला को कॉल कर सकते हैं। `search_kwargs` कॉन्फ़िगरेबल फ़ील्ड का आईडी है। मान Astra DB के लिए खोज kwargs है।

```python
chain.invoke(
    "What city did I visit last?",
    config={"configurable": {"search_kwargs": {"body_search": "new"}}},
)
```

```output
New York
```
