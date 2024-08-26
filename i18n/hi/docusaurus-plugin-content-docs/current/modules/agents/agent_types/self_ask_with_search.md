---
sidebar_position: 7
translated: true
---

# खोज के साथ स्वयं-पूछना

यह वॉकथ्रू खोज के साथ स्वयं-पूछने वाले एजेंट को प्रदर्शित करता है।

```python
from langchain import hub
from langchain.agents import AgentExecutor, create_self_ask_with_search_agent
from langchain_community.llms import Fireworks
from langchain_community.tools.tavily_search import TavilyAnswer
```

## उपकरणों को प्रारंभ करना

हम उपयोग करना चाहते हैं उन उपकरणों को प्रारंभ करेंगे। यह एक अच्छा उपकरण है क्योंकि यह हमें **उत्तर** देता है (दस्तावेज नहीं)

इस एजेंट के लिए, केवल एक उपकरण का उपयोग किया जा सकता है और इसे "मध्यवर्ती उत्तर" नाम दिया जाना चाहिए।

```python
tools = [TavilyAnswer(max_results=1, name="Intermediate Answer")]
```

## एजेंट बनाएं

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

## एजेंट चलाएं

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
