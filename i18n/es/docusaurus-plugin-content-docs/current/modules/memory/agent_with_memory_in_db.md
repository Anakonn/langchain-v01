---
translated: true
---

# Memoria de mensajes en un agente respaldado por una base de datos

Este cuaderno analiza cómo agregar memoria a un agente donde la memoria utiliza un almacén de mensajes externo. Antes de recorrer este cuaderno, por favor, recorra los siguientes cuadernos, ya que este se basará en ambos:

- [Memoria en LLMChain](/docs/modules/memory/adding_memory)
- [Agentes personalizados](/docs/modules/agents/how_to/custom_agent)
- [Memoria en Agente](/docs/modules/memory/agent_with_memory)

Para agregar una memoria con un almacén de mensajes externo a un agente, vamos a realizar los siguientes pasos:

1. Vamos a crear un `RedisChatMessageHistory` para conectarnos a una base de datos externa y almacenar los mensajes.
2. Vamos a crear una `LLMChain` utilizando ese historial de chat como memoria.
3. Vamos a usar esa `LLMChain` para crear un agente personalizado.

Para los fines de este ejercicio, vamos a crear un agente personalizado simple que tenga acceso a una herramienta de búsqueda y utilice la clase `ConversationBufferMemory`.

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

Observe el uso de la variable `chat_history` en la `PromptTemplate`, que coincide con el nombre de clave dinámico en `ConversationBufferMemory`.

```python
prompt = hub.pull("hwchase17/react")
```

Ahora podemos crear el `RedisChatMessageHistory` respaldado por la base de datos.

```python
message_history = RedisChatMessageHistory(
    url="redis://127.0.0.1:6379/0", ttl=600, session_id="my-session"
)
```

Ahora podemos construir la `LLMChain`, con el objeto Memory, y luego crear el agente.

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

Para probar la memoria de este agente, podemos hacer una pregunta de seguimiento que se base en la información del intercambio anterior para ser respondida correctamente.

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

Podemos ver que el agente recordó que la pregunta anterior era sobre Canadá y le preguntó correctamente a Google Search cuál es el himno nacional de Canadá.

Por diversión, comparémoslo con un agente que NO tenga memoria.

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
