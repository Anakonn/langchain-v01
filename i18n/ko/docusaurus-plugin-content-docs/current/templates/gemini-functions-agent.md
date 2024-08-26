---
translated: true
---

# 쌍둥이 함수 에이전트

이 템플릿은 Google Gemini 함수 호출을 사용하여 어떤 조치를 취할지에 대한 결정을 전달하는 에이전트를 생성합니다.

이 예제는 Tavily의 검색 엔진을 사용하여 인터넷에서 정보를 조회할 수 있는 에이전트를 생성합니다.

[LangSmith 추적 예시 보기](https://smith.langchain.com/public/0ebf1bd6-b048-4019-b4de-25efe8d3d18c/r)

## 환경 설정

다음과 같은 환경 변수를 설정해야 합니다:

`TAVILY_API_KEY` 환경 변수를 설정하여 Tavily에 액세스합니다.

`GOOGLE_API_KEY` 환경 변수를 설정하여 Google Gemini API에 액세스합니다.

## 사용법

이 패키지를 사용하려면 먼저 LangChain CLI를 설치해야 합니다:

```shell
pip install -U langchain-cli
```

새 LangChain 프로젝트를 만들고 이 패키지만 설치하려면 다음과 같이 할 수 있습니다:

```shell
langchain app new my-app --package gemini-functions-agent
```

기존 프로젝트에 추가하려면 다음과 같이 실행하면 됩니다:

```shell
langchain app add gemini-functions-agent
```

그리고 `server.py` 파일에 다음 코드를 추가합니다:

```python
from gemini_functions_agent import agent_executor as gemini_functions_agent_chain

add_routes(app, gemini_functions_agent_chain, path="/openai-functions-agent")
```

(선택 사항) 이제 LangSmith를 구성해 보겠습니다.
LangSmith를 사용하면 LangChain 애플리케이션을 추적, 모니터링 및 디버깅할 수 있습니다.
[여기](https://smith.langchain.com/)에서 LangSmith에 가입할 수 있습니다.
액세스 권한이 없는 경우 이 섹션을 건너뛸 수 있습니다.

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

이 디렉토리 내에 있다면 다음과 같이 LangServe 인스턴스를 직접 실행할 수 있습니다:

```shell
langchain serve
```

이렇게 하면 FastAPI 앱이 시작되며 로컬에서 서버가 실행됩니다.
[http://localhost:8000](http://localhost:8000)

모든 템플릿은 [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)에서 볼 수 있습니다.
[http://127.0.0.1:8000/gemini-functions-agent/playground](http://127.0.0.1:8000/gemini-functions-agent/playground)에서 playground에 액세스할 수 있습니다.

코드에서 템플릿에 액세스하려면 다음과 같이 하면 됩니다:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/gemini-functions-agent")
```
