---
translated: true
---

# Nuclia

>[Nuclia](https://nuclia.com) 는 내부 및 외부 소스의 비정형 데이터를 자동으로 인덱싱하여 최적화된 검색 결과와 생성형 답변을 제공합니다. 비디오 및 오디오 전사, 이미지 콘텐츠 추출, 문서 구문 분석을 처리할 수 있습니다.

`Nuclia Understanding API` 문서 변환기는 텍스트를 단락과 문장으로 분할하고, 엔티티를 식별하며, 텍스트의 요약을 제공하고 모든 문장에 대한 임베딩을 생성합니다.

Nuclia Understanding API를 사용하려면 Nuclia 계정이 필요합니다. [https://nuclia.cloud](https://nuclia.cloud)에서 무료로 계정을 만들고 [NUA 키를 생성](https://docs.nuclia.dev/docs/docs/using/understanding/intro)할 수 있습니다.

from langchain_community.document_transformers.nuclia_text_transform import NucliaTextTransformer

```python
%pip install --upgrade --quiet  protobuf
%pip install --upgrade --quiet  nucliadb-protos
```

```python
import os

os.environ["NUCLIA_ZONE"] = "<YOUR_ZONE>"  # e.g. europe-1
os.environ["NUCLIA_NUA_KEY"] = "<YOUR_API_KEY>"
```

Nuclia 문서 변환기를 사용하려면 `enable_ml`을 `True`로 설정하여 `NucliaUnderstandingAPI` 도구를 인스턴스화해야 합니다:

```python
from langchain_community.tools.nuclia import NucliaUnderstandingAPI

nua = NucliaUnderstandingAPI(enable_ml=True)
```

Nuclia 문서 변환기는 비동기 모드로 호출되어야 하므로 `atransform_documents` 메서드를 사용해야 합니다:

```python
import asyncio

from langchain_community.document_transformers.nuclia_text_transform import (
    NucliaTextTransformer,
)
from langchain_core.documents import Document


async def process():
    documents = [
        Document(page_content="<TEXT 1>", metadata={}),
        Document(page_content="<TEXT 2>", metadata={}),
        Document(page_content="<TEXT 3>", metadata={}),
    ]
    nuclia_transformer = NucliaTextTransformer(nua)
    transformed_documents = await nuclia_transformer.atransform_documents(documents)
    print(transformed_documents)


asyncio.run(process())
```
