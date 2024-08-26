---
translated: true
---

# python-lint

이 에이전트는 `black`, `ruff`, `mypy`를 사용하여 코드의 적절한 포맷팅과 린팅을 보장하는 데 중점을 두고 고품질의 Python 코드를 생성하는 데 특화되어 있습니다.

이를 통해 코딩 프로세스가 간소화되어 신뢰할 수 있고 일관된 코드 출력이 가능합니다.

이 에이전트는 코드를 실행할 수 없으므로 추가 종속성과 잠재적인 보안 취약성을 도입하지 않습니다.
따라서 이 에이전트는 코드 생성 작업에 안전하고 효율적인 솔루션이 됩니다.

이 에이전트를 사용하여 Python 코드를 직접 생성하거나 계획 및 실행 에이전트와 연결할 수 있습니다.

## 환경 설정

- `black`, `ruff`, `mypy` 설치: `pip install -U black ruff mypy`
- `OPENAI_API_KEY` 환경 변수 설정.

## 사용법

이 패키지를 사용하려면 먼저 LangChain CLI가 설치되어 있어야 합니다:

```shell
pip install -U langchain-cli
```

새 LangChain 프로젝트를 만들고 이 패키지만 설치하려면 다음과 같이 할 수 있습니다:

```shell
langchain app new my-app --package python-lint
```

기존 프로젝트에 추가하려면 다음을 실행하면 됩니다:

```shell
langchain app add python-lint
```

그리고 `server.py` 파일에 다음 코드를 추가하세요:

```python
from python_lint import agent_executor as python_lint_agent

add_routes(app, python_lint_agent, path="/python-lint")
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

이 디렉토리 내에 있다면 다음과 같이 LangServe 인스턴스를 직접 실행할 수 있습니다:

```shell
langchain serve
```

이렇게 하면 FastAPI 앱이 시작되며 로컬에서 서버가 실행됩니다.
[http://localhost:8000](http://localhost:8000)

모든 템플릿은 [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)에서 확인할 수 있습니다.
[http://127.0.0.1:8000/python-lint/playground](http://127.0.0.1:8000/python-lint/playground)에서 playground에 액세스할 수 있습니다.

코드에서 템플릿에 액세스할 수 있습니다:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/python-lint")
```
