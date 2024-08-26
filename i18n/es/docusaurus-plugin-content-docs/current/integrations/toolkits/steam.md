---
translated: true
---

# Recomendación y detalles de juegos de Steam

>[Steam (Wikipedia)](https://en.wikipedia.org/wiki/Steam_(service)) es un servicio de distribución digital de videojuegos y una tienda en línea desarrollada por `Valve Corporation`. Proporciona actualizaciones de juegos automáticamente para los juegos de Valve y se ha expandido a la distribución de títulos de terceros. `Steam` ofrece varias características, como emparejamiento de servidores de juegos con medidas de Valve Anti-Cheat, redes sociales y servicios de transmisión de juegos.

>[Steam](https://store.steampowered.com/about/) es el destino definitivo para jugar, discutir y crear juegos.

El conjunto de herramientas de Steam tiene dos herramientas:
- `Detalles del juego`
- `Juegos recomendados`

Este cuaderno proporciona un recorrido por el uso de la API de Steam con LangChain para recuperar recomendaciones de juegos de Steam basadas en su inventario actual de juegos de Steam o para recopilar información sobre algunos juegos de Steam que proporcione.

## Configuración

Tenemos que instalar dos bibliotecas de Python.

## Importaciones

```python
%pip install --upgrade --quiet  python-steam-api python-decouple
```

## Asignar variables de entorno

Para usar este conjunto de herramientas, tenga a mano su clave API de OpenAI, la clave API de Steam (desde [aquí](https://steamcommunity.com/dev/apikey))) y su propio SteamID. Una vez que haya recibido una clave API de Steam, puede ingresarla como una variable de entorno a continuación.
El conjunto de herramientas leerá la clave API "STEAM_KEY" como una variable de entorno para autenticarlo, así que configúrelas aquí. También necesitará establecer su "OPENAI_API_KEY" y su "STEAM_ID".

```python
import os

os.environ["STEAM_KEY"] = "xyz"
os.environ["STEAM_ID"] = "123"
os.environ["OPENAI_API_KEY"] = "abc"
```

## Inicialización:

¡Inicialice el LLM, SteamWebAPIWrapper, SteamToolkit y, lo más importante, el agente langchain para procesar su consulta!

## Ejemplo

```python
from langchain.agents import AgentType, initialize_agent
from langchain_community.agent_toolkits.steam.toolkit import SteamToolkit
from langchain_community.utilities.steam import SteamWebAPIWrapper
from langchain_openai import OpenAI
```

```python
llm = OpenAI(temperature=0)
Steam = SteamWebAPIWrapper()
toolkit = SteamToolkit.from_steam_api_wrapper(Steam)
agent = initialize_agent(
    toolkit.get_tools(), llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True
)
```

```python
out = agent("can you give the information about the game Terraria")
print(out)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m I need to find the game details
Action: Get Games Details
Action Input: Terraria[0m
Observation: [36;1m[1;3mThe id is: 105600
The link is: https://store.steampowered.com/app/105600/Terraria/?snr=1_7_15__13
The price is: $9.99
The summary of the game is: Dig, Fight, Explore, Build:  The very world is at your fingertips as you fight for survival, fortune, and glory.   Will you delve deep into cavernous expanses in search of treasure and raw materials with which to craft ever-evolving gear, machinery, and aesthetics?   Perhaps you will choose instead to seek out ever-greater foes to test your mettle in combat?   Maybe you will decide to construct your own city to house the host of mysterious allies you may encounter along your travels? In the World of Terraria, the choice is yours!Blending elements of classic action games with the freedom of sandbox-style creativity, Terraria is a unique gaming experience where both the journey and the destination are completely in the player’s control.   The Terraria adventure is truly as unique as the players themselves!  Are you up for the monumental task of exploring, creating, and defending a world of your own?   Key features: Sandbox Play  Randomly generated worlds Free Content Updates
The supported languages of the game are: English, French, Italian, German, Spanish - Spain, Polish, Portuguese - Brazil, Russian, Simplified Chinese
[0m
Thought:[32;1m[1;3m I now know the final answer
Final Answer: Terraria is a game with an id of 105600, a link of https://store.steampowered.com/app/105600/Terraria/?snr=1_7_15__13, a price of $9.99, a summary of "Dig, Fight, Explore, Build:  The very world is at your fingertips as you fight for survival, fortune, and glory.   Will you delve deep into cavernous expanses in search of treasure and raw materials with which to craft ever-evolving gear, machinery, and aesthetics?   Perhaps you will choose instead to seek out ever-greater foes to test your mettle in combat?   Maybe you will decide to construct your own city to house the host of mysterious allies you may encounter along your travels? In the World of Terraria, the choice is yours!Blending elements of classic action games with the freedom of sandbox-style creativity, Terraria is a unique gaming experience where both the journey and the destination are completely in the player’s control.   The Terraria adventure is truly as unique as the players themselves!  Are you up for the monumental task of exploring, creating, and defending a[0m

[1m> Finished chain.[0m
{'input': 'can you give the information about the game Terraria', 'output': 'Terraria is a game with an id of 105600, a link of https://store.steampowered.com/app/105600/Terraria/?snr=1_7_15__13, a price of $9.99, a summary of "Dig, Fight, Explore, Build:  The very world is at your fingertips as you fight for survival, fortune, and glory.   Will you delve deep into cavernous expanses in search of treasure and raw materials with which to craft ever-evolving gear, machinery, and aesthetics?   Perhaps you will choose instead to seek out ever-greater foes to test your mettle in combat?   Maybe you will decide to construct your own city to house the host of mysterious allies you may encounter along your travels? In the World of Terraria, the choice is yours!Blending elements of classic action games with the freedom of sandbox-style creativity, Terraria is a unique gaming experience where both the journey and the destination are completely in the player’s control.   The Terraria adventure is truly as unique as the players themselves!  Are you up for the monumental task of exploring, creating, and defending a'}
```
