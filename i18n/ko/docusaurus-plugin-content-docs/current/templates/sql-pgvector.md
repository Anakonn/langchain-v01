---
translated: true
---

# sql-pgvector

이 템플릿을 사용하면 사용자가 `pgvector`를 사용하여 PostgreSQL과 의미 검색 / RAG를 결합할 수 있습니다.

[RAG 강화 SQL 요리책](https://github.com/langchain-ai/langchain/blob/master/cookbook/retrieval_in_sql.ipynb)에 나와 있는 것처럼 [PGVector](https://github.com/pgvector/pgvector) 확장을 사용합니다.

## 환경 설정

`ChatOpenAI`를 LLM으로 사용하는 경우 환경에 `OPENAI_API_KEY`가 설정되어 있는지 확인하십시오. `chain.py` 내부에서 LLM과 임베딩 모델을 변경할 수 있습니다.

그리고 템플릿에서 사용할 다음과 같은 환경 변수를 구성할 수 있습니다(기본값은 괄호 안에 있음).

- `POSTGRES_USER` (postgres)
- `POSTGRES_PASSWORD` (test)
- `POSTGRES_DB` (vectordb)
- `POSTGRES_HOST` (localhost)
- `POSTGRES_PORT` (5432)

PostgreSQL 인스턴스가 없는 경우 로컬에서 Docker로 실행할 수 있습니다:

```bash
docker run \
  --name some-postgres \
  -e POSTGRES_PASSWORD=test \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=vectordb \
  -p 5432:5432 \
  postgres:16
```

나중에 다시 시작하려면 위에서 정의한 `--name`을 사용하십시오:

```bash
docker start some-postgres
```

### PostgreSQL 데이터베이스 설정

`pgvector` 확장을 사용할 수 있게 하는 것 외에도 SQL 쿼리 내에서 의미 검색을 실행할 수 있도록 추가 설정이 필요합니다.

PostgreSQL 데이터베이스에서 RAG를 실행하려면 검색하려는 특정 열에 대한 임베딩을 생성해야 합니다.

이 프로세스는 [RAG 강화 SQL 요리책](https://github.com/langchain-ai/langchain/blob/master/cookbook/retrieval_in_sql.ipynb)에 설명되어 있으며, 전체적인 접근 방식은 다음과 같습니다:
1. 열의 고유한 값 쿼리
2. 해당 값에 대한 임베딩 생성
3. 별도의 열이나 보조 테이블에 임베딩 저장

## 사용법

이 패키지를 사용하려면 먼저 LangChain CLI가 설치되어 있어야 합니다:

```shell
pip install -U langchain-cli
```

새 LangChain 프로젝트를 만들고 이 패키지만 설치하려면 다음과 같이 할 수 있습니다:

```shell
langchain app new my-app --package sql-pgvector
```

기존 프로젝트에 추가하려면 다음을 실행하면 됩니다:

```shell
langchain app add sql-pgvector
```

그리고 `server.py` 파일에 다음 코드를 추가하십시오:

```python
from sql_pgvector import chain as sql_pgvector_chain

add_routes(app, sql_pgvector_chain, path="/sql-pgvector")
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

이렇게 하면 FastAPI 앱이 시작되며 로컬에서 [http://localhost:8000](http://localhost:8000)에서 서버가 실행됩니다.

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)에서 모든 템플릿을 볼 수 있습니다.
[http://127.0.0.1:8000/sql-pgvector/playground](http://127.0.0.1:8000/sql-pgvector/playground)에서 playground에 액세스할 수 있습니다.

코드에서 템플릿에 액세스할 수 있습니다:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/sql-pgvector")
```
