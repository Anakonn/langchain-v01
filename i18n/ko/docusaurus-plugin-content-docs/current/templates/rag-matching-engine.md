---
translated: true
---

# rag-matching-engine

이 템플릿은 Google Cloud Platform의 Vertex AI와 매칭 엔진을 사용하여 RAG를 수행합니다.

이전에 생성된 인덱스를 사용하여 사용자가 제공한 질문에 기반하여 관련 문서 또는 컨텍스트를 검색합니다.

## 환경 설정

코드를 실행하기 전에 인덱스를 생성해야 합니다.

이 인덱스를 생성하는 과정은 [여기](https://github.com/GoogleCloudPlatform/generative-ai/blob/main/language/use-cases/document-qa/question_answering_documents_langchain_matching_engine.ipynb)에서 찾을 수 있습니다.

Vertex에 대한 환경 변수를 설정해야 합니다:

```text
PROJECT_ID
ME_REGION
GCS_BUCKET
ME_INDEX_ID
ME_ENDPOINT_ID
```

## 사용법

이 패키지를 사용하려면 먼저 LangChain CLI를 설치해야 합니다:

```shell
pip install -U langchain-cli
```

새 LangChain 프로젝트를 만들고 이 패키지만 설치하려면 다음과 같이 할 수 있습니다:

```shell
langchain app new my-app --package rag-matching-engine
```

기존 프로젝트에 추가하려면 다음을 실행하면 됩니다:

```shell
langchain app add rag-matching-engine
```

그리고 `server.py` 파일에 다음 코드를 추가하세요:

```python
from rag_matching_engine import chain as rag_matching_engine_chain

add_routes(app, rag_matching_engine_chain, path="/rag-matching-engine")
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

이렇게 하면 FastAPI 앱이 시작되며 로컬에서 [http://localhost:8000](http://localhost:8000)에서 서버가 실행됩니다.

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)에서 모든 템플릿을 볼 수 있습니다.
[http://127.0.0.1:8000/rag-matching-engine/playground](http://127.0.0.1:8000/rag-matching-engine/playground)에서 playground에 액세스할 수 있습니다.

코드에서 템플릿에 액세스하려면 다음과 같이 하면 됩니다:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-matching-engine")
```

템플릿에 연결하는 방법에 대한 자세한 내용은 Jupyter 노트북 `rag_matching_engine`을 참조하세요.
