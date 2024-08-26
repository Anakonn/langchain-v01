---
translated: true
---

# एलएलएमचेन में मेमोरी

यह नोटबुक `LLMChain` के साथ `Memory` क्लास का उपयोग करने के बारे में बताता है।

हम [ConversationBufferMemory](https://api.python.langchain.com/en/latest/memory/langchain.memory.buffer.ConversationBufferMemory.html#langchain.memory.buffer.ConversationBufferMemory) क्लास को जोड़ेंगे, हालांकि यह कोई भी मेमोरी क्लास हो सकती है।

```python
from langchain.chains import LLMChain
from langchain.memory import ConversationBufferMemory
from langchain_core.prompts import PromptTemplate
from langchain_openai import OpenAI
```

सबसे महत्वपूर्ण कदम प्रॉम्प्ट को सही ढंग से सेट करना है। नीचे दिए गए प्रॉम्प्ट में हमारे पास दो इनपुट कुंजी हैं: एक वास्तविक इनपुट के लिए और एक मेमोरी क्लास से इनपुट के लिए। महत्वपूर्ण बात यह है कि हम सुनिश्चित करते हैं कि `PromptTemplate` और `ConversationBufferMemory` में कुंजियां मेल खाती हैं (`chat_history`)।

```python
template = """You are a chatbot having a conversation with a human.

{chat_history}
Human: {human_input}
Chatbot:"""

prompt = PromptTemplate(
    input_variables=["chat_history", "human_input"], template=template
)
memory = ConversationBufferMemory(memory_key="chat_history")
```

```python
llm = OpenAI()
llm_chain = LLMChain(
    llm=llm,
    prompt=prompt,
    verbose=True,
    memory=memory,
)
```

```python
llm_chain.predict(human_input="Hi there my friend")
```

```output


[1m> Entering new LLMChain chain...[0m
Prompt after formatting:
[32;1m[1;3mYou are a chatbot having a conversation with a human.


Human: Hi there my friend
Chatbot:[0m

[1m> Finished chain.[0m
```

```output
' Hi there! How can I help you today?'
```

```python
llm_chain.predict(human_input="Not too bad - how are you?")
```

```output


[1m> Entering new LLMChain chain...[0m
Prompt after formatting:
[32;1m[1;3mYou are a chatbot having a conversation with a human.

Human: Hi there my friend
AI:  Hi there! How can I help you today?
Human: Not too bad - how are you?
Chatbot:[0m

[1m> Finished chain.[0m
```

```output
" I'm doing great, thanks for asking! How are you doing?"
```

## चैट मॉडल-आधारित `LLMChain` में मेमोरी जोड़ना

उपरोक्त कंप्लीशन-स्टाइल `LLM`s के लिए काम करता है, लेकिन यदि आप एक चैट मॉडल का उपयोग कर रहे हैं, तो संरचित चैट संदेशों का उपयोग करके बेहतर प्रदर्शन प्राप्त कर सकते हैं। नीचे एक उदाहरण दिया गया है।

```python
from langchain_core.messages import SystemMessage
from langchain_core.prompts import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    MessagesPlaceholder,
)
from langchain_openai import ChatOpenAI
```

हम चैट प्रॉम्प्ट को सेट करने के लिए [ChatPromptTemplate](https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html?highlight=chatprompttemplate) क्लास का उपयोग करेंगे।

[from_messages](https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html#langchain_core.prompts.chat.ChatPromptTemplate.from_messages) विधि संदेशों (जैसे `SystemMessage`, `HumanMessage`, `AIMessage`, `ChatMessage` आदि) या संदेश टेम्प्लेट, जैसे [MessagesPlaceholder](https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.MessagesPlaceholder.html#langchain_core.prompts.chat.MessagesPlaceholder) से `ChatPromptTemplate` बनाती है।

नीचे दिया गया कॉन्फ़िगरेशन यह सुनिश्चित करता है कि मेमोरी को चैट प्रॉम्प्ट के बीच में `chat_history` कुंजी में इंजेक्ट किया जाएगा, और उपयोगकर्ता के इनपुट को चैट प्रॉम्प्ट के अंत में एक मानव/उपयोगकर्ता संदेश के रूप में जोड़ा जाएगा।

```python
prompt = ChatPromptTemplate.from_messages(
    [
        SystemMessage(
            content="You are a chatbot having a conversation with a human."
        ),  # The persistent system prompt
        MessagesPlaceholder(
            variable_name="chat_history"
        ),  # Where the memory will be stored.
        HumanMessagePromptTemplate.from_template(
            "{human_input}"
        ),  # Where the human input will injected
    ]
)

memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)
```

```python
llm = ChatOpenAI()

chat_llm_chain = LLMChain(
    llm=llm,
    prompt=prompt,
    verbose=True,
    memory=memory,
)
```

```python
chat_llm_chain.predict(human_input="Hi there my friend")
```

```output


[1m> Entering new LLMChain chain...[0m
Prompt after formatting:
[32;1m[1;3mSystem: You are a chatbot having a conversation with a human.
Human: Hi there my friend[0m

[1m> Finished chain.[0m
```

```output
'Hello! How can I assist you today, my friend?'
```

```python
chat_llm_chain.predict(human_input="Not too bad - how are you?")
```

```output


[1m> Entering new LLMChain chain...[0m
Prompt after formatting:
[32;1m[1;3mSystem: You are a chatbot having a conversation with a human.
Human: Hi there my friend
AI: Hello! How can I assist you today, my friend?
Human: Not too bad - how are you?[0m

[1m> Finished chain.[0m
```

```output
"I'm an AI chatbot, so I don't have feelings, but I'm here to help and chat with you! Is there something specific you would like to talk about or any questions I can assist you with?"
```
