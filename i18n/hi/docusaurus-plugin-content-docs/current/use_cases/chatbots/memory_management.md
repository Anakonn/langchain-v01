---
sidebar_position: 1
translated: true
---

# मेमोरी प्रबंधन

चैटबॉट की एक प्रमुख विशेषता है कि वे पिछली वार्तालाप के सामग्री को संदर्भ के रूप में उपयोग कर सकते हैं। इस स्थिति प्रबंधन को कई रूपों में लिया जा सकता है, जिसमें शामिल हैं:

- केवल पिछले संदेशों को चैट मॉडल प्रॉम्प्ट में भरना।
- उपरोक्त, लेकिन पुराने संदेशों को कम करना ताकि मॉडल को व्यर्थ की जानकारी से निपटना न पड़े।
- लंबे समय तक चलने वाली वार्तालापों के लिए सारांश बनाने जैसी अधिक जटिल संशोधन।

हम नीचे कुछ तकनीकों पर अधिक विस्तार से चर्चा करेंगे!

## सेटअप

आपको कुछ पैकेज इंस्टॉल करने होंगे, और आपका OpenAI API कुंजी `OPENAI_API_KEY` नाम के एक पर्यावरण चर के रूप में सेट होनी चाहिए:

```python
%pip install --upgrade --quiet langchain langchain-openai

# Set env var OPENAI_API_KEY or load from a .env file:
import dotenv

dotenv.load_dotenv()
```

```output
[33mWARNING: You are using pip version 22.0.4; however, version 23.3.2 is available.
You should consider upgrading via the '/Users/jacoblee/.pyenv/versions/3.10.5/bin/python -m pip install --upgrade pip' command.[0m[33m
[0mNote: you may need to restart the kernel to use updated packages.
```

```output
True
```

आइए एक चैट मॉडल भी सेट करें जिसका हम नीचे के उदाहरणों में उपयोग करेंगे।

```python
from langchain_openai import ChatOpenAI

chat = ChatOpenAI(model="gpt-3.5-turbo-1106")
```

## संदेश पारित करना

मेमोरी का सबसे सरल रूप केवल चैट इतिहास संदेशों को एक श्रृंखला में पारित करना है। यहाँ एक उदाहरण है:

```python
from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful assistant. Answer all questions to the best of your ability.",
        ),
        MessagesPlaceholder(variable_name="messages"),
    ]
)

chain = prompt | chat

chain.invoke(
    {
        "messages": [
            HumanMessage(
                content="Translate this sentence from English to French: I love programming."
            ),
            AIMessage(content="J'adore la programmation."),
            HumanMessage(content="What did you just say?"),
        ],
    }
)
```

```output
AIMessage(content='I said "J\'adore la programmation," which means "I love programming" in French.')
```

हम देख सकते हैं कि पिछली वार्तालाप को एक श्रृंखला में पारित करके, यह उत्तर देने के लिए उसका उपयोग कर सकता है। यह चैटबॉट मेमोरी का मूल अवधारणा है - इस गाइड के शेष हिस्से में हम संदेशों को पारित या पुनर्प्रारूपित करने के लिए सुविधाजनक तकनीकों का प्रदर्शन करेंगे।

## चैट इतिहास

संदेशों को सीधे एक एरे के रूप में संग्रहित और पारित करना पूरी तरह से ठीक है, लेकिन हम LangChain के बिल्ट-इन [संदेश इतिहास वर्ग](/docs/modules/memory/chat_messages/) का उपयोग भी कर सकते हैं संदेशों को संग्रहित और लोड करने के लिए। इस वर्ग के इंस्टेंस चैट संदेशों को स्थायी संग्रह से संग्रहित और लोड करने के लिए जिम्मेदार हैं। LangChain कई प्रदाताओं के साथ एकीकृत है - आप [एकीकरण की सूची यहाँ](/docs/integrations/memory) देख सकते हैं - लेकिन इस डेमो के लिए हम एक अस्थायी डेमो वर्ग का उपयोग करेंगे।

API का एक उदाहरण यहाँ है:

```python
from langchain.memory import ChatMessageHistory

demo_ephemeral_chat_history = ChatMessageHistory()

demo_ephemeral_chat_history.add_user_message(
    "Translate this sentence from English to French: I love programming."
)

demo_ephemeral_chat_history.add_ai_message("J'adore la programmation.")

demo_ephemeral_chat_history.messages
```

```output
[HumanMessage(content='Translate this sentence from English to French: I love programming.'),
 AIMessage(content="J'adore la programmation.")]
```

हम अपनी श्रृंखला के लिए वार्तालाप मोड़ों को संग्रहित करने के लिए इसका सीधा उपयोग कर सकते हैं:

```python
demo_ephemeral_chat_history = ChatMessageHistory()

input1 = "Translate this sentence from English to French: I love programming."

demo_ephemeral_chat_history.add_user_message(input1)

response = chain.invoke(
    {
        "messages": demo_ephemeral_chat_history.messages,
    }
)

demo_ephemeral_chat_history.add_ai_message(response)

input2 = "What did I just ask you?"

demo_ephemeral_chat_history.add_user_message(input2)

chain.invoke(
    {
        "messages": demo_ephemeral_chat_history.messages,
    }
)
```

```output
AIMessage(content='You asked me to translate the sentence "I love programming" from English to French.')
```

## स्वचालित इतिहास प्रबंधन

पिछले उदाहरणों में संदेश श्रृंखला को स्पष्ट रूप से पारित किया जाता है। यह एक पूरी तरह से स्वीकार्य दृष्टिकोण है, लेकिन यह नए संदेशों के बाहरी प्रबंधन की आवश्यकता को आवश्यक बनाता है। LangChain में एक वैकल्पिक श्रृंखला के लिए एक रैपर भी शामिल है जो इस प्रक्रिया को स्वचालित रूप से संभाल सकता है, जिसे `RunnableWithMessageHistory` कहा जाता है।

यह कैसे काम करता है, यह दिखाने के लिए, आइए उपरोक्त प्रॉम्प्ट को थोड़ा संशोधित करें ताकि यह एक अंतिम `input` चर को लें जो `HumanMessage` टेम्पलेट को पूरा करे जब तक कि चैट इतिहास न हो। इसका मतलब है कि हम एक `chat_history` पैरामीटर की उम्मीद करेंगे जो सभी संदेशों को वर्तमान संदेशों से पहले संग्रहित करता है, न कि सभी संदेशों को।

```python
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful assistant. Answer all questions to the best of your ability.",
        ),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}"),
    ]
)

chain = prompt | chat
```

 हम यहाँ नवीनतम इनपुट को वार्तालाप में पारित करेंगे और `RunnableWithMessageHistory` वर्ग को हमारी श्रृंखला को लपेटने और उस `input` चर को चैट इतिहास में जोड़ने का काम करने देंगे।

 अब आइए हमारी लपेटी हुई श्रृंखला को घोषित करें:

```python
from langchain_core.runnables.history import RunnableWithMessageHistory

demo_ephemeral_chat_history_for_chain = ChatMessageHistory()

chain_with_message_history = RunnableWithMessageHistory(
    chain,
    lambda session_id: demo_ephemeral_chat_history_for_chain,
    input_messages_key="input",
    history_messages_key="chat_history",
)
```

इस वर्ग में कुछ अतिरिक्त पैरामीटर होते हैं जो हम श्रृंखला को लपेटना चाहते हैं:

- एक फैक्टरी फ़ंक्शन जो दिए गए सत्र आईडी के लिए एक संदेश इतिहास लौटाता है। यह आपकी श्रृंखला को एक साथ कई उपयोगकर्ताओं को संभालने में सक्षम बनाता है क्योंकि यह अलग-अलग वार्तालापों के लिए अलग-अलग संदेश लोड कर सकता है।
- एक `input_messages_key` जो निर्दिष्ट करता है कि इनपुट के कौन से हिस्से को ट्रैक और चैट इतिहास में संग्रहित किया जाना चाहिए। इस उदाहरण में, हम `input` के रूप में पारित किए गए स्ट्रिंग को ट्रैक करना चाहते हैं।
- एक `history_messages_key` जो निर्दिष्ट करता है कि पिछले संदेश प्रॉम्प्ट में किस रूप में इंजेक्ट किए जाने चाहिए। हमारे प्रॉम्प्ट में एक `MessagesPlaceholder` नाम का `chat_history` है, इसलिए हम इस गुण को इसके साथ मेल खाने के लिए निर्दिष्ट करते हैं।
- (एक से अधिक आउटपुट वाली श्रृंखलाओं के लिए) एक `output_messages_key` जो निर्दिष्ट करता है कि इतिहास में किस आउटपुट को संग्रहित किया जाना चाहिए। यह `input_messages_key` का उलट है।

हम सामान्य रूप से इस नई श्रृंखला को आमंत्रित कर सकते हैं, साथ ही एक अतिरिक्त `configurable` फ़ील्ड जो फैक्टरी फ़ंक्शन को पारित करने के लिए विशिष्ट `session_id` निर्दिष्ट करता है। यह डेमो के लिए अप्रयुक्त है, लेकिन वास्तविक दुनिया की श्रृंखलाओं में, आप पारित किए गए सत्र के अनुरूप एक चैट इतिहास लौटाना चाहेंगे:

```python
chain_with_message_history.invoke(
    {"input": "Translate this sentence from English to French: I love programming."},
    {"configurable": {"session_id": "unused"}},
)
```

```output
AIMessage(content='The translation of "I love programming" in French is "J\'adore la programmation."')
```

```python
chain_with_message_history.invoke(
    {"input": "What did I just ask you?"}, {"configurable": {"session_id": "unused"}}
)
```

```output
AIMessage(content='You just asked me to translate the sentence "I love programming" from English to French.')
```

## चैट इतिहास को संशोधित करना

संग्रहित चैट संदेशों को संशोधित करना आपके चैटबॉट को विभिन्न स्थितियों से निपटने में मदद कर सकता है। यहाँ कुछ उदाहरण हैं:

### संदेशों को काटना

एलएलएम और चैट मॉडल्स के पास सीमित संदर्भ विंडो होती हैं, और यहां तक कि यदि आप सीमाओं को सीधे नहीं छू रहे हैं, तो आप मॉडल को व्यस्त करने वाली मात्रा को सीमित करना चाह सकते हैं। एक समाधान यह है कि केवल `n` नवीनतम संदेशों को लोड और संग्रहीत करें। आइए एक उदाहरण इतिहास का उपयोग करें जिसमें कुछ पूर्वलोडेड संदेश हैं:

```python
demo_ephemeral_chat_history = ChatMessageHistory()

demo_ephemeral_chat_history.add_user_message("Hey there! I'm Nemo.")
demo_ephemeral_chat_history.add_ai_message("Hello!")
demo_ephemeral_chat_history.add_user_message("How are you today?")
demo_ephemeral_chat_history.add_ai_message("Fine thanks!")

demo_ephemeral_chat_history.messages
```

```output
[HumanMessage(content="Hey there! I'm Nemo."),
 AIMessage(content='Hello!'),
 HumanMessage(content='How are you today?'),
 AIMessage(content='Fine thanks!')]
```

आइए इस संदेश इतिहास का उपयोग उपर घोषित `RunnableWithMessageHistory` श्रृंखला के साथ करें:

```python
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful assistant. Answer all questions to the best of your ability.",
        ),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}"),
    ]
)

chain = prompt | chat

chain_with_message_history = RunnableWithMessageHistory(
    chain,
    lambda session_id: demo_ephemeral_chat_history,
    input_messages_key="input",
    history_messages_key="chat_history",
)

chain_with_message_history.invoke(
    {"input": "What's my name?"},
    {"configurable": {"session_id": "unused"}},
)
```

```output
AIMessage(content='Your name is Nemo.')
```

हम देख सकते हैं कि श्रृंखला को पूर्वलोडेड नाम याद है।

लेकिन मान लीजिए कि हमारे पास एक बहुत छोटा संदर्भ विंडो है, और हम श्रृंखला को भेजे जाने वाले संदेशों की संख्या को केवल 2 नवीनतम तक सीमित करना चाहते हैं। हम `clear` विधि का उपयोग कर सकते हैं ताकि संदेशों को हटाया और इतिहास में फिर से जोड़ा जा सके। हमें ऐसा नहीं करना है, लेकिन चेन के शीर्ष पर इस विधि को रखने दें ताकि यह हमेशा कॉल किया जाए:

```python
from langchain_core.runnables import RunnablePassthrough


def trim_messages(chain_input):
    stored_messages = demo_ephemeral_chat_history.messages
    if len(stored_messages) <= 2:
        return False

    demo_ephemeral_chat_history.clear()

    for message in stored_messages[-2:]:
        demo_ephemeral_chat_history.add_message(message)

    return True


chain_with_trimming = (
    RunnablePassthrough.assign(messages_trimmed=trim_messages)
    | chain_with_message_history
)
```

आइए इस नई श्रृंखला को कॉल करें और बाद में संदेशों की जांच करें:

```python
chain_with_trimming.invoke(
    {"input": "Where does P. Sherman live?"},
    {"configurable": {"session_id": "unused"}},
)
```

```output
AIMessage(content="P. Sherman's address is 42 Wallaby Way, Sydney.")
```

```python
demo_ephemeral_chat_history.messages
```

```output
[HumanMessage(content="What's my name?"),
 AIMessage(content='Your name is Nemo.'),
 HumanMessage(content='Where does P. Sherman live?'),
 AIMessage(content="P. Sherman's address is 42 Wallaby Way, Sydney.")]
```

और हम देख सकते हैं कि हमारा इतिहास दो पुराने संदेशों को हटा दिया गया है, लेकिन अंत में नवीनतम वार्तालाप को जोड़ा गया है। श्रृंखला को अगली बार कॉल किया जाएगा, तो `trim_messages` फिर से कॉल किया जाएगा, और केवल दो नवीनतम संदेश मॉडल को भेजे जाएंगे। इस मामले में, इसका मतलब है कि मॉडल अगली बार हमें कॉल करने पर उस नाम को भूल जाएगा:

```python
chain_with_trimming.invoke(
    {"input": "What is my name?"},
    {"configurable": {"session_id": "unused"}},
)
```

```output
AIMessage(content="I'm sorry, I don't have access to your personal information.")
```

```python
demo_ephemeral_chat_history.messages
```

```output
[HumanMessage(content='Where does P. Sherman live?'),
 AIMessage(content="P. Sherman's address is 42 Wallaby Way, Sydney."),
 HumanMessage(content='What is my name?'),
 AIMessage(content="I'm sorry, I don't have access to your personal information.")]
```

### सारांश मेमोरी

हम इस पैटर्न का उपयोग अन्य तरीकों से भी कर सकते हैं। उदाहरण के लिए, हम अपनी श्रृंखला को कॉल करने से पहले वार्तालाप का एक सारांश जनरेट करने के लिए एक अतिरिक्त एलएलएम कॉल का उपयोग कर सकते हैं। आइए अपना चैट इतिहास और चैटबॉट श्रृंखला फिर से बनाएं:

```python
demo_ephemeral_chat_history = ChatMessageHistory()

demo_ephemeral_chat_history.add_user_message("Hey there! I'm Nemo.")
demo_ephemeral_chat_history.add_ai_message("Hello!")
demo_ephemeral_chat_history.add_user_message("How are you today?")
demo_ephemeral_chat_history.add_ai_message("Fine thanks!")

demo_ephemeral_chat_history.messages
```

```output
[HumanMessage(content="Hey there! I'm Nemo."),
 AIMessage(content='Hello!'),
 HumanMessage(content='How are you today?'),
 AIMessage(content='Fine thanks!')]
```

हम प्रोम्प्ट को थोड़ा संशोधित करेंगे ताकि एलएलएम को पता चले कि वह चैट इतिहास के बजाय एक संक्षिप्त सारांश प्राप्त करेगा:

```python
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful assistant. Answer all questions to the best of your ability. The provided chat history includes facts about the user you are speaking with.",
        ),
        MessagesPlaceholder(variable_name="chat_history"),
        ("user", "{input}"),
    ]
)

chain = prompt | chat

chain_with_message_history = RunnableWithMessageHistory(
    chain,
    lambda session_id: demo_ephemeral_chat_history,
    input_messages_key="input",
    history_messages_key="chat_history",
)
```

और अब, आइए एक ऐसी फ़ंक्शन बनाएं जो पिछली बातचीत को एक सारांश में संक्षिप्त करेगी। हम इसे भी श्रृंखला के शीर्ष पर जोड़ सकते हैं:

```python
def summarize_messages(chain_input):
    stored_messages = demo_ephemeral_chat_history.messages
    if len(stored_messages) == 0:
        return False
    summarization_prompt = ChatPromptTemplate.from_messages(
        [
            MessagesPlaceholder(variable_name="chat_history"),
            (
                "user",
                "Distill the above chat messages into a single summary message. Include as many specific details as you can.",
            ),
        ]
    )
    summarization_chain = summarization_prompt | chat

    summary_message = summarization_chain.invoke({"chat_history": stored_messages})

    demo_ephemeral_chat_history.clear()

    demo_ephemeral_chat_history.add_message(summary_message)

    return True


chain_with_summarization = (
    RunnablePassthrough.assign(messages_summarized=summarize_messages)
    | chain_with_message_history
)
```

आइए देखें कि क्या यह उस नाम को याद रखता है जिसे हमने इसे दिया था:

```python
chain_with_summarization.invoke(
    {"input": "What did I say my name was?"},
    {"configurable": {"session_id": "unused"}},
)
```

```output
AIMessage(content='You introduced yourself as Nemo. How can I assist you today, Nemo?')
```

```python
demo_ephemeral_chat_history.messages
```

```output
[AIMessage(content='The conversation is between Nemo and an AI. Nemo introduces himself and the AI responds with a greeting. Nemo then asks the AI how it is doing, and the AI responds that it is fine.'),
 HumanMessage(content='What did I say my name was?'),
 AIMessage(content='You introduced yourself as Nemo. How can I assist you today, Nemo?')]
```

ध्यान दें कि श्रृंखला को फिर से कॉल करने से पहले एक और सारांश जनरेट होगा जो प्रारंभिक सारांश और नए संदेशों से बना होगा और इसी तरह। आप एक हाइब्रिड दृष्टिकोण भी डिज़ाइन कर सकते हैं जहां संदेशों की एक निश्चित संख्या चैट इतिहास में बरकरार रखी जाती है जबकि अन्य को सारांशित किया जाता है।
