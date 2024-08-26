---
translated: true
---

# Steam ゲームの推奨とゲームの詳細

>[Steam (Wikipedia)](https://en.wikipedia.org/wiki/Steam_(service))は、`Valve Corporation`が開発したビデオゲームのデジタル配信サービスとストアフロントです。Valveのゲームの自動アップデートを提供し、サードパーティのタイトルも配布するようになりました。`Steam`には、Valve Anti-Cheatによるゲームサーバーのマッチメイキング、ソーシャルネットワーキング、ゲームストリーミングサービスなどの機能があります。

>[Steam](https://store.steampowered.com/about/)は、ゲームをプレイ、議論、そして作成するための究極の目的地です。

Steamツールキットには2つのツールがあります:
- `ゲームの詳細`
- `おすすめのゲーム`

このノートブックでは、LangChainを使ってSteam APIを使用する方法を説明します。現在のSteamゲームインベントリに基づいてSteamゲームの推奨を取得したり、提供されたSteamゲームの情報を収集したりすることができます。

## セットアップ

2つのPythonライブラリをインストールする必要があります。

## インポート

```python
%pip install --upgrade --quiet  python-steam-api python-decouple
```

## 環境変数の割り当て

このツールキットを使用するには、OpenAI API Key、Steam API key ([ここ](https://steamcommunity.com/dev/apikey))から取得)、自分のSteamIDを用意する必要があります。Steam API Keyを受け取ったら、環境変数として以下に入力してください。
ツールキットは "STEAM_KEY" API Keyを環境変数として読み取ってあなたを認証するので、ここに設定してください。また、"OPENAI_API_KEY"と"STEAM_ID"も設定する必要があります。

```python
import os

os.environ["STEAM_KEY"] = "xyz"
os.environ["STEAM_ID"] = "123"
os.environ["OPENAI_API_KEY"] = "abc"
```

## 初期化:

LLM、SteamWebAPIWrapper、SteamToolkit、そして何より重要なlangchainエージェントを初期化して、クエリを処理します!

## 例

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
