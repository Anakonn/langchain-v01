---
translated: true
---

# NASA

이 노트북은 NASA 도구 키트와 상호 작용하기 위해 에이전트를 사용하는 방법을 보여줍니다. 이 도구 키트는 NASA 이미지 및 비디오 라이브러리 API에 대한 액세스를 제공하며, 향후 반복에서 다른 액세스 가능한 NASA API를 포함할 수 있습니다.

**참고: NASA 이미지 및 비디오 라이브러리 검색 쿼리는 원하는 미디어 결과 수가 지정되지 않은 경우 큰 응답을 생성할 수 있습니다. LLM 토큰 크레딧을 사용하기 전에 이를 고려하십시오.**

## 사용 예:

---

### 에이전트 초기화

```python
from langchain.agents import AgentType, initialize_agent
from langchain_community.agent_toolkits.nasa.toolkit import NasaToolkit
from langchain_community.utilities.nasa import NasaAPIWrapper
from langchain_openai import OpenAI

llm = OpenAI(temperature=0, openai_api_key="")
nasa = NasaAPIWrapper()
toolkit = NasaToolkit.from_nasa_api_wrapper(nasa)
agent = initialize_agent(
    toolkit.get_tools(), llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True
)
```

### 미디어 자산 쿼리

```python
agent.run(
    "Can you find three pictures of the moon published between the years 2014 and 2020?"
)
```

### 미디어 자산에 대한 세부 정보 쿼리

```python
output = agent.run(
    "I've just queried an image of the moon with the NASA id NHQ_2019_0311_Go Forward to the Moon."
    " Where can I find the metadata manifest for this asset?"
)
```
