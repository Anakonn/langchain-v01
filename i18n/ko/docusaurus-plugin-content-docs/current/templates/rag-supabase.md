---
translated: true
---

# rag_supabase

이 템플릿은 Supabase를 사용하여 RAG를 수행합니다.

[Supabase](https://supabase.com/docs)는 오픈 소스 Firebase 대안입니다. [PostgreSQL](https://en.wikipedia.org/wiki/PostgreSQL)이라는 무료 오픈 소스 관계형 데이터베이스 관리 시스템(RDBMS) 위에 구축되어 있으며 [pgvector](https://github.com/pgvector/pgvector)를 사용하여 테이블 내에 임베딩을 저장합니다.

## 환경 설정

OpenAI 모델에 액세스하려면 `OPENAI_API_KEY` 환경 변수를 설정하세요.

`OPENAI_API_KEY`를 얻으려면 OpenAI 계정의 [API keys](https://platform.openai.com/account/api-keys)로 이동하여 새 비밀 키를 만드세요.

`SUPABASE_URL`과 `SUPABASE_SERVICE_KEY`를 찾으려면 Supabase 프로젝트의 [API settings](https://supabase.com/dashboard/project/_/settings/api)로 이동하세요.

- `SUPABASE_URL`은 프로젝트 URL에 해당합니다.
- `SUPABASE_SERVICE_KEY`는 `service_role` API 키에 해당합니다.

```shell
export SUPABASE_URL=
export SUPABASE_SERVICE_KEY=
export OPENAI_API_KEY=
```

## Supabase 데이터베이스 설정

아직 Supabase 데이터베이스를 설정하지 않았다면 다음 단계를 따르세요.

1. https://database.new로 이동하여 Supabase 데이터베이스를 프로비저닝하세요.
2. 스튜디오에서 [SQL editor](https://supabase.com/dashboard/project/_/sql/new)로 이동하고 다음 스크립트를 실행하여 `pgvector`를 활성화하고 데이터베이스를 벡터 저장소로 설정하세요:

   ```sql
   -- pgvector 확장을 활성화하여 임베딩 벡터로 작업
   create extension if not exists vector;

   -- 문서를 저장할 테이블 생성
   create table
     documents (
       id uuid primary key,
       content text, -- Document.pageContent에 해당
       metadata jsonb, -- Document.metadata에 해당
       embedding vector (1536) -- OpenAI 임베딩의 경우 1536, 필요에 따라 변경
     );

   -- 문서 검색 함수 생성
   create function match_documents (
     query_embedding vector (1536),
     filter jsonb default '{}'
   ) returns table (
     id uuid,
     content text,
     metadata jsonb,
     similarity float
   ) language plpgsql as $$
   #variable_conflict use_column
   begin
     return query
     select
       id,
       content,
       metadata,
       1 - (documents.embedding <=> query_embedding) as similarity
     from documents
     where metadata @> filter
     order by documents.embedding <=> query_embedding;
   end;
   $$;
   ```

## 환경 변수 설정

우리는 [`SupabaseVectorStore`](https://python.langchain.com/docs/integrations/vectorstores/supabase)와 [`OpenAIEmbeddings`](https://python.langchain.com/docs/integrations/text_embedding/openai)를 사용하므로 해당 API 키를 로드해야 합니다.

## 사용법

먼저 LangChain CLI를 설치하세요:

```shell
pip install -U langchain-cli
```

새 LangChain 프로젝트를 만들고 이 패키지만 설치하려면 다음을 실행할 수 있습니다:

```shell
langchain app new my-app --package rag-supabase
```

기존 프로젝트에 추가하려면 다음을 실행하세요:

```shell
langchain app add rag-supabase
```

그리고 `server.py` 파일에 다음 코드를 추가하세요:

```python
from rag_supabase.chain import chain as rag_supabase_chain

add_routes(app, rag_supabase_chain, path="/rag-supabase")
```

(선택 사항) LangSmith를 구성해 보겠습니다.
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

이렇게 하면 FastAPI 앱이 시작되며 로컬에서 서버가 실행됩니다.
[http://localhost:8000](http://localhost:8000)

모든 템플릿은 [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)에서 볼 수 있습니다.
[http://127.0.0.1:8000/rag-supabase/playground](http://127.0.0.1:8000/rag-supabase/playground)에서 playground에 액세스할 수 있습니다.

코드에서 템플릿에 액세스할 수 있습니다:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-supabase")
```

TODO: Supabase 데이터베이스 설정에 대한 자세한 내용 추가
