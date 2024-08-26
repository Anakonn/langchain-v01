---
translated: true
---

# rag-redis-multi-modal-multi-vector

다중 모달 LLM은 이미지에 대한 질문 답변을 수행할 수 있는 시각적 보조 기능을 제공합니다.

이 템플릿은 그래프 또는 그림과 같은 시각적 요소를 포함하는 슬라이드 데크에 대한 시각적 보조 기능을 생성합니다.

GPT-4V를 사용하여 각 슬라이드에 대한 이미지 요약을 생성하고, 요약을 임베딩하여 Redis에 저장합니다.

질문이 주어지면 관련 슬라이드를 검색하고 GPT-4V에 전달하여 답변을 합성합니다.

## 입력

PDF 형식의 슬라이드 데크를 `/docs` 디렉토리에 제공하세요.

기본적으로 이 템플릿에는 NVIDIA의 최근 수익에 대한 슬라이드 데크가 포함되어 있습니다.

질문의 예는 다음과 같습니다:

```text
1/ how much can H100 TensorRT improve LLama2 inference performance?
2/ what is the % change in GPU accelerated applications from 2020 to 2023?
```

슬라이드 데크의 인덱스를 생성하려면 다음을 실행하세요:

```shell
poetry install
poetry shell
python ingest.py
```

## 저장

템플릿은 다음과 같은 프로세스를 사용하여 슬라이드의 인덱스를 생성합니다(자세한 내용은 [블로그](https://blog.langchain.dev/multi-modal-rag-template/) 참조):

* 슬라이드를 이미지 컬렉션으로 추출
* GPT-4V를 사용하여 각 이미지 요약
* 원본 이미지에 대한 링크와 함께 텍스트 임베딩을 사용하여 이미지 요약 임베딩
* 사용자 입력 질문과 이미지 요약 간 유사성을 기반으로 관련 이미지 검색
* 해당 이미지를 GPT-4V에 전달하여 답변 합성

### Redis

이 템플릿은 [Redis](https://redis.com)를 사용하여 [MultiVectorRetriever](https://python.langchain.com/docs/modules/data_connection/retrievers/multi_vector)를 구동합니다. 여기에는 다음이 포함됩니다:
- 이미지 요약 임베딩을 저장하고 인덱싱하는 [VectorStore](https://python.langchain.com/docs/integrations/vectorstores/redis)로서의 Redis
- 이미지를 저장하는 [ByteStore](https://python.langchain.com/docs/integrations/stores/redis)로서의 Redis

[클라우드](https://redis.com/try-free)(무료) 또는 [Docker](https://redis.io/docs/install/install-stack/docker/)를 사용하여 로컬에서 Redis 인스턴스를 배포해야 합니다.

이를 통해 URL로 사용할 수 있는 액세스 가능한 Redis 엔드포인트를 얻을 수 있습니다. 로컬에 배포하는 경우 `redis://localhost:6379`를 사용하면 됩니다.

## LLM

이 애플리케이션은 텍스트 입력과 이미지 요약(텍스트) 간 유사성을 기반으로 이미지를 검색하고, 해당 이미지를 GPT-4V에 전달하여 답변을 합성합니다.

## 환경 설정

OpenAI GPT-4V에 액세스하려면 `OPENAI_API_KEY` 환경 변수를 설정해야 합니다.

Redis 데이터베이스에 액세스하려면 `REDIS_URL` 환경 변수를 설정해야 합니다.

## 사용법

이 패키지를 사용하려면 먼저 LangChain CLI를 설치해야 합니다:

```shell
pip install -U langchain-cli
```

새 LangChain 프로젝트를 생성하고 이 패키지만 설치하려면 다음을 실행하세요:

```shell
langchain app new my-app --package rag-redis-multi-modal-multi-vector
```

기존 프로젝트에 추가하려면 다음을 실행하세요:

```shell
langchain app add rag-redis-multi-modal-multi-vector
```

그리고 `server.py` 파일에 다음 코드를 추가하세요:

```python
from rag_redis_multi_modal_multi_vector import chain as rag_redis_multi_modal_chain_mv

add_routes(app, rag_redis_multi_modal_chain_mv, path="/rag-redis-multi-modal-multi-vector")
```

(선택 사항) 이제 LangSmith를 구성해 보겠습니다.
LangSmith는 LangChain 애플리케이션의 추적, 모니터링 및 디버깅을 지원합니다.
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
[http://127.0.0.1:8000/rag-redis-multi-modal-multi-vector/playground](http://127.0.0.1:8000/rag-redis-multi-modal-multi-vector/playground)에서 playground에 액세스할 수 있습니다.

코드에서 이 템플릿을 사용하려면 다음과 같이 하세요:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-redis-multi-modal-multi-vector")
```
