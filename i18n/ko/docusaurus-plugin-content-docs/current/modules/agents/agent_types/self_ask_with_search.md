---
sidebar_position: 7
translated: true
---

# 검색을 통한 자기 질문

이 연습에서는 검색을 통한 자기 질문 에이전트를 소개합니다.

```python
from langchain import hub
from langchain.agents import AgentExecutor, create_self_ask_with_search_agent
from langchain_community.llms import Fireworks
from langchain_community.tools.tavily_search import TavilyAnswer
```

## 도구 초기화

우리는 사용할 도구를 초기화할 것입니다. 이는 **답변**을 제공하는 좋은 도구입니다(문서가 아님).

이 에이전트의 경우 하나의 도구만 사용할 수 있으며 "중간 답변"이라는 이름으로 지정해야 합니다.

```python
tools = [TavilyAnswer(max_results=1, name="Intermediate Answer")]
```

## 에이전트 생성

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

## 에이전트 실행

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
