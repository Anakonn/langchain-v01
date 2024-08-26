---
translated: true
---

# स्ट्रीमलिट

>[स्ट्रीमलिट](https://docs.streamlit.io/) एक ओपन-सोर्स पायथन लाइब्रेरी है जो मशीन लर्निंग और डेटा विज्ञान के लिए सुंदर, कस्टम वेब ऐप बनाने और साझा करने में आसान बनाती है।

यह नोटबुक स्ट्रीमलिट ऐप में चैट संदेश इतिहास को कैसे संग्रहित और उपयोग करें, इस बारे में बताता है। `StreamlitChatMessageHistory` [स्ट्रीमलिट सत्र स्थिति](https://docs.streamlit.io/library/api-reference/session-state) में निर्दिष्ट `key=` पर संदेशों को संग्रहित करेगा। डिफ़ॉल्ट कुंजी `"langchain_messages"` है।

- ध्यान दें, `StreamlitChatMessageHistory` केवल तब काम करता है जब एक स्ट्रीमलिट ऐप में चलाया जाता है।
- आप [StreamlitCallbackHandler](/docs/integrations/callbacks/streamlit) के बारे में भी रुचि रख सकते हैं जो LangChain के लिए है।
- स्ट्रीमलिट के बारे में अधिक जानने के लिए उनकी [शुरू करने की दस्तावेज़ीकरण](https://docs.streamlit.io/library/get-started) देखें।

एकीकरण `langchain-community` पैकेज में मौजूद है, इसलिए हमें उसे स्थापित करना होगा। हमें `streamlit` भी स्थापित करना होगा।

```bash
pip install -U langchain-community streamlit
```

आप [यहां](https://langchain-st-memory.streamlit.app/) चल रहे पूर्ण ऐप उदाहरण और [github.com/langchain-ai/streamlit-agent](https://github.com/langchain-ai/streamlit-agent) में अधिक उदाहरण देख सकते हैं।

```python
from langchain_community.chat_message_histories import (
    StreamlitChatMessageHistory,
)

history = StreamlitChatMessageHistory(key="chat_messages")

history.add_user_message("hi!")
history.add_ai_message("whats up?")
```

```python
history.messages
```

हम इस संदेश इतिहास वर्ग को [LCEL Runnables](/docs/expression_language/how_to/message_history) के साथ आसानी से जोड़ सकते हैं।

इतिहास स्ट्रीमलिट ऐप के एक दिए गए उपयोगकर्ता सत्र में पुनः चलाने के दौरान बरकरार रहेगा। एक दिया गया `StreamlitChatMessageHistory` उपयोगकर्ता सत्रों के बीच बरकरार या साझा नहीं रहेगा।

```python
# Optionally, specify your own session_state key for storing messages
msgs = StreamlitChatMessageHistory(key="special_app_key")

if len(msgs.messages) == 0:
    msgs.add_ai_message("How can I help you?")
```

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_openai import ChatOpenAI

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are an AI chatbot having a conversation with a human."),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{question}"),
    ]
)

chain = prompt | ChatOpenAI()
```

```python
chain_with_history = RunnableWithMessageHistory(
    chain,
    lambda session_id: msgs,  # Always return the instance created earlier
    input_messages_key="question",
    history_messages_key="history",
)
```

वार्तालाप स्ट्रीमलिट ऐप्स अक्सर प्रत्येक पूर्व चैट संदेश को प्रत्येक पुनः चलाने पर पुनः खींचेंगे। `StreamlitChatMessageHistory.messages` में दोहराव करके यह आसान है:

```python
import streamlit as st

for msg in msgs.messages:
    st.chat_message(msg.type).write(msg.content)

if prompt := st.chat_input():
    st.chat_message("human").write(prompt)

    # As usual, new messages are added to StreamlitChatMessageHistory when the Chain is called.
    config = {"configurable": {"session_id": "any"}}
    response = chain_with_history.invoke({"question": prompt}, config)
    st.chat_message("ai").write(response.content)
```

**[अंतिम ऐप देखें](https://langchain-st-memory.streamlit.app/)।**
