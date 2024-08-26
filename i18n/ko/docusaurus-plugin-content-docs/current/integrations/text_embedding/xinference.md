---
translated: true
---

# Xinference 추론 (Xinference)

이 노트북은 LangChain 내에서 Xinference 임베딩을 사용하는 방법을 설명합니다.

## 설치

PyPI를 통해 `Xinference`를 설치하세요:

```python
%pip install --upgrade --quiet  "xinference[all]"
```

## 로컬 또는 분산 클러스터에 Xinference 배포하기

로컬 배포의 경우, `xinference`를 실행하세요.

Xinference를 클러스터에 배포하려면, 먼저 `xinference-supervisor`를 사용하여 Xinference 수퍼바이저를 시작하세요. -p 옵션을 사용하여 포트를, -H 옵션을 사용하여 호스트를 지정할 수 있습니다. 기본 포트는 9997입니다.

그 다음, `xinference-worker`를 사용하여 각 서버에서 Xinference 작업자를 시작하세요.

[Xinference](https://github.com/xorbitsai/inference)의 README 파일을 참조하여 더 자세한 정보를 확인할 수 있습니다.

## 래퍼

LangChain에서 Xinference를 사용하려면 먼저 모델을 실행해야 합니다. 명령줄 인터페이스(CLI)를 사용하여 이를 수행할 수 있습니다:

```python
!xinference launch -n vicuna-v1.3 -f ggmlv3 -q q4_0
```

```output
Model uid: 915845ee-2a04-11ee-8ed4-d29396a3f064
```

모델 UID가 반환됩니다. 이제 LangChain에서 Xinference 임베딩을 사용할 수 있습니다:

```python
from langchain_community.embeddings import XinferenceEmbeddings

xinference = XinferenceEmbeddings(
    server_url="http://0.0.0.0:9997", model_uid="915845ee-2a04-11ee-8ed4-d29396a3f064"
)
```

```python
query_result = xinference.embed_query("This is a test query")
```

```python
doc_result = xinference.embed_documents(["text A", "text B"])
```

마지막으로, 더 이상 사용하지 않을 때 모델을 종료하세요:

```python
!xinference terminate --model-uid "915845ee-2a04-11ee-8ed4-d29396a3f064"
```
