---
translated: true
---

# 메시지 기록 추가 (메모리)

`RunnableWithMessageHistory`를 사용하면 특정 유형의 체인에 메시지 기록을 추가할 수 있습니다. 이는 다른 Runnable을 래핑하고 채팅 메시지 기록을 관리합니다.

구체적으로, 이는 다음 입력을 받는 모든 Runnable에 사용할 수 있습니다:

- `BaseMessage`의 시퀀스
- `BaseMessage`의 시퀀스를 받는 키가 있는 dict
- 최신 메시지(들)를 문자열 또는 `BaseMessage`의 시퀀스로 받고, 별도의 키로 역사적인 메시지를 받는 dict

그리고 다음 출력을 반환합니다:

- `AIMessage`의 내용으로 처리할 수 있는 문자열
- `BaseMessage`의 시퀀스
- `BaseMessage`의 시퀀스를 포함하는 키가 있는 dict

이것이 어떻게 작동하는지 몇 가지 예제를 통해 살펴보겠습니다. 먼저 입력으로 dict를 받고 메시지로 출력하는 실행 가능한 항목을 생성하겠습니다:

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_openai.chat_models import ChatOpenAI

model = ChatOpenAI()
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "당신은 {ability}에 능한 어시스턴트입니다. 20단어 이내로 응답하세요",
        ),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{input}"),
    ]
)
runnable = prompt | model
```

메시지 기록을 관리하려면 다음이 필요합니다:

1. 이 실행 가능한 항목;
2. `BaseChatMessageHistory` 인스턴스를 반환하는 callable.

Redis 및 기타 제공자를 사용하여 채팅 메시지 기록을 구현하는 예제는 [memory integrations](https://integrations.langchain.com/memory) 페이지를 참조하세요. 여기에서는 메모리에 저장하는 `ChatMessageHistory`와 `RedisChatMessageHistory`를 사용한 영구 저장을 시연합니다.

## 메모리 내 저장

아래는 글로벌 Python dict를 통해 채팅 기록이 메모리에 저장되는 간단한 예입니다.

이 dict를 참조하여 `ChatMessageHistory` 인스턴스를 반환하는 callable `get_session_history`를 생성합니다. callable에 대한 인수는 실행 시 `RunnableWithMessageHistory`에 구성을 전달하여 지정할 수 있습니다. 기본적으로 구성 매개변수는 단일 문자열 `session_id`로 예상됩니다. 이는 `history_factory_config` kwarg를 통해 조정할 수 있습니다.

단일 매개변수 기본값을 사용하는 예:

```python
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory

store = {}


def get_session_history(session_id: str) -> BaseChatMessageHistory:
    if session_id not in store:
        store[session_id] = ChatMessageHistory()
    return store[session_id]


with_message_history = RunnableWithMessageHistory(
    runnable,
    get_session_history,
    input_messages_key="input",
    history_messages_key="history",
)
```

여기서 `input_messages_key` (최신 입력 메시지로 처리할 키)와 `history_messages_key` (역사적인 메시지를 추가할 키)를 지정했습니다.

이 새로운 실행 가능한 항목을 호출할 때 구성 매개변수를 통해 해당 채팅 기록을 지정합니다:

```python
with_message_history.invoke(
    {"ability": "math", "input": "코사인은 무엇을 의미하나요?"},
    config={"configurable": {"session_id": "abc123"}},
)
```

```output
AIMessage(content='코사인은 직각 삼각형의 인접한 변과 빗변의 비율을 계산하는 삼각 함수입니다.')
```

```python
# 기억합니다.

with_message_history.invoke(
    {"ability": "math", "input": "뭐라고요?"},
    config={"configurable": {"session_id": "abc123"}},
)
```

```output
AIMessage(content='코사인은 직각 삼각형의 변 길이를 계산하는 데 사용되는 수학적 함수입니다.')
```

```python
# 새로운 session_id -> 기억하지 않습니다.

with_message_history.invoke(
    {"ability": "math", "input": "뭐라고요?"},
    config={"configurable": {"session_id": "def234"}},
)
```

```output
AIMessage(content='수학 문제를 도와드릴 수 있습니다. 무엇을 도와드릴까요?')
```

메시지 기록을 추적하는 구성 매개변수는 `history_factory_config` 매개변수에 `ConfigurableFieldSpec` 객체 목록을 전달하여 사용자 정의할 수 있습니다. 아래에서는 두 개의 매개변수: `user_id`와 `conversation_id`를 사용합니다.

```python
from langchain_core.runnables import ConfigurableFieldSpec

store = {}


def get_session_history(user_id: str, conversation_id: str) -> BaseChatMessageHistory:
    if (user_id, conversation_id) not in store:
        store[(user_id, conversation_id)] = ChatMessageHistory()
    return store[(user_id, conversation_id)]


with_message_history = RunnableWithMessageHistory(
    runnable,
    get_session_history,
    input_messages_key="input",
    history_messages_key="history",
    history_factory_config=[
        ConfigurableFieldSpec(
            id="user_id",
            annotation=str,
            name="사용자 ID",
            description="사용자의 고유 식별자.",
            default="",
            is_shared=True,
        ),
        ConfigurableFieldSpec(
            id="conversation_id",
            annotation=str,
            name="대화 ID",
            description="대화의 고유 식별자.",
            default="",
            is_shared=True,
        ),
    ],
)
```

```python
with_message_history.invoke(
    {"ability": "math", "input": "안녕하세요"},
    config={"configurable": {"user_id": "123", "conversation_id": "1"}},
)
```

### 다양한 서명의 실행 가능한 항목 예제

위의 실행 가능한 항목은 dict를 입력으로 받고 BaseMessage를 반환합니다. 아래에는 대체 예제를 보여줍니다.

#### 메시지 입력, dict 출력

```python
from langchain_core.messages import HumanMessage
from langchain_core.runnables import RunnableParallel

chain = RunnableParallel({"output_message": ChatOpenAI()})


def get_session_history(session_id: str) -> BaseChatMessageHistory:
    if session_id not in store:
        store[session_id] = ChatMessageHistory()
    return store[session_id]


with_message_history = RunnableWithMessageHistory(
    chain,
    get_session_history,
    output_messages_key="output_message",
)

with_message_history.invoke(
    [HumanMessage(content="Simone de Beauvoir는 자유 의지에 대해 무엇을 믿었나요?")],
    config={"configurable": {"session_id": "baz"}},
)
```

```output
{'output_message': AIMessage(content="Simone de Beauvoir는 자유 의지의 존재를 믿었습니다. 그녀는 사회적 및 문화적 제약에도 불구하고 개인이 선택하고 자신의 행동을 결정할 수 있는 능력을 가지고 있다고 주장했습니다. 그녀는 개인이 환경의 산물이나 생물학적 또는 운명에 의해 결정된다는 생각을 거부했습니다. 대신, 그녀는 개인적 책임의 중요성과 자신의 삶을 창조하고 자신의 존재를 정의하기 위해 적극적으로 참여할 필요성을 강조했습니다. 드 보부아르는 자유와 주체성이 자신의 자유를 인식하고 그것을 적극적으로 행사하여 개인적 및 집단적 해방을 추구하는 것에서 나온다고 믿었습니다.")}
```

```python
with_message_history.invoke(
    [HumanMessage(content="이것이 Sartre와 어떻게 비교되나요?")],
    config={"configurable": {"session_id": "baz"}},
)
```

```output
{'output_message': AIMessage(content='Simone de Beauvoir의 자유 의지에 대한 견해는 그녀의 동시대인이자 파트너인 Jean-Paul Sartre의 견해와 밀접하게 일치했습니다. 드 보부아르와 사르트르는 모두 개인의 자유의 중요성과 결정론의 거부를 강조한 실존주의 철학자였습니다. 그들은 인간이 환경의 제약을 초월하여 자신의 의미와 가치를 창조할 수 있는 능력을 가지고 있다고 믿었습니다.\n\n사르트르는 그의 유명한 저서 "존재와 무"에서 인간은 자유롭게 태어나는 운명에 처해 있다고 주장했습니다. 이는 우리가 의미 없는 세상에서 선택하고 자신을 정의하는 책임을 지고 있다는 것을 의미합니다. 드 보부아르와 마찬가지로 사르트르는 개인이 외부 및 내부 제약에 직면하여 자유를 행사하고 선택할 수 있는 능력을 가지고 있다고 믿었습니다.\n\n그들의 철학적 저술에서 약간의 미묘한 차이가 있을 수 있지만, 전체적으로 드 보부아르와 사르트르는 자유 의지의 존재와 자신의 삶을 형성하는 데 있어 개인의 주체성의 중요성에 대한 유사한 믿음을 공유했습니다.')}
```

#### 메시지 입력, 메시지 출력

```python
RunnableWithMessageHistory(
    ChatOpenAI(),
    get_session_history,
)
```

#### 모든 메시지를 위한 단일 키가 있는 dict 입력, 메시지 출력

```python
from operator import itemgetter

RunnableWithMessageHistory(
    itemgetter("input_messages") | ChatOpenAI(),
    get_session_history,
    input_messages_key="input_messages",
)
```

## 영구 저장

많은 경우 대화 기록을 영구적으로 저장하는 것이 좋습니다. `RunnableWithMessageHistory`는 `get_session_history` callable이 채팅 메시지 기록을 검색하는 방법에 대해 중립적입니다. 로컬 파일 시스템을 사용하는 예는 [여기](https://github.com/langchain-ai/langserve/blob/main/examples/chat_with_persistence_and_user/server.py)를 참조하세요. 아래에서는 Redis를 사용하는 방법을 시연합니다. 다른 제공자를 사용하여 채팅 메시지 기록을 구현하는 예는 [memory integrations](https://integrations.langchain.com/memory) 페이지를 참조하세요.

### 설정

Redis가 아직 설치되지 않은 경우 설치해야 합니다:

```python
%pip install --upgrade --quiet redis
```

기존 Redis 배포에 연결할 필요가 없는 경우 로컬 Redis Stack 서버를 시작합니다:

```bash
docker run -d -p 6379:6379 -p 8001:8001 redis/redis-stack:latest
```

```python
REDIS_URL = "redis://localhost:6379/0"
```

### [LangSmith](/docs/langsmith)

메시지 기록 주입과 같은 경우, LangSmith는 다양한 체인의 입력을 이해하는 데 유용합니다.

LangSmith가 꼭 필요한 것은 아니지만, 도움이 됩니다.
LangSmith를 사용하려면 위의 링크에서 가입한 후, 아래 주석을 제거하고 환경 변수를 설정하여 추적을 시작하세요:

```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"

# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()

```

메시지 기록 구현을 업데이트하려면 이번에는 `RedisChatMessageHistory` 인스턴스를 반환하는 새로운 callable을 정의하기만 하면 됩니다:

```python
from langchain_community.chat_message_histories import RedisChatMessageHistory


def get_message_history(session_id: str) -> RedisChatMessageHistory:
    return RedisChatMessageHistory(session_id, url=REDIS_URL)


with_message_history = RunnableWithMessageHistory(
    runnable,
    get_message_history,
    input_messages_key="input",
    history_messages_key="history",
)
```

이전과 같이 호출할 수 있습니다:

```python
with_message_history.invoke(
    {"ability": "math", "input": "코사인은 무엇을 의미하나요?"},
    config={"configurable": {"session_id": "foobar"}},
)
```

```output
AIMessage(content='코사인은 직각 삼각형에서 인접한 변과 빗변의 비율을 나타내는 삼각 함수입니다.')
```

```python
with_message_history.invoke(
    {"ability": "math", "input": "그것의 역함수는 무엇인가요?"},
    config={"configurable": {"session_id": "foobar"}},
)
```

```output
AIMessage(content='코사인의 역함수는 아크코사인 함수로, acos 또는 cos^-1로 표시되며, 주어진 코사인 값에 해당하는 각도를 제공합니다.')
```

:::tip

[Langsmith 추적](https://smith.langchain.com/public/bd73e122-6ec1-48b2-82df-e6483dc9cb63/r)

:::

두 번째 호출에 대한 Langsmith 추적을 보면, 프롬프트를 구성할 때 "history" 변수가 첫 번째 입력과 첫 번째 출력을 포함하는 두 개의 메시지 목록으로 주입된 것을 알 수 있습니다.