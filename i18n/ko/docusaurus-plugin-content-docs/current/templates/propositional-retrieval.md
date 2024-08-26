---
translated: true
---

# 명제 검색

이 템플릿은 Chen 등의 [Dense X Retrieval: What Retrieval Granularity Should We Use?](https://arxiv.org/abs/2312.06648)에서 제안한 다중 벡터 인덱싱 전략을 보여줍니다. 프롬프트는 [허브에서 시도해볼 수 있습니다](https://smith.langchain.com/hub/wfh/proposal-indexing). LLM에게 문맥에서 벗어난 "명제"를 생성하도록 지시하여 검색 정확도를 높입니다. 전체 정의는 `proposal_chain.py`에서 확인할 수 있습니다.

## 저장소

이 데모에서는 RecursiveUrlLoader를 사용하여 간단한 학술 논문을 인덱싱하고, 로컬 파일 시스템의 chroma와 bytestore를 사용하여 모든 검색기 정보를 로컬에 저장합니다. `storage.py`에서 저장소 계층을 수정할 수 있습니다.

## 환경 설정

`OPENAI_API_KEY` 환경 변수를 설정하여 `gpt-3.5`와 OpenAI Embeddings 클래스에 액세스할 수 있습니다.

## 인덱싱

다음을 실행하여 인덱스를 생성할 수 있습니다:

```python
poetry install
poetry run python propositional_retrieval/ingest.py
```

## 사용법

이 패키지를 사용하려면 먼저 LangChain CLI를 설치해야 합니다:

```shell
pip install -U langchain-cli
```

새 LangChain 프로젝트를 만들고 이 패키지만 설치하려면 다음을 수행할 수 있습니다:

```shell
langchain app new my-app --package propositional-retrieval
```

기존 프로젝트에 추가하려면 다음을 실행하면 됩니다:

```shell
langchain app add propositional-retrieval
```

그리고 `server.py` 파일에 다음 코드를 추가하세요:

```python
from propositional_retrieval import chain

add_routes(app, chain, path="/propositional-retrieval")
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
[http://127.0.0.1:8000/propositional-retrieval/playground](http://127.0.0.1:8000/propositional-retrieval/playground)에서 playground에 액세스할 수 있습니다.

코드에서 템플릿에 액세스할 수 있습니다:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/propositional-retrieval")
```
