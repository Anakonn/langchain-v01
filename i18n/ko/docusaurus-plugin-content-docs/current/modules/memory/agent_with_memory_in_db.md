---
translated: true
---

# 데이터베이스 지원 에이전트의 메시지 메모리

이 노트북은 외부 메시지 저장소를 사용하는 메모리를 가진 에이전트를 추가하는 방법을 다룹니다. 이 노트북을 진행하기 전에 다음 노트북을 먼저 살펴보시기 바랍니다. 이 노트북은 이를 기반으로 합니다:

- [LLMChain의 메모리](/docs/modules/memory/adding_memory)
- [사용자 정의 에이전트](/docs/modules/agents/how_to/custom_agent)
- [에이전트의 메모리](/docs/modules/memory/agent_with_memory)

외부 메시지 저장소를 사용하는 메모리를 에이전트에 추가하기 위해 다음과 같은 단계를 수행할 것입니다:

1. `RedisChatMessageHistory`를 만들어 외부 데이터베이스에 메시지를 저장할 수 있도록 합니다.
2. 해당 채팅 기록을 메모리로 사용하는 `LLMChain`을 만듭니다.
3. 해당 `LLMChain`을 사용하여 사용자 정의 에이전트를 만듭니다.

이 연습을 위해 검색 도구에 액세스할 수 있고 `ConversationBufferMemory` 클래스를 활용하는 간단한 사용자 정의 에이전트를 만들 것입니다.

```python
import os

from langchain import hub
from langchain.agents import AgentExecutor, Tool
from langchain_community.chat_message_histories import RedisChatMessageHistory
from langchain_community.utilities import SerpAPIWrapper
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_openai import OpenAI
```

```python
os.environ["GOOGLE_API_KEY"] = "GOOGLE_API_KEY"
os.environ["GOOGLE_CSE_ID"] = "GOOGLE_CSE_ID"
os.environ["OPENAI_API_KEY"] = "OPENAI_API_KEY"

search = SerpAPIWrapper()
tools = [
    Tool(
        name="Search",
        func=search.run,
        description="useful for when you need to answer questions about current events",
    )
]
```

`PromptTemplate`에서 `chat_history` 변수를 사용하는 것을 주목하세요. 이는 `ConversationBufferMemory`의 동적 키 이름과 일치합니다.

```python
prompt = hub.pull("hwchase17/react")
```

이제 데이터베이스 지원 `RedisChatMessageHistory`를 만들 수 있습니다.

```python
message_history = RedisChatMessageHistory(
    url="redis://127.0.0.1:6379/0", ttl=600, session_id="my-session"
)
```

이제 메모리 객체와 함께 `LLMChain`을 구성하고 에이전트를 만들 수 있습니다.

```python
from langchain.agents import create_react_agent

model = OpenAI()
agent = create_react_agent(model, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

```python
agent_with_chat_history = RunnableWithMessageHistory(
    agent_executor,
    # This is needed because in most real world scenarios, a session id is needed
    # It isn't really used here because we are using a simple in memory ChatMessageHistory
    lambda session_id: message_history,
    input_messages_key="input",
    history_messages_key="chat_history",
)

agent_with_chat_history.invoke(
    {"input": "How many people live in canada?"},
    config={"configurable": {"session_id": "<foo>"}},
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m I should use the Search tool to find the latest population data for Canada.
Action: Search
Action Input: "population of canada"[0m[36;1m[1;3m{'type': 'population_result', 'place': 'Canada', 'population': '38.93 million', 'year': '2022'}[0m[32;1m[1;3mI now know the final answer
Final Answer: The final answer to the original input question is 38.93 million people live in Canada as of 2022.[0m

[1m> Finished chain.[0m
```

```output
{'input': 'How many people live in canada?',
 'chat_history': [],
 'output': 'The final answer to the original input question is 38.93 million people live in Canada as of 2022.'}
```

이 에이전트의 메모리를 테스트하기 위해 이전 대화의 정보에 의존하는 후속 질문을 할 수 있습니다.

```python
agent_with_chat_history.invoke(
    {"input": "what is their national anthem called?"},
    config={"configurable": {"session_id": "<foo>"}},
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m There are many countries in the world with different national anthems, so I may need to specify which country's national anthem I am looking for.
Action: Search
Action Input: "national anthem" + country name[0m[36;1m[1;3m['"Liberté" ("Freedom") · "Esta É a Nossa Pátria Bem Amada" ("This Is Our Beloved Country") · "Dear Land of Guyana, of Rivers and Plains" · "La Dessalinienne" ("Song ...', 'National Anthem of Every Country ; Fiji, “Meda Dau Doka” (“God Bless Fiji”) ; Finland, “Maamme”. (“Our Land”) ; France, “La Marseillaise” (“The Marseillaise”).', 'List of national anthems ; Albania · Hymni i Flamurit · Algeria ; The Bahamas · March On, Bahamaland · Bahrain ; Cambodia · Nokoreach · Cameroon ; Madagascar · Ry ...', 'General information: Hatikvah (the Hope) is now firmly established as the Anthem of the State of Israel as well as the Jewish National Anthem. 1. While yet ...', 'National anthem · Afghanistan · Akrotiri · Albania · Algeria · American Samoa · Andorra · Angola · Anguilla.', 'Background > National anthems: Countries Compared ; DjiboutiDjibouti, Djibouti ; DominicaDominica, Isle of Beauty, Isle of Splendour ; Dominican RepublicDominican ...', "Today, the total number is massive, with all 193 UN countries having a national anthem. Former and non-UN countries' anthems add to the list. Due to space ...", '1. United States of America - The Star-Spangled Banner · 2. United Kingdom - God Save the Queen/King · 3. Canada - O Canada · 4. France - La ...', "Pedro I wrote the song that was used as the national anthem of Brazil from 1822 to 1831. The song is now recognized as the country's official patriotic song. 7."][0m[32;1m[1;3mI now know the final answer
Final Answer: The final answer cannot be determined without specifying which country's national anthem is being referred to.[0m

[1m> Finished chain.[0m
```

```output
{'input': 'what is their national anthem called?',
 'chat_history': [HumanMessage(content='How many people live in canada?'),
  AIMessage(content='The final answer to the original input question is 38.93 million people live in Canada as of 2022.')],
 'output': "The final answer cannot be determined without specifying which country's national anthem is being referred to."}
```

에이전트가 이전 질문이 캐나다에 대한 것이었다는 것을 기억하고 캐나다의 국가 anthem 이름을 Google 검색으로 올바르게 질문했음을 확인할 수 있습니다.

재미삼아 메모리가 없는 에이전트와 비교해 보겠습니다.

```python
agent = create_react_agent(model, tools, prompt)
agent_executor__without_memory = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

```python
agent_executor__without_memory.invoke({"input": "How many people live in canada?"})
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m To find the number of people living in Canada, I should use a search engine to look for a reliable source.
Action: Search
Action Input: "Population of Canada"[0m[36;1m[1;3m{'type': 'population_result', 'place': 'Canada', 'population': '38.93 million', 'year': '2022'}[0m[32;1m[1;3m38.93 million people live in Canada as of 2022.
Final Answer: 38.93 million people live in Canada.[0m

[1m> Finished chain.[0m
```

```output
{'input': 'How many people live in canada?',
 'output': '38.93 million people live in Canada.'}
```

```python
agent_executor__without_memory.invoke(
    {"input": "what is their national anthem called?"}
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m I should always think about what to do
Action: Search
Action Input: "national anthem of [country name]"[0m[36;1m[1;3m['Most nation states have an anthem, defined as "a song, as of praise, devotion, or patriotism"; most anthems are either marches or hymns in style.', 'National Anthem of Every Country ; Fiji, “Meda Dau Doka” (“God Bless Fiji”) ; Finland, “Maamme”. (“Our Land”) ; France, “La Marseillaise” (“The Marseillaise”).', 'List of national anthems ; Albania · Hymni i Flamurit · Algeria ; The Bahamas · March On, Bahamaland · Bahrain ; Cambodia · Nokoreach · Cameroon ; Madagascar · Ry ...', 'General Information: First sung in 1844 with the title,. Sang till Norden (Song of the North). Its use as a. National Anthem dates from 1880-90. 1. Thou ancient ...', 'National anthem · Afghanistan · Akrotiri · Albania · Algeria · American Samoa · Andorra · Angola · Anguilla.', 'Background > National anthems: Countries Compared ; IndiaIndia, Jana Gana Mana ( Hail the ruler of all minds ) ; IndonesiaIndonesia, Indonesia Raya ( Great ...', '1. Afghanistan, "Milli Surood" (National Anthem) · 2. Armenia, "Mer Hayrenik" (Our Fatherland) · 3. Azerbaijan (a transcontinental country with ...', 'National Anthems of all the countries of the world ; Star Spangled Banner with Lyrics, Vocals, and Beautiful Photos. Musicplay ; Russia National ...', 'Himno Nacional del Perú, also known as Marcha Nacional del Perú or Somos libres, was selected as the national anthem of Peru in a public contest. Shortly after ...'][0m[32;1m[1;3mI now know the final answer
Final Answer: It depends on the country, but their national anthem can be found by searching "national anthem of [country name]".[0m

[1m> Finished chain.[0m
```

```output
{'input': 'what is their national anthem called?',
 'output': 'It depends on the country, but their national anthem can be found by searching "national anthem of [country name]".'}
```
