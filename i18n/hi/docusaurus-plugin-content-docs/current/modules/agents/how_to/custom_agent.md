---
sidebar_position: 0
translated: true
---

यह नोटबुक आपके अपने कस्टम एजेंट को कैसे बनाया जाए, इसके बारे में बताता है।

इस उदाहरण में, हम OpenAI Tool Calling का उपयोग करके यह एजेंट बनाएंगे।
**यह एजेंट बनाने का सबसे विश्वसनीय तरीका है।**

हम पहले इसे मेमोरी के बिना बनाएंगे, लेकिन फिर हम मेमोरी को कैसे जोड़ा जाए, यह भी दिखाएंगे।
मेमोरी वार्तालाप को सक्षम करने के लिए आवश्यक है।

## LLM लोड करें

पहले, चलिए उस भाषा मॉडल को लोड करें जिसका उपयोग हम एजेंट को नियंत्रित करने के लिए करेंगे।

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
```

## उपकरण परिभाषित करें

अगला कदम, कुछ उपकरण परिभाषित करना है।
चलिए एक बहुत ही सरल Python फ़ंक्शन लिखते हैं जो किसी दिए गए शब्द की लंबाई की गणना करता है।

ध्यान दें कि यहां उपयोग किए जाने वाले फ़ंक्शन डॉक्स्ट्रिंग काफी महत्वपूर्ण हैं। इसके बारे में अधिक जानकारी के लिए [यहां](/docs/modules/tools/custom_tools) पढ़ें।

```python
from langchain.agents import tool


@tool
def get_word_length(word: str) -> int:
    """Returns the length of a word."""
    return len(word)


get_word_length.invoke("abc")
```

```output
3
```

```python
tools = [get_word_length]
```

## प्रोम्प्ट बनाएं

अब आइए प्रोम्प्ट बनाते हैं।
क्योंकि OpenAI Function Calling उपकरण उपयोग के लिए अनुकूलित है, हमें तर्क करने या आउटपुट प्रारूप के बारे में कोई निर्देश की आवश्यकता नहीं है।
हमारे पास केवल दो इनपुट चर होंगे: `input` और `agent_scratchpad`। `input` में उपयोक्ता के उद्देश्य को संदर्भित करने वाला स्ट्रिंग होना चाहिए। `agent_scratchpad` में पिछले एजेंट उपकरण आह्वान और संबंधित उपकरण आउटपुट का अनुक्रम होना चाहिए।

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are very powerful assistant, but don't know current events",
        ),
        ("user", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ]
)
```

## उपकरणों को LLM से बांधें

एजेंट को कौन से उपकरण उपयोग करने की जानकारी कैसे होती है?

इस मामले में, हम OpenAI Tool Calling LLMs पर निर्भर हैं, जो उपकरणों को एक अलग तर्क के रूप में लेते हैं और उन उपकरणों को कब आमंत्रित करना है, इसके लिए विशेष रूप से प्रशिक्षित किए गए हैं।

हमारे उपकरणों को एजेंट तक पहुंचाने के लिए, हमें उन्हें [OpenAI उपकरण प्रारूप](https://platform.openai.com/docs/api-reference/chat/create) में प्रारूपित करना होगा और उन्हें हमारे मॉडल को पास करना होगा। (फ़ंक्शन को `bind` करके, हम सुनिश्चित कर रहे हैं कि वे हर बार जब मॉडल को आमंत्रित किया जाता है, तब उन्हें पास किया जाता है।)

```python
llm_with_tools = llm.bind_tools(tools)
```

## एजेंट बनाएं

इन टुकड़ों को एक साथ रखकर, हम अब एजेंट बना सकते हैं।
हम दो अंतिम उपयोगिता फ़ंक्शन आयात करेंगे: एक घटक मध्यवर्ती चरणों को (एजेंट क्रिया, उपकरण आउटपुट युग्मों) इनपुट संदेशों में प्रारूपित करने के लिए, और एक घटक एजेंट क्रिया/एजेंट समाप्ति में आउटपुट संदेश को रूपांतरित करने के लिए।

```python
from langchain.agents.format_scratchpad.openai_tools import (
    format_to_openai_tool_messages,
)
from langchain.agents.output_parsers.openai_tools import OpenAIToolsAgentOutputParser

agent = (
    {
        "input": lambda x: x["input"],
        "agent_scratchpad": lambda x: format_to_openai_tool_messages(
            x["intermediate_steps"]
        ),
    }
    | prompt
    | llm_with_tools
    | OpenAIToolsAgentOutputParser()
)
```

```python
from langchain.agents import AgentExecutor

agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

```python
list(agent_executor.stream({"input": "How many letters in the word eudca"}))
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `get_word_length` with `{'word': 'eudca'}`


[0m[36;1m[1;3m5[0m[32;1m[1;3mThere are 5 letters in the word "eudca".[0m

[1m> Finished chain.[0m
```

```output
[{'actions': [OpenAIToolAgentAction(tool='get_word_length', tool_input={'word': 'eudca'}, log="\nInvoking: `get_word_length` with `{'word': 'eudca'}`\n\n\n", message_log=[AIMessageChunk(content='', additional_kwargs={'tool_calls': [{'index': 0, 'id': 'call_A07D5TuyqcNIL0DIEVRPpZkg', 'function': {'arguments': '{\n  "word": "eudca"\n}', 'name': 'get_word_length'}, 'type': 'function'}]})], tool_call_id='call_A07D5TuyqcNIL0DIEVRPpZkg')],
  'messages': [AIMessageChunk(content='', additional_kwargs={'tool_calls': [{'index': 0, 'id': 'call_A07D5TuyqcNIL0DIEVRPpZkg', 'function': {'arguments': '{\n  "word": "eudca"\n}', 'name': 'get_word_length'}, 'type': 'function'}]})]},
 {'steps': [AgentStep(action=OpenAIToolAgentAction(tool='get_word_length', tool_input={'word': 'eudca'}, log="\nInvoking: `get_word_length` with `{'word': 'eudca'}`\n\n\n", message_log=[AIMessageChunk(content='', additional_kwargs={'tool_calls': [{'index': 0, 'id': 'call_A07D5TuyqcNIL0DIEVRPpZkg', 'function': {'arguments': '{\n  "word": "eudca"\n}', 'name': 'get_word_length'}, 'type': 'function'}]})], tool_call_id='call_A07D5TuyqcNIL0DIEVRPpZkg'), observation=5)],
  'messages': [FunctionMessage(content='5', name='get_word_length')]},
 {'output': 'There are 5 letters in the word "eudca".',
  'messages': [AIMessage(content='There are 5 letters in the word "eudca".')]}]
```

यदि हम इसे आधार LLM से तुलना करते हैं, तो हम देख सकते हैं कि LLM अकेले संघर्ष करता है।

```python
llm.invoke("How many letters in the word educa")
```

```output
AIMessage(content='There are 6 letters in the word "educa".')
```

## मेमोरी जोड़ना

यह बहुत अच्छा है - हमारे पास एक एजेंट है!
हालांकि, यह एजेंट स्थिरता रहित है - यह पिछली बातचीत के बारे में कुछ भी याद नहीं रखता है।
इसका मतलब है कि आप आसानी से फॉलो-अप प्रश्न नहीं पूछ सकते।
चलिए मेमोरी जोड़कर इसे ठीक करते हैं।

इसे करने के लिए, हमें दो चीजें करनी होंगी:

1. प्रोम्प्ट में मेमोरी चर के लिए एक जगह जोड़ना
2. चैट इतिहास को ट्रैक करना

पहले, प्रोम्प्ट में मेमोरी के लिए एक जगह जोड़ते हैं।
हम यह `"chat_history"` कुंजी के साथ एक प्लेसहोल्डर जोड़कर करते हैं।
ध्यान दें कि हम इसे नए उपयोक्ता इनपुट (वार्तालाप प्रवाह का अनुसरण करने के लिए) से ऊपर रखते हैं।

```python
from langchain_core.prompts import MessagesPlaceholder

MEMORY_KEY = "chat_history"
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are very powerful assistant, but bad at calculating lengths of words.",
        ),
        MessagesPlaceholder(variable_name=MEMORY_KEY),
        ("user", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ]
)
```

फिर हम चैट इतिहास को ट्रैक करने के लिए एक सूची सेट कर सकते हैं।

```python
from langchain_core.messages import AIMessage, HumanMessage

chat_history = []
```

फिर हम इन सबको एक साथ रख सकते हैं!

```python
agent = (
    {
        "input": lambda x: x["input"],
        "agent_scratchpad": lambda x: format_to_openai_tool_messages(
            x["intermediate_steps"]
        ),
        "chat_history": lambda x: x["chat_history"],
    }
    | prompt
    | llm_with_tools
    | OpenAIToolsAgentOutputParser()
)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

चलाते समय, हमें इनपुट और आउटपुट को चैट इतिहास के रूप में ट्रैक करना होगा।

```python
input1 = "how many letters in the word educa?"
result = agent_executor.invoke({"input": input1, "chat_history": chat_history})
chat_history.extend(
    [
        HumanMessage(content=input1),
        AIMessage(content=result["output"]),
    ]
)
agent_executor.invoke({"input": "is that a real word?", "chat_history": chat_history})
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `get_word_length` with `{'word': 'educa'}`


[0m[36;1m[1;3m5[0m[32;1m[1;3mThere are 5 letters in the word "educa".[0m

[1m> Finished chain.[0m


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mNo, "educa" is not a real word in English.[0m

[1m> Finished chain.[0m
```

```output
{'input': 'is that a real word?',
 'chat_history': [HumanMessage(content='how many letters in the word educa?'),
  AIMessage(content='There are 5 letters in the word "educa".')],
 'output': 'No, "educa" is not a real word in English.'}
```
