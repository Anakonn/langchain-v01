---
translated: true
---

# Nuclia 이해하기

>[Nuclia](https://nuclia.com)는 내부 및 외부 소스의 비정형 데이터를 자동으로 인덱싱하여 최적화된 검색 결과와 생성 답변을 제공합니다. 동영상 및 오디오 전사, 이미지 콘텐츠 추출, 문서 구문 분석을 처리할 수 있습니다.

`Nuclia Understanding API`는 텍스트, 웹 페이지, 문서, 오디오/비디오 콘텐츠를 포함한 비정형 데이터 처리를 지원합니다. 필요한 경우 음성-텍스트 변환 또는 OCR을 사용하여 모든 텍스트를 추출하고, 엔티티를 식별하며, 메타데이터, 임베디드 파일(PDF의 이미지 등), 웹 링크를 추출합니다. 또한 콘텐츠 요약을 제공합니다.

`Nuclia Understanding API`를 사용하려면 `Nuclia` 계정이 필요합니다. [https://nuclia.cloud](https://nuclia.cloud)에서 무료로 계정을 만들고 [NUA 키를 생성](https://docs.nuclia.dev/docs/docs/using/understanding/intro)할 수 있습니다.

```python
%pip install --upgrade --quiet  protobuf
%pip install --upgrade --quiet  nucliadb-protos
```

```python
import os

os.environ["NUCLIA_ZONE"] = "<YOUR_ZONE>"  # e.g. europe-1
os.environ["NUCLIA_NUA_KEY"] = "<YOUR_API_KEY>"
```

```python
from langchain_community.tools.nuclia import NucliaUnderstandingAPI

nua = NucliaUnderstandingAPI(enable_ml=False)
```

`push` 작업을 사용하여 파일을 Nuclia Understanding API에 푸시할 수 있습니다. 처리가 비동기적으로 수행되므로, 결과가 파일이 푸시된 순서와 다를 수 있습니다. 따라서 `id`를 제공하여 결과를 해당 파일과 일치시켜야 합니다.

```python
nua.run({"action": "push", "id": "1", "path": "./report.docx"})
nua.run({"action": "push", "id": "2", "path": "./interview.mp4"})
```

`pull` 작업을 반복적으로 호출하여 JSON 형식의 결과를 얻을 수 있습니다.

```python
import time

pending = True
data = None
while pending:
    time.sleep(15)
    data = nua.run({"action": "pull", "id": "1", "path": None})
    if data:
        print(data)
        pending = False
    else:
        print("waiting...")
```

`async` 모드에서 한 번에 수행할 수도 있습니다. 푸시만 하면 결과가 풀링될 때까지 기다립니다:

```python
import asyncio


async def process():
    data = await nua.arun(
        {"action": "push", "id": "1", "path": "./talk.mp4", "text": None}
    )
    print(data)


asyncio.run(process())
```

## 검색된 정보

Nuclia는 다음과 같은 정보를 반환합니다:

- 파일 메타데이터
- 추출된 텍스트
- 중첩된 텍스트(이미지 내 텍스트 등)
- 요약(`enable_ml`이 `True`로 설정된 경우에만)
- 단락 및 문장 분할(첫 문자와 마지막 문자의 위치, 비디오 또는 오디오 파일의 시작 시간과 종료 시간 포함)
- 인명, 날짜, 장소, 조직 등의 명명된 엔티티(`enable_ml`이 `True`로 설정된 경우에만)
- 링크
- 썸네일
- 임베디드 파일
- 텍스트의 벡터 표현(`enable_ml`이 `True`로 설정된 경우에만)

참고:

  생성된 파일(썸네일, 추출된 임베디드 파일 등)은 토큰으로 제공됩니다. [`/processing/download` 엔드포인트](https://docs.nuclia.dev/docs/api#operation/Download_binary_file_processing_download_get)를 사용하여 다운로드할 수 있습니다.

  또한 어느 수준에서든 특정 크기를 초과하는 속성은 다운로드 가능한 파일에 배치되며 문서에서 파일 포인터로 대체됩니다. 이는 `{"file": {"uri": "JWT_TOKEN"}}` 형식으로 구성됩니다. 메시지 크기가 1000000자를 초과하면 가장 큰 부분이 다운로드 가능한 파일로 이동됩니다. 먼저 벡터 압축 프로세스가 대상이 되며, 그렇지 않으면 큰 필드 메타데이터와 마지막으로 추출된 텍스트가 대상이 됩니다.
