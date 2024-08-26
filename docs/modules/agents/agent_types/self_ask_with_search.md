---
canonical: https://python.langchain.com/v0.1/docs/modules/agents/agent_types/self_ask_with_search
sidebar_position: 7
translated: false
---

# Self-ask with search

This walkthrough showcases the self-ask with search agent.

```python
from langchain import hub
from langchain.agents import AgentExecutor, create_self_ask_with_search_agent
from langchain_community.llms import Fireworks
from langchain_community.tools.tavily_search import TavilyAnswer
```

## Initialize Tools

We will initialize the tools we want to use. This is a good tool because it gives us **answers** (not documents)

For this agent, only one tool can be used and it needs to be named "Intermediate Answer"

```python
tools = [TavilyAnswer(max_results=1, name="Intermediate Answer")]
```

## Create Agent

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

## Run Agent

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