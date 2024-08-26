---
sidebar_label: Yuan2.0
translated: true
---

# Yuan2.0

이 노트북은 LangChain에서 `langchain.chat_models.ChatYuan2`를 사용하여 [YUAN2 API](https://github.com/IEIT-Yuan/Yuan-2.0/blob/main/docs/inference_server.md)를 사용하는 방법을 보여줍니다.

[_Yuan2.0_](https://github.com/IEIT-Yuan/Yuan-2.0/blob/main/README-EN.md)는 IEIT 시스템에서 개발한 차세대 대형 언어 모델입니다. Yuan 2.0-102B, Yuan 2.0-51B, Yuan 2.0-2B 세 가지 모델을 모두 공개했으며, 다른 개발자를 위한 사전 학습, 미세 조정 및 추론 서비스를 위한 관련 스크립트를 제공합니다. Yuan2.0은 Yuan1.0을 기반으로 더 넓은 범위의 고품질 사전 학습 데이터와 명령어 미세 조정 데이터를 사용하여 모델의 의미, 수학, 추론, 코드, 지식 등을 이해하는 능력을 향상시킵니다.

## 시작하기

### 설치

먼저, Yuan2.0은 OpenAI 호환 API를 제공하며, OpenAI 클라이언트를 사용하여 ChatYuan2를 LangChain 채팅 모델에 통합합니다. 따라서 Python 환경에 openai 패키지가 설치되어 있어야 합니다. 다음 명령을 실행하세요:

```python
%pip install --upgrade --quiet openai
```

### 필요한 모듈 가져오기

설치 후, 필요한 모듈을 Python 스크립트에 가져옵니다:

```python
from langchain_community.chat_models import ChatYuan2
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
```

### API 서버 설정

OpenAI 호환 API 서버를 설정하려면 [yuan2 openai api server](https://github.com/IEIT-Yuan/Yuan-2.0/blob/main/docs/Yuan2_fastchat.md)를 참조하세요. 로컬에 API 서버를 배포한 경우, `yuan2_api_key="EMPTY"` 또는 원하는 값으로 설정할 수 있습니다. `yuan2_api_base`가 올바르게 설정되었는지 확인하세요.

```python
yuan2_api_key = "your_api_key"
yuan2_api_base = "http://127.0.0.1:8001/v1"
```

### ChatYuan2 모델 초기화

다음과 같이 채팅 모델을 초기화합니다:

```python
chat = ChatYuan2(
    yuan2_api_base="http://127.0.0.1:8001/v1",
    temperature=1.0,
    model_name="yuan2",
    max_retries=3,
    streaming=False,
)
```

### 기본 사용법

시스템 및 사용자 메시지로 모델을 호출합니다:

```python
messages = [
    SystemMessage(content="你是一个人工智能助手。"),
    HumanMessage(content="你好，你是谁？"),
]
```

```python
print(chat.invoke(messages))
```

### 스트리밍을 통한 기본 사용법

연속적인 상호작용을 위해 스트리밍 기능을 사용합니다:

```python
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler

chat = ChatYuan2(
    yuan2_api_base="http://127.0.0.1:8001/v1",
    temperature=1.0,
    model_name="yuan2",
    max_retries=3,
    streaming=True,
    callbacks=[StreamingStdOutCallbackHandler()],
)
messages = [
    SystemMessage(content="你是个旅游小助手。"),
    HumanMessage(content="给我介绍一下北京有哪些好玩的。"),
]
```

```python
chat.invoke(messages)
```

## 고급 기능

### 비동기 호출 사용법

비동기 호출로 모델을 호출하는 방법은 다음과 같습니다:

```python
async def basic_agenerate():
    chat = ChatYuan2(
        yuan2_api_base="http://127.0.0.1:8001/v1",
        temperature=1.0,
        model_name="yuan2",
        max_retries=3,
    )
    messages = [
        [
            SystemMessage(content="你是个旅游小助手。"),
            HumanMessage(content="给我介绍一下北京有哪些好玩的。"),
        ]
    ]

    result = await chat.agenerate(messages)
    print(result)
```

```python
import asyncio

asyncio.run(basic_agenerate())
```

### 프롬프트 템플릿 사용법

비동기 호출과 함께 프롬프트 템플릿을 사용하는 방법은 다음과 같습니다:

```python
async def ainvoke_with_prompt_template():
    from langchain_core.prompts.chat import (
        ChatPromptTemplate,
    )

    chat = ChatYuan2(
        yuan2_api_base="http://127.0.0.1:8001/v1",
        temperature=1.0,
        model_name="yuan2",
        max_retries=3,
    )
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", "你是一个诗人，擅长写诗。"),
            ("human", "给我写首诗，主题是{theme}。"),
        ]
    )
    chain = prompt | chat
    result = await chain.ainvoke({"theme": "明月"})
    print(f"type(result): {type(result)}; {result}")
```

```python
import asyncio

asyncio.run(ainvoke_with_prompt_template())
```

### 비동기 호출 및 스트리밍 사용법

비동기 호출과 스트리밍 출력을 사용하는 방법은 다음과 같습니다:

```python
async def basic_astream():
    chat = ChatYuan2(
        yuan2_api_base="http://127.0.0.1:8001/v1",
        temperature=1.0,
        model_name="yuan2",
        max_retries=3,
    )
    messages = [
        SystemMessage(content="你是个旅游小助手。"),
        HumanMessage(content="给我介绍一下北京有哪些好玩的。"),
    ]
    result = chat.astream(messages)
    async for chunk in result:
        print(chunk.content, end="", flush=True)
```

```python
import asyncio

asyncio.run(basic_astream())
```