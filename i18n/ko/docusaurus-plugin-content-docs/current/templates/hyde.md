---
translated: true
---

# 하이드

이 템플릿은 HyDE와 RAG를 사용합니다.

하이드는 Hypothetical Document Embeddings(HyDE)라는 검색 방법입니다. 이는 들어오는 쿼리에 대해 가설적인 문서를 생성하여 검색을 향상시키는 방법입니다.

그런 다음 문서를 임베딩하고 그 임베딩을 사용하여 가설적인 문서와 유사한 실제 문서를 찾습니다.

기본 개념은 가설적인 문서가 쿼리보다 임베딩 공간에 더 가까울 수 있다는 것입니다.

자세한 설명은 [여기](https://arxiv.org/abs/2212.10496)의 논문을 참조하세요.

## 환경 설정

OpenAI 모델에 액세스하려면 `OPENAI_API_KEY` 환경 변수를 설정하세요.

## 사용법

이 패키지를 사용하려면 먼저 LangChain CLI가 설치되어 있어야 합니다:

```shell
pip install -U langchain-cli
```

새 LangChain 프로젝트를 만들고 이것만 설치하려면 다음과 같이 할 수 있습니다:

```shell
langchain app new my-app --package hyde
```

기존 프로젝트에 추가하려면 다음을 실행하면 됩니다:

```shell
langchain app add hyde
```

그리고 `server.py` 파일에 다음 코드를 추가하세요:

```python
from hyde.chain import chain as hyde_chain

add_routes(app, hyde_chain, path="/hyde")
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

모든 템플릿은 [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)에서 볼 수 있습니다.
[http://127.0.0.1:8000/hyde/playground](http://127.0.0.1:8000/hyde/playground)에서 playground에 액세스할 수 있습니다.

코드에서 템플릿에 액세스할 수 있습니다:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/hyde")
```
