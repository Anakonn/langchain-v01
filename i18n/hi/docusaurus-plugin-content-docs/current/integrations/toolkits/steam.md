---
translated: true
---

# स्टीम गेम अनुशंसा और गेम विवरण

>[स्टीम (विकिपीडिया)](https://en.wikipedia.org/wiki/Steam_(service)) एक वीडियो गेम डिजिटल वितरण सेवा और स्टोरफ्रंट है जिसे `Valve Corporation` द्वारा विकसित किया गया है। यह वाल्व के गेम्स के लिए स्वचालित रूप से गेम अपडेट प्रदान करता है, और तीसरे पक्ष के शीर्षकों को वितरित करने तक विस्तारित हुआ है। `स्टीम` विभिन्न सुविधाएं प्रदान करता है, जैसे गेम सर्वर मैचमेकिंग वाल्व एंटी-चीट उपाय, सामाजिक नेटवर्किंग और गेम स्ट्रीमिंग सेवाएं।

>[स्टीम](https://store.steampowered.com/about/) गेम खेलने, चर्चा करने और बनाने का अंतिम गंतव्य है।

स्टीम टूलकिट में दो उपकरण हैं:
- `गेम विवरण`
- `अनुशंसित गेम`

यह नोटबुक स्टीम एपीआई का उपयोग करके LangChain के साथ अपने वर्तमान स्टीम गेम इन्वेंटरी के आधार पर स्टीम गेम अनुशंसाएं प्राप्त करने या आपके द्वारा प्रदान किए गए कुछ स्टीम गेमों के बारे में जानकारी एकत्र करने का एक चरण-दर-चरण मार्गदर्शन प्रदान करता है।

## सेटअप करना

हमें दो पायथन लाइब्रेरी स्थापित करनी होगी।

## आयात

```python
%pip install --upgrade --quiet  python-steam-api python-decouple
```

## पर्यावरण चर आवंटित करना

इस टूलकिट का उपयोग करने के लिए, कृपया अपना OpenAI API कुंजी, स्टीम API कुंजी ([यहाँ से](https://steamcommunity.com/dev/apikey))) और अपना स्वयं का SteamID तैयार रखें। एक बार स्टीम API कुंजी प्राप्त करने के बाद, आप इसे नीचे दिए गए पर्यावरण चर के रूप में इनपुट कर सकते हैं।
टूलकिट "STEAM_KEY" API कुंजी को पर्यावरण चर के रूप में पढ़ेगा ताकि आप प्रमाणित हो सकें, इसलिए कृपया उन्हें यहां सेट करें। आपको "OPENAI_API_KEY" और "STEAM_ID" भी सेट करना होगा।

```python
import os

os.environ["STEAM_KEY"] = "xyz"
os.environ["STEAM_ID"] = "123"
os.environ["OPENAI_API_KEY"] = "abc"
```

## प्रारंभीकरण:

LLM, SteamWebAPIWrapper, SteamToolkit और सबसे महत्वपूर्ण langchain एजेंट को आपके प्रश्न को प्रोसेस करने के लिए प्रारंभ करें!

## उदाहरण

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
