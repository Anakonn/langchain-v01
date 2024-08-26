---
translated: true
---

# LLMonitor

>[LLMonitor](https://llmonitor.com?utm_source=langchain&utm_medium=py&utm_campaign=docs) एक ओपन-सोर्स अवलोकनीयता प्लेटफॉर्म है जो लागत और उपयोग विश्लेषण, उपयोगकर्ता ट्रैकिंग, ट्रेसिंग और मूल्यांकन उपकरण प्रदान करता है।

<video controls width='100%' >
  <source src='https://llmonitor.com/videos/demo-annotated.mp4'/>
</video>

## सेटअप

[llmonitor.com](https://llmonitor.com?utm_source=langchain&utm_medium=py&utm_campaign=docs) पर एक खाता बनाएं, फिर अपने नए ऐप का `ट्रैकिंग आईडी` कॉपी करें।

एक बार जब आप इसे प्राप्त कर लेते हैं, तो निम्नलिखित कमांड चलाकर इसे एक पर्यावरण चर के रूप में सेट करें:

```bash
export LLMONITOR_APP_ID="..."
```

यदि आप पर्यावरण चर सेट करना नहीं चाहते हैं, तो आप कॉलबैक हैंडलर को प्रारंभ करते समय कुंजी को सीधे पास कर सकते हैं:

```python
<!--IMPORTS:[{"imported": "LLMonitorCallbackHandler", "source": "langchain_community.callbacks.llmonitor_callback", "docs": "https://api.python.langchain.com/en/latest/callbacks/langchain_community.callbacks.llmonitor_callback.LLMonitorCallbackHandler.html", "title": "LLMonitor"}]-->
from langchain_community.callbacks.llmonitor_callback import LLMonitorCallbackHandler

handler = LLMonitorCallbackHandler(app_id="...")
```

## LLM/चैट मॉडल के साथ उपयोग

```python
<!--IMPORTS:[{"imported": "OpenAI", "source": "langchain_openai", "docs": "https://api.python.langchain.com/en/latest/llms/langchain_openai.llms.base.OpenAI.html", "title": "LLMonitor"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://api.python.langchain.com/en/latest/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "LLMonitor"}]-->
from langchain_openai import OpenAI
from langchain_openai import ChatOpenAI

handler = LLMonitorCallbackHandler()

llm = OpenAI(
    callbacks=[handler],
)

chat = ChatOpenAI(callbacks=[handler])

llm("Tell me a joke")

```

## श्रृंखला और एजेंटों के साथ उपयोग

सुनिश्चित करें कि सभी संबंधित श्रृंखला और एलएलएम कॉल सही ढंग से ट्रैक किए जाएं, इसके लिए `run` विधि में कॉलबैक हैंडलर पास करें।

यह भी अनुशंसित है कि `agent_name` को मेटाडेटा में पास किया जाए ताकि डैशबोर्ड में एजेंटों को अलग-अलग पहचाना जा सके।

उदाहरण:

```python
<!--IMPORTS:[{"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://api.python.langchain.com/en/latest/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "LLMonitor"}, {"imported": "LLMonitorCallbackHandler", "source": "langchain_community.callbacks.llmonitor_callback", "docs": "https://api.python.langchain.com/en/latest/callbacks/langchain_community.callbacks.llmonitor_callback.LLMonitorCallbackHandler.html", "title": "LLMonitor"}, {"imported": "SystemMessage", "source": "langchain_core.messages", "docs": "https://api.python.langchain.com/en/latest/messages/langchain_core.messages.system.SystemMessage.html", "title": "LLMonitor"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://api.python.langchain.com/en/latest/messages/langchain_core.messages.human.HumanMessage.html", "title": "LLMonitor"}, {"imported": "OpenAIFunctionsAgent", "source": "langchain.agents", "docs": "https://api.python.langchain.com/en/latest/agents/langchain.agents.openai_functions_agent.base.OpenAIFunctionsAgent.html", "title": "LLMonitor"}, {"imported": "AgentExecutor", "source": "langchain.agents", "docs": "https://api.python.langchain.com/en/latest/agents/langchain.agents.agent.AgentExecutor.html", "title": "LLMonitor"}, {"imported": "tool", "source": "langchain.agents", "docs": "https://api.python.langchain.com/en/latest/tools/langchain_core.tools.tool.html", "title": "LLMonitor"}]-->
from langchain_openai import ChatOpenAI
from langchain_community.callbacks.llmonitor_callback import LLMonitorCallbackHandler
from langchain_core.messages import SystemMessage, HumanMessage
from langchain.agents import OpenAIFunctionsAgent, AgentExecutor, tool

llm = ChatOpenAI(temperature=0)

handler = LLMonitorCallbackHandler()

@tool
def get_word_length(word: str) -> int:
    """Returns the length of a word."""
    return len(word)

tools = [get_word_length]

prompt = OpenAIFunctionsAgent.create_prompt(
    system_message=SystemMessage(
        content="You are very powerful assistant, but bad at calculating lengths of words."
    )
)

agent = OpenAIFunctionsAgent(llm=llm, tools=tools, prompt=prompt, verbose=True)
agent_executor = AgentExecutor(
    agent=agent, tools=tools, verbose=True, metadata={"agent_name": "WordCount"}  # <- recommended, assign a custom name
)
agent_executor.run("how many letters in the word educa?", callbacks=[handler])
```

एक और उदाहरण:

```python
<!--IMPORTS:[{"imported": "load_tools", "source": "langchain.agents", "docs": "https://api.python.langchain.com/en/latest/agent_toolkits/langchain_community.agent_toolkits.load_tools.load_tools.html", "title": "LLMonitor"}, {"imported": "initialize_agent", "source": "langchain.agents", "docs": "https://api.python.langchain.com/en/latest/agents/langchain.agents.initialize.initialize_agent.html", "title": "LLMonitor"}, {"imported": "AgentType", "source": "langchain.agents", "docs": "https://api.python.langchain.com/en/latest/agents/langchain.agents.agent_types.AgentType.html", "title": "LLMonitor"}, {"imported": "OpenAI", "source": "langchain_openai", "docs": "https://api.python.langchain.com/en/latest/llms/langchain_openai.llms.base.OpenAI.html", "title": "LLMonitor"}, {"imported": "LLMonitorCallbackHandler", "source": "langchain_community.callbacks.llmonitor_callback", "docs": "https://api.python.langchain.com/en/latest/callbacks/langchain_community.callbacks.llmonitor_callback.LLMonitorCallbackHandler.html", "title": "LLMonitor"}]-->
from langchain.agents import load_tools, initialize_agent, AgentType
from langchain_openai import OpenAI
from langchain_community.callbacks.llmonitor_callback import LLMonitorCallbackHandler


handler = LLMonitorCallbackHandler()

llm = OpenAI(temperature=0)
tools = load_tools(["serpapi", "llm-math"], llm=llm)
agent = initialize_agent(tools, llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, metadata={ "agent_name": "GirlfriendAgeFinder" })  # <- recommended, assign a custom name

agent.run(
    "Who is Leo DiCaprio's girlfriend? What is her current age raised to the 0.43 power?",
    callbacks=[handler],
)
```

## उपयोगकर्ता ट्रैकिंग

उपयोगकर्ता ट्रैकिंग आपको अपने उपयोगकर्ताओं की पहचान करने, उनकी लागत, वार्तालाप और अधिक को ट्रैक करने में मदद करता है।

```python
<!--IMPORTS:[{"imported": "LLMonitorCallbackHandler", "source": "langchain_community.callbacks.llmonitor_callback", "docs": "https://api.python.langchain.com/en/latest/callbacks/langchain_community.callbacks.llmonitor_callback.LLMonitorCallbackHandler.html", "title": "LLMonitor"}, {"imported": "identify", "source": "langchain_community.callbacks.llmonitor_callback", "docs": "https://api.python.langchain.com/en/latest/callbacks/langchain_community.callbacks.llmonitor_callback.identify.html", "title": "LLMonitor"}]-->
from langchain_community.callbacks.llmonitor_callback import LLMonitorCallbackHandler, identify

with identify("user-123"):
    llm.invoke("Tell me a joke")

with identify("user-456", user_props={"email": "user456@test.com"}):
    agen.run("Who is Leo DiCaprio's girlfriend?")
```

## समर्थन

किसी भी प्रश्न या एकीकरण संबंधी समस्या के लिए आप [Discord](http://discord.com/invite/8PafSG58kK) पर LLMonitor टीम से संपर्क कर सकते हैं या [ईमेल](mailto:vince@llmonitor.com) के माध्यम से संपर्क कर सकते हैं।
