---
translated: true
---

# アクセス中間ステップ

エージェントの動作をより詳しく確認するために、中間ステップを返すこともできます。これは、返り値に追加のキーとして現れ、(action, observation) のタプルのリストになります。

```python
# pip install wikipedia
```

```python
from langchain import hub
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain_community.tools import WikipediaQueryRun
from langchain_community.utilities import WikipediaAPIWrapper
from langchain_openai import ChatOpenAI

api_wrapper = WikipediaAPIWrapper(top_k_results=1, doc_content_chars_max=100)
tool = WikipediaQueryRun(api_wrapper=api_wrapper)
tools = [tool]

# Get the prompt to use - you can modify this!
# If you want to see the prompt in full, you can at: https://smith.langchain.com/hub/hwchase17/openai-functions-agent
prompt = hub.pull("hwchase17/openai-functions-agent")

llm = ChatOpenAI(temperature=0)

agent = create_openai_functions_agent(llm, tools, prompt)
```

`return_intermediate_steps=True` を指定して AgentExecutor を初期化します:

```python
agent_executor = AgentExecutor(
    agent=agent, tools=tools, verbose=True, return_intermediate_steps=True
)
```

```python
response = agent_executor.invoke({"input": "What is Leo DiCaprio's middle name?"})
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `Wikipedia` with `Leo DiCaprio`


[0m[36;1m[1;3mPage: Leonardo DiCaprio
Summary: Leonardo Wilhelm DiCaprio (; Italian: [diˈkaːprjo]; born November 1[0m[32;1m[1;3mLeonardo DiCaprio's middle name is Wilhelm.[0m

[1m> Finished chain.[0m
```

```python
# The actual return type is a NamedTuple for the agent action, and then an observation
print(response["intermediate_steps"])
```

```output
[(AgentActionMessageLog(tool='Wikipedia', tool_input='Leo DiCaprio', log='\nInvoking: `Wikipedia` with `Leo DiCaprio`\n\n\n', message_log=[AIMessage(content='', additional_kwargs={'function_call': {'name': 'Wikipedia', 'arguments': '{\n  "__arg1": "Leo DiCaprio"\n}'}})]), 'Page: Leonardo DiCaprio\nSummary: Leonardo Wilhelm DiCaprio (; Italian: [diˈkaːprjo]; born November 1')]
```
