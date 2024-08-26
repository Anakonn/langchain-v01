---
canonical: https://python.langchain.com/v0.1/docs/integrations/callbacks/llmonitor
translated: false
---

# LLMonitor

>[LLMonitor](https://llmonitor.com?utm_source=langchain&utm_medium=py&utm_campaign=docs) is an open-source observability platform that provides cost and usage analytics, user tracking, tracing and evaluation tools.

<video controls width='100%' >
  <source src='https://llmonitor.com/videos/demo-annotated.mp4'/>
</video>

## Setup

Create an account on [llmonitor.com](https://llmonitor.com?utm_source=langchain&utm_medium=py&utm_campaign=docs), then copy your new app's `tracking id`.

Once you have it, set it as an environment variable by running:

```bash
export LLMONITOR_APP_ID="..."
```

If you'd prefer not to set an environment variable, you can pass the key directly when initializing the callback handler:

```python
<!--IMPORTS:[{"imported": "LLMonitorCallbackHandler", "source": "langchain_community.callbacks.llmonitor_callback", "docs": "https://api.python.langchain.com/en/latest/callbacks/langchain_community.callbacks.llmonitor_callback.LLMonitorCallbackHandler.html", "title": "LLMonitor"}]-->
from langchain_community.callbacks.llmonitor_callback import LLMonitorCallbackHandler

handler = LLMonitorCallbackHandler(app_id="...")
```

## Usage with LLM/Chat models

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

## Usage with chains and agents

Make sure to pass the callback handler to the `run` method so that all related chains and llm calls are correctly tracked.

It is also recommended to pass `agent_name` in the metadata to be able to distinguish between agents in the dashboard.

Example:

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

Another example:

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

## User Tracking

User tracking allows you to identify your users, track their cost, conversations and more.

```python
<!--IMPORTS:[{"imported": "LLMonitorCallbackHandler", "source": "langchain_community.callbacks.llmonitor_callback", "docs": "https://api.python.langchain.com/en/latest/callbacks/langchain_community.callbacks.llmonitor_callback.LLMonitorCallbackHandler.html", "title": "LLMonitor"}, {"imported": "identify", "source": "langchain_community.callbacks.llmonitor_callback", "docs": "https://api.python.langchain.com/en/latest/callbacks/langchain_community.callbacks.llmonitor_callback.identify.html", "title": "LLMonitor"}]-->
from langchain_community.callbacks.llmonitor_callback import LLMonitorCallbackHandler, identify

with identify("user-123"):
    llm.invoke("Tell me a joke")

with identify("user-456", user_props={"email": "user456@test.com"}):
    agen.run("Who is Leo DiCaprio's girlfriend?")
```

## Support

For any question or issue with integration you can reach out to the LLMonitor team on [Discord](http://discord.com/invite/8PafSG58kK) or via [email](mailto:vince@llmonitor.com).