---
translated: true
---

# SQLite

>[SQLite](https://en.wikipedia.org/wiki/SQLite) एक डेटाबेस इंजन है जो सी प्रोग्रामिंग भाषा में लिखा गया है। यह एक स्टैंडअलोन ऐप नहीं है; बल्कि, यह एक लाइब्रेरी है जिसे सॉफ्टवेयर डेवलपर्स अपने ऐप्स में एम्बेड करते हैं। इस प्रकार, यह एम्बेडेड डेटाबेस परिवार से संबंधित है। यह सबसे व्यापक रूप से तैनात डेटाबेस इंजन है, क्योंकि यह कई शीर्ष वेब ब्राउज़रों, ऑपरेटिंग सिस्टमों, मोबाइल फोनों और अन्य एम्बेडेड सिस्टमों द्वारा उपयोग किया जाता है।

इस वॉकथ्रू में हम एक सरल वार्तालाप श्रृंखला बनाएंगे जो `ConversationEntityMemory` का उपयोग करती है जो `SqliteEntityStore` द्वारा बैक किया गया है।

```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## उपयोग

स्टोरेज का उपयोग करने के लिए आपको केवल 2 चीजें प्रदान करनी होंगी:

1. सत्र आईडी - सत्र का एक अद्वितीय पहचानकर्ता, जैसे उपयोगकर्ता नाम, ईमेल, चैट आईडी आदि।
2. कनेक्शन स्ट्रिंग - एक स्ट्रिंग जो डेटाबेस कनेक्शन को निर्दिष्ट करता है। SQLite के लिए, यह स्ट्रिंग `slqlite:///` के बाद डेटाबेस फ़ाइल का नाम है। यदि वह फ़ाइल मौजूद नहीं है, तो यह बना दी जाएगी।

```python
from langchain_community.chat_message_histories import SQLChatMessageHistory

chat_message_history = SQLChatMessageHistory(
    session_id="test_session_id", connection_string="sqlite:///sqlite.db"
)

chat_message_history.add_user_message("Hello")
chat_message_history.add_ai_message("Hi")
```

```python
chat_message_history.messages
```

```output
[HumanMessage(content='Hello'), AIMessage(content='Hi')]
```

## श्रृंखलाबद्धता

हम इस संदेश इतिहास वर्ग को [LCEL Runnables](/docs/expression_language/how_to/message_history) के साथ आसानी से जोड़ सकते हैं।

ऐसा करने के लिए हम OpenAI का उपयोग करना चाहेंगे, इसलिए हमें उसे स्थापित करने की आवश्यकता है। हमें OPENAI_API_KEY पर्यावरण चर को भी अपने OpenAI कुंजी पर सेट करना होगा।

```bash
pip install -U langchain-openai

export OPENAI_API_KEY='sk-xxxxxxx'
```

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_openai import ChatOpenAI
```

```python
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful assistant."),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{question}"),
    ]
)

chain = prompt | ChatOpenAI()
```

```python
chain_with_history = RunnableWithMessageHistory(
    chain,
    lambda session_id: SQLChatMessageHistory(
        session_id=session_id, connection_string="sqlite:///sqlite.db"
    ),
    input_messages_key="question",
    history_messages_key="history",
)
```

```python
# This is where we configure the session id
config = {"configurable": {"session_id": "<SQL_SESSION_ID>"}}
```

```python
chain_with_history.invoke({"question": "Hi! I'm bob"}, config=config)
```

```output
AIMessage(content='Hello Bob! How can I assist you today?')
```

```python
chain_with_history.invoke({"question": "Whats my name"}, config=config)
```

```output
AIMessage(content='Your name is Bob! Is there anything specific you would like assistance with, Bob?')
```
