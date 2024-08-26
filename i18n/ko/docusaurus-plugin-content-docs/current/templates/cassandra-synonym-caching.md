---
translated: true
---

# cassandra-synonym-caching

이 템플릿은 Apache Cassandra® 또는 Astra DB를 통한 CQL 백업 LLM 캐싱 사용을 보여주는 간단한 체인 템플릿을 제공합니다.

## 환경 설정

환경을 설정하려면 다음이 필요합니다:

- [Astra](https://astra.datastax.com) Vector Database (무료 티어 가능!). **[Database Administrator 토큰](https://awesome-astra.github.io/docs/pages/astra/create-token/#c-procedure)이 필요**, 특히 `AstraCS:...`로 시작하는 문자열;
- [Database ID](https://awesome-astra.github.io/docs/pages/astra/faq/#where-should-i-find-a-database-identifier)도 준비해야 합니다;
- **OpenAI API 키**. (자세한 내용은 [여기](https://cassio.org/start_here/#llm-access) 참조, 기본적으로 이 데모는 OpenAI를 지원합니다.)

_참고:_ 일반 Cassandra 클러스터를 사용할 수도 있습니다: `.env.template`에 표시된 대로 `USE_CASSANDRA_CLUSTER` 항목과 연결에 필요한 후속 환경 변수를 제공해야 합니다.

## 사용법

이 패키지를 사용하려면 먼저 LangChain CLI가 설치되어 있어야 합니다:

```shell
pip install -U langchain-cli
```

새 LangChain 프로젝트를 만들고 이 패키지만 설치하려면 다음을 수행할 수 있습니다:

```shell
langchain app new my-app --package cassandra-synonym-caching
```

기존 프로젝트에 추가하려면 다음을 실행하면 됩니다:

```shell
langchain app add cassandra-synonym-caching
```

그리고 `server.py` 파일에 다음 코드를 추가하세요:

```python
from cassandra_synonym_caching import chain as cassandra_synonym_caching_chain

add_routes(app, cassandra_synonym_caching_chain, path="/cassandra-synonym-caching")
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

이렇게 하면 FastAPI 앱이 시작되며 [http://localhost:8000](http://localhost:8000)에서 로컬 서버가 실행됩니다.

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)에서 모든 템플릿을 볼 수 있습니다.
[http://127.0.0.1:8000/cassandra-synonym-caching/playground](http://127.0.0.1:8000/cassandra-synonym-caching/playground)에서 playground에 액세스할 수 있습니다.

코드에서 템플릿에 액세스할 수 있습니다:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/cassandra-synonym-caching")
```

## 참고

독립형 LangServe 템플릿 리포지토리: [여기](https://github.com/hemidactylus/langserve_cassandra_synonym_caching).
