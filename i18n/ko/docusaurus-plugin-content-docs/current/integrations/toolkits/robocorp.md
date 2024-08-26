---
translated: true
---

# 로보코프

이 노트북은 [Robocorp Action Server](https://github.com/robocorp/robocorp) 액션 툴킷과 LangChain 시작하는 방법을 다룹니다.

Robocorp는 AI 에이전트, 어시스턴트 및 코파일럿의 기능을 사용자 정의 작업으로 쉽게 확장할 수 있는 방법입니다.

## 설치

먼저 `Action Server`를 설정하고 작업을 만드는 방법에 대한 [Robocorp Quickstart](https://github.com/robocorp/robocorp#quickstart)를 참조하세요.

LangChain 애플리케이션에 `langchain-robocorp` 패키지를 설치하세요:

```python
# Install package
%pip install --upgrade --quiet langchain-robocorp
```

위의 퀵스타트를 따라 새 `Action Server`를 만들면

파일이 포함된 디렉토리가 생성됩니다. 여기에는 `action.py`도 포함됩니다.

[여기](https://github.com/robocorp/robocorp/tree/master/actions#describe-your-action)에 나와 있는 것처럼 Python 함수를 작업으로 추가할 수 있습니다.

`action.py`에 더미 함수를 추가해 보겠습니다.

```python
@action
def get_weather_forecast(city: str, days: int, scale: str = "celsius") -> str:
    """
    Returns weather conditions forecast for a given city.

    Args:
        city (str): Target city to get the weather conditions for
        days: How many day forecast to return
        scale (str): Temperature scale to use, should be one of "celsius" or "fahrenheit"

    Returns:
        str: The requested weather conditions forecast
    """
    return "75F and sunny :)"
```

그런 다음 서버를 시작합니다:

```bash
action-server start
```

그리고 다음과 같은 것을 볼 수 있습니다:

```text
Found new action: get_weather_forecast

```

`http://localhost:8080`에서 실행 중인 서버로 이동하여 UI를 사용하여 함수를 실행하여 로컬로 테스트할 수 있습니다.

## 환경 설정

선택적으로 다음과 같은 환경 변수를 설정할 수 있습니다:

- `LANGCHAIN_TRACING_V2=true`: LangSmith 로그 실행 추적을 활성화하여 해당 Action Server 작업 실행 로그와 연결할 수 있습니다. 자세한 내용은 [LangSmith 문서](https://docs.smith.langchain.com/tracing#log-runs)를 참조하세요.

## 사용법

위에서 `http://localhost:8080`에서 로컬 작업 서버를 시작했습니다.

```python
from langchain.agents import AgentExecutor, OpenAIFunctionsAgent
from langchain_core.messages import SystemMessage
from langchain_openai import ChatOpenAI
from langchain_robocorp import ActionServerToolkit

# Initialize LLM chat model
llm = ChatOpenAI(model="gpt-4", temperature=0)

# Initialize Action Server Toolkit
toolkit = ActionServerToolkit(url="http://localhost:8080", report_trace=True)
tools = toolkit.get_tools()

# Initialize Agent
system_message = SystemMessage(content="You are a helpful assistant")
prompt = OpenAIFunctionsAgent.create_prompt(system_message)
agent = OpenAIFunctionsAgent(llm=llm, prompt=prompt, tools=tools)

executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

executor.invoke("What is the current weather today in San Francisco in fahrenheit?")
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `robocorp_action_server_get_weather_forecast` with `{'city': 'San Francisco', 'days': 1, 'scale': 'fahrenheit'}`


[0m[33;1m[1;3m"75F and sunny :)"[0m[32;1m[1;3mThe current weather today in San Francisco is 75F and sunny.[0m

[1m> Finished chain.[0m
```

```output
{'input': 'What is the current weather today in San Francisco in fahrenheit?',
 'output': 'The current weather today in San Francisco is 75F and sunny.'}
```

### 단일 입력 도구

기본적으로 `toolkit.get_tools()`는 구조화된 도구로 작업을 반환합니다.

단일 입력 도구를 반환하려면 입력을 처리하는 데 사용할 채팅 모델을 전달하세요.

```python
# Initialize single input Action Server Toolkit
toolkit = ActionServerToolkit(url="http://localhost:8080")
tools = toolkit.get_tools(llm=llm)
```
