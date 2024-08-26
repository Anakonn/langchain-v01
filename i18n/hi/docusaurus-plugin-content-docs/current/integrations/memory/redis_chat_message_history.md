---
translated: true
---

# रेडिस

>[रेडिस (रिमोट डिक्शनरी सर्वर)](https://en.wikipedia.org/wiki/Redis) एक ओपन-सोर्स इन-मेमोरी स्टोरेज है, जिसका उपयोग वितरित, इन-मेमोरी कुंजी-मूल्य डेटाबेस, कैश और संदेश ब्रोकर के रूप में किया जाता है, वैकल्पिक स्थायित्व के साथ। क्योंकि यह सभी डेटा को मेमोरी में रखता है और अपने डिज़ाइन के कारण, `रेडिस` कम-लेटेंसी वाचन और लेखन प्रदान करता है, जिससे यह विशेष रूप से उन उपयोग मामलों के लिए उपयुक्त है जो एक कैश की आवश्यकता होती है। रेडिस सबसे लोकप्रिय NoSQL डेटाबेस है, और समग्र रूप से सबसे लोकप्रिय डेटाबेसों में से एक है।

यह नोटबुक चैट संदेश इतिहास को संग्रहीत करने के लिए `रेडिस` का उपयोग करने के बारे में बताता है।

## सेटअप

पहले हमें निर्भरताओं को स्थापित करना होगा, और `redis-server` जैसे कमांड का उपयोग करके एक रेडिस इंस्टेंस शुरू करना होगा।

```python
pip install -U langchain-community redis
```

```python
from langchain_community.chat_message_histories import RedisChatMessageHistory
```

## संदेश संग्रहीत और पुनर्प्राप्त करें

```python
history = RedisChatMessageHistory("foo", url="redis://localhost:6379")

history.add_user_message("hi!")

history.add_ai_message("whats up?")
```

```python
history.messages
```

```output
[HumanMessage(content='hi!'), AIMessage(content='whats up?')]
```

## श्रृंखलाओं में उपयोग करना

```python
pip install -U langchain-openai
```

```python
from typing import Optional

from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_openai import ChatOpenAI
```

```python
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You're an assistant。"),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{question}"),
    ]
)

chain = prompt | ChatOpenAI()

chain_with_history = RunnableWithMessageHistory(
    chain,
    lambda session_id: RedisChatMessageHistory(
        session_id, url="redis://localhost:6379"
    ),
    input_messages_key="question",
    history_messages_key="history",
)

config = {"configurable": {"session_id": "foo"}}

chain_with_history.invoke({"question": "Hi! I'm bob"}, config=config)

chain_with_history.invoke({"question": "Whats my name"}, config=config)
```

```output
AIMessage(content='Your name is Bob, as you mentioned earlier. Is there anything specific you would like assistance with, Bob?')
```
