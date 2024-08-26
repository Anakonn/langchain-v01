---
translated: true
---

# Langchain - Robocorp Action Server

이 템플릿을 사용하면 [Robocorp Action Server](https://github.com/robocorp/robocorp)에서 제공하는 작업을 Agent의 도구로 사용할 수 있습니다.

## 사용법

이 패키지를 사용하려면 먼저 LangChain CLI를 설치해야 합니다:

```shell
pip install -U langchain-cli
```

새로운 LangChain 프로젝트를 만들고 이 패키지만 설치하려면 다음과 같이 할 수 있습니다:

```shell
langchain app new my-app --package robocorp-action-server
```

기존 프로젝트에 추가하려면 다음과 같이 실행하면 됩니다:

```shell
langchain app add robocorp-action-server
```

그리고 `server.py` 파일에 다음 코드를 추가하세요:

```python
from robocorp_action_server import agent_executor as action_server_chain

add_routes(app, action_server_chain, path="/robocorp-action-server")
```

### Action Server 실행하기

Action Server를 실행하려면 Robocorp Action Server가 설치되어 있어야 합니다.

```bash
pip install -U robocorp-action-server
```

그런 다음 다음과 같이 Action Server를 실행할 수 있습니다:

```bash
action-server new
cd ./your-project-name
action-server start
```

### LangSmith 구성(선택 사항)

LangSmith는 LangChain 애플리케이션의 추적, 모니터링 및 디버깅을 도와줍니다.
[여기](https://smith.langchain.com/)에서 LangSmith에 가입할 수 있습니다.
액세스 권한이 없는 경우 이 섹션을 건너뛸 수 있습니다.

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

### LangServe 인스턴스 시작하기

이 디렉토리 내에 있다면 다음과 같이 LangServe 인스턴스를 직접 실행할 수 있습니다:

```shell
langchain serve
```

이렇게 하면 FastAPI 앱이 시작되며 로컬에서 [http://localhost:8000](http://localhost:8000)에서 서버가 실행됩니다.

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)에서 모든 템플릿을 볼 수 있습니다.
[http://127.0.0.1:8000/robocorp-action-server/playground](http://127.0.0.1:8000/robocorp-action-server/playground)에서 playground에 액세스할 수 있습니다.

코드에서 템플릿에 액세스할 수 있습니다:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/robocorp-action-server")
```
