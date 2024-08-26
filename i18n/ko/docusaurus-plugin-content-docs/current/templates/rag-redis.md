---
translated: true
---

# rag-redis

이 템플릿은 Redis(벡터 데이터베이스)와 OpenAI(LLM)를 사용하여 Nike의 재무 10k 제출 문서에 대한 RAG(Retrieval Augmented Generation)를 수행합니다.

문서 청크와 사용자 질문에 대한 임베딩에는 문장 변환기 `all-MiniLM-L6-v2`를 사용합니다.

## 환경 설정

[OpenAI](https://platform.openai.com) 모델에 액세스하려면 `OPENAI_API_KEY` 환경 변수를 설정하세요:

```bash
export OPENAI_API_KEY= <YOUR OPENAI API KEY>
```

다음 [Redis](https://redis.com/try-free) 환경 변수를 설정하세요:

```bash
export REDIS_HOST = <YOUR REDIS HOST>
export REDIS_PORT = <YOUR REDIS PORT>
export REDIS_USER = <YOUR REDIS USER NAME>
export REDIS_PASSWORD = <YOUR REDIS PASSWORD>
```

## 지원되는 설정

이 애플리케이션을 구성하기 위해 다양한 환경 변수를 사용합니다.

| 환경 변수 | 설명 | 기본값 |
|----------------------|-----------------------------------|---------------|
| `DEBUG`            | Langchain 디버깅 로그 활성화 또는 비활성화       | True         |
| `REDIS_HOST`           | Redis 서버의 호스트 이름     | "localhost"   |
| `REDIS_PORT`           | Redis 서버의 포트         | 6379          |
| `REDIS_USER`           | Redis 서버의 사용자         | "" |
| `REDIS_PASSWORD`       | Redis 서버의 비밀번호     | "" |
| `REDIS_URL`            | Redis에 연결하기 위한 전체 URL  | `None`, 제공되지 않은 경우 사용자, 비밀번호, 호스트 및 포트에서 구성됨 |
| `INDEX_NAME`           | 벡터 인덱스의 이름          | "rag-redis"   |

## 사용법

이 패키지를 사용하려면 먼저 Python 가상 환경에 LangChain CLI와 Pydantic을 설치해야 합니다:

```shell
pip install -U langchain-cli pydantic==1.10.13
```

새 LangChain 프로젝트를 만들고 이것을 유일한 패키지로 설치하려면 다음을 수행할 수 있습니다:

```shell
langchain app new my-app --package rag-redis
```

기존 프로젝트에 추가하려면 다음을 실행하면 됩니다:

```shell
langchain app add rag-redis
```

그리고 다음 코드 조각을 `app/server.py` 파일에 추가하세요:

```python
from rag_redis.chain import chain as rag_redis_chain

add_routes(app, rag_redis_chain, path="/rag-redis")
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
[http://127.0.0.1:8000/rag-redis/playground](http://127.0.0.1:8000/rag-redis/playground)에서 playground에 액세스할 수 있습니다.

코드에서 템플릿에 액세스할 수 있습니다:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-redis")
```
