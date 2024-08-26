---
translated: true
---

# Steam 게임 추천 및 게임 세부 정보

>[Steam (Wikipedia)](https://en.wikipedia.org/wiki/Steam_(service))은 `Valve Corporation`이 개발한 비디오 게임 디지털 배포 서비스 및 스토어프런트입니다. 이는 Valve의 게임에 대한 자동 게임 업데이트를 제공하며 타사 타이틀의 배포로 확장되었습니다. `Steam`은 Valve Anti-Cheat 조치를 통한 게임 서버 매칭, 소셜 네트워킹, 게임 스트리밍 서비스와 같은 다양한 기능을 제공합니다.

>[Steam](https://store.steampowered.com/about/)은 게임을 플레이하고, 토론하고, 만드는 최고의 목적지입니다.

Steam 도구 키트에는 두 가지 도구가 있습니다:
- `Game Details`
- `Recommended Games`

이 노트북은 현재 Steam 게임 인벤토리를 기반으로 Steam API와 LangChain을 사용하여 Steam 게임 추천을 검색하거나 제공된 Steam 게임에 대한 정보를 수집하는 방법을 안내합니다.

## 설정

두 개의 Python 라이브러리를 설치해야 합니다.

## 가져오기

```python
%pip install --upgrade --quiet  python-steam-api python-decouple
```

## 환경 변수 할당

이 도구 키트를 사용하려면 OpenAI API 키, Steam API 키(여기서 받기: [https://steamcommunity.com/dev/apikey](https://steamcommunity.com/dev/apikey)) 및 자신의 SteamID를 준비해야 합니다. Steam API 키를 받으면 아래와 같이 환경 변수로 입력할 수 있습니다.
이 도구 키트는 "STEAM_KEY" API 키를 환경 변수로 읽어 인증하므로 여기에 설정해 주세요. "OPENAI_API_KEY"와 "STEAM_ID"도 설정해야 합니다.

```python
import os

os.environ["STEAM_KEY"] = "xyz"
os.environ["STEAM_ID"] = "123"
os.environ["OPENAI_API_KEY"] = "abc"
```

## 초기화:

LLM, SteamWebAPIWrapper, SteamToolkit 및 가장 중요한 langchain 에이전트를 초기화하여 사용자의 쿼리를 처리합니다!

## 예시

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
