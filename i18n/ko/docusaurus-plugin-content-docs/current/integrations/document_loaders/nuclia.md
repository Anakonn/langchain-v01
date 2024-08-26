---
translated: true
---

# 누클리아

>[누클리아](https://nuclia.com)는 내부 및 외부 소스의 비정형 데이터를 자동으로 인덱싱하여 최적화된 검색 결과와 생성 답변을 제공합니다. 비디오 및 오디오 전사, 이미지 콘텐츠 추출, 문서 구문 분석을 처리할 수 있습니다.

>` Nuclia Understanding API`는 텍스트, 웹 페이지, 문서, 오디오/비디오 콘텐츠를 포함한 비정형 데이터 처리를 지원합니다. 필요한 경우 음성-텍스트 변환 또는 OCR을 사용하여 모든 텍스트를 추출하며, 메타데이터, 임베디드 파일(PDF의 이미지 등), 웹 링크도 추출합니다. 기계 학습이 활성화된 경우 엔티티를 식별하고 콘텐츠 요약을 제공하며 모든 문장에 대한 임베딩을 생성합니다.

## 설정

`Nuclia Understanding API`를 사용하려면 Nuclia 계정이 필요합니다. [https://nuclia.cloud](https://nuclia.cloud)에서 무료로 계정을 만들고 [NUA 키를 생성](https://docs.nuclia.dev/docs/docs/using/understanding/intro)할 수 있습니다.

```python
%pip install --upgrade --quiet  protobuf
%pip install --upgrade --quiet  nucliadb-protos
```

```python
import os

os.environ["NUCLIA_ZONE"] = "<YOUR_ZONE>"  # e.g. europe-1
os.environ["NUCLIA_NUA_KEY"] = "<YOUR_API_KEY>"
```

## 예시

Nuclia 문서 로더를 사용하려면 `NucliaUnderstandingAPI` 도구를 인스턴스화해야 합니다:

```python
from langchain_community.tools.nuclia import NucliaUnderstandingAPI

nua = NucliaUnderstandingAPI(enable_ml=False)
```

```python
from langchain_community.document_loaders.nuclia import NucliaLoader

loader = NucliaLoader("./interview.mp4", nua)
```

이제 문서를 로드하는 루프를 호출할 수 있습니다.

```python
import time

pending = True
while pending:
    time.sleep(15)
    docs = loader.load()
    if len(docs) > 0:
        print(docs[0].page_content)
        print(docs[0].metadata)
        pending = False
    else:
        print("waiting...")
```

## 검색된 정보

Nuclia는 다음과 같은 정보를 반환합니다:

- 파일 메타데이터
- 추출된 텍스트
- 중첩된 텍스트(이미지에 포함된 텍스트 등)
- 단락 및 문장 분할(첫 번째 및 마지막 문자의 위치, 비디오 또는 오디오 파일의 시작 시간 및 종료 시간 정의)
- 링크
- 썸네일
- 임베디드 파일

참고:

  생성된 파일(썸네일, 추출된 임베디드 파일 등)은 토큰으로 제공됩니다. [`/processing/download` 엔드포인트](https://docs.nuclia.dev/docs/api#operation/Download_binary_file_processing_download_get)를 사용하여 다운로드할 수 있습니다.

  또한 어느 수준에서든 특성 크기가 특정 크기를 초과하면 다운로드 가능한 파일에 배치되고 문서에서 파일 포인터로 대체됩니다. 이는 `{"file": {"uri": "JWT_TOKEN"}}` 형식으로 구성됩니다. 메시지 크기가 1000000자를 초과하면 압축 프로세스가 먼저 벡터를 대상으로 하고, 그 다음에는 큰 필드 메타데이터, 마지막으로는 추출된 텍스트를 대상으로 합니다.
