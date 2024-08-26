---
translated: true
---

# Weaviate의 하이브리드 검색

이 템플릿은 Weaviate의 하이브리드 검색 기능을 사용하는 방법을 보여줍니다. 하이브리드 검색은 여러 검색 알고리즘을 결합하여 검색 결과의 정확성과 관련성을 높입니다.

Weaviate는 검색 쿼리와 문서의 의미와 맥락을 나타내기 위해 sparse 및 dense 벡터를 모두 사용합니다. 결과는 `bm25` 및 벡터 검색 순위 지정의 조합을 사용하여 상위 결과를 반환합니다.

##  구성

`chain.py`에서 몇 가지 환경 변수를 설정하여 호스팅된 Weaviate Vectorstore에 연결합니다:

* `WEAVIATE_ENVIRONMENT`
* `WEAVIATE_API_KEY`

또한 OpenAI 모델을 사용하려면 `OPENAI_API_KEY`를 설정해야 합니다.

## 시작하기

이 패키지를 사용하려면 먼저 LangChain CLI가 설치되어 있어야 합니다:

```shell
pip install -U langchain-cli
```

새 LangChain 프로젝트를 만들고 이것을 유일한 패키지로 설치하려면 다음을 수행할 수 있습니다:

```shell
langchain app new my-app --package hybrid-search-weaviate
```

기존 프로젝트에 추가하려면 다음을 실행하면 됩니다:

```shell
langchain app add hybrid-search-weaviate
```

그리고 다음 코드를 `server.py` 파일에 추가하세요:

```python
from hybrid_search_weaviate import chain as hybrid_search_weaviate_chain

add_routes(app, hybrid_search_weaviate_chain, path="/hybrid-search-weaviate")
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

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)에서 모든 템플릿을 볼 수 있습니다.
[http://127.0.0.1:8000/hybrid-search-weaviate/playground](http://127.0.0.1:8000/hybrid-search-weaviate/playground)에서 playground에 액세스할 수 있습니다.

코드에서 템플릿에 액세스할 수 있습니다:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/hybrid-search-weaviate")
```
