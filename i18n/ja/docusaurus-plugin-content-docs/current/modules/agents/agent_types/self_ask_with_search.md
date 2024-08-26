---
sidebar_position: 7
translated: true
---

# 自問自答検索

このウォークスルーでは、自問自答検索エージェントを紹介します。

```python
from langchain import hub
from langchain.agents import AgentExecutor, create_self_ask_with_search_agent
from langchain_community.llms import Fireworks
from langchain_community.tools.tavily_search import TavilyAnswer
```

## ツールの初期化

使用するツールを初期化します。これは良いツールです。なぜなら、**回答**（文書ではなく）を提供してくれるからです。

このエージェントでは、1つのツールしか使用できず、それは「中間回答」と名付ける必要があります。

```python
tools = [TavilyAnswer(max_results=1, name="Intermediate Answer")]
```

## エージェントの作成

```python
# Get the prompt to use - you can modify this!
prompt = hub.pull("hwchase17/self-ask-with-search")
```

```python
# Choose the LLM that will drive the agent
llm = Fireworks()

# Construct the Self Ask With Search Agent
agent = create_self_ask_with_search_agent(llm, tools, prompt)
```

## エージェントの実行

```python
# Create an agent executor by passing in the agent and tools
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

```python
agent_executor.invoke(
    {"input": "What is the hometown of the reigning men's U.S. Open champion?"}
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m Yes.
Follow up: Who is the reigning men's U.S. Open champion?[0m[36;1m[1;3mThe reigning men's U.S. Open champion is Novak Djokovic. He won his 24th Grand Slam singles title by defeating Daniil Medvedev in the final of the 2023 U.S. Open.[0m[32;1m[1;3m
So the final answer is: Novak Djokovic.[0m

[1m> Finished chain.[0m
```

```output
{'input': "What is the hometown of the reigning men's U.S. Open champion?",
 'output': 'Novak Djokovic.'}
```
