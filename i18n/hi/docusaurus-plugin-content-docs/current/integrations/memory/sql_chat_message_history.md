---
translated: true
---

# SQL (SQLAlchemy)

>[संरचित क्वेरी भाषा (SQL)](https://en.wikipedia.org/wiki/SQL) एक डोमेन-विशिष्ट भाषा है जिसका उपयोग प्रोग्रामिंग में किया जाता है और रिलेशनल डेटाबेस प्रबंधन प्रणाली (RDBMS) में संग्रहीत डेटा को प्रबंधित करने के लिए डिज़ाइन किया गया है, या रिलेशनल डेटा स्ट्रीम प्रबंधन प्रणाली (RDSMS) में स्ट्रीम प्रोसेसिंग के लिए। यह संरचित डेटा, अर्थात् संबंधों के साथ संस्थाओं और चरों को शामिल करने वाले डेटा को संभालने में विशेष रूप से उपयोगी है।

>[SQLAlchemy](https://github.com/sqlalchemy/sqlalchemy) एक ओपन-सोर्स `SQL` टूलकिट और ऑब्जेक्ट-रिलेशनल मैपर (ORM) है जो पायथन प्रोग्रामिंग भाषा के लिए MIT लाइसेंस के तहत जारी किया गया है।

यह नोटबुक `SQLChatMessageHistory` क्लास के बारे में चर्चा करता है जो किसी भी `SQLAlchemy` द्वारा समर्थित डेटाबेस में चैट इतिहास को संग्रहीत करने की अनुमति देता है।

कृपया ध्यान दें कि `SQLite` के अलावा किसी अन्य डेटाबेस का उपयोग करने के लिए, आपको संबंधित डेटाबेस ड्राइवर को स्थापित करने की आवश्यकता होगी।

## सेटअप

एकीकरण `langchain-community` पैकेज में मौजूद है, इसलिए हमें उसे स्थापित करना होगा। हमें `SQLAlchemy` पैकेज भी स्थापित करना होगा।

```bash
pip install -U langchain-community SQLAlchemy langchain-openai
```

[LangSmith](https://smith.langchain.com/) को सेट अप करना भी (लेकिन आवश्यक नहीं) बेहतरीन अवलोकनीयता के लिए उपयोगी है।

```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## उपयोग

स्टोरेज का उपयोग करने के लिए आपको केवल 2 चीजें प्रदान करनी होंगी:

1. सत्र आईडी - सत्र का एक अद्वितीय पहचानकर्ता, जैसे उपयोगकर्ता नाम, ईमेल, चैट आईडी आदि।
2. कनेक्शन स्ट्रिंग - एक स्ट्रिंग जो डेटाबेस कनेक्शन को निर्दिष्ट करता है। यह SQLAlchemy create_engine फ़ंक्शन को पास किया जाएगा।

```python
from langchain_community.chat_message_histories import SQLChatMessageHistory

chat_message_history = SQLChatMessageHistory(
    session_id="test_session", connection_string="sqlite:///sqlite.db"
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

हम इस संदेश इतिहास क्लास को आसानी से [LCEL Runnables](/docs/expression_language/how_to/message_history) के साथ जोड़ सकते हैं।

ऐसा करने के लिए हमें OpenAI का उपयोग करना होगा, इसलिए हमें उसे स्थापित करना होगा।

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
config = {"configurable": {"session_id": "<SESSION_ID>"}}
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
