---
translated: true
---

# rag-google-cloud-sensitive-data-protection

이 템플릿은 Google Vertex AI Search, 기계 학습 기반 검색 서비스, 및 PaLM 2 for Chat (chat-bison)을 활용하는 애플리케이션입니다. 이 애플리케이션은 Retrieval chain을 사용하여 문서를 기반으로 질문에 답변합니다.

이 템플릿은 Google Sensitive Data Protection, 텍스트에서 민감한 데이터를 감지하고 편집하는 서비스, 및 PaLM 2 for Chat (chat-bison)을 활용하는 애플리케이션이지만, 다른 모델도 사용할 수 있습니다.

Sensitive Data Protection 사용에 대한 자세한 내용은 [여기](https://cloud.google.com/dlp/docs/sensitive-data-protection-overview)를 참조하세요.

## 환경 설정

이 템플릿을 사용하기 전에 [DLP API](https://console.cloud.google.com/marketplace/product/google/dlp.googleapis.com)와 [Vertex AI API](https://console.cloud.google.com/marketplace/product/google/aiplatform.googleapis.com)를 Google Cloud 프로젝트에서 활성화해야 합니다.

Google Cloud와 관련된 일반적인 문제 해결 단계는 이 readme 파일의 하단을 참조하세요.

다음과 같은 환경 변수를 설정하세요:

* `GOOGLE_CLOUD_PROJECT_ID` - Google Cloud 프로젝트 ID
* `MODEL_TYPE` - Vertex AI Search의 모델 유형 (예: `chat-bison`)

## 사용법

이 패키지를 사용하려면 LangChain CLI가 설치되어 있어야 합니다:

```shell
pip install -U langchain-cli
```

새 LangChain 프로젝트를 만들고 이 패키지만 설치하려면 다음과 같이 할 수 있습니다:

```shell
langchain app new my-app --package rag-google-cloud-sensitive-data-protection
```

기존 프로젝트에 추가하려면 다음과 같이 실행하세요:

```shell
langchain app add rag-google-cloud-sensitive-data-protection
```

그리고 `server.py` 파일에 다음 코드를 추가하세요:

```python
from rag_google_cloud_sensitive_data_protection.chain import chain as rag_google_cloud_sensitive_data_protection_chain

add_routes(app, rag_google_cloud_sensitive_data_protection_chain, path="/rag-google-cloud-sensitive-data-protection")
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

이 디렉토리 내에 있다면 다음과 같이 LangServe 인스턴스를 직접 실행할 수 있습니다:

```shell
langchain serve
```

이렇게 하면 [http://localhost:8000](http://localhost:8000)에서 로컬로 실행되는 FastAPI 앱이 시작됩니다.

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)에서 모든 템플릿을 볼 수 있습니다.
[http://127.0.0.1:8000/rag-google-cloud-vertexai-search/playground](http://127.0.0.1:8000/rag-google-cloud-vertexai-search/playground)에서 playground에 액세스할 수 있습니다.

코드에서 다음과 같이 템플릿에 액세스할 수 있습니다:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-google-cloud-sensitive-data-protection")
```

# Google Cloud 문제 해결

`gcloud auth application-default login`을 사용하여 `gcloud` 자격 증명을 설정할 수 있습니다.

다음 명령을 사용하여 `gcloud` 프로젝트를 설정할 수 있습니다:

```bash
gcloud config set project <your project>
gcloud auth application-default set-quota-project <your project>
export GOOGLE_CLOUD_PROJECT_ID=<your project>
```
