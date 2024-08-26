---
translated: true
---

# LLMonitor

> [LLMonitor](https://llmonitor.com?utm_source=langchain&utm_medium=py&utm_campaign=docs)은 비용 및 사용 분석, 사용자 추적, 추적 및 평가 도구를 제공하는 오픈 소스 가시성 플랫폼입니다.

<video controls width='100%'>
  <source src='https://llmonitor.com/videos/demo-annotated.mp4'/>
</video>

## 설정

[llmonitor.com](https://llmonitor.com?utm_source=langchain&utm_medium=py&utm_campaign=docs)에서 계정을 생성한 후 새 앱의 `tracking id`를 복사합니다.

tracking id를 얻은 후 다음 명령어를 실행하여 환경 변수로 설정합니다:

```bash
export LLMONITOR_APP_ID="..."
```

환경 변수를 설정하지 않으려면 콜백 핸들러를 초기화할 때 직접 키를 전달할 수 있습니다:

```python
from langchain_community.callbacks.llmonitor_callback import LLMonitorCallbackHandler

handler = LLMonitorCallbackHandler(app_id="...")
```

## LLM/Chat 모델에서 사용

```python
from langchain_openai import OpenAI
from langchain_openai import ChatOpenAI

handler = LLMonitorCallbackHandler()

llm = OpenAI(
    callbacks=[handler],
)

chat = ChatOpenAI(callbacks=[handler])

llm("Tell me a joke")
```

## 체인 및 에이전트에서 사용

관련 체인 및 LLM 호출이 올바르게 추적되도록 `run` 메서드에 콜백 핸들러를 전달해야 합니다.

대시보드에서 에이전트를 구별할 수 있도록 메타데이터에 `agent_name`을 전달하는 것이 좋습니다.

예시:

```python
from langchain_openai import ChatOpenAI
from langchain_community.callbacks.llmonitor_callback import LLMonitorCallbackHandler
from langchain_core.messages import SystemMessage, HumanMessage
from langchain.agents import OpenAIFunctionsAgent, AgentExecutor, tool

llm = ChatOpenAI(temperature=0)

handler = LLMonitorCallbackHandler()

@tool
def get_word_length(word: str) -> int:
    """Returns the length of a word."""
    return len(word)

tools = [get_word_length]

prompt = OpenAIFunctionsAgent.create_prompt(
    system_message=SystemMessage(
        content="You are a very powerful assistant, but bad at calculating lengths of words."
    )
)

agent = OpenAIFunctionsAgent(llm=llm, tools=tools, prompt=prompt, verbose=True)
agent_executor = AgentExecutor(
    agent=agent, tools=tools, verbose=True, metadata={"agent_name": "WordCount"}  # <- 추천, 사용자 정의 이름 할당
)
agent_executor.run("how many letters in the word educa?", callbacks=[handler])
```

또 다른 예시:

```python
from langchain.agents import load_tools, initialize_agent, AgentType
from langchain_openai import OpenAI
from langchain_community.callbacks.llmonitor_callback import LLMonitorCallbackHandler

handler = LLMonitorCallbackHandler()

llm = OpenAI(temperature=0)
tools = load_tools(["serpapi", "llm-math"], llm=llm)
agent = initialize_agent(tools, llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, metadata={ "agent_name": "GirlfriendAgeFinder" })  # <- 추천, 사용자 정의 이름 할당

agent.run(
    "Who is Leo DiCaprio's girlfriend? What is her current age raised to the 0.43 power?",
    callbacks=[handler],
)
```

## 사용자 추적

사용자 추적을 통해 사용자를 식별하고, 비용 및 대화 등을 추적할 수 있습니다.

```python
from langchain_community.callbacks.llmonitor_callback import LLMonitorCallbackHandler, identify

with identify("user-123"):
    llm.invoke("Tell me a joke")

with identify("user-456", user_props={"email": "user456@test.com"}):
    agent.run("Who is Leo DiCaprio's girlfriend?")
```

## 지원

통합 관련 질문이나 문제가 있는 경우 [Discord](http://discord.com/invite/8PafSG58kK) 또는 [이메일](mailto:vince@llmonitor.com)을 통해 LLMonitor 팀에 문의할 수 있습니다.