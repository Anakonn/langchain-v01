---
translated: true
---

# 단독 성능 프롬프팅 에이전트

이 템플릿은 단일 LLM을 다양한 페르소나와의 다중 회차 자기 협업을 통해 인지 시너지스트로 변환하는 에이전트를 생성합니다.
인지 시너지스트는 개별 강점과 지식을 결합하여 복잡한 과제에서 문제 해결 및 전반적인 성능을 향상시키는 지능형 에이전트를 말합니다. SPP는 과제 입력에 따라 다양한 페르소나를 동적으로 식별하고 시뮬레이션하여 LLM의 인지 시너지 잠재력을 unleash합니다.

이 템플릿은 `DuckDuckGo` 검색 API를 사용할 것입니다.

## 환경 설정

이 템플릿은 기본적으로 `OpenAI`를 사용할 것입니다.
`OPENAI_API_KEY`가 환경에 설정되어 있는지 확인하세요.

## 사용법

이 패키지를 사용하려면 먼저 LangChain CLI가 설치되어 있어야 합니다:

```shell
pip install -U langchain-cli
```

새 LangChain 프로젝트를 생성하고 이 패키지만 설치하려면 다음과 같이 할 수 있습니다:

```shell
langchain app new my-app --package solo-performance-prompting-agent
```

기존 프로젝트에 추가하려면 다음과 같이 실행하면 됩니다:

```shell
langchain app add solo-performance-prompting-agent
```

그리고 `server.py` 파일에 다음 코드를 추가하세요:

```python
from solo_performance_prompting_agent.agent import agent_executor as solo_performance_prompting_agent_chain

add_routes(app, solo_performance_prompting_agent_chain, path="/solo-performance-prompting-agent")
```

(선택 사항) 이제 LangSmith를 구성해 보겠습니다.
LangSmith는 LangChain 애플리케이션의 추적, 모니터링 및 디버깅을 도와줍니다.
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

이렇게 하면 FastAPI 앱이 시작되며 [http://localhost:8000](http://localhost:8000)에서 로컬 서버가 실행됩니다.

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)에서 모든 템플릿을 볼 수 있습니다.
[http://127.0.0.1:8000/solo-performance-prompting-agent/playground](http://127.0.0.1:8000/solo-performance-prompting-agent/playground)에서 playground에 액세스할 수 있습니다.

코드에서 템플릿에 액세스하려면 다음과 같이 하면 됩니다:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/solo-performance-prompting-agent")
```
