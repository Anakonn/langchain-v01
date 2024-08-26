---
translated: true
---

# rag-ollama-multi-query

이 템플릿은 Ollama와 OpenAI를 사용하여 다중 쿼리 리트리버로 RAG를 수행합니다.

다중 쿼리 리트리버는 사용자의 입력 쿼리를 기반으로 다양한 관점에서 여러 쿼리를 생성하는 쿼리 변환의 예입니다.

각 쿼리에 대해 관련 문서 집합을 검색하고 답변 합성을 위해 모든 쿼리에 걸쳐 고유한 합집합을 취합니다.

쿼리 생성을 위해 더 큰 LLM API에 과도한 호출을 피하기 위해 개인 로컬 LLM을 사용합니다.

Ollama LLM이 쿼리 확장을 수행하는 예제 추적은 [여기](https://smith.langchain.com/public/8017d04d-2045-4089-b47f-f2d66393a999/r)에서 확인할 수 있습니다.

그러나 더 어려운 답변 합성 작업을 위해 OpenAI를 사용합니다(전체 추적 예제 [여기](https://smith.langchain.com/public/ec75793b-645b-498d-b855-e8d85e1f6738/r)).

## 환경 설정

환경을 설정하려면 Ollama를 다운로드해야 합니다.

[여기](https://python.langchain.com/docs/integrations/chat/ollama)의 지침을 따르세요.

Ollama로 원하는 LLM을 선택할 수 있습니다.

이 템플릿은 `zephyr`를 사용하며, `ollama pull zephyr`로 액세스할 수 있습니다.

[여기](https://ollama.ai/library)에서 다른 옵션을 확인할 수 있습니다.

OpenAI 모델에 액세스하려면 `OPENAI_API_KEY` 환경 변수를 설정하세요.

## 사용법

이 패키지를 사용하려면 먼저 LangChain CLI를 설치해야 합니다:

```shell
pip install -U langchain-cli
```

새 LangChain 프로젝트를 만들고 이 패키지를 설치하려면 다음을 수행하세요:

```shell
langchain app new my-app --package rag-ollama-multi-query
```

기존 프로젝트에 이 패키지를 추가하려면 다음을 실행하세요:

```shell
langchain app add rag-ollama-multi-query
```

그리고 `server.py` 파일에 다음 코드를 추가하세요:

```python
from rag_ollama_multi_query import chain as rag_ollama_multi_query_chain

add_routes(app, rag_ollama_multi_query_chain, path="/rag-ollama-multi-query")
```

(선택 사항) 이제 LangSmith를 구성해 보겠습니다. LangSmith는 LangChain 애플리케이션을 추적, 모니터링 및 디버깅하는 데 도움이 됩니다. [여기](https://smith.langchain.com/)에서 LangSmith에 가입할 수 있습니다. 액세스 권한이 없는 경우 이 섹션을 건너뛸 수 있습니다.

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

이 디렉토리 내에 있다면 다음과 같이 LangServe 인스턴스를 직접 시작할 수 있습니다:

```shell
langchain serve
```

이렇게 하면 [http://localhost:8000](http://localhost:8000)에서 로컬로 실행되는 FastAPI 앱이 시작됩니다.

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)에서 모든 템플릿을 볼 수 있습니다.
[http://127.0.0.1:8000/rag-ollama-multi-query/playground](http://127.0.0.1:8000/rag-ollama-multi-query/playground)에서 playground에 액세스할 수 있습니다.

코드에서 이 템플릿에 액세스하려면 다음을 사용하세요:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-ollama-multi-query")
```
