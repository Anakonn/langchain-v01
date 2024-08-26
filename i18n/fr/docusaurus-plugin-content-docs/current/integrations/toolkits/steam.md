---
translated: true
---

# Recommandation et détails des jeux Steam

>[Steam (Wikipédia)](https://en.wikipedia.org/wiki/Steam_(service)) est un service de distribution numérique et une place de marché de jeux vidéo développé par `Valve Corporation`. Il fournit automatiquement des mises à jour de jeux pour les jeux de Valve et s'est étendu à la distribution de titres tiers. `Steam` offre diverses fonctionnalités, comme le matchmaking de serveurs de jeux avec des mesures anti-triche de Valve, le réseautage social et les services de diffusion de jeux.

>[Steam](https://store.steampowered.com/about/) est la destination ultime pour jouer, discuter et créer des jeux.

La boîte à outils Steam a deux outils :
- `Détails du jeu`
- `Jeux recommandés`

Ce carnet fournit un aperçu de l'utilisation de l'API Steam avec LangChain pour récupérer des recommandations de jeux Steam en fonction de votre inventaire de jeux Steam actuel ou pour rassembler des informations sur certains jeux Steam que vous fournissez.

## Configuration

Nous devons installer deux bibliothèques Python.

## Imports

```python
%pip install --upgrade --quiet  python-steam-api python-decouple
```

## Attribuer des variables d'environnement

Pour utiliser cette boîte à outils, veuillez avoir votre clé API OpenAI, votre clé API Steam (à partir de [ici](https://steamcommunity.com/dev/apikey))) et votre propre SteamID à portée de main. Une fois que vous aurez reçu une clé API Steam, vous pouvez la saisir en tant que variable d'environnement ci-dessous.
La boîte à outils lira la clé API "STEAM_KEY" en tant que variable d'environnement pour vous authentifier, donc veuillez les définir ici. Vous aurez également besoin de définir votre "OPENAI_API_KEY" et votre "STEAM_ID".

```python
import os

os.environ["STEAM_KEY"] = "xyz"
os.environ["STEAM_ID"] = "123"
os.environ["OPENAI_API_KEY"] = "abc"
```

## Initialisation :

Initialisez le LLM, SteamWebAPIWrapper, SteamToolkit et surtout l'agent langchain pour traiter votre requête !

## Exemple

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
