---
translated: true
---

# OpenAI Functions Agent - Gmail

편지함 비우기에 어려움을 겪어본 적이 있나요?

이 템플릿을 사용하면 자신만의 AI 어시스턴트를 만들어 Gmail 계정을 관리할 수 있습니다. 기본 Gmail 도구를 사용하여 이메일을 읽고 검색하며 대신 작성할 수 있습니다. 또한 Tavily 검색 엔진에 액세스할 수 있어 이메일 스레드의 주제나 사람에 대한 관련 정보를 검색하고 작성할 때 이를 활용할 수 있습니다.

## 세부 사항

이 어시스턴트는 OpenAI의 [함수 호출](https://python.langchain.com/docs/modules/chains/how_to/openai_functions) 기능을 사용하여 제공된 도구를 안정적으로 선택하고 호출합니다.

이 템플릿은 [langchain-core](https://pypi.org/project/langchain-core/) 및 [`langchain-community`](https://pypi.org/project/langchain-community/)에서 직접 가져옵니다. LangChain을 재구성하여 사용 사례에 필요한 특정 통합을 선택할 수 있습니다. `langchain`에서 여전히 가져올 수 있지만(이 전환은 역호환성을 유지합니다), 대부분의 통합은 `langchain-community` 패키지에서 찾을 수 있으며, 핵심 표현 언어 API만 사용하는 경우 `langchain-core`만으로도 구축할 수 있습니다.

## 환경 설정

다음과 같은 환경 변수를 설정해야 합니다:

OpenAI 모델에 액세스하려면 `OPENAI_API_KEY` 환경 변수를 설정하세요.

Tavily 검색에 액세스하려면 `TAVILY_API_KEY` 환경 변수를 설정하세요.

Gmail의 OAuth 클라이언트 ID가 포함된 [`credentials.json`](https://developers.google.com/gmail/api/quickstart/python#authorize_credentials_for_a_desktop_application) 파일을 만드세요. 인증을 사용자 정의하려면 [인증 사용자 정의](#인증-사용자-정의) 섹션을 참조하세요.

*참고: 이 앱을 처음 실행하면 사용자 인증 흐름을 거쳐야 합니다.*

(선택 사항): `GMAIL_AGENT_ENABLE_SEND`를 `true`로 설정하거나 이 템플릿의 `agent.py` 파일을 수정하여 "보내기" 도구에 대한 액세스 권한을 부여할 수 있습니다. 이렇게 하면 명시적인 검토 없이 대신 이메일을 보낼 수 있지만 권장되지 않습니다.

## 사용법

이 패키지를 사용하려면 LangChain CLI가 설치되어 있어야 합니다:

```shell
pip install -U langchain-cli
```

새 LangChain 프로젝트를 만들고 이 패키지만 설치하려면 다음과 같이 할 수 있습니다:

```shell
langchain app new my-app --package openai-functions-agent-gmail
```

기존 프로젝트에 추가하려면 다음을 실행하면 됩니다:

```shell
langchain app add openai-functions-agent-gmail
```

그리고 `server.py` 파일에 다음 코드를 추가하세요:

```python
from openai_functions_agent import agent_executor as openai_functions_agent_chain

add_routes(app, openai_functions_agent_chain, path="/openai-functions-agent-gmail")
```

(선택 사항) 이제 LangSmith를 구성해 보겠습니다.
LangSmith는 LangChain 애플리케이션을 추적, 모니터링 및 디버깅하는 데 도움이 됩니다.
[여기](https://smith.langchain.com/)에서 LangSmith에 가입할 수 있습니다.
액세스 권한이 없는 경우 이 섹션을 건너뛸 수 있습니다.

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

이 디렉토리 내에 있다면 다음과 같이 LangServe 인스턴스를 직접 시작할 수 있습니다:

```shell
langchain serve
```

이렇게 하면 [http://localhost:8000](http://localhost:8000)에서 FastAPI 앱이 로컬로 실행됩니다.

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)에서 모든 템플릿을 볼 수 있습니다.
[http://127.0.0.1:8000/openai-functions-agent-gmail/playground](http://127.0.0.1:8000/openai-functions-agent/playground)에서 playground에 액세스할 수 있습니다.

코드에서 다음과 같이 템플릿에 액세스할 수 있습니다:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/openai-functions-agent-gmail")
```

## 인증 사용자 정의

```python
from langchain_community.tools.gmail.utils import build_resource_service, get_gmail_credentials

# Can review scopes here https://developers.google.com/gmail/api/auth/scopes
# For instance, readonly scope is 'https://www.googleapis.com/auth/gmail.readonly'
credentials = get_gmail_credentials(
    token_file="token.json",
    scopes=["https://mail.google.com/"],
    client_secrets_file="credentials.json",
)
api_resource = build_resource_service(credentials=credentials)
toolkit = GmailToolkit(api_resource=api_resource)
```
