---
translated: true
---

# neo4j-semantic-ollama

이 템플릿은 Mixtral을 사용하는 JSON 기반 에이전트를 통해 Neo4j와 같은 그래프 데이터베이스와 상호 작용할 수 있는 에이전트를 구현하도록 설계되었습니다.
시맨틱 레이어는 에이전트에게 강력한 도구 세트를 제공하여 사용자의 의도에 따라 그래프 데이터베이스와 상호 작용할 수 있습니다.
시맨틱 레이어 템플릿에 대해 자세히 알아보려면 [해당 블로그 게시물](https://medium.com/towards-data-science/enhancing-interaction-between-language-models-and-graph-databases-via-a-semantic-layer-0a78ad3eba49)을 참조하고, [Ollama를 사용한 Mixtral 에이전트](https://blog.langchain.dev/json-based-agents-with-ollama-and-langchain/)에 대해 자세히 알아보세요.

## 도구

에이전트는 Neo4j 그래프 데이터베이스와 효과적으로 상호 작용하기 위해 여러 가지 도구를 사용합니다:

1. **정보 도구**:
   - 영화 또는 개인에 대한 데이터를 검색하여 에이전트가 최신 및 가장 관련성 있는 정보에 액세스할 수 있도록 합니다.
2. **추천 도구**:
   - 사용자 선호도와 입력을 기반으로 영화 추천을 제공합니다.
3. **메모리 도구**:
   - 사용자 선호도에 대한 정보를 지식 그래프에 저장하여 여러 상호 작용에 걸쳐 개인화된 경험을 제공합니다.
4. **소소한 대화 도구**:
   - 에이전트가 소소한 대화를 처리할 수 있도록 합니다.

## 환경 설정

이 템플릿을 사용하려면 Ollama와 Neo4j 데이터베이스를 설정해야 합니다.

1. [여기](https://python.langchain.com/docs/integrations/chat/ollama)의 지침을 따라 Ollama를 다운로드하세요.

2. 관심 있는 LLM을 다운로드하세요:

    * 이 패키지는 `mixtral`을 사용합니다: `ollama pull mixtral`
    * [여기](https://ollama.ai/library)에서 많은 LLM을 선택할 수 있습니다.

다음과 같은 환경 변수를 정의해야 합니다.

```shell
OLLAMA_BASE_URL=<YOUR_OLLAMA_URL>
NEO4J_URI=<YOUR_NEO4J_URI>
NEO4J_USERNAME=<YOUR_NEO4J_USERNAME>
NEO4J_PASSWORD=<YOUR_NEO4J_PASSWORD>
```

## 데이터 채우기

예제 영화 데이터세트로 DB를 채우려면 `python ingest.py`를 실행할 수 있습니다.
이 스크립트는 영화 정보와 사용자에 의한 평점을 가져옵니다.
또한 이 스크립트는 사용자 입력을 데이터베이스에 매핑하는 데 사용되는 두 개의 [전체 텍스트 인덱스](https://neo4j.com/docs/cypher-manual/current/indexes-for-full-text-search/)를 만듭니다.

## 사용법

이 패키지를 사용하려면 먼저 LangChain CLI가 설치되어 있어야 합니다:

```shell
pip install -U "langchain-cli[serve]"
```

새 LangChain 프로젝트를 만들고 이것을 유일한 패키지로 설치하려면 다음을 수행할 수 있습니다:

```shell
langchain app new my-app --package neo4j-semantic-ollama
```

기존 프로젝트에 추가하려면 다음을 실행하면 됩니다:

```shell
langchain app add neo4j-semantic-ollama
```

그리고 `server.py` 파일에 다음 코드를 추가하세요:

```python
from neo4j_semantic_layer import agent_executor as neo4j_semantic_agent

add_routes(app, neo4j_semantic_agent, path="/neo4j-semantic-ollama")
```

(선택 사항) 이제 LangSmith를 구성해 보겠습니다.
LangSmith는 LangChain 애플리케이션을 추적, 모니터링 및 디버깅하는 데 도움이 될 것입니다.
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
[http://127.0.0.1:8000/neo4j-semantic-ollama/playground](http://127.0.0.1:8000/neo4j-semantic-ollama/playground)에서 playground에 액세스할 수 있습니다.

코드에서 템플릿에 액세스할 수 있습니다:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/neo4j-semantic-ollama")
```
