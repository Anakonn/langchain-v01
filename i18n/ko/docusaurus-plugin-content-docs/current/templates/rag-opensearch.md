---
translated: true
---

# rag-opensearch

이 템플릿은 [OpenSearch](https://python.langchain.com/docs/integrations/vectorstores/opensearch)를 사용하여 RAG를 수행합니다.

## 환경 설정

다음과 같은 환경 변수를 설정하세요.

- `OPENAI_API_KEY` - OpenAI Embeddings와 Models에 액세스하기 위해

그리고 기본값을 사용하지 않는 경우 다음과 같은 OpenSearch 변수도 설정하세요:

- `OPENSEARCH_URL` - 호스팅된 OpenSearch 인스턴스의 URL
- `OPENSEARCH_USERNAME` - OpenSearch 인스턴스의 사용자 이름
- `OPENSEARCH_PASSWORD` - OpenSearch 인스턴스의 비밀번호
- `OPENSEARCH_INDEX_NAME` - 인덱스의 이름

기본 OpenSeach 인스턴스를 Docker에서 실행하려면 다음 명령어를 사용할 수 있습니다.

```shell
docker run -p 9200:9200 -p 9600:9600 -e "discovery.type=single-node" --name opensearch-node -d opensearchproject/opensearch:latest
```

참고: `langchain-test`라는 이름의 더미 인덱스에 더미 문서를 로드하려면 패키지 내에서 `python dummy_index_setup.py`를 실행하세요.

## 사용법

이 패키지를 사용하려면 먼저 LangChain CLI가 설치되어 있어야 합니다:

```shell
pip install -U langchain-cli
```

새 LangChain 프로젝트를 만들고 이 패키지만 설치하려면 다음과 같이 할 수 있습니다:

```shell
langchain app new my-app --package rag-opensearch
```

기존 프로젝트에 추가하려면 다음과 같이 실행하세요:

```shell
langchain app add rag-opensearch
```

그리고 `server.py` 파일에 다음 코드를 추가하세요:

```python
from rag_opensearch import chain as rag_opensearch_chain

add_routes(app, rag_opensearch_chain, path="/rag-opensearch")
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

이 디렉토리 내에 있다면 다음과 같이 직접 LangServe 인스턴스를 실행할 수 있습니다:

```shell
langchain serve
```

이렇게 하면 FastAPI 앱이 시작되며 로컬에서 서버가 실행됩니다.
[http://localhost:8000](http://localhost:8000)

모든 템플릿은 [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)에서 확인할 수 있습니다.
[http://127.0.0.1:8000/rag-opensearch/playground](http://127.0.0.1:8000/rag-opensearch/playground)에서 playground에 액세스할 수 있습니다.

코드에서 템플릿에 액세스할 수 있습니다:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-opensearch")
```
