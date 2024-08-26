---
translated: true
---

# elastic-query-generator

이 템플릿을 사용하면 LLM을 사용하여 Elasticsearch 분석 데이터베이스와 자연어로 상호 작용할 수 있습니다.

Elasticsearch DSL API(필터 및 집계)를 통해 검색 쿼리를 작성합니다.

## 환경 설정

OpenAI 모델에 액세스하려면 `OPENAI_API_KEY` 환경 변수를 설정하세요.

### Elasticsearch 설치

Elasticsearch를 실행하는 방법은 여러 가지가 있습니다. 그러나 권장되는 방법 중 하나는 Elastic Cloud를 통하는 것입니다.

[Elastic Cloud](https://cloud.elastic.co/registration?utm_source=langchain&utm_content=langserve)에서 무료 평가판 계정을 만드세요.

배포 시 연결 문자열을 업데이트하세요.

비밀번호와 연결(elasticsearch url)은 배포 콘솔에서 찾을 수 있습니다.

Elasticsearch 클라이언트에는 인덱스 나열, 매핑 설명 및 검색 쿼리에 대한 권한이 있어야 합니다.

### 데이터 채우기

예제 정보로 DB를 채우려면 `python ingest.py`를 실행할 수 있습니다.

이렇게 하면 `customers` 인덱스가 생성됩니다. 이 패키지에서는 쿼리를 생성할 인덱스를 지정하며, `["customers"]`를 지정합니다. 이는 Elastic 인덱스를 설정하는 데 특정합니다.

## 사용법

이 패키지를 사용하려면 먼저 LangChain CLI가 설치되어 있어야 합니다:

```shell
pip install -U langchain-cli
```

새 LangChain 프로젝트를 만들고 이것만 설치하려면 다음을 수행할 수 있습니다:

```shell
langchain app new my-app --package elastic-query-generator
```

기존 프로젝트에 추가하려면 다음을 실행하면 됩니다:

```shell
langchain app add elastic-query-generator
```

그리고 `server.py` 파일에 다음 코드를 추가하세요:

```python
from elastic_query_generator.chain import chain as elastic_query_generator_chain

add_routes(app, elastic_query_generator_chain, path="/elastic-query-generator")
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
[http://127.0.0.1:8000/elastic-query-generator/playground](http://127.0.0.1:8000/elastic-query-generator/playground)에서 playground에 액세스할 수 있습니다.

코드에서 템플릿에 액세스할 수 있습니다:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/elastic-query-generator")
```
