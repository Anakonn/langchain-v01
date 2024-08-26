---
translated: true
---

# Polygon IO 도구 키트

이 노트북은 [Polygon IO](https://polygon.io/) 도구 키트와 상호 작용하는 에이전트를 사용하는 방법을 보여줍니다. 이 도구 키트는 Polygon의 주식 시장 데이터 API에 대한 액세스를 제공합니다.

## 사용 예

### 설정

```python
%pip install --upgrade --quiet langchain-community > /dev/null
```

Polygon IO API 키를 [여기](https://polygon.io/)에서 받은 다음 아래에 설정하십시오.
이 예제에서 사용된 도구에는 "Stocks Advanced" 구독이 필요합니다.

```python
import getpass
import os

os.environ["POLYGON_API_KEY"] = getpass.getpass()
```

```output
········
```

[LangSmith](https://smith.langchain.com/)를 설정하면 최고 수준의 관찰 기능을 사용할 수 있습니다(필수는 아님).

```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

### 에이전트 초기화

```python
from langchain import hub
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain_community.agent_toolkits.polygon.toolkit import PolygonToolkit
from langchain_community.utilities.polygon import PolygonAPIWrapper
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(temperature=0)

instructions = """You are an assistant."""
base_prompt = hub.pull("langchain-ai/openai-functions-template")
prompt = base_prompt.partial(instructions=instructions)
```

```python
polygon = PolygonAPIWrapper()
toolkit = PolygonToolkit.from_polygon_api_wrapper(polygon)
agent = create_openai_functions_agent(llm, toolkit.get_tools(), prompt)
```

```python
agent_executor = AgentExecutor(
    agent=agent,
    tools=toolkit.get_tools(),
    verbose=True,
)
```

### 주식의 마지막 가격 인용 가져오기

```python
agent_executor.invoke({"input": "What is the latest stock price for AAPL?"})
```
