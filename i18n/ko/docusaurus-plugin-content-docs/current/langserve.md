---
translated: true
---

# 🦜️🏓 LangServe

[![Release Notes](https://img.shields.io/github/release/langchain-ai/langserve)](https://github.com/langchain-ai/langserve/releases)
[![Downloads](https://static.pepy.tech/badge/langserve/month)](https://pepy.tech/project/langserve)
[![Open Issues](https://img.shields.io/github/issues-raw/langchain-ai/langserve)](https://github.com/langchain-ai/langserve/issues)
[![](https://dcbadge.vercel.app/api/server/6adMQxSpJS?compact=true&style=flat)](https://discord.com/channels/1038097195422978059/1170024642245832774)

🚩 LangChain 애플리케이션의 원클릭 배포를 위한 LangServe의 호스팅 버전을 출시할 예정입니다. 대기자 명단에 등록하려면 [여기를 클릭하세요](https://airtable.com/apppQ9p5XuujRl3wJ/shrABpHWdxry8Bacm).

## 개요

[LangServe](https://github.com/langchain-ai/langserve)는 개발자가 `LangChain` [runnables 및 체인](https://python.langchain.com/docs/expression_language/)을 REST API로 배포하는 데 도움을 줍니다.

이 라이브러리는 [FastAPI](https://fastapi.tiangolo.com/)와 통합되어 있으며 데이터 유효성을 검사하기 위해 [pydantic](https://docs.pydantic.dev/latest/)을 사용합니다.

또한 서버에 배포된 runnable을 호출할 수 있는 클라이언트를 제공합니다.
JavaScript 클라이언트는 [LangChain.js](https://js.langchain.com/docs/ecosystem/langserve)에 있습니다.

## 특징

- 입력 및 출력 스키마는 LangChain 객체에서 자동으로 추론되며, 모든 API 호출에서 엄격하게 적용되며, 풍부한 오류 메시지를 제공합니다.
- JSONSchema 및 Swagger와 함께 API 문서 페이지 제공 (예시 링크 삽입)
- 단일 서버에서 많은 동시 요청을 지원하는 효율적인 `/invoke`, `/batch` 및 `/stream` 엔드포인트
- 체인/에이전트의 모든(또는 일부) 중간 단계를 스트리밍하기 위한 `/stream_log` 엔드포인트
- **0.0.40 버전부터** `/stream_events`를 지원하여 `/stream_log` 출력 파싱 없이도 스트리밍을 더 쉽게 만듭니다.
- 스트리밍 출력 및 중간 단계를 제공하는 `/playground/`의 플레이그라운드 페이지
- [LangSmith](https://www.langchain.com/langsmith)에 대한 내장(선택적) 추적 기능, API 키만 추가하면 됩니다 (자세한 내용은 [설명서](https://docs.smith.langchain.com/) 참조).
- FastAPI, Pydantic, uvloop 및 asyncio와 같은 검증된 오픈 소스 Python 라이브러리로 모두 구축되었습니다.
- 클라이언트 SDK를 사용하여 LangServe 서버를 로컬에서 실행 중인 Runnable처럼 호출하거나 HTTP API를 직접 호출할 수 있습니다.
- [LangServe Hub](https://github.com/langchain-ai/langchain/blob/master/templates/README.md)

## 한계

- 서버에서 발생하는 이벤트에 대한 클라이언트 콜백은 아직 지원되지 않습니다.
- Pydantic V2를 사용할 때 OpenAPI 문서는 생성되지 않습니다. FastAPI는 [pydantic v1과 v2 네임스페이스 혼합](https://github.com/tiangolo/fastapi/issues/10360)을 지원하지 않습니다. 자세한 내용은 아래 섹션을 참조하세요.

## 호스팅 LangServe

LangChain 애플리케이션의 원클릭 배포를 위한 LangServe의 호스팅 버전을 출시할 예정입니다. 대기자 명단에 등록하려면 [여기를 클릭하세요](https://airtable.com/apppQ9p5XuujRl3wJ/shrABpHWdxry8Bacm).

## 보안

- 버전 0.0.13 - 0.0.15의 취약점 -- playground 엔드포인트가 서버의 임의 파일에 접근할 수 있게 합니다. [0.0.16에서 해결됨](https://github.com/langchain-ai/langserve/pull/98).

## 설치

클라이언트 및 서버 모두를 위해:

```bash
pip install "langserve[all]"
```

또는 클라이언트 코드를 위한 `pip install "langserve[client]"` 및 서버 코드를 위한 `pip install "langserve[server]"`.

## LangChain CLI 🛠️

`LangChain` CLI를 사용하여 `LangServe` 프로젝트를 신속하게 부트스트랩하세요.

langchain CLI를 사용하려면 최신 버전의 `langchain-cli`가 설치되어 있는지 확인하세요. `pip install -U langchain-cli`로 설치할 수 있습니다.

## 설정

**참고**: 의존성 관리를 위해 `poetry`를 사용합니다. 자세한 내용은 poetry [문서](https://python-poetry.org/docs/)를 참조하세요.

### 1. langchain cli 명령을 사용하여 새 앱 생성

```sh
langchain app new my-app
```

### 2. add_routes에서 runnable 정의. server.py로 이동하여 수정

```sh
add_routes(app. NotImplemented)
```

### 3. `poetry`를 사용하여 타사 패키지 추가 (예: langchain-openai, langchain-anthropic, langchain-mistral 등).

```sh
poetry add [package-name] // 예: `poetry add langchain-openai`
```

### 4. 관련 환경 변수를 설정합니다. 예를 들어,

```sh
export OPENAI_API_KEY="sk-..."
```

### 5. 앱을 제공하세요

```sh
poetry run langchain serve --port=8100
```

## 예제

[LangChain Templates](https://github.com/langchain-ai/langchain/blob/master/templates/README.md)를 사용하여 LangServe 인스턴스를 신속하게 시작하세요.

더 많은 예제를 보려면 템플릿 [목록](https://github.com/langchain-ai/langchain/blob/master/templates/docs/INDEX.md) 또는 [examples](https://github.com/langchain-ai/langserve/tree/main/examples) 디렉토리를 참조하세요.

| 설명                                                                                                                                                                                                                                                   | 링크                                                                                                                                                                                                                                |
| :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **LLMs** OpenAI 및 Anthropic 채팅 모델을 예약하는 최소 예제. 비동기 사용, 배치 및 스트리밍 지원.                                                                                                                                                       | [server](https://github.com/langchain-ai/langserve/tree/main/examples/llm/server.py), [client](https://github.com/langchain-ai/langserve/blob/main/examples/llm/client.ipynb)                                                       |
| **Retriever** 실행 가능한 검색기를 노출하는 간단한 서버.                                                                                                                                                                                               | [server](https://github.com/langchain-ai/langserve/tree/main/examples/retrieval/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/retrieval/client.ipynb)                                           |
| **Conversational Retriever** [Conversational Retriever](https://python.langchain.com/docs/expression_language/cookbook/retrieval#conversational-retrieval-chain)을 LangServe를 통해 노출                                                               | [server](https://github.com/langchain-ai/langserve/tree/main/examples/conversational_retrieval_chain/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/conversational_retrieval_chain/client.ipynb) |
| **Agent** 대화 기록 없이 **OpenAI 도구** 기반 [에이전트](https://python.langchain.com/docs/modules/agents/agent_types/openai_functions_agent)                                                                                                          | [server](https://github.com/langchain-ai/langserve/tree/main/examples/agent/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/agent/client.ipynb)                                                   |
| **Agent** 대화 기록을 사용하는 **OpenAI 도구** 기반 [에이전트](https://python.langchain.com/docs/modules/agents/agent_types/openai_functions_agent)                                                                                                    | [server](https://github.com/langchain-ai/langserve/blob/main/examples/agent_with_history/server.py), [client](https://github.com/langchain-ai/langserve/blob/main/examples/agent_with_history/client.ipynb)                         |
| [RunnableWithMessageHistory](https://python.langchain.com/docs/expression_language/how_to/message_history)를 사용하여 클라이언트가 제공한 `session_id`를 기반으로 백엔드에 저장된 채팅을 구현합니다.                                                   | [server](https://github.com/langchain-ai/langserve/tree/main/examples/chat_with_persistence/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/chat_with_persistence/client.ipynb)                   |
| [RunnableWithMessageHistory](https://python.langchain.com/docs/expression_language/how_to/message_history)를 사용하여 클라이언트가 제공한 `conversation_id` 및 `user_id`(올바르게 `user_id`를 구현하는 인증 참조)로 백엔드에 저장된 채팅을 구현합니다. | [server](https://github.com/langchain-ai/langserve/tree/main/examples/chat_with_persistence_and_user/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/chat_with_persistence_and_user/client.ipynb) |
| [Configurable Runnable](https://python.langchain.com/docs/expression_language/how_to/configure)를 사용하여 인덱스 이름의 실행 시간 구성을 지원하는 검색기를 만듭니다.                                                                                  | [server](https://github.com/langchain-ai/langserve/tree/main/examples/configurable_retrieval/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/configurable_retrieval/client.ipynb)                 |
| [Configurable Runnable](https://python.langchain.com/docs/expression_language/how_to/configure)를 사용하여 구성 가능한 필드와 구성 가능한 대안을 보여줍니다.                                                                                           | [server](https://github.com/langchain-ai/langserve/tree/main/examples/configurable_chain/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/configurable_chain/client.ipynb)                         |
| **APIHandler** `APIHandler`를 사용하여 `add_routes` 대신 사용하는 방법을 보여줍니다. 이는 개발자가 엔드포인트를 정의하는 데 더 많은 유연성을 제공합니다. 모든 FastAPI 패턴과 잘 작동하지만 약간 더 많은 노력이 필요합니다.                             | [server](https://github.com/langchain-ai/langserve/tree/main/examples/api_handler_examples/server.py)                                                                                                                               |
| **LCEL 예제** 딕셔너리 입력을 조작하기 위해 LCEL을 사용하는 예제.                                                                                                                                                                                      | [server](https://github.com/langchain-ai/langserve/tree/main/examples/passthrough_dict/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/passthrough_dict/client.ipynb)                             |
| **인증** `add_routes`와 함께: 앱과 연결된 모든 엔드포인트에 적용할 수 있는 간단한 인증. (자체적으로는 사용자별 로직을 구현하는 데 유용하지 않습니다.)                                                                                                  | [server](https://github.com/langchain-ai/langserve/tree/main/examples/auth/global_deps/server.py)                                                                                                                                   |
| **인증** `add_routes`와 함께: 경로 종속성을 기반으로 한 간단한 인증 메커니즘. (자체적으로는 사용자별 로직을 구현하는 데 유용하지 않습니다.)                                                                                                            | [server](https://github.com/langchain-ai/langserve/tree/main/examples/auth/path_dependencies/server.py)                                                                                                                             |
| **인증** `add_routes`와 함께: 사용자별 로직 및 요청별 구성 수정자를 사용하는 엔드포인트에 대한 인증 구현. (**참고**: 현재는 OpenAPI 문서와 통합되지 않습니다.)                                                                                         | [server](https://github.com/langchain-ai/langserve/tree/main/examples/auth/per_req_config_modifier/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/auth/per_req_config_modifier/client.ipynb)     |
| **인증** `APIHandler`와 함께: 사용자별 로직 및 인증을 구현하여 사용자 소유 문서 내에서만 검색하는 방법을 보여줍니다.                                                                                                                                   | [server](https://github.com/langchain-ai/langserve/tree/main/examples/auth/api_handler/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/auth/api_handler/client.ipynb)                             |
| **위젯** 플레이그라운드에서 사용할 수 있는 다양한 위젯(파일 업로드 및 채팅)                                                                                                                                                                            | [server](https://github.com/langchain-ai/langserve/tree/main/examples/widgets/chat/tuples/server.py)                                                                                                                                |
| **위젯** LangServe 플레이그라운드에서 사용할 파일 업로드 위젯.                                                                                                                                                                                         | [server](https://github.com/langchain-ai/langserve/tree/main/examples/file_processing/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/file_processing/client.ipynb)                               |

## 샘플 애플리케이션

### 서버

다음은 OpenAI 채팅 모델, Anthropic 채팅 모델을 배포하고 Anthropic 모델을 사용하여 주제에 대한 농담을 말하는 체인을 사용하는 서버 예제입니다.

```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain.prompts", "docs": "https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "🦜️🏓 LangServe"}, {"imported": "ChatAnthropic", "source": "langchain.chat_models", "docs": "https://api.python.langchain.com/en/latest/chat_models/langchain_community.chat_models.anthropic.ChatAnthropic.html", "title": "🦜️🏓 LangServe"}, {"imported": "ChatOpenAI", "source": "langchain.chat_models", "docs": "https://api.python.langchain.com/en/latest/chat_models/langchain_community.chat_models.openai.ChatOpenAI.html", "title": "🦜️🏓 LangServe"}]-->
#!/usr/bin/env python
from fastapi import FastAPI
from langchain.prompts import ChatPromptTemplate
from langchain.chat_models import ChatAnthropic, ChatOpenAI
from langserve import add_routes

app = FastAPI(
    title="LangChain Server",
    version="1.0",
    description="Langchain의 Runnable 인터페이스를 사용하는 간단한 API 서버",
)

add_routes(
    app,
    ChatOpenAI(),
    path="/openai",
)

add_routes(
    app,
    ChatAnthropic(),
    path="/anthropic",
)

model = ChatAnthropic()
prompt = ChatPromptTemplate.from_template("tell me a joke about {topic}")
add_routes(
    app,
    prompt | model,
    path="/joke",
)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="localhost", port=8000)
```

브라우저에서 엔드포인트를 호출하려는 경우 CORS 헤더를 설정해야 합니다.
이를 위해 FastAPI의 내장 미들웨어를 사용할 수 있습니다:

```python
from fastapi.middleware.cors import CORSMiddleware

# 모든 CORS 허용 출처 설정

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)
```

### 문서

위에서 서버를 배포한 경우, 생성된 OpenAPI 문서를 다음과 같이 볼 수 있습니다:

> ⚠️ pydantic v2를 사용할 경우, _invoke_, _batch_, _stream_, *stream_log*에 대한 문서는 생성되지 않습니다.
> 자세한 내용은 아래 [Pydantic](#pydantic) 섹션을 참조하세요.

```sh
curl localhost:8000/docs
```

반드시 **/docs** 접미사를 추가하세요.

> ⚠️ 인덱스 페이지 `/`는 **디자인상** 정의되지 않았으므로 `curl localhost:8000` 또는 URL 방문 시 404가 반환됩니다.
> `/`에 콘텐츠를 원한다면 `@app.get("/")` 엔드포인트를 정의하세요.

### 클라이언트

Python SDK

```python
<!--IMPORTS:[{"imported": "SystemMessage", "source": "langchain.schema", "docs": "https://api.python.langchain.com/en/latest/messages/langchain_core.messages.system.SystemMessage.html", "title": "🦜️🏓 LangServe"}, {"imported": "HumanMessage", "source": "langchain.schema", "docs": "https://api.python.langchain.com/en/latest/messages/langchain_core.messages.human.HumanMessage.html", "title": "🦜️🏓 LangServe"}, {"imported": "ChatPromptTemplate", "source": "langchain.prompts", "docs": "https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "🦜️🏓 LangServe"}, {"imported": "RunnableMap", "source": "langchain.schema.runnable", "docs": "https://api.python.langchain.com/en/latest/runnables/langchain_core.runnables.base.RunnableMap.html", "title": "🦜️🏓 LangServe"}]-->

from langchain.schema import SystemMessage, HumanMessage
from langchain.prompts import ChatPromptTemplate
from langchain.schema.runnable import RunnableMap
from langserve import RemoteRunnable

openai = RemoteRunnable("http://localhost:8000/openai/")
anthropic = RemoteRunnable("http://localhost:8000/anthropic/")
joke_chain = RemoteRunnable("http://localhost:8000/joke/")

joke_chain.invoke({"topic": "parrots"})

# 또는 비동기 방식으로

await joke_chain.ainvoke({"topic": "parrots"})

prompt = [
    SystemMessage(content='고양이나 앵무새처럼 행동하세요.'),
    HumanMessage(content='안녕하세요!')
]

# astream을 지원합니다

async for msg in anthropic.astream(prompt):
    print(msg, end="", flush=True)

prompt = ChatPromptTemplate.from_messages(
    [("system", "Tell me a long story about {topic}")]
)

# 사용자 지정 체인 정의 가능

chain = prompt | RunnableMap({
    "openai": openai,
    "anthropic": anthropic,
})

chain.batch([{"topic": "parrots"}, {"topic": "cats"}])
```

TypeScript에서 (LangChain.js 버전 0.0.166 이상 필요):

```typescript
import { RemoteRunnable } from '@langchain/core/runnables/remote';

const chain = new RemoteRunnable({
  url: `http://localhost:8000/joke/`,
});
const result = await chain.invoke({
  topic: 'cats',
});
```

`requests`를 사용하는 Python:

```python
import requests

response = requests.post(
    "http://localhost:8000/joke/invoke",
    json={'input': {'topic': 'cats'}}
)
response.json()
```

`curl`도 사용할 수 있습니다:

```sh
curl --location --request POST 'http://localhost:8000/joke/invoke' \
    --header 'Content-Type: application/json' \
    --data-raw '{
        "input": {
            "topic": "cats"
        }
    }'
```

## 엔드포인트

다음 코드는 다음과 같습니다:

```python
...
add_routes(
    app,
    runnable,
    path="/my_runnable",
)
```

이러한 엔드포인트를 서버에 추가합니다:

- `POST /my_runnable/invoke` - 단일 입력에 대해 runnable을 호출합니다.
- `POST /my_runnable/batch` - 입력 배치에 대해 runnable을 호출합니다.
- `POST /my_runnable/stream` - 단일 입력에 대해 호출하고 출력을 스트리밍합니다.
- `POST /my_runnable/stream_log` - 단일 입력에 대해 호출하고 출력, 중간 단계의 출력까지 포함하여 스트리밍합니다.
- `POST /my_runnable/astream_events` - 단일 입력에 대해 호출하고 중간 단계의 출력까지 포함하여 이벤트를 스트리밍합니다.
- `GET /my_runnable/input_schema` - runnable의 입력에 대한 JSON 스키마를 가져옵니다.
- `GET /my_runnable/output_schema` - runnable의 출력에 대한 JSON 스키마를 가져옵니다.
- `GET /my_runnable/config_schema` - runnable의 구성에 대한 JSON 스키마를 가져옵니다.

이 엔드포인트들은 [LangChain Expression Language 인터페이스](https://python.langchain.com/docs/expression_language/interface)와 일치합니다 -- 자세한 내용은 해당 문서를 참조하세요.

## 플레이그라운드

`/my_runnable/playground/`에서 runnable에 대한 플레이그라운드 페이지를 찾을 수 있습니다. 이는 스트리밍 출력 및 중간 단계를 포함하여 runnable을 구성하고 호출할 수 있는 간단한 UI를 제공합니다.

<p align="center">
<img src="https://github.com/langchain-ai/langserve/assets/3205522/5ca56e29-f1bb-40f4-84b5-15916384a276" width="50%"/>
</p>

### 위젯

플레이그라운드는 [위젯](#playground-widgets)을 지원하며 다양한 입력으로 runnable을 테스트하는 데 사용할 수 있습니다. 자세한 내용은 [위젯](#widgets) 섹션을 참조하세요.

### 공유

또한 구성 가능한 runnable의 경우, 플레이그라운드를 통해 runnable을 구성하고 구성 링크를 공유할 수 있습니다:

<p align="center">
<img src="https://github.com/langchain-ai/langserve/assets/3205522/86ce9c59-f8e4-4d08-9fa3-62030e0f521d" width="50%"/>
</p>

## 채팅 플레이그라운드

LangServe는 `/my_runnable/playground/`에서 사용할 수 있는 채팅 중심의 플레이그라운드도 지원합니다.
일반 플레이그라운드와 달리, 특정 유형의 runnable만 지원됩니다 - runnable의 입력 스키마는 다음 중 하나여야 합니다:

- 단일 키가 있으며 해당 키의 값이 채팅 메시지 목록인 경우.
- 하나는 메시지 목록의 값이고 다른 하나는 최신 메시지를 나타내는 두 개의 키가 있는 경우.

첫 번째 형식을 사용하는 것이 좋습니다.

runnable은 또한 `AIMessage` 또는 문자열을 반환해야 합니다.

이를 활성화하려면 라우트를 추가할 때 `playground_type="chat",`를 설정해야 합니다. 다음은 예제입니다:

```python
# 체인 선언

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful, professional assistant named Cob."),
        MessagesPlaceholder(variable_name="messages"),
    ]
)

chain = prompt | ChatAnthropic(model="claude-2")


class InputChat(BaseModel):
    """채팅 엔드포인트에 대한 입력."""

    messages: List[Union[HumanMessage, AIMessage, SystemMessage]] = Field(
        ...,
        description="현재 대화를 나타내는 채팅 메시지.",
    )


add_routes(
    app,
    chain.with_types(input_type=InputChat),
    enable_feedback_endpoint=True,
    enable_public_trace_link_endpoint=True,
    playground_type="chat",
)
```

LangSmith를 사용하는 경우, 라우트에서 `enable_feedback_endpoint=True`를 설정하여 각 메시지 후에 thumbs-up/thumbs-down 버튼을 활성화할 수 있으며, `enable_public_trace_link_endpoint=True`를 설정하여 실행에 대한 공개 추적 링크를 추가할 수 있습니다.
다음 환경 변수를 설정해야 합니다:

```bash
export LANGCHAIN_TRACING_V2="true"
export LANGCHAIN_PROJECT="YOUR_PROJECT_NAME"
export LANGCHAIN_API_KEY="YOUR_API_KEY"
```

다음은 위 두 옵션을 활성화한 예제입니다:

<p align="center">
<img src="./.github/img/chat_playground.png" width="50%"/>
</p>

참고: 공개 추적 링크를 활성화하면 체인의 내부가 노출됩니다. 이 설정은 데모 또는 테스트 목적으로만 사용하는 것이 좋습니다.

## 레거시 체인

LangServe는 Runnables( [LangChain Expression Language](https://python.langchain.com/docs/expression_language/)을 통해 구성됨)와 레거시 체인(`Chain`을 상속받음) 모두에서 작동합니다.
그러나 레거시 체인의 입력 스키마는 불완전하거나 잘못될 수 있으며, 이는 오류로 이어질 수 있습니다.
이는 LangChain에서 해당 체인의 `input_schema` 속성을 업데이트하여 수정할 수 있습니다.
오류가 발생하면 이 레포지토리에 이슈를 열어 주시면 해결하겠습니다.

## 배포

### AWS에 배포

[AWS Copilot CLI](https://aws.github.io/copilot-cli/)를 사용하여 AWS에 배포할 수 있습니다.

```bash
copilot init --app [application-name] --name [service-name] --type 'Load Balanced Web Service' --dockerfile './Dockerfile' --deploy
```

자세한 내용은 [여기](https://aws.amazon.com/containers/copilot/)를 클릭하여 확인하세요.

### Azure에 배포

Azure Container Apps(Serverless)를 사용하여 Azure에 배포할 수 있습니다:

```
az containerapp up --name [container-app-name] --source . --resource-group [resource-group-name] --environment  [environment-name] --ingress external --target-port 8001 --env-vars=OPENAI_API_KEY=your_key
```

자세한 내용은 [여기](https://learn.microsoft.com/en-us/azure/container-apps/containerapp-up)에서 확인할 수 있습니다.

### GCP에 배포

다음 명령을 사용하여 GCP Cloud Run에 배포할 수 있습니다:

```
gcloud run deploy [your-service-name] --source . --port 8001 --allow-unauthenticated --region us-central1 --set-env-vars=OPENAI_API_KEY=your_key
```

### 커뮤니티 기여

#### Railway에 배포

[예제 Railway 저장소](https://github.com/PaulLockett/LangServe-Railway/tree/main)

[![Railway에 배포](https://railway.app/button.svg)](https://railway.app/template/pW9tXP?referralCode=c-aq4K)

## Pydantic

LangServe는 몇 가지 제한 사항과 함께 Pydantic 2를 지원합니다.

1. Pydantic V2를 사용할 때 invoke/batch/stream/stream_log에 대한 OpenAPI 문서는 생성되지 않습니다. Fast API는 [pydantic v1과 v2 네임스페이스 혼합을 지원하지 않습니다].
2. LangChain은 Pydantic v2에서 v1 네임스페이스를 사용합니다. LangChain과의 호환성을 보장하기 위한 [다음 가이드라인](https://github.com/langchain-ai/langchain/discussions/9337)을 읽어보세요.

이러한 제한 사항을 제외하고, API 엔드포인트, 플레이그라운드 및 기타 기능이 예상대로 작동할 것으로 기대합니다.

## 고급

### 인증 처리

서버에 인증을 추가해야 하는 경우, Fast API의 [dependencies](https://fastapi.tiangolo.com/tutorial/dependencies/) 및 [security](https://fastapi.tiangolo.com/tutorial/security/) 문서를 참조하세요.

아래 예제는 FastAPI 원시를 사용하여 LangServe 엔드포인트에 인증 로직을 연결하는 방법을 보여줍니다.

실제 인증 로직, 사용자 테이블 등을 제공하는 것은 사용자 책임입니다.

확실하지 않은 경우, [Auth0](https://auth0.com/)와 같은 기존 솔루션을 사용하는 것이 좋습니다.

#### add_routes 사용

`add_routes`를 사용하는 경우, [여기](https://github.com/langchain-ai/langserve/tree/main/examples/auth)에서 예제를 참조하세요.

| 설명                                                                                                                                                    | 링크                                                                                                                                                                                                                            |
| :------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Auth** `add_routes` 사용: 앱과 연결된 모든 엔드포인트에 적용할 수 있는 간단한 인증. (사용자별 로직을 구현하는 데 자체적으로는 유용하지 않음)          | [server](https://github.com/langchain-ai/langserve/tree/main/examples/auth/global_deps/server.py)                                                                                                                               |
| **Auth** `add_routes` 사용: 경로 종속성을 기반으로 한 간단한 인증 메커니즘. (사용자별 로직을 구현하는 데 자체적으로는 유용하지 않음)                    | [server](https://github.com/langchain-ai/langserve/tree/main/examples/auth/path_dependencies/server.py)                                                                                                                         |
| **Auth** `add_routes` 사용: 요청별 구성 수정자를 사용하는 엔드포인트에 대한 사용자별 로직 및 인증 구현. (**참고**: 현재는 OpenAPI 문서와 통합되지 않음) | [server](https://github.com/langchain-ai/langserve/tree/main/examples/auth/per_req_config_modifier/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/auth/per_req_config_modifier/client.ipynb) |

또는 FastAPI의 [middleware](https://fastapi.tiangolo.com/tutorial/middleware/)를 사용할 수 있습니다.

전역 종속성 및 경로 종속성을 사용하면 인증이 OpenAPI 문서 페이지에서 적절하게 지원된다는 장점이 있지만, 이는 사용자별 로직(예: 사용자 소유 문서 내에서만 검색하는 애플리케이션 만들기)을 구현하기에는 충분하지 않습니다.

사용자별 로직을 구현해야 하는 경우, `per_req_config_modifier` 또는 `APIHandler`(아래)를 사용하여 이 로직을 구현할 수 있습니다.

**사용자별**

사용자 의존적 인증 또는 로직이 필요한 경우, `add_routes`를 사용할 때 `per_req_config_modifier`를 지정하세요. 호출 가능한 것은 원시 `Request` 객체를 수신하고 인증 및 권한 부여 목적을 위해 관련 정보를 추출할 수 있습니다.

#### APIHandler 사용

FastAPI 및 Python에 익숙하다면, LangServe의 [APIHandler](https://github.com/langchain-ai/langserve/blob/main/examples/api_handler_examples/server.py)를 사용할 수 있습니다.

| 설명                                                                                                                                                                                                          | 링크                                                                                                                                                                                                            |
| :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Auth** `APIHandler` 사용: 사용자 소유 문서 내에서만 검색하는 방법을 보여주는 사용자별 로직 및 인증 구현.                                                                                                    | [server](https://github.com/langchain-ai/langserve/tree/main/examples/auth/api_handler/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/auth/api_handler/client.ipynb)         |
| **APIHandler** `add_routes` 대신 `APIHandler`를 사용하는 방법을 보여줍니다. 이는 개발자가 엔드포인트를 정의하는 데 더 많은 유연성을 제공합니다. FastAPI 패턴과 잘 작동하지만, 약간 더 많은 노력이 필요합니다. | [server](https://github.com/langchain-ai/langserve/tree/main/examples/api_handler_examples/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/api_handler_examples/client.ipynb) |

약간 더 많은 작업이 필요하지만, 엔드포인트 정의에 대한 완전한 제어를 제공하여 인증을 위한 사용자 지정 로직을 구현할 수 있습니다.

### 파일 처리

LLM 애플리케이션은 종종 파일을 다룹니다. 파일 처리를 구현하기 위한 다양한 아키텍처가 있을 수 있습니다; 고수준에서는 다음과 같습니다:

1. 파일은 전용 엔드포인트를 통해 서버에 업로드되고 별도의 엔드포인트를 사용하여 처리될 수 있습니다.
2. 파일은 값(파일의 바이트) 또는 참조(e.g., s3 URL)로 업로드될 수 있습니다.
3. 처리 엔드포인트는 블로킹 또는 논블로킹일 수 있습니다.
4. 상당한 처리가 필요한 경우, 처리는 전용 프로세스 풀에 오프로드될 수 있습니다.

애플리케이션에 적합한 아키텍처를 결정해야 합니다.

현재, runnable에 파일을 값으로 업로드하려면 base64 인코딩을 사용하세요 (`multipart/form-data`는 아직 지원되지 않습니다).

다음은 원격 runnable에 파일을 보내기 위해 base64 인코딩을 사용하는 방법을 보여주는 [예제](https://github.com/langchain-ai/langserve/tree/main/examples/file_processing)입니다.

참고로, 참조(e.g., s3 URL)로 파일을 업로드하거나 전용 엔드포인트로 `multipart/form-data`로 파일을 업로드할 수 있습니다.

### 사용자 정의 입력 및 출력 타입

입력 및 출력 타입은 모든 runnable에 대해 정의됩니다.

`input_schema` 및 `output_schema` 속성을 통해 액세스할 수 있습니다.

`LangServe`는 이러한 타입을 유효성 검사 및 문서화에 사용합니다.

기본적으로 추론된 타입을 재정의하려면 `with_types` 메서드를 사용할 수 있습니다.

아이디어를 설명하기 위한 간단한 예제입니다:

### 커뮤니티 기여

#### Railway에 배포

[예제 Railway 저장소](https://github.com/PaulLockett/LangServe-Railway/tree/main)

[![Railway에 배포](https://railway.app/button.svg)](https://railway.app/template/pW9tXP?referralCode=c-aq4K)

## Pydantic

LangServe는 몇 가지 제한 사항과 함께 Pydantic 2를 지원합니다.

1. Pydantic V2를 사용할 때 invoke/batch/stream/stream_log에 대한 OpenAPI 문서는 생성되지 않습니다. Fast API는 [pydantic v1과 v2 네임스페이스 혼합을 지원하지 않습니다].
2. LangChain은 Pydantic v2에서 v1 네임스페이스를 사용합니다. LangChain과의 호환성을 보장하기 위한 [다음 가이드라인](https://github.com/langchain-ai/langchain/discussions/9337)을 읽어보세요.

이러한 제한 사항을 제외하고, API 엔드포인트, 플레이그라운드 및 기타 기능이 예상대로 작동할 것으로 기대합니다.

## 고급

### 인증 처리

서버에 인증을 추가해야 하는 경우, Fast API의 [dependencies](https://fastapi.tiangolo.com/tutorial/dependencies/) 및 [security](https://fastapi.tiangolo.com/tutorial/security/) 문서를 참조하세요.

아래 예제는 FastAPI 원시를 사용하여 LangServe 엔드포인트에 인증 로직을 연결하는 방법을 보여줍니다.

실제 인증 로직, 사용자 테이블 등을 제공하는 것은 사용자 책임입니다.

확실하지 않은 경우, [Auth0](https://auth0.com/)와 같은 기존 솔루션을 사용하는 것이 좋습니다.

#### add_routes 사용

`add_routes`를 사용하는 경우, [여기](https://github.com/langchain-ai/langserve/tree/main/examples/auth)에서 예제를 참조하세요.

| 설명                                                                                                                                                    | 링크                                                                                                                                                                                                                            |
| :------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Auth** `add_routes` 사용: 앱과 연결된 모든 엔드포인트에 적용할 수 있는 간단한 인증. (사용자별 로직을 구현하는 데 자체적으로는 유용하지 않음)          | [server](https://github.com/langchain-ai/langserve/tree/main/examples/auth/global_deps/server.py)                                                                                                                               |
| **Auth** `add_routes` 사용: 경로 종속성을 기반으로 한 간단한 인증 메커니즘. (사용자별 로직을 구현하는 데 자체적으로는 유용하지 않음)                    | [server](https://github.com/langchain-ai/langserve/tree/main/examples/auth/path_dependencies/server.py)                                                                                                                         |
| **Auth** `add_routes` 사용: 요청별 구성 수정자를 사용하는 엔드포인트에 대한 사용자별 로직 및 인증 구현. (**참고**: 현재는 OpenAPI 문서와 통합되지 않음) | [server](https://github.com/langchain-ai/langserve/tree/main/examples/auth/per_req_config_modifier/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/auth/per_req_config_modifier/client.ipynb) |

또는 FastAPI의 [middleware](https://fastapi.tiangolo.com/tutorial/middleware/)를 사용할 수 있습니다.

전역 종속성 및 경로 종속성을 사용하면 인증이 OpenAPI 문서 페이지에서 적절하게 지원된다는 장점이 있지만, 이는 사용자별 로직(예: 사용자 소유 문서 내에서만 검색하는 애플리케이션 만들기)을 구현하기에는 충분하지 않습니다.

사용자별 로직을 구현해야 하는 경우, `per_req_config_modifier` 또는 `APIHandler`(아래)를 사용하여 이 로직을 구현할 수 있습니다.

**사용자별**

사용자 의존적 인증 또는 로직이 필요한 경우, `add_routes`를 사용할 때 `per_req_config_modifier`를 지정하세요. 호출 가능한 것은 원시 `Request` 객체를 수신하고 인증 및 권한 부여 목적을 위해 관련 정보를 추출할 수 있습니다.

#### APIHandler 사용

FastAPI 및 Python에 익숙하다면, LangServe의 [APIHandler](https://github.com/langchain-ai/langserve/blob/main/examples/api_handler_examples/server.py)를 사용할 수 있습니다.

| 설명                                                                                                                                                                                                          | 링크                                                                                                                                                                                                            |
| :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Auth** `APIHandler` 사용: 사용자 소유 문서 내에서만 검색하는 방법을 보여주는 사용자별 로직 및 인증 구현.                                                                                                    | [server](https://github.com/langchain-ai/langserve/tree/main/examples/auth/api_handler/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/auth/api_handler/client.ipynb)         |
| **APIHandler** `add_routes` 대신 `APIHandler`를 사용하는 방법을 보여줍니다. 이는 개발자가 엔드포인트를 정의하는 데 더 많은 유연성을 제공합니다. FastAPI 패턴과 잘 작동하지만, 약간 더 많은 노력이 필요합니다. | [server](https://github.com/langchain-ai/langserve/tree/main/examples/api_handler_examples/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/api_handler_examples/client.ipynb) |

약간 더 많은 작업이 필요하지만, 엔드포인트 정의에 대한 완전한 제어를 제공하여 인증을 위한 사용자 지정 로직을 구현할 수 있습니다.

### 파일 처리

LLM 애플리케이션은 종종 파일을 다룹니다. 파일 처리를 구현하기 위한 다양한 아키텍처가 있을 수 있습니다; 고수준에서는 다음과 같습니다:

1. 파일은 전용 엔드포인트를 통해 서버에 업로드되고 별도의 엔드포인트를 사용하여 처리될 수 있습니다.
2. 파일은 값(파일의 바이트) 또는 참조(e.g., s3 URL)로 업로드될 수 있습니다.
3. 처리 엔드포인트는 블로킹 또는 논블로킹일 수 있습니다.
4. 상당한 처리가 필요한 경우, 처리는 전용 프로세스 풀에 오프로드될 수 있습니다.

애플리케이션에 적합한 아키텍처를 결정해야 합니다.

현재, runnable에 파일을 값으로 업로드하려면 base64 인코딩을 사용하세요 (`multipart/form-data`는 아직 지원되지 않습니다).

다음은 원격 runnable에 파일을 보내기 위해 base64 인코딩을 사용하는 방법을 보여주는 [예제](https://github.com/langchain-ai/langserve/tree/main/examples/file_processing)입니다.

참고로, 참조(e.g., s3 URL)로 파일을 업로드하거나 전용 엔드포인트로 `multipart/form-data`로 파일을 업로드할 수 있습니다.

### 사용자 정의 입력 및 출력 타입

입력 및 출력 타입은 모든 runnable에 대해 정의됩니다.

`input_schema` 및 `output_schema` 속성을 통해 액세스할 수 있습니다.

`LangServe`는 이러한 타입을 유효성 검사 및 문서화에 사용합니다.

기본적으로 추론된 타입을 재정의하려면 `with_types` 메서드를 사용할 수 있습니다.

아이디어를 설명하기 위한 간단한 예제입니다:

```python
<!--IMPORTS:[{"imported": "RunnableLambda", "source": "langchain.schema.runnable", "docs": "https://api.python.langchain.com/en/latest/runnables/langchain_core.runnables.base.RunnableLambda.html", "title": "\ud83e\udd9c\ufe0f\ud83c\udfd3 LangServe"}]-->
from typing import Any

from fastapi import FastAPI
from langchain.schema.runnable import RunnableLambda

app = FastAPI()


def func(x: Any) -> int:
    """정수가 아닌 값을 받아들이도록 잘못 정의된 함수."""
    return x + 1


runnable = RunnableLambda(func).with_types(
    input_type=int,
)

add_routes(app, runnable)
```

### 사용자 정의 타입

데이터를 Pydantic 모델 대신 해당 dict 표현으로 직렬화하려는 경우, `CustomUserType`을 상속합니다.

현재, 이 타입은 _서버_ 측에서만 작동하며 원하는 _디코딩_ 동작을 지정하는 데 사용됩니다. 이 타입을 상속하면 서버는 디코딩된 타입을 dict로 변환하는 대신 Pydantic 모델로 유지합니다.

```python
<!--IMPORTS:[{"imported": "RunnableLambda", "source": "langchain.schema.runnable", "docs": "https://api.python.langchain.com/en/latest/runnables/langchain_core.runnables.base.RunnableLambda.html", "title": "\ud83e\udd9c\ufe0f\ud83c\udfd3 LangServe"}]-->
from fastapi import FastAPI
from langchain.schema.runnable import RunnableLambda

from langserve import add_routes
from langserve.schema import CustomUserType

app = FastAPI()


class Foo(CustomUserType):
    bar: int


def func(foo: Foo) -> int:
    """Pydantic 모델인 Foo 타입을 기대하는 샘플 함수"""
    assert isinstance(foo, Foo)
    return foo.bar


# 입력 및 출력 타입은 자동으로 추론됩니다!

# 입력 및 출력 타입을 지정할 필요가 없습니다.

# runnable = RunnableLambda(func).with_types( # <-- 이 경우에는 필요하지 않습니다.

#     input_type=Foo,

#     output_type=int,

#

add_routes(app, RunnableLambda(func), path="/foo")
```

### 플레이그라운드 위젯

플레이그라운드는 백엔드에서 runnable을 위한 사용자 정의 위젯을 정의할 수 있습니다.

여기 몇 가지 예제가 있습니다:

| 설명                                                             | 링크                                                                                                                                                                                                  |
| :--------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **위젯** 파일 업로드 및 채팅을 위한 다양한 위젯                  | [server](https://github.com/langchain-ai/langserve/tree/main/examples/widgets/chat/tuples/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/widgets/client.ipynb)     |
| **위젯** LangServe 플레이그라운드에서 사용되는 파일 업로드 위젯. | [server](https://github.com/langchain-ai/langserve/tree/main/examples/file_processing/server.py), [client](https://github.com/langchain-ai/langserve/tree/main/examples/file_processing/client.ipynb) |

#### 스키마

- 위젯은 필드 레벨에서 지정되며 입력 타입의 JSON 스키마의 일부로 전달됩니다.
- 위젯은 `type`이라는 키를 포함해야 하며 값은 잘 알려진 위젯 목록 중 하나여야 합니다.
- 다른 위젯 키는 JSON 객체의 경로를 설명하는 값과 연관됩니다.

```typescript
type JsonPath = number | string | (number | string)[];
type NameSpacedPath = { title: string; path: JsonPath }; // json 스키마를 모방하기 위해 title을 사용하지만 네임스페이스를 사용할 수 있습니다.
type OneOfPath = { oneOf: JsonPath[] };

type Widget = {
  type: string; // 잘 알려진 타입 중 하나 (예: base64file, chat 등)
  [key: string]: JsonPath | NameSpacedPath | OneOfPath;
};
```

### 사용 가능한 위젯

현재 사용자가 수동으로 지정할 수 있는 위젯은 두 가지뿐입니다:

1. 파일 업로드 위젯
2. 채팅 기록 위젯

아래에서 이러한 위젯에 대한 자세한 정보를 확인할 수 있습니다.

플레이그라운드 UI의 다른 모든 위젯은 Runnable의 구성 스키마를 기반으로 UI에 의해 자동으로 생성 및 관리됩니다. 구성 가능한 Runnable을 만들 때, 플레이그라운드는 이러한 위젯을 자동으로 생성하여 동작을 제어할 수 있습니다.

#### 파일 업로드 위젯

플레이그라운드 UI에서 파일을 base64 인코딩된 문자열로 업로드할 수 있는 파일 업로드 입력을 생성할 수 있습니다. [전체 예제](https://github.com/langchain-ai/langserve/tree/main/examples/file_processing)를 확인하세요.

코드 조각:

```python
try:
    from pydantic.v1 import Field
except ImportError:
    from pydantic import Field

from langserve import CustomUserType


# 주의: BaseModel 대신 CustomUserType을 상속해야 서버가 이를 dict로 디코딩하지 않고 Pydantic 모델로 유지합니다.

class FileProcessingRequest(CustomUserType):
    """base64 인코딩된 파일을 포함하는 요청."""

    # 추가 필드는 플레이그라운드 UI를 위한 위젯을 지정하는 데 사용됩니다.
    file: str = Field(..., extra={"widget": {"type": "base64file"}})
    num_chars: int = 100

```

위젯 예제:

<p align="center">
<img src="https://github.com/langchain-ai/langserve/assets/3205522/52199e46-9464-4c2e-8be8-222250e08c3f" width="50%"/>
</p>

### 채팅 위젯

채팅 위젯을 정의하려면 "type": "chat"을 전달하세요.

- "input"은 *Request*에서 새 입력 메시지가 있는 필드의 JSONPath입니다.
- "output"은 *Response*에서 새 출력 메시지(들)가 있는 필드의 JSONPath입니다.
- 전체 입력 또는 출력을 그대로 사용해야 하는 경우 이 필드를 지정하지 마세요 (예: 출력이 채팅 메시지 목록인 경우).

여기 코드 조각이 있습니다:

```python
class ChatHistory(CustomUserType):
    chat_history: List[Tuple[str, str]] = Field(
        ...,
        examples=[[("human input", "ai response")]],
        extra={"widget": {"type": "chat", "input": "question", "output": "answer"}},
    )
    question: str


def _format_to_messages(input: ChatHistory) -> List[BaseMessage]:
    """입력을 메시지 목록으로 포맷팅합니다."""
    history = input.chat_history
    user_input = input.question

    messages = []

    for human, ai in history:
        messages.append(HumanMessage(content=human))
        messages.append(AIMessage(content=ai))
    messages.append(HumanMessage(content=user_input))
    return messages


model = ChatOpenAI()
chat_model = RunnableParallel({"answer": (RunnableLambda(_format_to_messages) | model)})
add_routes(
    app,
    chat_model.with_types(input_type=ChatHistory),
    config_keys=["configurable"],
    path="/chat",
)
```

위젯 예제:

<p align="center">
<img src="https://github.com/langchain-ai/langserve/assets/3205522/a71ff37b-a6a9-4857-a376-cf27c41d3ca4" width="50%"/>
</p>

매개변수로 메시지 목록을 직접 지정할 수도 있습니다. 다음 코드 조각을 참조하세요:

```python
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful assistant named Cob."),
        MessagesPlaceholder(variable_name="messages"),
    ]
)

chain = prompt | ChatAnthropic(model="claude-2")


class MessageListInput(BaseModel):
    """채팅 엔드포인트에 대한 입력."""
    messages: List[Union[HumanMessage, AIMessage]] = Field(
        ...,
        description="현재 대화를 나타내는 채팅 메시지.",
        extra={"widget": {"type": "chat", "input": "messages"}},
    )


add_routes(
    app,
    chain.with_types(input_type=MessageListInput),
    path="/chat",
)
```

[이 예제 파일](https://github.com/langchain-ai/langserve/tree/main/examples/widgets/chat/message_list/server.py)을 참조하세요.

### 엔드포인트 활성화/비활성화 (LangServe >=0.0.33)

주어진 체인의 경로를 추가할 때 노출할 엔드포인트를 활성화/비활성화할 수 있습니다.

업그레이드할 때 새 엔드포인트를 받지 않도록 하려면 `enabled_endpoints`를 사용하세요.

활성화: 아래 코드는 `invoke`, `batch` 및 해당 `config_hash` 엔드포인트 변형만 활성화합니다.

```python
add_routes(app, chain, enabled_endpoints=["invoke", "batch", "config_hashes"], path="/mychain")
```

비활성화: 아래 코드는 체인의 플레이그라운드를 비활성화합니다.

```python
add_routes(app, chain, disabled_endpoints=["playground"], path="/mychain")
```

