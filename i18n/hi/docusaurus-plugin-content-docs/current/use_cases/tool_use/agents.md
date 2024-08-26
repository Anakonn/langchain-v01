---
sidebar_position: 1
translated: true
---

## उपकरणों का बार-बार उपयोग एजेंटों के साथ

जब हम किसी भी उपयोगकर्ता इनपुट के लिए आवश्यक उपकरण उपयोग के विशिष्ट क्रम को जानते हैं, तो श्रृंखलाएं महान होती हैं। लेकिन कुछ उपयोग मामलों में, हम उपकरणों का उपयोग कितनी बार करते हैं, यह इनपुट पर निर्भर करता है। इन मामलों में, हम मॉडल को खुद तय करने देना चाहते हैं कि वह उपकरणों का उपयोग कितनी बार और किस क्रम में करे। [एजेंट](/docs/modules/agents/) हमें ऐसा करने देते हैं।

LangChain में कई बिल्ट-इन एजेंट हैं जो विभिन्न उपयोग मामलों के लिए अनुकूलित हैं। यहां सभी [एजेंट प्रकारों](/docs/modules/agents/agent_types/) के बारे में पढ़ें।

हम [उपकरण कॉलिंग एजेंट](/docs/modules/agents/agent_types/tool_calling/) का उपयोग करेंगे, जो आमतौर पर सबसे विश्वसनीय प्रकार है और अधिकांश उपयोग मामलों के लिए अनुशंसित है। इस मामले में "उपकरण कॉलिंग" का मतलब है मॉडल एपीआई का एक विशिष्ट प्रकार जो उपकरण परिभाषाओं को मॉडलों को स्पष्ट रूप से पारित करने और स्पष्ट उपकरण आह्वान प्राप्त करने की अनुमति देता है। उपकरण कॉलिंग मॉडलों के बारे में अधिक जानकारी के लिए [इस गाइड](/docs/modules/model_io/chat/function_calling/) देखें।

![एजेंट](../../../../../../static/img/tool_agent.svg)

## सेटअप

हमें निम्नलिखित पैकेज इंस्टॉल करने होंगे:

```python
%pip install --upgrade --quiet langchain langchainhub
```

यदि आप LangSmith का उपयोग करना चाहते हैं, तो नीचे दिए गए वातावरण متغيरों को सेट करें:

```python
import getpass
import os


# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## उपकरण बनाएं

पहले, हमें कुछ उपकरण बनाने की आवश्यकता है जिन्हें हम कॉल कर सकें। इस उदाहरण के लिए, हम कस्टम उपकरण कार्यों से बनाएंगे। कस्टम उपकरण बनाने के बारे में अधिक जानकारी के लिए, कृपया [इस गाइड](/docs/modules/tools/) देखें।

```python
from langchain_core.tools import tool


@tool
def multiply(first_int: int, second_int: int) -> int:
    """Multiply two integers together."""
    return first_int * second_int


@tool
def add(first_int: int, second_int: int) -> int:
    "Add two integers."
    return first_int + second_int


@tool
def exponentiate(base: int, exponent: int) -> int:
    "Exponentiate the base to the exponent power."
    return base**exponent


tools = [multiply, add, exponentiate]
```

## प्रॉम्प्ट बनाएं

```python
from langchain import hub
from langchain.agents import AgentExecutor, create_tool_calling_agent
```

```python
# Get the prompt to use - you can modify this!
prompt = hub.pull("hwchase17/openai-tools-agent")
prompt.pretty_print()
```

```output
================================[1m System Message [0m================================

You are a helpful assistant

=============================[1m Messages Placeholder [0m=============================

[33;1m[1;3m{chat_history}[0m

================================[1m Human Message [0m=================================

[33;1m[1;3m{input}[0m

=============================[1m Messages Placeholder [0m=============================

[33;1m[1;3m{agent_scratchpad}[0m
```

## एजेंट बनाएं

हमें उपकरण कॉलिंग क्षमताओं वाले मॉडल का उपयोग करना होगा। आप यहां देख सकते हैं कि कौन से मॉडल उपकरण कॉलिंग का समर्थन करते हैं [यहां](/docs/integrations/chat/)।

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs customVarName="llm"/>

```python
# | echo: false
# | output: false
from langchain_anthropic import ChatAnthropic

llm = ChatAnthropic(model="claude-3-sonnet-20240229", temperature=0)
```

```python
# Construct the tool calling agent
agent = create_tool_calling_agent(llm, tools, prompt)
```

```python
# Create an agent executor by passing in the agent and tools
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

## एजेंट को कॉल करें

```python
agent_executor.invoke(
    {
        "input": "Take 3 to the fifth power and multiply that by the sum of twelve and three, then square the whole result"
    }
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `exponentiate` with `{'base': 3, 'exponent': 5}`
responded: [{'text': "Okay, let's break this down step-by-step:", 'type': 'text'}, {'id': 'toolu_01CjdiDhDmMtaT1F4R7hSV5D', 'input': {'base': 3, 'exponent': 5}, 'name': 'exponentiate', 'type': 'tool_use'}]

[0m[38;5;200m[1;3m243[0m[32;1m[1;3m
Invoking: `add` with `{'first_int': 12, 'second_int': 3}`
responded: [{'text': '3 to the 5th power is 243.', 'type': 'text'}, {'id': 'toolu_01EKqn4E5w3Zj7bQ8s8xmi4R', 'input': {'first_int': 12, 'second_int': 3}, 'name': 'add', 'type': 'tool_use'}]

[0m[33;1m[1;3m15[0m[32;1m[1;3m
Invoking: `multiply` with `{'first_int': 243, 'second_int': 15}`
responded: [{'text': '12 + 3 = 15', 'type': 'text'}, {'id': 'toolu_017VZJgZBYbwMo2KGD6o6hsQ', 'input': {'first_int': 243, 'second_int': 15}, 'name': 'multiply', 'type': 'tool_use'}]

[0m[36;1m[1;3m3645[0m[32;1m[1;3m
Invoking: `multiply` with `{'first_int': 3645, 'second_int': 3645}`
responded: [{'text': '243 * 15 = 3645', 'type': 'text'}, {'id': 'toolu_01RtFCcQgbVGya3NVDgTYKTa', 'input': {'first_int': 3645, 'second_int': 3645}, 'name': 'multiply', 'type': 'tool_use'}]

[0m[36;1m[1;3m13286025[0m[32;1m[1;3mSo 3645 squared is 13,286,025.

Therefore, the final result of taking 3 to the 5th power (243), multiplying by 12 + 3 (15), and then squaring the whole result is 13,286,025.[0m

[1m> Finished chain.[0m
```

```output
{'input': 'Take 3 to the fifth power and multiply that by the sum of twelve and three, then square the whole result',
 'output': 'So 3645 squared is 13,286,025.\n\nTherefore, the final result of taking 3 to the 5th power (243), multiplying by 12 + 3 (15), and then squaring the whole result is 13,286,025.'}
```

आप [LangSmith ट्रेस यहां](https://smith.langchain.com/public/92694ff3-71b7-44ed-bc45-04bdf04d4689/r) देख सकते हैं।
