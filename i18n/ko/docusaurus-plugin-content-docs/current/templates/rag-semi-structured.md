---
translated: true
---

# rag-semi-structured

이 템플릿은 PDF와 같은 반구조화된 데이터에서 RAG(Retrieval Augmented Generation)을 수행합니다.

[이 레시피](https://github.com/langchain-ai/langchain/blob/master/cookbook/Semi_Structured_RAG.ipynb)를 참조하세요.

## 환경 설정

OpenAI 모델에 액세스하려면 `OPENAI_API_KEY` 환경 변수를 설정하세요.

이 템플릿은 PDF 구문 분석을 위해 [Unstructured](https://unstructured-io.github.io/unstructured/)를 사용하며, 이를 위해 시스템 수준의 패키지 설치가 필요합니다.

Mac에서는 다음과 같이 필요한 패키지를 설치할 수 있습니다:

```shell
brew install tesseract poppler
```

## 사용법

이 패키지를 사용하려면 먼저 LangChain CLI를 설치해야 합니다:

```shell
pip install -U langchain-cli
```

새 LangChain 프로젝트를 만들고 이 패키지만 설치하려면 다음과 같이 할 수 있습니다:

```shell
langchain app new my-app --package rag-semi-structured
```

기존 프로젝트에 추가하려면 다음과 같이 실행하면 됩니다:

```shell
langchain app add rag-semi-structured
```

그리고 `server.py` 파일에 다음 코드를 추가하세요:

```python
from rag_semi_structured import chain as rag_semi_structured_chain

add_routes(app, rag_semi_structured_chain, path="/rag-semi-structured")
```

(선택 사항) LangSmith를 구성해 보겠습니다.
LangSmith는 LangChain 애플리케이션의 추적, 모니터링 및 디버깅을 지원합니다.
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
[http://127.0.0.1:8000/rag-semi-structured/playground](http://127.0.0.1:8000/rag-semi-structured/playground)에서 playground에 액세스할 수 있습니다.

코드에서 템플릿에 액세스하려면 다음과 같이 할 수 있습니다:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-semi-structured")
```

템플릿에 연결하는 방법에 대한 자세한 내용은 `rag_semi_structured` Jupyter 노트북을 참조하세요.
