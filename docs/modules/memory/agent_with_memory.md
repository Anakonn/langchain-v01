---
canonical: https://python.langchain.com/v0.1/docs/modules/memory/agent_with_memory
translated: false
---

# Memory in Agent

This notebook goes over adding memory to an Agent. Before going through this notebook, please walkthrough the following notebooks, as this will build on top of both of them:

- [Memory in LLMChain](/docs/modules/memory/adding_memory)
- [Custom Agents](/docs/modules/agents/how_to/custom_agent)

In order to add a memory to an agent we are going to perform the following steps:

1. We are going to create an `LLMChain` with memory.
2. We are going to use that `LLMChain` to create a custom Agent.

For the purposes of this exercise, we are going to create a simple custom Agent that has access to a search tool and utilizes the `ConversationBufferMemory` class.

```python
import os

from langchain.agents import Tool
from langchain_community.utilities import GoogleSearchAPIWrapper
```

```python
os.environ["GOOGLE_API_KEY"] = "GOOGLE_API_KEY"
os.environ["GOOGLE_CSE_ID"] = "GOOGLE_CSE_ID"
os.environ["OPENAI_API_KEY"] = "OPENAI_API_KEY"
search = GoogleSearchAPIWrapper()
tools = [
    Tool(
        name="Search",
        func=search.run,
        description="useful for when you need to answer questions about current events",
    )
]
```

Notice the usage of the `chat_history` variable in the `PromptTemplate`, which matches up with the dynamic key name in the `ConversationBufferMemory`.

```python
from langchain import hub
from langchain.agents import AgentExecutor, create_react_agent
from langchain.memory import ChatMessageHistory

prompt = hub.pull("hwchase17/react")

memory = ChatMessageHistory(session_id="test-session")
```

```python
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_openai import OpenAI

llm = OpenAI(temperature=0)
agent = create_react_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools)

agent_with_chat_history = RunnableWithMessageHistory(
    agent_executor,
    # This is needed because in most real world scenarios, a session id is needed
    # It isn't really used here because we are using a simple in memory ChatMessageHistory
    lambda session_id: memory,
    input_messages_key="input",
    history_messages_key="chat_history",
)
```

```python
agent_with_chat_history.invoke(
    {"input": "How many people live in canada?"},
    config={"configurable": {"session_id": "<foo>"}},
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m I should use the Search tool to find the most recent population data for Canada.
Action: Search
Action Input: "population of Canada"[0m[36;1m[1;3m{'type': 'population_result', 'place': 'Canada', 'population': '38.93 million', 'year': '2022'}[0m[32;1m[1;3m38.93 million people live in Canada as of 2022.
Final Answer: 38.93 million[0m

[1m> Finished chain.[0m
```

```output
{'input': 'How many people live in canada?',
 'chat_history': [],
 'output': '38.93 million'}
```

To test the memory of this agent, we can ask a followup question that relies on information in the previous exchange to be answered correctly.

```python
agent_with_chat_history.invoke(
    {"input": "what is their national anthem called?"},
    config={"configurable": {"session_id": "<foo>"}},
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m I should search for the country's name and "national anthem"
Action: Search
Action Input: "country name" national anthem[0m[36;1m[1;3m['"Liberté" ("Freedom") · "Esta É a Nossa Pátria Bem Amada" ("This Is Our Beloved Country") · "Dear Land of Guyana, of Rivers and Plains" · "La Dessalinienne" ("Song ...', 'National Anthem of Every Country ; Fiji, “Meda Dau Doka” (“God Bless Fiji”) ; Finland, “Maamme”. (“Our Land”) ; France, “La Marseillaise” (“The Marseillaise”).', 'List of national anthems ; Albania · Hymni i Flamurit · Algeria ; The Bahamas · March On, Bahamaland · Bahrain ; Cambodia · Nokoreach · Cameroon ; Madagascar · Ry ...', 'General information: Hatikvah (the Hope) is now firmly established as the Anthem of the State of Israel as well as the Jewish National Anthem. 1. While yet ...', 'National anthem · Afghanistan · Akrotiri · Albania · Algeria · American Samoa · Andorra · Angola · Anguilla.', 'Background > National anthems: Countries Compared ; IndonesiaIndonesia, Indonesia Raya ( Great Indonesia ) ; IranIran, Soroud-e Melli-e Jomhouri-e Eslami-e Iran ( ...', '1. Afghanistan, "Milli Surood" (National Anthem) · 2. Armenia, "Mer Hayrenik" (Our Fatherland) · 3. Azerbaijan (a transcontinental country with ...', 'National Anthems of all the countries of the world ; Star Spangled Banner with Lyrics, Vocals, and Beautiful Photos. Musicplay ; Russia National ...', "The countries with the ten newest anthem additions adopted them between 2006 to as recently as 2021. Let's take a look: ... Afghanistan's “Dā də bātorāno kor” (“ ..."][0m[32;1m[1;3mI now know the final answer
Final Answer: The national anthem of a country can be found by searching for the country's name and "national anthem".[0m

[1m> Finished chain.[0m
```

```output
{'input': 'what is their national anthem called?',
 'chat_history': [HumanMessage(content='How many people live in canada?'),
  AIMessage(content='38.93 million')],
 'output': 'The national anthem of a country can be found by searching for the country\'s name and "national anthem".'}
```

We can see that the agent remembered that the previous question was about Canada, and properly asked Google Search what the name of Canada's national anthem was.

For fun, let's compare this to an agent that does NOT have memory.

```python
agent = create_react_agent(llm, tools, prompt)
agent_executor_without_memory = AgentExecutor(agent=agent, tools=tools)
```

```python
agent_executor_without_memory.invoke({"input": "How many people live in canada?"})
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m I should use the Search tool to find the most recent population data for Canada.
Action: Search
Action Input: "population of Canada"[0m[36;1m[1;3m{'type': 'population_result', 'place': 'Canada', 'population': '38.93 million', 'year': '2022'}[0m[32;1m[1;3mI should check the source of the data to ensure it is reliable.
Action: Search
Action Input: "population of Canada source"[0m[36;1m[1;3mThe 2021 Canadian census enumerated a total population of 36,991,981, an increase of around 5.2 percent over the 2016 figure. It is estimated that Canada's population surpassed 40 million in 2023 and 41 million in 2024.[0m[32;1m[1;3m I now know the final answer.
Final Answer: The estimated population of Canada in 2022 is 38.93 million.[0m

[1m> Finished chain.[0m
```

```output
{'input': 'How many people live in canada?',
 'output': 'The estimated population of Canada in 2022 is 38.93 million.'}
```

```python
agent_executor_without_memory.invoke({"input": "what is their national anthem called?"})
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m I should search for the country's name and "national anthem"
Action: Search
Action Input: "country name" national anthem[0m[36;1m[1;3m['"Liberté" ("Freedom") · "Esta É a Nossa Pátria Bem Amada" ("This Is Our Beloved Country") · "Dear Land of Guyana, of Rivers and Plains" · "La Dessalinienne" ("Song ...', 'National Anthem of Every Country ; Fiji, “Meda Dau Doka” (“God Bless Fiji”) ; Finland, “Maamme”. (“Our Land”) ; France, “La Marseillaise” (“The Marseillaise”).', 'List of national anthems ; Albania · Hymni i Flamurit · Algeria ; The Bahamas · March On, Bahamaland · Bahrain ; Cambodia · Nokoreach · Cameroon ; Madagascar · Ry ...', 'General information: Hatikvah (the Hope) is now firmly established as the Anthem of the State of Israel as well as the Jewish National Anthem. 1. While yet ...', 'National anthem · Afghanistan · Akrotiri · Albania · Algeria · American Samoa · Andorra · Angola · Anguilla.', 'Background > National anthems: Countries Compared ; IndonesiaIndonesia, Indonesia Raya ( Great Indonesia ) ; IranIran, Soroud-e Melli-e Jomhouri-e Eslami-e Iran ( ...', '1. Afghanistan, "Milli Surood" (National Anthem) · 2. Armenia, "Mer Hayrenik" (Our Fatherland) · 3. Azerbaijan (a transcontinental country with ...', 'National Anthems of all the countries of the world ; Star Spangled Banner with Lyrics, Vocals, and Beautiful Photos. Musicplay ; Russia National ...', "The countries with the ten newest anthem additions adopted them between 2006 to as recently as 2021. Let's take a look: ... Afghanistan's “Dā də bātorāno kor” (“ ..."][0m[32;1m[1;3mI now know the final answer
Final Answer: The national anthem of Afghanistan is called "Milli Surood".[0m

[1m> Finished chain.[0m
```

```output
{'input': 'what is their national anthem called?',
 'output': 'The national anthem of Afghanistan is called "Milli Surood".'}
```