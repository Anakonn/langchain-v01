---
translated: true
---

여기는 NVIDIA 모델(임베딩 및 채팅)과 Milvus 벡터 스토어를 사용하여 RAG를 수행하는 템플릿입니다.

## 환경 설정

NVIDIA API 키를 환경 변수로 내보내야 합니다.
NVIDIA API 키가 없는 경우 다음 단계를 따라 생성할 수 있습니다:
1. [NVIDIA GPU Cloud](https://catalog.ngc.nvidia.com/) 서비스에 무료 계정을 만듭니다.
2. `Catalog > AI Foundation Models > (API 엔드포인트가 있는 모델)`로 이동합니다.
3. `API` 옵션을 선택하고 `Generate Key`를 클릭합니다.
4. 생성된 키를 `NVIDIA_API_KEY`로 저장합니다. 그러면 엔드포인트에 액세스할 수 있습니다.

```shell
export NVIDIA_API_KEY=...
```

Milvus 벡터 스토어를 호스팅하는 방법은 아래 섹션을 참조하세요.

## 사용법

이 패키지를 사용하려면 먼저 LangChain CLI를 설치해야 합니다:

```shell
pip install -U langchain-cli
```

NVIDIA 모델을 사용하려면 Langchain NVIDIA AI Endpoints 패키지를 설치하세요:

```shell
pip install -U langchain_nvidia_aiplay
```

새 LangChain 프로젝트를 만들고 이 패키지만 설치하려면 다음을 실행하세요:

```shell
langchain app new my-app --package nvidia-rag-canonical
```

기존 프로젝트에 추가하려면 다음을 실행하세요:

```shell
langchain app add nvidia-rag-canonical
```

그리고 `server.py` 파일에 다음 코드를 추가하세요:

```python
from nvidia_rag_canonical import chain as nvidia_rag_canonical_chain

add_routes(app, nvidia_rag_canonical_chain, path="/nvidia-rag-canonical")
```

ingestion 파이프라인을 설정하려면 `server.py` 파일에 다음 코드를 추가하세요:

```python
from nvidia_rag_canonical import ingest as nvidia_rag_ingest

add_routes(app, nvidia_rag_ingest, path="/nvidia-rag-ingest")
```

참고: ingestion API로 수집된 파일의 경우 새로 수집된 파일을 검색기가 사용할 수 있도록 서버를 다시 시작해야 합니다.

(선택 사항) LangSmith를 구성해 보겠습니다.
LangSmith는 LangChain 애플리케이션을 추적, 모니터링 및 디버깅하는 데 도움이 됩니다.
[여기](https://smith.langchain.com/)에서 LangSmith에 가입할 수 있습니다.
액세스 권한이 없는 경우 이 섹션을 건너뛸 수 있습니다.

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

Milvus 벡터 스토어가 없는 경우 아래 `Milvus 설정` 섹션을 참조하세요.

Milvus 벡터 스토어가 있는 경우 `nvidia_rag_canonical/chain.py`에서 연결 세부 정보를 편집하세요.

이 디렉토리 내에 있다면 다음과 같이 LangServe 인스턴스를 직접 시작할 수 있습니다:

```shell
langchain serve
```

이렇게 하면 FastAPI 앱이 시작되며 로컬에서 서버가 실행됩니다.
[http://localhost:8000](http://localhost:8000)

모든 템플릿은 [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)에서 볼 수 있습니다.
[http://127.0.0.1:8000/nvidia-rag-canonical/playground](http://127.0.0.1:8000/nvidia-rag-canonical/playground)에서 playground에 액세스할 수 있습니다.

코드에서 템플릿에 액세스할 수 있습니다:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/nvidia-rag-canonical")
```

## Milvus 설정

Milvus 벡터 스토어를 생성하고 데이터를 수집해야 하는 경우 이 단계를 사용하세요.
먼저 [여기](https://milvus.io/docs/install_standalone-docker.md)의 표준 Milvus 설정 지침을 따르겠습니다.

1. Docker Compose YAML 파일을 다운로드합니다.
    ```shell
    wget https://github.com/milvus-io/milvus/releases/download/v2.3.3/milvus-standalone-docker-compose.yml -O docker-compose.yml
    ```
2. Milvus 벡터 스토어 컨테이너를 시작합니다.
    ```shell
    sudo docker compose up -d
    ```
3. Milvus 컨테이너와 상호 작용하기 위해 PyMilvus 패키지를 설치합니다.
    ```shell
    pip install pymilvus
    ```
4. 이제 데이터를 수집해 보겠습니다! 이 디렉토리로 이동하고 `ingest.py`의 코드를 실행하면 됩니다:

    ```shell
    python ingest.py
    ```

    이 코드를 원하는 데이터로 변경할 수 있습니다.
