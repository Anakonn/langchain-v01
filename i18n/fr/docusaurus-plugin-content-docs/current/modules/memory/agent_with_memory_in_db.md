---
translated: true
---

# Mémoire des messages dans un agent basé sur une base de données

Ce cahier d'exercices aborde l'ajout de mémoire à un agent où la mémoire utilise un magasin de messages externe. Avant de parcourir ce cahier d'exercices, veuillez suivre les cahiers d'exercices suivants, car celui-ci s'appuiera sur les deux :

- [Mémoire dans LLMChain](/docs/modules/memory/adding_memory)
- [Agents personnalisés](/docs/modules/agents/how_to/custom_agent)
- [Mémoire dans l'agent](/docs/modules/memory/agent_with_memory)

Afin d'ajouter une mémoire avec un magasin de messages externe à un agent, nous allons effectuer les étapes suivantes :

1. Nous allons créer un `RedisChatMessageHistory` pour se connecter à une base de données externe afin de stocker les messages.
2. Nous allons créer une `LLMChain` en utilisant cette chronologie des discussions comme mémoire.
3. Nous allons utiliser cette `LLMChain` pour créer un agent personnalisé.

Pour les besoins de cet exercice, nous allons créer un agent personnalisé simple qui a accès à un outil de recherche et utilise la classe `ConversationBufferMemory`.

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

Notez l'utilisation de la variable `chat_history` dans le `PromptTemplate`, qui correspond au nom de clé dynamique dans le `ConversationBufferMemory`.

```python
prompt = hub.pull("hwchase17/react")
```

Nous pouvons maintenant construire le `RedisChatMessageHistory` basé sur la base de données.

```python
message_history = RedisChatMessageHistory(
    url="redis://127.0.0.1:6379/0", ttl=600, session_id="my-session"
)
```

Nous pouvons maintenant construire la `LLMChain`, avec l'objet Mémoire, puis créer l'agent.

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

Pour tester la mémoire de cet agent, nous pouvons poser une question de suivi qui s'appuie sur les informations de l'échange précédent pour être correctement répondue.

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

Nous pouvons voir que l'agent se souvenait que la question précédente portait sur le Canada et a correctement demandé à Google Search quel était l'hymne national du Canada.

Pour le plaisir, comparons cela à un agent qui n'a PAS de mémoire.

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
