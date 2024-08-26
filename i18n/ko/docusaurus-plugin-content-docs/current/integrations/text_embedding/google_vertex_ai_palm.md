---
translated: true
---

# Google Vertex AI PaLM

>[Vertex AI PaLM API](https://cloud.google.com/vertex-ai/docs/generative-ai/learn/overview)는 Google Cloud에서 제공하는 임베딩 모델 서비스입니다.

참고: 이 통합은 Google PaLM 통합과 별도입니다.

기본적으로 Google Cloud는 [고객 데이터를 사용하지 않습니다](https://cloud.google.com/vertex-ai/docs/generative-ai/data-governance#foundation_model_development)Google Cloud의 AI/ML 개인정보 보호 약속의 일환으로 기반 모델을 학습하는 데 사용합니다. Google이 데이터를 처리하는 방식에 대한 자세한 내용은 [Google의 고객 데이터 처리 부록(CDPA)](https://cloud.google.com/terms/data-processing-addendum)에서 확인할 수 있습니다.

Vertex AI PaLM을 사용하려면 `langchain-google-vertexai` Python 패키지를 설치하고 다음 중 하나를 수행해야 합니다.
- 환경에 대한 자격 증명을 구성합니다(gcloud, workload identity 등).
- GOOGLE_APPLICATION_CREDENTIALS 환경 변수에 서비스 계정 JSON 파일의 경로를 저장합니다.

이 코드베이스는 `google.auth` 라이브러리를 사용하며, 먼저 위에 언급된 애플리케이션 자격 증명 변수를 찾고 그 다음 시스템 수준 인증을 찾습니다.

자세한 내용은 다음을 참조하세요.
- https://cloud.google.com/docs/authentication/application-default-credentials#GAC
- https://googleapis.dev/python/google-auth/latest/reference/google.auth.html#module-google.auth

```python
%pip install --upgrade --quiet langchain langchain-google-vertexai
```

```python
from langchain_google_vertexai import VertexAIEmbeddings
```

```python
embeddings = VertexAIEmbeddings()
```

```python
text = "This is a test document."
```

```python
query_result = embeddings.embed_query(text)
```

```python
doc_result = embeddings.embed_documents([text])
```
