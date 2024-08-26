---
translated: true
---

# トークン使用量の追跡

このノートブックでは、特定の呼び出しのトークン使用量を追跡する方法について説明します。現在のところ、OpenAI APIでのみ実装されています。

まず、単一のLLM呼び出しのトークン使用量を追跡する非常に簡単な例を見てみましょう。

```python
from langchain_community.callbacks import get_openai_callback
from langchain_openai import OpenAI
```

```python
llm = OpenAI(model_name="gpt-3.5-turbo-instruct", n=2, best_of=2)
```

```python
with get_openai_callback() as cb:
    result = llm.invoke("Tell me a joke")
    print(cb)
```

```output
Tokens Used: 37
	Prompt Tokens: 4
	Completion Tokens: 33
Successful Requests: 1
Total Cost (USD): $7.2e-05
```

コンテキストマネージャ内のすべてが追跡されます。複数の呼び出しを順次追跡する例を以下に示します。

```python
with get_openai_callback() as cb:
    result = llm.invoke("Tell me a joke")
    result2 = llm.invoke("Tell me a joke")
    print(cb.total_tokens)
```

```output
72
```

チェーンやエージェントで複数のステップが使用される場合、それらすべてのステップが追跡されます。

```python
from langchain.agents import AgentType, initialize_agent, load_tools
from langchain_openai import OpenAI

llm = OpenAI(temperature=0)
tools = load_tools(["serpapi", "llm-math"], llm=llm)
agent = initialize_agent(
    tools, llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True
)
```

```python
with get_openai_callback() as cb:
    response = agent.run(
        "Who is Olivia Wilde's boyfriend? What is his current age raised to the 0.23 power?"
    )
    print(f"Total Tokens: {cb.total_tokens}")
    print(f"Prompt Tokens: {cb.prompt_tokens}")
    print(f"Completion Tokens: {cb.completion_tokens}")
    print(f"Total Cost (USD): ${cb.total_cost}")
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m I need to find out who Olivia Wilde's boyfriend is and then calculate his age raised to the 0.23 power.
Action: Search
Action Input: "Olivia Wilde boyfriend"[0m
Observation: [36;1m[1;3m["Olivia Wilde and Harry Styles took fans by surprise with their whirlwind romance, which began when they met on the set of Don't Worry Darling.", 'Olivia Wilde started dating Harry Styles after ending her years-long engagement to Jason Sudeikis — see their relationship timeline.', 'Olivia Wilde and Harry Styles were spotted early on in their relationship walking around London. (. Image ...', "Looks like Olivia Wilde and Jason Sudeikis are starting 2023 on good terms. Amid their highly publicized custody battle – and the actress' ...", 'The two started dating after Wilde split up with actor Jason Sudeikisin 2020. However, their relationship came to an end last November.', "Olivia Wilde and Harry Styles started dating during the filming of Don't Worry Darling. While the movie got a lot of backlash because of the ...", "Here's what we know so far about Harry Styles and Olivia Wilde's relationship.", 'Olivia and the Grammy winner kept their romance out of the spotlight as their relationship began just two months after her split from ex-fiancé ...', "Harry Styles and Olivia Wilde first met on the set of Don't Worry Darling and stepped out as a couple in January 2021. Relive all their biggest relationship ..."][0m
Thought:[32;1m[1;3m Harry Styles is Olivia Wilde's boyfriend.
Action: Search
Action Input: "Harry Styles age"[0m
Observation: [36;1m[1;3m29 years[0m
Thought:[32;1m[1;3m I need to calculate 29 raised to the 0.23 power.
Action: Calculator
Action Input: 29^0.23[0m
Observation: [33;1m[1;3mAnswer: 2.169459462491557[0m
Thought:[32;1m[1;3m I now know the final answer.
Final Answer: Harry Styles is Olivia Wilde's boyfriend and his current age raised to the 0.23 power is 2.169459462491557.[0m

[1m> Finished chain.[0m
Total Tokens: 2205
Prompt Tokens: 2053
Completion Tokens: 152
Total Cost (USD): $0.0441
```
