---
translated: true
---

# EDEN AI

Eden AI는 최고의 AI 제공업체를 통합하여 사용자가 무한한 가능성을 열고 인공 지능의 진정한 잠재력을 활용할 수 있도록 AI 환경을 혁신하고 있습니다. 종합적이고 번거롭지 않은 단일 플랫폼을 통해 사용자는 단일 API를 통해 AI 기능을 신속하게 배포하고 AI 기능의 전체 범위에 쉽게 액세스할 수 있습니다. (웹사이트: https://edenai.co/)

이 예제에서는 LangChain을 사용하여 Eden AI 임베딩 모델과 상호 작용하는 방법을 설명합니다.

-----------------------------------------------------------------------------------

EDENAI의 API에 액세스하려면 API 키가 필요합니다.

계정을 만들고 https://app.edenai.run/admin/account/settings에서 키를 받을 수 있습니다.

키를 받으면 다음과 같이 환경 변수로 설정하고 싶습니다:

```shell
export EDENAI_API_KEY="..."
```

환경 변수를 설정하고 싶지 않다면 EdenAI 임베딩 클래스를 초기화할 때 edenai_api_key 매개변수로 직접 전달할 수 있습니다:

```python
from langchain_community.embeddings.edenai import EdenAiEmbeddings
```

```python
embeddings = EdenAiEmbeddings(edenai_api_key="...", provider="...")
```

## 모델 호출

EDENAI API는 다양한 제공업체를 통합합니다.

특정 모델에 액세스하려면 "provider"를 사용하여 호출하면 됩니다.

```python
embeddings = EdenAiEmbeddings(provider="openai")
```

```python
docs = ["It's raining right now", "cats are cute"]
document_result = embeddings.embed_documents(docs)
```

```python
query = "my umbrella is broken"
query_result = embeddings.embed_query(query)
```

```python
import numpy as np

query_numpy = np.array(query_result)
for doc_res, doc in zip(document_result, docs):
    document_numpy = np.array(doc_res)
    similarity = np.dot(query_numpy, document_numpy) / (
        np.linalg.norm(query_numpy) * np.linalg.norm(document_numpy)
    )
    print(f'Cosine similarity between "{doc}" and query: {similarity}')
```

```output
Cosine similarity between "It's raining right now" and query: 0.849261496107252
Cosine similarity between "cats are cute" and query: 0.7525900655705218
```
