---
translated: true
---

# 베드록

>[Amazon Bedrock](https://aws.amazon.com/bedrock/)은 `AI21 Labs`, `Anthropic`, `Cohere`, `Meta`, `Stability AI`, `Amazon` 등 선도적인 AI 기업의 고성능 기반 모델(FMs)을 단일 API를 통해 제공하는 완전 관리형 서비스입니다. 또한 보안, 프라이버시 및 책임감 있는 AI를 위한 광범위한 기능을 제공합니다. `Amazon Bedrock`을 사용하면 사용 사례에 적합한 최상위 FMs을 쉽게 실험하고 평가할 수 있으며, 미세 조정 및 `Retrieval Augmented Generation`(`RAG`) 기술을 사용하여 사내 데이터로 비공개적으로 사용자 지정할 수 있습니다. 또한 기업 시스템 및 데이터 소스를 사용하여 작업을 수행하는 에이전트를 구축할 수 있습니다. `Amazon Bedrock`은 서버리스이므로 인프라를 관리할 필요가 없으며, 이미 익숙한 AWS 서비스를 사용하여 생성 AI 기능을 안전하게 통합하고 배포할 수 있습니다.

```python
%pip install --upgrade --quiet  boto3
```

```python
from langchain_community.embeddings import BedrockEmbeddings

embeddings = BedrockEmbeddings(
    credentials_profile_name="bedrock-admin", region_name="us-east-1"
)
```

```python
embeddings.embed_query("This is a content of the document")
```

```python
embeddings.embed_documents(
    ["This is a content of the document", "This is another document"]
)
```

```python
# async embed query
await embeddings.aembed_query("This is a content of the document")
```

```python
# async embed documents
await embeddings.aembed_documents(
    ["This is a content of the document", "This is another document"]
)
```
