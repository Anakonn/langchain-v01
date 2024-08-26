---
translated: true
---

# SambaNova

**[SambaNova](https://sambanova.ai/)**의 [Sambastudio](https://sambanova.ai/technology/full-stack-ai-platform)는 자신만의 오픈 소스 모델을 실행할 수 있는 플랫폼입니다.

이 예제에서는 LangChain을 사용하여 SambaNova 임베딩 모델과 상호 작용하는 방법을 살펴봅니다.

## SambaStudio

**SambaStudio**를 통해 사용자가 직접 미세 조정한 오픈 소스 모델을 학습, 일괄 추론 작업 실행, 온라인 추론 엔드포인트 배포할 수 있습니다.

모델을 배포하려면 SambaStudio 환경이 필요합니다. [sambanova.ai/products/enterprise-ai-platform-sambanova-suite](https://sambanova.ai/products/enterprise-ai-platform-sambanova-suite)에서 자세한 정보를 확인하세요.

환경 변수를 등록하세요:

```python
import os

sambastudio_base_url = "<Your SambaStudio environment URL>"
sambastudio_project_id = "<Your SambaStudio project id>"
sambastudio_endpoint_id = "<Your SambaStudio endpoint id>"
sambastudio_api_key = "<Your SambaStudio endpoint API key>"

# Set the environment variables
os.environ["SAMBASTUDIO_EMBEDDINGS_BASE_URL"] = sambastudio_base_url
os.environ["SAMBASTUDIO_EMBEDDINGS_PROJECT_ID"] = sambastudio_project_id
os.environ["SAMBASTUDIO_EMBEDDINGS_ENDPOINT_ID"] = sambastudio_endpoint_id
os.environ["SAMBASTUDIO_EMBEDDINGS_API_KEY"] = sambastudio_api_key
```

LangChain에서 SambaStudio 호스팅 임베딩을 직접 호출하세요!

```python
from langchain_community.embeddings.sambanova import SambaStudioEmbeddings

embeddings = SambaStudioEmbeddings()

text = "Hello, this is a test"
result = embeddings.embed_query(text)
print(result)

texts = ["Hello, this is a test", "Hello, this is another test"]
results = embeddings.embed_documents(texts)
print(results)
```
