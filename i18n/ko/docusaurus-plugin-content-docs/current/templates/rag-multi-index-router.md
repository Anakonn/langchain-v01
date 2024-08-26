---
translated: true
---

# 다중 인덱스(라우팅)를 사용한 RAG

사용자 질문에 따라 다양한 도메인별 검색기 사이를 라우팅하는 QA 애플리케이션입니다.

## 환경 설정

이 애플리케이션은 PubMed, ArXiv, Wikipedia, [Kay AI](https://www.kay.ai)(SEC 파일용)를 쿼리합니다.

Kay AI 계정을 무료로 만들고 [여기서 API 키를 받으세요](https://www.kay.ai).
그리고 환경 변수를 설정하세요:

```bash
export KAY_API_KEY="<YOUR_API_KEY>"
```

## 사용법

이 패키지를 사용하려면 먼저 LangChain CLI를 설치해야 합니다:

```shell
pip install -U langchain-cli
```

새 LangChain 프로젝트를 만들고 이 패키지만 설치하려면 다음과 같이 하세요:

```shell
langchain app new my-app --package rag-multi-index-router
```

기존 프로젝트에 추가하려면 다음과 같이 실행하세요:

```shell
langchain app add rag-multi-index-router
```

그리고 `server.py` 파일에 다음 코드를 추가하세요:

```python
from rag_multi_index_router import chain as rag_multi_index_router_chain

add_routes(app, rag_multi_index_router_chain, path="/rag-multi-index-router")
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
[http://127.0.0.1:8000/rag-multi-index-router/playground](http://127.0.0.1:8000/rag-multi-index-router/playground)에서 playground에 액세스할 수 있습니다.

코드에서 템플릿에 액세스하려면 다음과 같이 하세요:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-multi-index-router")
```
