---
translated: true
---

# neo4j-cypher-ft

이 템플릿을 사용하면 OpenAI의 LLM을 활용하여 자연어로 Neo4j 그래프 데이터베이스와 상호 작용할 수 있습니다.

주요 기능은 자연어 질문을 Cypher 쿼리(Neo4j 데이터베이스를 쿼리하는 데 사용되는 언어)로 변환하고, 이 쿼리를 실행하며, 쿼리 결과를 기반으로 자연어 응답을 제공하는 것입니다.

이 패키지는 효율적인 텍스트 값과 데이터베이스 항목 매핑을 위해 전체 텍스트 인덱스를 활용합니다. 이를 통해 정확한 Cypher 문 생성이 가능합니다.

제공된 예에서는 전체 텍스트 인덱스를 사용하여 사용자 쿼리의 사람 및 영화 이름을 해당 데이터베이스 항목에 매핑합니다.

## 환경 설정

다음과 같은 환경 변수를 설정해야 합니다:

```shell
OPENAI_API_KEY=<YOUR_OPENAI_API_KEY>
NEO4J_URI=<YOUR_NEO4J_URI>
NEO4J_USERNAME=<YOUR_NEO4J_USERNAME>
NEO4J_PASSWORD=<YOUR_NEO4J_PASSWORD>
```

또한 예제 데이터를 데이터베이스에 채우고 싶다면 `python ingest.py`를 실행할 수 있습니다.
이 스크립트는 샘플 영화 데이터를 데이터베이스에 채우고 정확한 Cypher 문 생성을 위해 사용되는 `entity`라는 전체 텍스트 인덱스를 생성합니다.

## 사용법

이 패키지를 사용하려면 먼저 LangChain CLI를 설치해야 합니다:

```shell
pip install -U langchain-cli
```

새 LangChain 프로젝트를 만들고 이 패키지만 설치하려면 다음과 같이 할 수 있습니다:

```shell
langchain app new my-app --package neo4j-cypher-ft
```

기존 프로젝트에 추가하려면 다음과 같이 실행하면 됩니다:

```shell
langchain app add neo4j-cypher-ft
```

그리고 `server.py` 파일에 다음 코드를 추가하세요:

```python
from neo4j_cypher_ft import chain as neo4j_cypher_ft_chain

add_routes(app, neo4j_cypher_ft_chain, path="/neo4j-cypher-ft")
```

(선택 사항) 이제 LangSmith를 구성해 보겠습니다.
LangSmith는 LangChain 애플리케이션의 추적, 모니터링 및 디버깅을 도와줍니다.
[여기](https://smith.langchain.com/)에서 LangSmith에 가입할 수 있습니다.
액세스 권한이 없는 경우 이 섹션을 건너뛸 수 있습니다.

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

이 디렉토리 내에 있다면 다음과 같이 직접 LangServe 인스턴스를 시작할 수 있습니다:

```shell
langchain serve
```

이렇게 하면 [http://localhost:8000](http://localhost:8000)에서 로컬로 실행되는 FastAPI 앱이 시작됩니다.

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)에서 모든 템플릿을 볼 수 있습니다.
[http://127.0.0.1:8000/neo4j-cypher-ft/playground](http://127.0.0.1:8000/neo4j-cypher-ft/playground)에서 playground에 액세스할 수 있습니다.

코드에서 템플릿에 액세스할 수 있습니다:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/neo4j-cypher-ft")
```
