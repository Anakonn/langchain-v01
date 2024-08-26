---
translated: true
---

# rag-elasticsearch

이 템플릿은 [Elasticsearch](https://python.langchain.com/docs/integrations/vectorstores/elasticsearch)를 사용하여 RAG를 수행합니다.

문장 변환기 `MiniLM-L6-v2`를 사용하여 문단과 질문의 임베딩을 수행합니다.

## 환경 설정

OpenAI 모델에 액세스하려면 `OPENAI_API_KEY` 환경 변수를 설정하세요.

Elasticsearch 인스턴스에 연결하려면 다음 환경 변수를 사용하세요:

```bash
export ELASTIC_CLOUD_ID = <ClOUD_ID>
export ELASTIC_USERNAME = <ClOUD_USERNAME>
export ELASTIC_PASSWORD = <ClOUD_PASSWORD>
```

Docker를 사용한 로컬 개발의 경우 다음을 사용하세요:

```bash
export ES_URL="http://localhost:9200"
```

그리고 Docker에서 Elasticsearch 인스턴스를 실행하려면 다음을 사용하세요:

```bash
docker run -p 9200:9200 -e "discovery.type=single-node" -e "xpack.security.enabled=false" -e "xpack.security.http.ssl.enabled=false" docker.elastic.co/elasticsearch/elasticsearch:8.9.0
```

## 사용법

이 패키지를 사용하려면 먼저 LangChain CLI를 설치해야 합니다:

```shell
pip install -U langchain-cli
```

새 LangChain 프로젝트를 만들고 이 패키지만 설치하려면 다음을 실행하세요:

```shell
langchain app new my-app --package rag-elasticsearch
```

기존 프로젝트에 추가하려면 다음을 실행하세요:

```shell
langchain app add rag-elasticsearch
```

그리고 `server.py` 파일에 다음 코드를 추가하세요:

```python
from rag_elasticsearch import chain as rag_elasticsearch_chain

add_routes(app, rag_elasticsearch_chain, path="/rag-elasticsearch")
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

이 디렉토리 내에 있다면 다음을 실행하여 LangServe 인스턴스를 직접 시작할 수 있습니다:

```shell
langchain serve
```

이렇게 하면 FastAPI 앱이 시작되며 로컬에서 서버가 실행됩니다.
[http://localhost:8000](http://localhost:8000)

모든 템플릿은 [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)에서 볼 수 있습니다.
[http://127.0.0.1:8000/rag-elasticsearch/playground](http://127.0.0.1:8000/rag-elasticsearch/playground)에서 playground에 액세스할 수 있습니다.

코드에서 템플릿에 액세스하려면 다음을 사용하세요:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-elasticsearch")
```

가상의 직장 문서를 로드하려면 이 리포지토리의 루트에서 다음 명령을 실행하세요:

```bash
python ingest.py
```

그러나 [여기](https://python.langchain.com/docs/integrations/document_loaders)에서 많은 문서 로더를 선택할 수 있습니다.
