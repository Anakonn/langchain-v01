---
translated: true
---

# TiDB

> [TiDB Cloud](https://tidbcloud.com/), एक व्यापक डेटाबेस-एज-ए-सर्विस (DBaaS) समाधान है, जो समर्पित और सर्वरलेस विकल्प प्रदान करता है। TiDB Serverless अब MySQL परिदृश्य में एक अंतर्निहित वेक्टर खोज को एकीकृत कर रहा है। इस सुधार के साथ, आप TiDB Serverless का उपयोग करके AI अनुप्रयोग को सुचारू रूप से विकसित कर सकते हैं, बिना नए डेटाबेस या अतिरिक्त तकनीकी स्टैक की आवश्यकता के। निजी बीटा के लिए प्रतीक्षा सूची में शामिल होकर इसका अनुभव करने वालों में से एक बनें https://tidb.cloud/ai.

यह नोटबुक बताता है कि चैट संदेश इतिहास को संग्रहीत करने के लिए TiDB का उपयोग कैसे किया जाए।

## सेटअप

पहले, हम निम्नलिखित निर्भरताओं को स्थापित करेंगे:

```python
%pip install --upgrade --quiet langchain langchain_openai
```

आपके OpenAI कुंजी को कॉन्फ़िगर करना

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("Input your OpenAI API key:")
```

अंत में, हम एक TiDB से कनेक्शन कॉन्फ़िगर करेंगे। इस नोटबुक में, हम सुरक्षित और कुशल डेटाबेस कनेक्शन स्थापित करने के लिए TiDB Cloud द्वारा प्रदान किए गए मानक कनेक्शन विधि का पालन करेंगे।

```python
# copy from tidb cloud console
tidb_connection_string_template = "mysql+pymysql://<USER>:<PASSWORD>@<HOST>:4000/<DB>?ssl_ca=/etc/ssl/cert.pem&ssl_verify_cert=true&ssl_verify_identity=true"
tidb_password = getpass.getpass("Input your TiDB password:")
tidb_connection_string = tidb_connection_string_template.replace(
    "<PASSWORD>", tidb_password
)
```

## ऐतिहासिक डेटा का उत्पादन

पिछले प्रदर्शनों के लिए आधार के रूप में कार्य करने वाले ऐतिहासिक डेटा का एक सेट बनाना।

```python
from datetime import datetime

from langchain_community.chat_message_histories import TiDBChatMessageHistory

history = TiDBChatMessageHistory(
    connection_string=tidb_connection_string,
    session_id="code_gen",
    earliest_time=datetime.utcnow(),  # Optional to set earliest_time to load messages after this time point.
)

history.add_user_message("How's our feature going?")
history.add_ai_message(
    "It's going well. We are working on testing now. It will be released in Feb."
)
```

```python
history.messages
```

```output
[HumanMessage(content="How's our feature going?"),
 AIMessage(content="It's going well. We are working on testing now. It will be released in Feb.")]
```

## ऐतिहासिक डेटा के साथ चैट करना

आइए पहले उत्पन्न किए गए ऐतिहासिक डेटा पर आगे बढ़कर एक गतिशील चैट इंटरैक्शन बनाएं।

पहले, LangChain के साथ एक चैट श्रृंखला बनाना:

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_openai import ChatOpenAI

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You're an assistant who's good at coding. You're helping a startup build",
        ),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{question}"),
    ]
)
chain = prompt | ChatOpenAI()
```

इतिहास पर एक रनएबल बनाना:

```python
from langchain_core.runnables.history import RunnableWithMessageHistory

chain_with_history = RunnableWithMessageHistory(
    chain,
    lambda session_id: TiDBChatMessageHistory(
        session_id=session_id, connection_string=tidb_connection_string
    ),
    input_messages_key="question",
    history_messages_key="history",
)
```

चैट शुरू करना:

```python
response = chain_with_history.invoke(
    {"question": "Today is Jan 1st. How many days until our feature is released?"},
    config={"configurable": {"session_id": "code_gen"}},
)
response
```

```output
AIMessage(content='There are 31 days in January, so there are 30 days until our feature is released in February.')
```

## इतिहास डेटा की जांच करना

```python
history.reload_cache()
history.messages
```

```output
[HumanMessage(content="How's our feature going?"),
 AIMessage(content="It's going well. We are working on testing now. It will be released in Feb."),
 HumanMessage(content='Today is Jan 1st. How many days until our feature is released?'),
 AIMessage(content='There are 31 days in January, so there are 30 days until our feature is released in February.')]
```
