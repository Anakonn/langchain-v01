---
translated: true
---

# Búsqueda de Tavily

[La API de búsqueda de Tavily](https://tavily.com) es un motor de búsqueda construido específicamente para agentes de IA (LLM), que entrega resultados en tiempo real, precisos y factuales a gran velocidad.

## Configuración

La integración se encuentra en el paquete `langchain-community`. También necesitamos instalar el paquete `tavily-python` en sí.

```bash
pip install -U langchain-community tavily-python
```

También necesitamos establecer nuestra clave API de Tavily.

```python
import getpass
import os

os.environ["TAVILY_API_KEY"] = getpass.getpass()
```

También es útil (pero no necesario) configurar [LangSmith](https://smith.langchain.com/) para una observabilidad de primera clase.

```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## Uso

Aquí mostramos cómo usar la herramienta individualmente.

```python
from langchain_community.tools.tavily_search import TavilySearchResults

tool = TavilySearchResults()
```

```python
tool.invoke({"query": "What happened in the latest burning man floods"})
```

```output
[{'url': 'https://apnews.com/article/burning-man-flooding-nevada-stranded-3971a523f4b993f8f35e158fd1a17a1e',
  'content': 'festival goers are helped off a truck from the Burning Man festival site in Black Rock, Nev., on Monday, Sept. 4, 2023.  festival goers are helped off a truck from the Burning Man festival site in Black Rock, Nev., on Monday, Sept. 4, 2023.  at the site of the Burning Man festival where thousands of attendees remained stranded as flooding from storms swept  at the site of the Burning Man festival where thousands of attendees remained stranded as flooding from storms sweptRENO, Nev. (AP) — The traffic jam leaving the Burning Man festival eased up considerably Tuesday as the exodus from the mud-caked Nevada desert entered another day following massive rain that left tens of thousands of partygoers stranded for days.'},
 {'url': 'https://www.theguardian.com/culture/2023/sep/03/burning-man-nevada-festival-floods',
  'content': 'Officials investigate death at Burning Man as thousands stranded by floods  Burning Man festival-goers trapped in desert as rain turns site to mud  the burning of a giant sculpture to cap off the event, if weather permits. The festival said the roads remain too wet  Burning Man festivalgoers surrounded by mud in Nevada desert – videoMichael Sainato @msainat1 Sun 3 Sep 2023 14.31 EDT Over 70,000 attendees of the annual Burning Man festival in the Black Rock desert of Nevada are stranded as the festival comes to a close on...'},
 {'url': 'https://abcnews.go.com/US/burning-man-flooding-happened-stranded-festivalgoers/story?id=102908331',
  'content': 'ABC News Video Live Shows Election 2024 538 Stream on Burning Man flooding: What happened to stranded festivalgoers?  Tens of thousands of Burning Man attendees are now able to leave the festival after a downpour and massive flooding  Burning Man has been hosted for over 30 years, according to a statement from the organizers.  people last year, and just as many were expected this year. Burning Man began on Aug. 28 and was scheduled to runJulie Jammot/AFP via Getty Images Tens of thousands of Burning Man attendees are now able to leave the festival after a downpour and massive flooding left them stranded over the weekend. The festival, held in the Black Rock Desert in northwestern Nevada, was attended by more than 70,000 people last year, and just as many were expected this year.'},
 {'url': 'https://www.vox.com/culture/2023/9/6/23861675/burning-man-2023-mud-stranded-climate-change-playa-foot',
  'content': 'This year’s rains opened the floodgates for Burning Man criticism  Pray for him people #burningman #burningman2023 #titanicsound #mud #festival  who went to Burning Man  that large wooden Man won’t be the only one burning.Celebrity Culture The Burning Man flameout, explained Climate change — and schadenfreude — finally caught up to the survivalist cosplayers. By Aja Romano @ajaromano Sep 6, 2023, 3:00pm EDT Share'},
 {'url': 'https://www.cnn.com/2023/09/03/us/burning-man-storms-shelter-sunday/index.html',
  'content': 'Editor’s Note: Find the latest Burning Man festival coverage here.  CNN values your feedback More than 70,000 Burning Man festival attendees remain stuck in Nevada desert after rain  Burning Man organizers said Sunday night.  Thousands of people remain trapped at the Burning Man festival in the Nevada desert after heavy rains inundated the"A mucky, muddy, environment." This is what Burning Man looks like See More Videos Editor\'s Note: Find the latest Burning Man festival coverage here. CNN —'}]
```

## Encadenamiento

Aquí mostramos cómo usarlo como parte de un [agente](/docs/modules/agents). Usaremos el Agente de Funciones de OpenAI, por lo que tendremos que configurar e instalar las dependencias requeridas para eso. También usaremos [LangSmith Hub](https://smith.langchain.com/hub) para extraer el mensaje, por lo que tendremos que instalar eso.

```bash
pip install -U langchain-openai langchainhub
```

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()
```

```python
from langchain import hub
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain_openai import ChatOpenAI

instructions = """You are an assistant."""
base_prompt = hub.pull("langchain-ai/openai-functions-template")
prompt = base_prompt.partial(instructions=instructions)
llm = ChatOpenAI(temperature=0)
tavily_tool = TavilySearchResults()
tools = [tavily_tool]
agent = create_openai_functions_agent(llm, tools, prompt)
agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True,
)
```

```python
agent_executor.invoke({"input": "What happened in the latest burning man floods?"})
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `tavily_search_results_json` with `{'query': 'latest burning man floods'}`


[0m[36;1m[1;3m[{'url': 'https://www.politifact.com/factchecks/2023/sep/06/instagram-posts/there-were-floods-there-was-mud-but-burning-man-sp/', 'content': 'The Associated Press, Burning Man flooding triggers false claims of Ebola outbreak, ‘national emergency,’ Sept. 5, 2023  BBC, Thousands queue for hours to leave Burning Man festival, Sept. 5, 2023  Newsweek, Is FEMA at Burning Man? Virus Outbreak Conspiracy Theory Spreads Online, Sept. 4, 2023  CBS News, Burning Man "exodus operations" begin as driving ban is lifted, organizers say, Sept. 4, 2023(AP) By Madison Czopek September 6, 2023 There were floods, there was mud, but Burning Man sparked no emergency declaration If Your Time is short Heavy rain began falling Sept. 1 in Nevada\'s...'}, {'url': 'https://www.nbcnews.com/news/us-news/live-blog/live-updates-burning-man-flooding-keeps-thousands-stranded-nevada-site-rcna103193', 'content': 'As heavy rain turns Burning Man 2023 into a muddy mess, a deluge of unsympathetic jokes has swamped the internet  Burning Man flooding keeps thousands stranded at Nevada site as authorities investigate 1 death  Burning Man revelers unfazed by deluge and deep mud Reuters  The flash flood watch is in effect until tomorrow morning. Burning Man is ‘absolutely soaked,’ festivalgoer saysThousands of Burning Man attendees partied hard on Sunday despite downpours that turned the Nevada desert where the annual arts and music festival takes place into a sea of sticky mud and led...'}, {'url': 'https://apnews.com/article/burning-man-flooding-nevada-stranded-3971a523f4b993f8f35e158fd1a17a1e', 'content': 'festival goers are helped off a truck from the Burning Man festival site in Black Rock, Nev., on Monday, Sept. 4, 2023.  festival goers are helped off a truck from the Burning Man festival site in Black Rock, Nev., on Monday, Sept. 4, 2023.  at the site of the Burning Man festival where thousands of attendees remained stranded as flooding from storms swept  at the site of the Burning Man festival where thousands of attendees remained stranded as flooding from storms sweptRENO, Nev. (AP) — The traffic jam leaving the Burning Man festival eased up considerably Tuesday as the exodus from the mud-caked Nevada desert entered another day following massive rain that left tens of thousands of partygoers stranded for days.'}, {'url': 'https://apnews.com/article/burning-man-flooding-nevada-stranded-0726190c9f8378935e2a3cce7f154785', 'content': 'festival goers are helped off a truck from the Burning Man festival site in Black Rock, Nev., on Monday, Sept. 4, 2023.  festival goers are helped off a truck from the Burning Man festival site in Black Rock, Nev., on Monday, Sept. 4, 2023.  at the site of the Burning Man festival where thousands of attendees remained stranded as flooding from storms swept  Wait times to exit Burning Man drop after flooding left tens of thousands stranded in Nevada desertFILE - In this satellite photo provided by Maxar Technologies, an overview of Burning Man festival in Black Rock, Nev on Monday, Aug. 28, 2023. Authorities in Nevada were investigating a death at the site of the Burning Man festival where thousands of attendees remained stranded as flooding from storms swept through the Nevada desert.'}, {'url': 'https://www.theguardian.com/culture/2023/sep/03/burning-man-nevada-festival-floods', 'content': 'Officials investigate death at Burning Man as thousands stranded by floods  Burning Man festival-goers trapped in desert as rain turns site to mud  the burning of a giant sculpture to cap off the event, if weather permits. The festival said the roads remain too wet  Burning Man festivalgoers surrounded by mud in Nevada desert – videoMichael Sainato @msainat1 Sun 3 Sep 2023 14.31 EDT Over 70,000 attendees of the annual Burning Man festival in the Black Rock desert of Nevada are stranded as the festival comes to a close on...'}][0m[32;1m[1;3mThe latest Burning Man festival experienced heavy rain, resulting in floods and muddy conditions. Thousands of attendees were stranded at the festival site in Nevada. There were false claims of an Ebola outbreak and a national emergency, but no emergency declaration was made. One death was reported at the festival, which is currently under investigation. Despite the challenging conditions, many festivalgoers remained unfazed and continued to enjoy the event. The exodus from the festival site began as the mud-caked desert started to dry up. Authorities issued a flash flood watch, and investigations are ongoing regarding the death at the festival.[0m

[1m> Finished chain.[0m
```

```output
{'input': 'What happened in the latest burning man floods?',
 'output': 'The latest Burning Man festival experienced heavy rain, resulting in floods and muddy conditions. Thousands of attendees were stranded at the festival site in Nevada. There were false claims of an Ebola outbreak and a national emergency, but no emergency declaration was made. One death was reported at the festival, which is currently under investigation. Despite the challenging conditions, many festivalgoers remained unfazed and continued to enjoy the event. The exodus from the festival site began as the mud-caked desert started to dry up. Authorities issued a flash flood watch, and investigations are ongoing regarding the death at the festival.'}
```
