---
translated: true
---

# OpenWeatherMap

이 노트북은 `OpenWeatherMap` 구성 요소를 사용하여 날씨 정보를 가져오는 방법을 설명합니다.

먼저 `OpenWeatherMap API` 키를 등록해야 합니다:

1. OpenWeatherMap에 가입하고 API 키를 [여기](https://openweathermap.org/api/)에서 받으세요.
2. pip install pyowm

그런 다음 환경 변수를 설정해야 합니다:
1. API KEY를 OPENWEATHERMAP_API_KEY 환경 변수에 저장하세요.

## 래퍼 사용하기

```python
import os

from langchain_community.utilities import OpenWeatherMapAPIWrapper

os.environ["OPENWEATHERMAP_API_KEY"] = ""

weather = OpenWeatherMapAPIWrapper()
```

```python
weather_data = weather.run("London,GB")
print(weather_data)
```

```output
In London,GB, the current weather is as follows:
Detailed status: broken clouds
Wind speed: 2.57 m/s, direction: 240°
Humidity: 55%
Temperature:
  - Current: 20.12°C
  - High: 21.75°C
  - Low: 18.68°C
  - Feels like: 19.62°C
Rain: {}
Heat index: None
Cloud cover: 75%
```

## 도구 사용하기

```python
import os

from langchain.agents import AgentType, initialize_agent, load_tools
from langchain_openai import OpenAI

os.environ["OPENAI_API_KEY"] = ""
os.environ["OPENWEATHERMAP_API_KEY"] = ""

llm = OpenAI(temperature=0)

tools = load_tools(["openweathermap-api"], llm)

agent_chain = initialize_agent(
    tools=tools, llm=llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True
)
```

```python
agent_chain.run("What's the weather like in London?")
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m I need to find out the current weather in London.
Action: OpenWeatherMap
Action Input: London,GB[0m
Observation: [36;1m[1;3mIn London,GB, the current weather is as follows:
Detailed status: broken clouds
Wind speed: 2.57 m/s, direction: 240°
Humidity: 56%
Temperature:
  - Current: 20.11°C
  - High: 21.75°C
  - Low: 18.68°C
  - Feels like: 19.64°C
Rain: {}
Heat index: None
Cloud cover: 75%[0m
Thought:[32;1m[1;3m I now know the current weather in London.
Final Answer: The current weather in London is broken clouds, with a wind speed of 2.57 m/s, direction 240°, humidity of 56%, temperature of 20.11°C, high of 21.75°C, low of 18.68°C, and a heat index of None.[0m

[1m> Finished chain.[0m
```

```output
'The current weather in London is broken clouds, with a wind speed of 2.57 m/s, direction 240°, humidity of 56%, temperature of 20.11°C, high of 21.75°C, low of 18.68°C, and a heat index of None.'
```
