---
translated: true
---

# rag-momento-vector-index

이 템플릿은 Momento Vector Index (MVI) 및 OpenAI를 사용하여 RAG를 수행합니다.

> MVI: 데이터에 대한 가장 생산적이고 사용하기 쉬운 서버리스 벡터 인덱스입니다. MVI 시작하려면 계정을 등록하기만 하면 됩니다. 인프라를 처리하거나 서버를 관리할 필요가 없으며 확장에 대해 걱정할 필요도 없습니다. MVI는 요구 사항에 맞춰 자동으로 확장되는 서비스입니다. Momento Cache와 같은 다른 Momento 서비스와 결합하여 프롬프트를 캐시하고 세션 저장소로 사용하거나 Momento Topics를 pub/sub 시스템으로 사용하여 이벤트를 애플리케이션에 브로드캐스트할 수 있습니다.

MVI를 시작하고 액세스하려면 [Momento Console](https://console.gomomento.com/)을 방문하세요.

## 환경 설정

이 템플릿은 Momento Vector Index를 벡터 저장소로 사용하며 `MOMENTO_API_KEY` 및 `MOMENTO_INDEX_NAME`을 설정해야 합니다.

[콘솔](https://console.gomomento.com/)에서 API 키를 가져오세요.

OpenAI 모델에 액세스하려면 `OPENAI_API_KEY` 환경 변수를 설정하세요.

## 사용법

이 패키지를 사용하려면 먼저 LangChain CLI가 설치되어 있어야 합니다:

```shell
pip install -U langchain-cli
```

새 LangChain 프로젝트를 만들고 이 패키지만 설치하려면 다음을 수행할 수 있습니다:

```shell
langchain app new my-app --package rag-momento-vector-index
```

기존 프로젝트에 추가하려면 다음을 실행하면 됩니다:

```shell
langchain app add rag-momento-vector-index
```

그리고 `server.py` 파일에 다음 코드를 추가하세요:

```python
from rag_momento_vector_index import chain as rag_momento_vector_index_chain

add_routes(app, rag_momento_vector_index_chain, path="/rag-momento-vector-index")
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
[http://127.0.0.1:8000/rag-momento-vector-index/playground](http://127.0.0.1:8000/rag-momento-vector-index/playground)에서 playground에 액세스할 수 있습니다.

코드에서 템플릿에 액세스할 수 있습니다:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-momento-vector-index")
```

## 데이터 인덱싱

데이터를 인덱싱하는 샘플 모듈이 포함되어 있습니다. `rag_momento_vector_index/ingest.py`에서 확인할 수 있습니다. `chain.py`에 주석 처리된 줄이 있는데, 이를 사용하려면 주석을 해제하세요.
