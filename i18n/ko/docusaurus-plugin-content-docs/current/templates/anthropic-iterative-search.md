---
translated: true
---

# 인공지능 반복 검색

이 템플릿은 위키피디아를 검색하여 질문에 대한 답변을 찾을 수 있는 가상 연구 보조원을 만듭니다.

이는 [이 노트북](https://github.com/anthropics/anthropic-cookbook/blob/main/long_context/wikipedia-search-cookbook.ipynb)에 크게 영향을 받았습니다.

## 환경 설정

Anthropic 모델에 액세스하려면 `ANTHROPIC_API_KEY` 환경 변수를 설정하세요.

## 사용법

이 패키지를 사용하려면 먼저 LangChain CLI가 설치되어 있어야 합니다:

```shell
pip install -U langchain-cli
```

새 LangChain 프로젝트를 만들고 이것만 설치하려면 다음과 같이 할 수 있습니다:

```shell
langchain app new my-app --package anthropic-iterative-search
```

기존 프로젝트에 추가하려면 다음을 실행하면 됩니다:

```shell
langchain app add anthropic-iterative-search
```

그리고 `server.py` 파일에 다음 코드를 추가하세요:

```python
from anthropic_iterative_search import chain as anthropic_iterative_search_chain

add_routes(app, anthropic_iterative_search_chain, path="/anthropic-iterative-search")
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

이렇게 하면 FastAPI 앱이 시작되며 [http://localhost:8000](http://localhost:8000)에서 로컬 서버가 실행됩니다.

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)에서 모든 템플릿을 볼 수 있습니다.
[http://127.0.0.1:8000/anthropic-iterative-search/playground](http://127.0.0.1:8000/anthropic-iterative-search/playground)에서 playground에 액세스할 수 있습니다.

코드에서 템플릿에 액세스할 수 있습니다:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/anthropic-iterative-search")
```
