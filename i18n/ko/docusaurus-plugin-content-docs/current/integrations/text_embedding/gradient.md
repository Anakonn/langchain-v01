---
translated: true
---

# 그라디언트

`그라디언트`를 사용하면 간단한 웹 API로 `임베딩`을 만들고 LLM을 미세 조정하고 완성할 수 있습니다.

이 노트북에서는 [그라디언트](https://gradient.ai/)의 임베딩을 사용하여 Langchain을 사용하는 방법을 살펴봅니다.

## 가져오기

```python
from langchain_community.embeddings import GradientEmbeddings
```

## 환경 API 키 설정

그라디언트 AI에서 API 키를 받으세요. 다양한 모델을 테스트하고 미세 조정하는 데 $10의 무료 크레딧이 제공됩니다.

```python
import os
from getpass import getpass

if not os.environ.get("GRADIENT_ACCESS_TOKEN", None):
    # Access token under https://auth.gradient.ai/select-workspace
    os.environ["GRADIENT_ACCESS_TOKEN"] = getpass("gradient.ai access token:")
if not os.environ.get("GRADIENT_WORKSPACE_ID", None):
    # `ID` listed in `$ gradient workspace list`
    # also displayed after login at at https://auth.gradient.ai/select-workspace
    os.environ["GRADIENT_WORKSPACE_ID"] = getpass("gradient.ai workspace id:")
```

선택 사항: `gradientai` Python 패키지를 사용하여 현재 배포된 모델을 확인하도록 환경 변수 `GRADIENT_ACCESS_TOKEN` 및 `GRADIENT_WORKSPACE_ID`를 확인하세요.

```python
%pip install --upgrade --quiet  gradientai
```

## 그라디언트 인스턴스 생성

```python
documents = [
    "Pizza is a dish.",
    "Paris is the capital of France",
    "numpy is a lib for linear algebra",
]
query = "Where is Paris?"
```

```python
embeddings = GradientEmbeddings(model="bge-large")

documents_embedded = embeddings.embed_documents(documents)
query_result = embeddings.embed_query(query)
```

```python
# (demo) compute similarity
import numpy as np

scores = np.array(documents_embedded) @ np.array(query_result).T
dict(zip(documents, scores))
```
