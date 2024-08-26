---
translated: true
---

# MongoDB

>`MongoDB` एक स्रोत-उपलब्ध क्रॉस-प्लेटफॉर्म दस्तावेज़-उन्मुख डेटाबेस कार्यक्रम है। `NoSQL` डेटाबेस कार्यक्रम के रूप में वर्गीकृत, `MongoDB` `JSON`-जैसे दस्तावेज़ों का उपयोग करता है जिनमें वैकल्पिक स्कीमा होती है।

>`MongoDB` MongoDB Inc. द्वारा विकसित किया गया है और सर्वर साइड पब्लिक लाइसेंस (SSPL) के तहत लाइसेंस प्राप्त है। - [विकिपीडिया](https://en.wikipedia.org/wiki/MongoDB)

यह नोटबुक `MongoDBChatMessageHistory` क्लास का उपयोग करके चैट संदेश इतिहास को एक Mongodb डेटाबेस में कैसे संग्रहित करें, इस बारे में चर्चा करता है।

## सेटअप

एकीकरण `langchain-mongodb` पैकेज में मौजूद है, इसलिए हमें उसे स्थापित करना होगा।

```bash
pip install -U --quiet langchain-mongodb
```

[LangSmith](https://smith.langchain.com/) को सेट करना भी (लेकिन आवश्यक नहीं) उत्कृष्ट अवलोकनीयता के लिए उपयोगी है।

```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## उपयोग

स्टोरेज का उपयोग करने के लिए आपको केवल 2 चीजें प्रदान करनी होंगी:

1. सत्र आईडी - सत्र का एक अद्वितीय पहचानकर्ता, जैसे उपयोगकर्ता नाम, ईमेल, चैट आईडी आदि।
2. कनेक्शन स्ट्रिंग - डेटाबेस कनेक्शन को निर्दिष्ट करने वाली एक स्ट्रिंग। यह MongoDB create_engine फ़ंक्शन में पारित किया जाएगा।

यदि आप चैट इतिहास को कहां जाना चाहते हैं, उसे अनुकूलित करना चाहते हैं, तो आप निम्नलिखित भी पास कर सकते हैं:
1. *database_name* - उपयोग करने के लिए डेटाबेस का नाम
1. *collection_name* - उस डेटाबेस में उपयोग करने के लिए संग्रह

```python
from langchain_mongodb.chat_message_histories import MongoDBChatMessageHistory

chat_message_history = MongoDBChatMessageHistory(
    session_id="test_session",
    connection_string="mongodb://mongo_user:password123@mongo:27017",
    database_name="my_db",
    collection_name="chat_histories",
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

## श्रृंखला

हम इस संदेश इतिहास वर्ग को आसानी से [LCEL Runnables](/docs/expression_language/how_to/message_history) के साथ जोड़ सकते हैं।

ऐसा करने के लिए हम OpenAI का उपयोग करना चाहेंगे, इसलिए हमें उसे स्थापित करना होगा। आपको OPENAI_API_KEY पर्यावरण चर को भी अपने OpenAI कुंजी के साथ सेट करना होगा।

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_openai import ChatOpenAI
```

```python
import os

assert os.environ[
    "OPENAI_API_KEY"
], "Set the OPENAI_API_KEY environment variable with your OpenAI API key."
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
    lambda session_id: MongoDBChatMessageHistory(
        session_id=session_id,
        connection_string="mongodb://mongo_user:password123@mongo:27017",
        database_name="my_db",
        collection_name="chat_histories",
    ),
    input_messages_key="question",
    history_messages_key="history",
)
```

```python
# This is where we configure the session id
config = {"configurable": {"session_id": "<SESSION_ID>"}}
```

```python
chain_with_history.invoke({"question": "Hi! I'm bob"}, config=config)
```

```output
AIMessage(content='Hi Bob! How can I assist you today?')
```

```python
chain_with_history.invoke({"question": "Whats my name"}, config=config)
```

```output
AIMessage(content='Your name is Bob. Is there anything else I can help you with, Bob?')
```
