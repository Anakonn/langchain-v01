---
translated: true
---

# 에이전트의 메모리

이 노트북은 에이전트에 메모리를 추가하는 것에 대해 설명합니다. 이 노트북을 살펴보기 전에 다음 노트북을 먼저 살펴보시기 바랍니다. 이 노트북은 이 두 노트북을 기반으로 합니다:

- [LLMChain의 메모리](/docs/modules/memory/adding_memory)
- [사용자 정의 에이전트](/docs/modules/agents/how_to/custom_agent)

에이전트에 메모리를 추가하기 위해 다음과 같은 단계를 수행할 것입니다:

1. 메모리가 있는 `LLMChain`을 만들 것입니다.
2. 그 `LLMChain`을 사용하여 사용자 정의 에이전트를 만들 것입니다.

이 연습의 목적을 위해, 검색 도구에 액세스할 수 있고 `ConversationBufferMemory` 클래스를 활용하는 간단한 사용자 정의 에이전트를 만들 것입니다.

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

`PromptTemplate`에서 `chat_history` 변수를 사용한 것을 주목하세요. 이는 `ConversationBufferMemory`의 동적 키 이름과 일치합니다.

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

이 에이전트의 메모리를 테스트하기 위해, 이전 대화의 정보에 의존하여 올바르게 답변할 수 있는 후속 질문을 할 수 있습니다.

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

에이전트가 이전 질문이 캐나다에 대한 것이었다는 것을 기억하고 캐나다의 국가 anthem의 이름을 Google 검색으로 적절히 질문했음을 볼 수 있습니다.

재미삼아, 메모리가 없는 에이전트와 비교해 보겠습니다.

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
