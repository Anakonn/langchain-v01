---
translated: true
---

# rag-google-cloud-vertexai-search

이 템플릿은 Google Vertex AI Search, 기계 학습 기반 검색 서비스, 및 PaLM 2 for Chat(chat-bison)을 활용하는 애플리케이션입니다. 이 애플리케이션은 Retrieval chain을 사용하여 문서를 기반으로 질문에 답변합니다.

Vertex AI Search를 사용하여 RAG 애플리케이션을 구축하는 데 대한 자세한 내용은
[여기](https://cloud.google.com/generative-ai-app-builder/docs/enterprise-search-introduction)를 참조하세요.

## 환경 설정

이 템플릿을 사용하기 전에 Vertex AI Search에 인증되어 있는지 확인하세요. 인증 가이드는
[여기](https://cloud.google.com/generative-ai-app-builder/docs/authentication)를 참조하세요.

또한 다음을 생성해야 합니다:

- 검색 애플리케이션 [여기](https://cloud.google.com/generative-ai-app-builder/docs/create-engine-es)
- 데이터 저장소 [여기](https://cloud.google.com/generative-ai-app-builder/docs/create-data-store-es)

이 템플릿을 테스트하기 위한 적절한 데이터 세트는 Alphabet Earnings Reports이며, [여기](https://abc.xyz/investor/)에서 찾을 수 있습니다. 데이터는 `gs://cloud-samples-data/gen-app-builder/search/alphabet-investor-pdfs`에서도 사용할 수 있습니다.

다음 환경 변수를 설정하세요:

* `GOOGLE_CLOUD_PROJECT_ID` - 귀하의 Google Cloud 프로젝트 ID.
* `DATA_STORE_ID` - Vertex AI Search의 데이터 저장소 ID, 데이터 저장소 세부 정보 페이지에서 찾을 수 있는 36자 영숫자 값입니다.
* `MODEL_TYPE` - Vertex AI Search의 모델 유형.

## 사용법

이 패키지를 사용하려면 LangChain CLI가 설치되어 있어야 합니다:

```shell
pip install -U langchain-cli
```

새 LangChain 프로젝트를 만들고 이것을 유일한 패키지로 설치하려면 다음을 수행할 수 있습니다:

```shell
langchain app new my-app --package rag-google-cloud-vertexai-search
```

기존 프로젝트에 추가하려면 다음을 실행하면 됩니다:

```shell
langchain app add rag-google-cloud-vertexai-search
```

그리고 `server.py` 파일에 다음 코드를 추가하세요:

```python
from rag_google_cloud_vertexai_search.chain import chain as rag_google_cloud_vertexai_search_chain

add_routes(app, rag_google_cloud_vertexai_search_chain, path="/rag-google-cloud-vertexai-search")
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

이렇게 하면 [http://localhost:8000](http://localhost:8000)에서 로컬로 실행되는 FastAPI 앱이 시작됩니다.

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)에서 모든 템플릿을 볼 수 있습니다.
[http://127.0.0.1:8000/rag-google-cloud-vertexai-search/playground](http://127.0.0.1:8000/rag-google-cloud-vertexai-search/playground)에서 playground에 액세스할 수 있습니다.

코드에서 템플릿에 액세스할 수 있습니다:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-google-cloud-vertexai-search")
```
