---
translated: true
---

# SQL 연구 보조원

이 패키지는 SQL 데이터베이스에 대한 연구를 수행합니다.

## 사용법

이 패키지는 다음과 같은 종속성을 가진 여러 모델을 사용합니다:

- OpenAI: `OPENAI_API_KEY` 환경 변수 설정
- Ollama: [Ollama 설치 및 실행](https://python.langchain.com/docs/integrations/chat/ollama)
- llama2 (Ollama에서): `ollama pull llama2` (그렇지 않으면 Ollama에서 404 오류가 발생합니다)

이 패키지를 사용하려면 먼저 LangChain CLI를 설치해야 합니다:

```shell
pip install -U langchain-cli
```

새 LangChain 프로젝트를 만들고 이 패키지만 설치하려면 다음과 같이 할 수 있습니다:

```shell
langchain app new my-app --package sql-research-assistant
```

기존 프로젝트에 이 패키지를 추가하려면 다음을 실행하면 됩니다:

```shell
langchain app add sql-research-assistant
```

그리고 `server.py` 파일에 다음 코드를 추가하세요:

```python
from sql_research_assistant import chain as sql_research_assistant_chain

add_routes(app, sql_research_assistant_chain, path="/sql-research-assistant")
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

이렇게 하면 FastAPI 앱이 시작되며 로컬에서 서버가 실행됩니다.
[http://localhost:8000](http://localhost:8000)

모든 템플릿은 [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)에서 볼 수 있습니다.
[http://127.0.0.1:8000/sql-research-assistant/playground](http://127.0.0.1:8000/sql-research-assistant/playground)에서 playground에 액세스할 수 있습니다.

코드에서 템플릿에 액세스할 수 있습니다:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/sql-research-assistant")
```
