---
sidebar_position: 2
translated: true
---

# एक से अधिक उपकरणों के बीच चुनाव करना

हमारे [त्वरित शुरुआत](/docs/use_cases/tool_use/quickstart) में हमने देखा कि कैसे एक `multiply` उपकरण को कॉल करने वाली श्रृंखला बनाई जाती है। अब आइए देखें कि हम इस श्रृंखला को कैसे बढ़ा सकते हैं ताकि यह कई उपकरणों में से चुन सके। हम श्रृंखलाओं पर ध्यान केंद्रित करेंगे क्योंकि [एजेंट](/docs/use_cases/tool_use/agents) डिफ़ॉल्ट रूप से कई उपकरणों के बीच मार्गप्रदर्शन कर सकते हैं।

## सेटअप

इस गाइड के लिए हमें निम्नलिखित पैकेज इंस्टॉल करने की आवश्यकता होगी:

```python
%pip install --upgrade --quiet langchain-core
```

यदि आप [LangSmith](/docs/langsmith/) में अपने रन ट्रेस करना चाहते हैं, तो निम्नलिखित पर्यावरण चर को अनकमेंट और सेट करें:

```python
import getpass
import os

# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## उपकरण

याद करें कि हमारे पास पहले से ही एक `multiply` उपकरण था:

```python
from langchain_core.tools import tool


@tool
def multiply(first_int: int, second_int: int) -> int:
    """Multiply two integers together."""
    return first_int * second_int
```

और अब हम इसमें एक `exponentiate` और `add` उपकरण जोड़ सकते हैं:

```python
@tool
def add(first_int: int, second_int: int) -> int:
    "Add two integers."
    return first_int + second_int


@tool
def exponentiate(base: int, exponent: int) -> int:
    "Exponentiate the base to the exponent power."
    return base**exponent
```

एक उपकरण का उपयोग करने और कई उपकरणों का उपयोग करने के बीच का मुख्य अंतर यह है कि हम पहले से ही नहीं जान सकते कि मॉडल कौन सा उपकरण कॉल करेगा, इसलिए हम [त्वरित शुरुआत](/docs/use_cases/tool_use/quickstart) में की तरह एक विशिष्ट उपकरण को हार्डकोड नहीं कर सकते। बजाय इसके, हम `call_tools` जोड़ेंगे, जो एक `RunnableLambda` है जो उपकरण कॉल वाले आउटपुट AI संदेश को लेता है और सही उपकरणों तक मार्गप्रदर्शन करता है।

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs customVarName="llm"/>

```python
# | echo: false
# | output: false

from langchain_anthropic import ChatAnthropic

llm = ChatAnthropic(model="claude-3-sonnet-20240229", temperature=0)
```

```python
from operator import itemgetter
from typing import Dict, List, Union

from langchain_core.messages import AIMessage
from langchain_core.runnables import (
    Runnable,
    RunnableLambda,
    RunnableMap,
    RunnablePassthrough,
)

tools = [multiply, exponentiate, add]
llm_with_tools = llm.bind_tools(tools)
tool_map = {tool.name: tool for tool in tools}


def call_tools(msg: AIMessage) -> Runnable:
    """Simple sequential tool calling helper."""
    tool_map = {tool.name: tool for tool in tools}
    tool_calls = msg.tool_calls.copy()
    for tool_call in tool_calls:
        tool_call["output"] = tool_map[tool_call["name"]].invoke(tool_call["args"])
    return tool_calls


chain = llm_with_tools | call_tools
```

```python
chain.invoke("What's 23 times 7")
```

```output
[{'name': 'multiply',
  'args': {'first_int': 23, 'second_int': 7},
  'id': 'toolu_01Wf8kUs36kxRKLDL8vs7G8q',
  'output': 161}]
```

```python
chain.invoke("add a million plus a billion")
```

```output
[{'name': 'add',
  'args': {'first_int': 1000000, 'second_int': 1000000000},
  'id': 'toolu_012aK4xZBQg2sXARsFZnqxHh',
  'output': 1001000000}]
```

```python
chain.invoke("cube thirty-seven")
```

```output
[{'name': 'exponentiate',
  'args': {'base': 37, 'exponent': 3},
  'id': 'toolu_01VDU6X3ugDb9cpnnmCZFPbC',
  'output': 50653}]
```
