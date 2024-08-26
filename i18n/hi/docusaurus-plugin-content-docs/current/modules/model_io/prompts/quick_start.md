---
sidebar_position: 0
title: त्वरित संदर्भ
translated: true
---

# त्वरित संदर्भ

प्रॉम्प्ट टेम्प्लेट भाषा मॉडलों के लिए प्रॉम्प्ट जनरेट करने के लिए पूर्व-परिभाषित रेसिपी हैं।

एक टेम्प्लेट में निर्देश, कुछ उदाहरण और दिए गए कार्य के लिए उपयुक्त विशिष्ट संदर्भ और प्रश्न शामिल हो सकते हैं।

LangChain मॉडल-निरपेक्ष टेम्प्लेट बनाने और उनके साथ काम करने के लिए उपकरण प्रदान करता है।

LangChain विभिन्न भाषा मॉडलों में मौजूदा टेम्प्लेट को पुनः उपयोग करने में आसान बनाने के लिए प्रयास करता है।

आमतौर पर, भाषा मॉडल या तो स्ट्रिंग या चैट संदेशों की सूची के रूप में प्रॉम्प्ट की उम्मीद करते हैं।

## `PromptTemplate`

स्ट्रिंग प्रॉम्प्ट के लिए एक टेम्प्लेट बनाने के लिए `PromptTemplate` का उपयोग करें।

डिफ़ॉल्ट रूप से, `PromptTemplate` टेम्प्लेटिंग के लिए [Python's str.format](https://docs.python.org/3/library/stdtypes.html#str.format) शैली का उपयोग करता है।

```python
from langchain_core.prompts import PromptTemplate

prompt_template = PromptTemplate.from_template(
    "Tell me a {adjective} joke about {content}."
)
prompt_template.format(adjective="funny", content="chickens")
```

```output
'Tell me a funny joke about chickens.'
```

टेम्प्लेट में कोई भी संख्या में चर समर्थित हैं, जिसमें कोई चर नहीं भी हो सकते हैं:

```python
from langchain_core.prompts import PromptTemplate

prompt_template = PromptTemplate.from_template("Tell me a joke")
prompt_template.format()
```

```output
'Tell me a joke'
```

आप अपनी पसंद के अनुसार प्रॉम्प्ट को फ़ॉर्मेट करने वाले कस्टम प्रॉम्प्ट टेम्प्लेट बना सकते हैं।
अधिक जानकारी के लिए, [प्रॉम्प्ट टेम्प्लेट संयोजन](/docs/modules/model_io/prompts/composition/) देखें।

## `ChatPromptTemplate`

[चैट मॉडल](/docs/modules/model_io/chat)/ के लिए प्रॉम्प्ट [चैट संदेशों](/docs/modules/model_io/chat/message_types/)की एक सूची है।

प्रत्येक चैट संदेश में सामग्री और एक अतिरिक्त पैरामीटर 'role' शामिल होता है।
उदाहरण के लिए, OpenAI [चैट पूर्णता API](https://platform.openai.com/docs/guides/chat/introduction) में, एक चैट संदेश को एक AI सहायक, एक मानव या एक सिस्टम भूमिका से जोड़ा जा सकता है।

इस तरह एक चैट प्रॉम्प्ट टेम्प्लेट बनाएं:

```python
from langchain_core.prompts import ChatPromptTemplate

chat_template = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful AI bot. Your name is {name}."),
        ("human", "Hello, how are you doing?"),
        ("ai", "I'm doing well, thanks!"),
        ("human", "{user_input}"),
    ]
)

messages = chat_template.format_messages(name="Bob", user_input="What is your name?")
```

इन प्रारूपित संदेशों को LangChain के `ChatOpenAI` चैट मॉडल क्लास में पाइप करना, OpenAI क्लाइंट का सीधा उपयोग करने के लगभग समकक्ष है:

```python
%pip install openai
```

```python
from openai import OpenAI

client = OpenAI()

response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[
        {"role": "system", "content": "You are a helpful AI bot. Your name is Bob."},
        {"role": "user", "content": "Hello, how are you doing?"},
        {"role": "assistant", "content": "I'm doing well, thanks!"},
        {"role": "user", "content": "What is your name?"},
    ],
)
```

`ChatPromptTemplate.from_messages` स्टैटिक विधि संदेश प्रतिनिधित्व के विभिन्न प्रकारों को स्वीकार करती है और चैट मॉडलों के लिए इनपुट को बनाने का एक सुविधाजनक तरीका है।

उदाहरण के लिए, ऊपर उपयोग किए गए (प्रकार, सामग्री) के 2-ट्यूपल प्रतिनिधित्व के अलावा, आप `MessagePromptTemplate` या `BaseMessage` के एक उदाहरण भी पास कर सकते हैं।

```python
from langchain_core.messages import SystemMessage
from langchain_core.prompts import HumanMessagePromptTemplate

chat_template = ChatPromptTemplate.from_messages(
    [
        SystemMessage(
            content=(
                "You are a helpful assistant that re-writes the user's text to "
                "sound more upbeat."
            )
        ),
        HumanMessagePromptTemplate.from_template("{text}"),
    ]
)
messages = chat_template.format_messages(text="I don't like eating tasty things")
print(messages)
```

```output
[SystemMessage(content="You are a helpful assistant that re-writes the user's text to sound more upbeat."), HumanMessage(content="I don't like eating tasty things")]
```

यह आपको अपने चैट प्रॉम्प्ट को बनाने में काफी लचीलापन प्रदान करता है।

## संदेश प्रॉम्प्ट

LangChain विभिन्न प्रकार के `MessagePromptTemplate` प्रदान करता है। सबसे आम उपयोग किए जाने वाले `AIMessagePromptTemplate`, `SystemMessagePromptTemplate` और `HumanMessagePromptTemplate` हैं, जो क्रमशः एक AI संदेश, एक सिस्टम संदेश और एक मानव संदेश बनाते हैं। आप [संदेशों के विभिन्न प्रकारों के बारे में यहाँ](/docs/modules/model_io/chat/message_types) और पढ़ सकते हैं।

मामलों में जहां चैट मॉडल किसी भी भूमिका के साथ चैट संदेश लेने का समर्थन करता है, आप `ChatMessagePromptTemplate` का उपयोग कर सकते हैं, जो उपयोगकर्ता को भूमिका नाम निर्दिष्ट करने की अनुमति देता है।

```python
from langchain_core.prompts import ChatMessagePromptTemplate

prompt = "May the {subject} be with you"

chat_message_prompt = ChatMessagePromptTemplate.from_template(
    role="Jedi", template=prompt
)
chat_message_prompt.format(subject="force")
```

```output
ChatMessage(content='May the force be with you', role='Jedi')
```

## `MessagesPlaceholder`

LangChain `MessagesPlaceholder` भी प्रदान करता है, जो आपको प्रारूपण के दौरान प्रदर्शित किए जाने वाले संदेशों पर पूर्ण नियंत्रण देता है। यह तब उपयोगी हो सकता है जब आप अपने संदेश प्रॉम्प्ट टेम्प्लेट के लिए कौन सी भूमिका का उपयोग करना चाहते हैं या जब आप प्रारूपण के दौरान एक संदेशों की सूची डालना चाहते हैं।

```python
from langchain_core.prompts import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    MessagesPlaceholder,
)

human_prompt = "Summarize our conversation so far in {word_count} words."
human_message_template = HumanMessagePromptTemplate.from_template(human_prompt)

chat_prompt = ChatPromptTemplate.from_messages(
    [MessagesPlaceholder(variable_name="conversation"), human_message_template]
)
```

```python
from langchain_core.messages import AIMessage, HumanMessage

human_message = HumanMessage(content="What is the best way to learn programming?")
ai_message = AIMessage(
    content="""\
1. Choose a programming language: Decide on a programming language that you want to learn.

2. Start with the basics: Familiarize yourself with the basic programming concepts such as variables, data types and control structures.

3. Practice, practice, practice: The best way to learn programming is through hands-on experience\
"""
)

chat_prompt.format_prompt(
    conversation=[human_message, ai_message], word_count="10"
).to_messages()
```

```output
[HumanMessage(content='What is the best way to learn programming?'),
 AIMessage(content='1. Choose a programming language: Decide on a programming language that you want to learn.\n\n2. Start with the basics: Familiarize yourself with the basic programming concepts such as variables, data types and control structures.\n\n3. Practice, practice, practice: The best way to learn programming is through hands-on experience'),
 HumanMessage(content='Summarize our conversation so far in 10 words.')]
```

संदेश प्रॉम्प्ट टेम्प्लेट के प्रकारों की पूरी सूची में शामिल हैं:

* [AIMessagePromptTemplate](https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.AIMessagePromptTemplate.html), AI सहायक संदेशों के लिए;
* [SystemMessagePromptTemplate](https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.SystemMessagePromptTemplate.html), सिस्टम संदेशों के लिए;
* [HumanMessagePromptTemplate](https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.HumanMessagePromptTemplate.html), उपयोगकर्ता संदेशों के लिए;
* [ChatMessagePromptTemplate](https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.ChatMessagePromptTemplate.html), अनिर्दिष्ट भूमिकाओं के संदेशों के लिए;
* [MessagesPlaceholder](https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.MessagesPlaceholder.html), जो संदेशों की एक सूची समायोजित करता है।

## LCEL

`PromptTemplate` और `ChatPromptTemplate` [Runnable इंटरफ़ेस](/docs/expression_language/interface) को लागू करते हैं, जो [LangChain Expression Language (LCEL)](/docs/expression_language/) का मूल बिंदु है। इसका मतलब है कि वे `invoke`, `ainvoke`, `stream`, `astream`, `batch`, `abatch`, `astream_log` कॉल का समर्थन करते हैं।

`PromptTemplate` एक डिक्शनरी (प्रॉम्प्ट चरों का) स्वीकार करता है और एक `StringPromptValue` लौटाता है। एक `ChatPromptTemplate` एक डिक्शनरी स्वीकार करता है और एक `ChatPromptValue` लौटाता है।

```python
prompt_template = PromptTemplate.from_template(
    "Tell me a {adjective} joke about {content}."
)

prompt_val = prompt_template.invoke({"adjective": "funny", "content": "chickens"})
prompt_val
```

```output
StringPromptValue(text='Tell me a funny joke about chickens.')
```

```python
prompt_val.to_string()
```

```output
'Tell me a funny joke about chickens.'
```

```python
prompt_val.to_messages()
```

```output
[HumanMessage(content='Tell me a funny joke about chickens.')]
```

```python
chat_template = ChatPromptTemplate.from_messages(
    [
        SystemMessage(
            content=(
                "You are a helpful assistant that re-writes the user's text to "
                "sound more upbeat."
            )
        ),
        HumanMessagePromptTemplate.from_template("{text}"),
    ]
)

chat_val = chat_template.invoke({"text": "i dont like eating tasty things."})
```

```python
chat_val.to_messages()
```

```output
[SystemMessage(content="You are a helpful assistant that re-writes the user's text to sound more upbeat."),
 HumanMessage(content='i dont like eating tasty things.')]
```

```python
chat_val.to_string()
```

```output
"System: You are a helpful assistant that re-writes the user's text to sound more upbeat.\nHuman: i dont like eating tasty things."
```
