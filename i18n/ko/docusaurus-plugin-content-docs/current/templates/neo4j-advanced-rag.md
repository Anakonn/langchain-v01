---
translated: true
---

# neo4j-advanced-rag

이 템플릿을 사용하면 고급 검색 전략을 구현하여 정확한 임베딩과 문맥 유지 사이의 균형을 맞출 수 있습니다.

## 전략

1. **일반적인 RAG**:
   - 실제 색인된 데이터가 검색되는 전통적인 방법입니다.
2. **부모 검색기**:
   - 전체 문서를 색인하는 대신, 데이터를 더 작은 청크로 나누어 부모 및 자식 문서로 참조합니다.
   - 특정 개념의 표현을 개선하기 위해 자식 문서가 색인되며, 부모 문서는 문맥 유지를 위해 검색됩니다.
3. **가설적 질문**:
     - 문서가 잠재적으로 답변할 수 있는 질문을 결정하기 위해 처리됩니다.
     - 이러한 질문은 특정 개념의 표현을 개선하기 위해 색인되며, 부모 문서는 문맥 유지를 위해 검색됩니다.
4. **요약**:
     - 전체 문서를 색인하는 대신, 문서의 요약이 생성되어 색인됩니다.
     - 마찬가지로 RAG 애플리케이션에서 부모 문서가 검색됩니다.

## 환경 설정

다음과 같은 환경 변수를 정의해야 합니다.

```shell
OPENAI_API_KEY=<YOUR_OPENAI_API_KEY>
NEO4J_URI=<YOUR_NEO4J_URI>
NEO4J_USERNAME=<YOUR_NEO4J_USERNAME>
NEO4J_PASSWORD=<YOUR_NEO4J_PASSWORD>
```

## 데이터 채우기

`dune.txt` 파일에서 텍스트 섹션을 처리하고 Neo4j 그래프 데이터베이스에 저장하려면 `python ingest.py`를 실행할 수 있습니다.
먼저 텍스트를 더 큰 청크("부모")로 나누고 이를 다시 더 작은 청크("자식")로 세분화합니다. 부모와 자식 청크는 문맥을 유지하기 위해 약간 겹칩니다.
이러한 청크를 데이터베이스에 저장한 후 OpenAI의 임베딩을 사용하여 자식 노드의 임베딩을 계산하고 향후 검색 또는 분석을 위해 그래프에 다시 저장합니다.
각 부모 노드에 대해 가설적 질문과 요약이 생성, 임베딩되어 데이터베이스에 추가됩니다.
또한 이러한 임베딩을 효율적으로 쿼리할 수 있는 각 검색 전략에 대한 벡터 인덱스가 생성됩니다.

*LLM의 가설적 질문 및 요약 생성 속도로 인해 수집에 1-2분 정도 소요될 수 있습니다.*

## 사용법

이 패키지를 사용하려면 먼저 LangChain CLI가 설치되어 있어야 합니다:

```shell
pip install -U "langchain-cli[serve]"
```

새 LangChain 프로젝트를 만들고 이 패키지만 설치하려면 다음을 수행할 수 있습니다:

```shell
langchain app new my-app --package neo4j-advanced-rag
```

기존 프로젝트에 추가하려면 다음을 실행하면 됩니다:

```shell
langchain app add neo4j-advanced-rag
```

그리고 `server.py` 파일에 다음 코드를 추가하세요:

```python
from neo4j_advanced_rag import chain as neo4j_advanced_chain

add_routes(app, neo4j_advanced_chain, path="/neo4j-advanced-rag")
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

이렇게 하면 FastAPI 앱이 시작되며 로컬에서 서버가 실행됩니다.
[http://localhost:8000](http://localhost:8000)

모든 템플릿은 [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)에서 확인할 수 있습니다.
[http://127.0.0.1:8000/neo4j-advanced-rag/playground](http://127.0.0.1:8000/neo4j-advanced-rag/playground)에서 playground에 액세스할 수 있습니다.

코드에서 템플릿에 액세스할 수 있습니다:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/neo4j-advanced-rag")
```
