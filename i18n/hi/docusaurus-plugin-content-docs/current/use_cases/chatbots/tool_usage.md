---
sidebar_position: 3
translated: true
---

यह अनुभाग उपकरण का उपयोग करने के बारे में बताएगा: चैटबॉट जो अन्य प्रणालियों और API का उपयोग करके बातचीत कर सकते हैं।

इस गाइड को पढ़ने से पहले, हम आपको [चैटबॉट त्वरित शुरुआत](/docs/use_cases/chatbots/quickstart) और [एजेंटों पर प्रलेखन](/docs/modules/agents/) पढ़ने की सलाह देते हैं।

## सेटअप

इस गाइड के लिए, हम [OpenAI उपकरण एजेंट](/docs/modules/agents/agent_types/openai_tools) का उपयोग करेंगे जिसमें वेब खोजने के लिए एक उपकरण होगा। डिफ़ॉल्ट [Tavily](/docs/integrations/tools/tavily_search) द्वारा संचालित होगा, लेकिन आप इसे किसी भी समान उपकरण से बदल सकते हैं। इस अनुभाग के शेष हिस्से में हम Tavily का उपयोग करते हुए मान लेंगे।

आपको [Tavily वेबसाइट पर एक खाता बनाना](https://tavily.com/) होगा, और निम्नलिखित पैकेज इंस्टॉल करने होंगे:

```python
%pip install --upgrade --quiet langchain-openai tavily-python

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

आपको अपना OpenAI कुंजी `OPENAI_API_KEY` के रूप में और अपना Tavily API कुंजी `TAVILY_API_KEY` के रूप में सेट करना होगा।

## एक एजेंट बनाना

हमारा अंतिम लक्ष्य ऐसा एजेंट बनाना है जो उपयोगकर्ता के प्रश्नों का जवाब देने के लिए वार्तालाप करने में सक्षम हो और आवश्यकतानुसार जानकारी खोज सके।

पहले, चलो Tavily और एक OpenAI चैट मॉडल जो उपकरण कॉलिंग में सक्षम है, को इनिशियलाइज़ करते हैं:

```python
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_openai import ChatOpenAI

tools = [TavilySearchResults(max_results=1)]

# Choose the LLM that will drive the agent
# Only certain models support this
chat = ChatOpenAI(model="gpt-3.5-turbo-1106", temperature=0)
```

अपने एजेंट को वार्तालाप करने योग्य बनाने के लिए, हमें अपने चैट इतिहास के लिए एक प्लेसहोल्डर के साथ एक प्रॉम्प्ट का चयन करना होगा। यहां एक उदाहरण है:

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

# Adapted from https://smith.langchain.com/hub/hwchase17/openai-tools-agent
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful assistant. You may not need to use tools for every query - the user may just want to chat!",
        ),
        MessagesPlaceholder(variable_name="messages"),
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ]
)
```

बढ़िया! अब चलो अपने एजेंट को एकत्रित करते हैं:

```python
from langchain.agents import AgentExecutor, create_openai_tools_agent

agent = create_openai_tools_agent(chat, tools, prompt)

agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

## एजेंट चलाना

अब जब हमने अपने एजेंट को सेट अप कर लिया है, तो चलो इससे बातचीत करने का प्रयास करते हैं! यह कोई खोज की आवश्यकता नहीं वाले सरल प्रश्नों को भी संभाल सकता है:

```python
from langchain_core.messages import HumanMessage

agent_executor.invoke({"messages": [HumanMessage(content="I'm Nemo!")]})
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mHello Nemo! It's great to meet you. How can I assist you today?[0m

[1m> Finished chain.[0m
```

```output
{'messages': [HumanMessage(content="I'm Nemo!")],
 'output': "Hello Nemo! It's great to meet you. How can I assist you today?"}
```

या, यह आवश्यकतानुसार अद्यतन जानकारी प्राप्त करने के लिए पारित खोज उपकरण का उपयोग कर सकता है:

```python
agent_executor.invoke(
    {
        "messages": [
            HumanMessage(
                content="What is the current conservation status of the Great Barrier Reef?"
            )
        ],
    }
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `tavily_search_results_json` with `{'query': 'current conservation status of the Great Barrier Reef'}`


[0m[36;1m[1;3m[{'url': 'https://www.barrierreef.org/news/blog/this-is-the-critical-decade-for-coral-reef-survival', 'content': "global coral reef conservation.  © 2024 Great Barrier Reef Foundation. Website by bigfish.tv  #Related News · 29 January 2024 290m more baby corals to help restore and protect the Great Barrier Reef  Great Barrier Reef Foundation Managing Director Anna Marsden says it’s not too late if we act now.The Status of Coral Reefs of the World: 2020 report is the largest analysis of global coral reef health ever undertaken. It found that 14 per cent of the world's coral has been lost since 2009. The report also noted, however, that some of these corals recovered during the 10 years to 2019."}][0m[32;1m[1;3mThe current conservation status of the Great Barrier Reef is a critical concern. According to the Great Barrier Reef Foundation, the Status of Coral Reefs of the World: 2020 report found that 14% of the world's coral has been lost since 2009. However, the report also noted that some of these corals recovered during the 10 years to 2019. For more information, you can visit the following link: [Great Barrier Reef Foundation - Conservation Status](https://www.barrierreef.org/news/blog/this-is-the-critical-decade-for-coral-reef-survival)[0m

[1m> Finished chain.[0m
```

```output
{'messages': [HumanMessage(content='What is the current conservation status of the Great Barrier Reef?')],
 'output': "The current conservation status of the Great Barrier Reef is a critical concern. According to the Great Barrier Reef Foundation, the Status of Coral Reefs of the World: 2020 report found that 14% of the world's coral has been lost since 2009. However, the report also noted that some of these corals recovered during the 10 years to 2019. For more information, you can visit the following link: [Great Barrier Reef Foundation - Conservation Status](https://www.barrierreef.org/news/blog/this-is-the-critical-decade-for-coral-reef-survival)"}
```

## वार्तालाप प्रतिक्रियाएं

क्योंकि हमारा प्रॉम्प्ट चैट इतिहास संदेशों के लिए एक प्लेसहोल्डर है, हमारा एजेंट पिछली बातचीत को ध्यान में रखकर एक मानक चैटबॉट की तरह वार्तालाप करके प्रतिक्रिया दे सकता है:

```python
from langchain_core.messages import AIMessage, HumanMessage

agent_executor.invoke(
    {
        "messages": [
            HumanMessage(content="I'm Nemo!"),
            AIMessage(content="Hello Nemo! How can I assist you today?"),
            HumanMessage(content="What is my name?"),
        ],
    }
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mYour name is Nemo![0m

[1m> Finished chain.[0m
```

```output
{'messages': [HumanMessage(content="I'm Nemo!"),
  AIMessage(content='Hello Nemo! How can I assist you today?'),
  HumanMessage(content='What is my name?')],
 'output': 'Your name is Nemo!'}
```

यदि आप चाहते हैं, तो आप एजेंट कार्यकर्ता को `RunnableWithMessageHistory` क्लास में लपेट सकते हैं ताकि यह इतिहास संदेशों का आंतरिक प्रबंधन कर सके। पहले, हमें प्रॉम्प्ट को थोड़ा संशोधित करना होगा ताकि यह अलग इनपुट चर लें ताकि रैपर इतिहास के रूप में किस इनपुट मान को संग्रहीत करना है, उसे पार्स कर सके:

```python
# Adapted from https://smith.langchain.com/hub/hwchase17/openai-tools-agent
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful assistant. You may not need to use tools for every query - the user may just want to chat!",
        ),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ]
)

agent = create_openai_tools_agent(chat, tools, prompt)

agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

क्योंकि हमारे एजेंट कार्यकर्ता के पास कई आउटपुट हैं, हमें `output_messages_key` गुण को भी सेट करना होगा जब हम रैपर को इनिशियलाइज़ करते हैं:

```python
from langchain.memory import ChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory

demo_ephemeral_chat_history_for_chain = ChatMessageHistory()

conversational_agent_executor = RunnableWithMessageHistory(
    agent_executor,
    lambda session_id: demo_ephemeral_chat_history_for_chain,
    input_messages_key="input",
    output_messages_key="output",
    history_messages_key="chat_history",
)
```

```python
conversational_agent_executor.invoke(
    {
        "input": "I'm Nemo!",
    },
    {"configurable": {"session_id": "unused"}},
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mHi Nemo! It's great to meet you. How can I assist you today?[0m

[1m> Finished chain.[0m
```

```output
{'input': "I'm Nemo!",
 'chat_history': [],
 'output': "Hi Nemo! It's great to meet you. How can I assist you today?"}
```

```python
conversational_agent_executor.invoke(
    {
        "input": "What is my name?",
    },
    {"configurable": {"session_id": "unused"}},
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mYour name is Nemo! How can I assist you today, Nemo?[0m

[1m> Finished chain.[0m
```

```output
{'input': 'What is my name?',
 'chat_history': [HumanMessage(content="I'm Nemo!"),
  AIMessage(content="Hi Nemo! It's great to meet you. How can I assist you today?")],
 'output': 'Your name is Nemo! How can I assist you today, Nemo?'}
```

## और पढ़ने के लिए

अन्य प्रकार के एजेंट भी वार्तालाप प्रतिक्रियाएं समर्थित कर सकते हैं - अधिक जानकारी के लिए, [एजेंट अनुभाग](/docs/modules/agents) देखें।

उपकरण उपयोग के बारे में अधिक जानकारी के लिए, आप [इस उपयोग मामले अनुभाग](/docs/use_cases/tool_use/) भी देख सकते हैं।
