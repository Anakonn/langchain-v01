---
translated: true
---

# Cloudflare Workers AI

>[Cloudflare, Inc. (Wikipedia)](https://en.wikipedia.org/wiki/Cloudflare)은 콘텐츠 전송 네트워크 서비스, 클라우드 사이버 보안, DDoS 완화 및 ICANN 인증 도메인 등록 서비스를 제공하는 미국 기업입니다.

>[Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/)를 사용하면 REST API를 통해 `Cloudflare` 네트워크에서 기계 학습 모델을 실행할 수 있습니다.

>[Cloudflare AI 문서](https://developers.cloudflare.com/workers-ai/models/text-embeddings/)에는 사용 가능한 모든 텍스트 임베딩 모델이 나열되어 있습니다.

## 설정

Cloudflare 계정 ID와 API 토큰이 필요합니다. [이 문서](https://developers.cloudflare.com/workers-ai/get-started/rest-api/)에서 어떻게 얻을 수 있는지 확인하세요.

```python
import getpass

my_account_id = getpass.getpass("Enter your Cloudflare account ID:\n\n")
my_api_token = getpass.getpass("Enter your Cloudflare API token:\n\n")
```

## 예시

```python
from langchain_community.embeddings.cloudflare_workersai import (
    CloudflareWorkersAIEmbeddings,
)
```

```python
embeddings = CloudflareWorkersAIEmbeddings(
    account_id=my_account_id,
    api_token=my_api_token,
    model_name="@cf/baai/bge-small-en-v1.5",
)
# single string embeddings
query_result = embeddings.embed_query("test")
len(query_result), query_result[:3]
```

```output
(384, [-0.033627357333898544, 0.03982774540781975, 0.03559349477291107])
```

```python
# string embeddings in batches
batch_query_result = embeddings.embed_documents(["test1", "test2", "test3"])
len(batch_query_result), len(batch_query_result[0])
```

```output
(3, 384)
```
