---
sidebar_label: ZHIPU AI
translated: true
---

# ZHIPU AI

이 노트북은 LangChain에서 `langchain.chat_models.ChatZhipuAI`를 사용하여 [ZHIPU AI API](https://open.bigmodel.cn/dev/api)를 사용하는 방법을 보여줍니다.

> [_GLM-4_](https://open.bigmodel.cn/)는 다국어를 지원하는 대형 언어 모델로, Q&A, 다중 턴 대화, 코드 생성 등의 기능을 갖추고 있습니다. 새로운 세대의 기본 모델인 GLM-4는 이전 세대에 비해 전체 성능이 크게 향상되었으며, 더 긴 문맥을 지원합니다. 또한, 더 강력한 멀티모달 기능을 제공하며, 더 빠른 추론 속도와 더 많은 동시성을 지원하여 추론 비용을 크게 줄입니다. 동시에 GLM-4는 지능형 에이전트의 기능을 향상시킵니다.

## 시작하기

### 설치

먼저, Python 환경에 zhipuai 패키지가 설치되어 있는지 확인하세요. 다음 명령을 실행하세요:

```python
%pip install --upgrade httpx httpx-sse PyJWT
```

### 필요한 모듈 가져오기

설치 후, 필요한 모듈을 Python 스크립트에 가져옵니다:

```python
from langchain_community.chat_models import ChatZhipuAI
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
```

### API 키 설정

[ZHIPU AI](https://open.bigmodel.cn/login?redirect=%2Fusercenter%2Fapikeys)에 로그인하여 API 키를 발급받아 모델에 접근하세요.

```python
import os

os.environ["ZHIPUAI_API_KEY"] = "zhipuai_api_key"
```

### ZHIPU AI 채팅 모델 초기화

다음은 채팅 모델을 초기화하는 방법입니다:

```python
chat = ChatZhipuAI(
    model="glm-4",
    temperature=0.5,
)
```

### 기본 사용법

다음과 같이 시스템 및 사용자 메시지로 모델을 호출합니다:

```python
messages = [
    AIMessage(content="Hi."),
    SystemMessage(content="Your role is a poet."),
    HumanMessage(content="Write a short poem about AI in four lines."),
]
```

```python
response = chat.invoke(messages)
print(response.content)  # AI가 생성한 시를 출력합니다
```

## 고급 기능

### 스트리밍 지원

연속적인 상호작용을 위해 스트리밍 기능을 사용합니다:

```python
from langchain_core.callbacks.manager import CallbackManager
from langchain_core.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
```

```python
streaming_chat = ChatZhipuAI(
    model="glm-4",
    temperature=0.5,
    streaming=True,
    callback_manager=CallbackManager([StreamingStdOutCallbackHandler()]),
)
```

```python
streaming_chat(messages)
```

### 비동기 호출

비동기 접근 방식을 사용하여 모델을 호출하려면 다음을 따르세요:

```python
async_chat = ChatZhipuAI(
    model="glm-4",
    temperature=0.5,
)
```

```python
response = await async_chat.agenerate([messages])
print(response)
```

### 함수 호출과 함께 사용

GLM-4 모델은 함수 호출과 함께 사용할 수도 있습니다. 다음 코드를 사용하여 간단한 LangChain json_chat_agent를 실행하세요.

```python
os.environ["TAVILY_API_KEY"] = "tavily_api_key"
```

```python
from langchain import hub
from langchain.agents import AgentExecutor, create_json_chat_agent
from langchain_community.tools.tavily_search import TavilySearchResults

tools = [TavilySearchResults(max_results=1)]
prompt = hub.pull("hwchase17/react-chat-json")
llm = ChatZhipuAI(temperature=0.01, model="glm-4")

agent = create_json_chat_agent(llm, tools, prompt)
agent_executor = AgentExecutor(
    agent=agent, tools=tools, verbose=True, handle_parsing_errors=True
)
```

```python
agent_executor.invoke({"input": "what is LangChain?"})
```