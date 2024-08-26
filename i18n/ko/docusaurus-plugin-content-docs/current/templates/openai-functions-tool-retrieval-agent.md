---
translated: true
---

# openai-functions-tool-retrieval-agent

이 템플릿에 소개된 새로운 아이디어는 검색을 사용하여 에이전트 쿼리에 사용할 도구 집합을 선택하는 것입니다. 많은 도구를 선택할 때 유용합니다. 프롬프트에 모든 도구의 설명을 넣을 수 없기 때문에(컨텍스트 길이 문제로) 대신 실행 시간에 고려하려는 N개의 도구를 동적으로 선택합니다.

이 템플릿에서는 약간 인위적인 예를 만들 것입니다. 하나의 정당한 도구(검색)와 99개의 가짜 도구(무의미한 것들)가 있습니다. 그런 다음 프롬프트 템플릿에 사용자 입력을 가져와 쿼리와 관련된 도구를 검색하는 단계를 추가할 것입니다.

이 템플릿은 [이 Agent How-To](https://python.langchain.com/docs/modules/agents/how_to/custom_agent_with_tool_retrieval)를 기반으로 합니다.

## 환경 설정

다음과 같은 환경 변수를 설정해야 합니다:

OpenAI 모델에 액세스하려면 `OPENAI_API_KEY` 환경 변수를 설정하세요.

Tavily에 액세스하려면 `TAVILY_API_KEY` 환경 변수를 설정하세요.

## 사용법

이 패키지를 사용하려면 먼저 LangChain CLI를 설치해야 합니다:

```shell
pip install -U langchain-cli
```

새 LangChain 프로젝트를 만들고 이것만 설치하려면 다음과 같이 할 수 있습니다:

```shell
langchain app new my-app --package openai-functions-tool-retrieval-agent
```

기존 프로젝트에 추가하려면 다음을 실행하면 됩니다:

```shell
langchain app add openai-functions-tool-retrieval-agent
```

그리고 `server.py` 파일에 다음 코드를 추가하세요:

```python
from openai_functions_tool_retrieval_agent import agent_executor as openai_functions_tool_retrieval_agent_chain

add_routes(app, openai_functions_tool_retrieval_agent_chain, path="/openai-functions-tool-retrieval-agent")
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

이렇게 하면 FastAPI 앱이 시작되며 [http://localhost:8000](http://localhost:8000)에서 로컬 서버가 실행됩니다.

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)에서 모든 템플릿을 볼 수 있습니다.
[http://127.0.0.1:8000/openai-functions-tool-retrieval-agent/playground](http://127.0.0.1:8000/openai-functions-tool-retrieval-agent/playground)에서 playground에 액세스할 수 있습니다.

코드에서 템플릿에 액세스할 수 있습니다:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/openai-functions-tool-retrieval-agent")
```
