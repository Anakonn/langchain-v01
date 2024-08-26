---
translated: true
---

# Xata

>[Xata](https://xata.io) एक सर्वरलेस डेटा प्लेटफॉर्म है, जो `PostgreSQL` और `Elasticsearch` पर आधारित है। यह आपके डेटाबेस के साथ इंटरैक्ट करने के लिए एक Python SDK और अपने डेटा को प्रबंधित करने के लिए एक UI प्रदान करता है। `XataChatMessageHistory` क्लास के साथ, आप चैट सत्रों के दीर्घकालिक संरक्षण के लिए Xata डेटाबेस का उपयोग कर सकते हैं।

यह नोटबुक कवर करता है:

* `XataChatMessageHistory` क्या करता है, इसका एक सरल उदाहरण।
* एक अधिक जटिल उदाहरण जिसमें एक REACT एजेंट का उपयोग किया जाता है जो ज्ञान आधारित या दस्तावेज़ीकरण (Xata में एक वेक्टर स्टोर के रूप में संग्रहीत) पर आधारित प्रश्नों का उत्तर देता है और साथ ही अपने पिछले संदेशों (Xata में एक मेमोरी स्टोर के रूप में संग्रहीत) का दीर्घकालिक खोजयोग्य इतिहास भी रखता है।

## सेटअप

### एक डेटाबेस बनाएं

[Xata UI](https://app.xata.io) में एक नया डेटाबेस बनाएं। आप इसे जो भी नाम देना चाहते हैं, इस नोटपैड में हम `langchain` का उपयोग करेंगे। Langchain एकीकरण स्वचालित रूप से मेमोरी को संग्रहीत करने के लिए उपयोग किए जाने वाले तालिका को बना सकता है, और यही है जिसका हम इस उदाहरण में उपयोग करेंगे। यदि आप तालिका को पहले से ही बनाना चाहते हैं, तो सुनिश्चित करें कि इसका सही स्कीमा है और `create_table` को `False` पर सेट करें जब आप वर्ग बना रहे हों। पूर्व-निर्मित तालिका प्रत्येक सत्र प्रारंभीकरण के दौरान एक राउंड-ट्रिप को बचाता है।

पहले आइए हमारी निर्भरताओं को स्थापित करें:

```python
%pip install --upgrade --quiet  xata langchain-openai langchain
```

अब, हमें Xata के लिए पर्यावरण चर प्राप्त करने की आवश्यकता है। आप [खाता सेटिंग्स](https://app.xata.io/settings) पर जाकर एक नया API कुंजी बना सकते हैं। डेटाबेस URL को खोजने के लिए, आप द्वारा बनाए गए डेटाबेस के सेटिंग पृष्ठ पर जाएं। डेटाबेस URL इस प्रकार दिखना चाहिए: `https://demo-uni3q8.eu-west-1.xata.sh/db/langchain`।

```python
import getpass

api_key = getpass.getpass("Xata API key: ")
db_url = input("Xata database URL (copy it from your DB settings):")
```

## एक सरल मेमोरी स्टोर बनाएं

मेमोरी स्टोर कार्यक्षमता को अलग से परीक्षण करने के लिए, आइए निम्नलिखित कोड स्निपेट का उपयोग करें:

```python
from langchain_community.chat_message_histories import XataChatMessageHistory

history = XataChatMessageHistory(
    session_id="session-1", api_key=api_key, db_url=db_url, table_name="memory"
)

history.add_user_message("hi!")

history.add_ai_message("whats up?")
```

उपरोक्त कोड `session-1` ID के साथ एक सत्र बनाता है और इसमें दो संदेश संग्रहीत करता है। उपरोक्त को चलाने के बाद, यदि आप Xata UI पर जाते हैं, तो आपको `memory` नामक एक तालिका और उसमें जोड़े गए दो संदेश दिखाई देने चाहिए।

आप निम्नलिखित कोड के साथ किसी विशिष्ट सत्र के संदेश इतिहास को पुनः प्राप्त कर सकते हैं:

```python
history.messages
```

## अपने डेटा पर वार्तालाप Q&A श्रृंखला के साथ मेमोरी

अब आइए एक अधिक जटिल उदाहरण देखें जिसमें हम OpenAI, Xata Vector Store एकीकरण और Xata मेमोरी स्टोर एकीकरण को एक साथ मिलाकर अपने डेटा पर एक Q&A चैटबोट बनाते हैं, जिसमें फॉलो-अप प्रश्न और इतिहास होता है।

हमें OpenAI API का उपयोग करने की आवश्यकता होगी, इसलिए आइए API कुंजी कॉन्फ़िगर करें:

```python
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

चैटबॉट द्वारा खोज के लिए उपयोग किए जाने वाले दस्तावेजों को संग्रहीत करने के लिए, Xata UI का उपयोग करके अपने `langchain` डेटाबेस में एक `docs` नामक तालिका जोड़ें और निम्नलिखित स्तंभ जोड़ें:

* `content` टाइप "Text"। यह `Document.pageContent` मान को संग्रहीत करने के लिए उपयोग किया जाता है।
* `embedding` टाइप "Vector"। आप द्वारा उपयोग किए जाने वाले मॉडल द्वारा उपयोग की जाने वाली आयाम का उपयोग करें। इस नोटबुक में हम OpenAI एम्बेडिंग का उपयोग करते हैं, जिनमें 1536 आयाम होते हैं।

आइए वेक्टर स्टोर बनाएं और कुछ नमूना दस्तावेज़ इसमें जोड़ें:

```python
from langchain_community.vectorstores.xata import XataVectorStore
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings()

texts = [
    "Xata is a Serverless Data platform based on PostgreSQL",
    "Xata offers a built-in vector type that can be used to store and query vectors",
    "Xata includes similarity search",
]

vector_store = XataVectorStore.from_texts(
    texts, embeddings, api_key=api_key, db_url=db_url, table_name="docs"
)
```

उपरोक्त कमांड चलाने के बाद, यदि आप Xata UI पर जाते हैं, तो आपको `docs` तालिका में दस्तावेज़ और उनके एम्बेडिंग लोड होते हुए दिखाई देने चाहिए।

अब आइए एक ConversationBufferMemory बनाते हैं जो उपयोगकर्ता और AI दोनों के चैट संदेशों को संग्रहीत करेगा।

```python
from uuid import uuid4

from langchain.memory import ConversationBufferMemory

chat_memory = XataChatMessageHistory(
    session_id=str(uuid4()),  # needs to be unique per user session
    api_key=api_key,
    db_url=db_url,
    table_name="memory",
)
memory = ConversationBufferMemory(
    memory_key="chat_history", chat_memory=chat_memory, return_messages=True
)
```

अब एक एजेंट बनाने का समय है जो दोनों वेक्टर स्टोर और चैट मेमोरी का उपयोग एक साथ करेगा।

```python
from langchain.agents import AgentType, initialize_agent
from langchain.agents.agent_toolkits import create_retriever_tool
from langchain_openai import ChatOpenAI

tool = create_retriever_tool(
    vector_store.as_retriever(),
    "search_docs",
    "Searches and returns documents from the Xata manual. Useful when you need to answer questions about Xata.",
)
tools = [tool]

llm = ChatOpenAI(temperature=0)

agent = initialize_agent(
    tools,
    llm,
    agent=AgentType.CHAT_CONVERSATIONAL_REACT_DESCRIPTION,
    verbose=True,
    memory=memory,
)
```

परीक्षण करने के लिए, आइए एजेंट को हमारा नाम बताते हैं:

```python
agent.run(input="My name is bob")
```

अब, आइए एजेंट से Xata के बारे में कुछ प्रश्न पूछें:

```python
agent.run(input="What is xata?")
```

ध्यान दें कि यह दस्तावेज़ स्टोर में संग्रहीत डेटा के आधार पर उत्तर देता है। और अब, आइए एक फॉलो-अप प्रश्न पूछें:

```python
agent.run(input="Does it support similarity search?")
```

और अब इसकी मेमोरी का परीक्षण करें:

```python
agent.run(input="Did I tell you my name? What is it?")
```
