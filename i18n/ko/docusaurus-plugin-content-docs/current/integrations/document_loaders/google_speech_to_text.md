---
translated: true
---

# Google 음성-텍스트 오디오 트랜스크립트

`GoogleSpeechToTextLoader`를 사용하면 [Google Cloud Speech-to-Text API](https://cloud.google.com/speech-to-text)를 사용하여 오디오 파일을 전사할 수 있으며, 전사된 텍스트를 문서에 로드할 수 있습니다.

이를 사용하려면 `google-cloud-speech` Python 패키지가 설치되어 있어야 하며, [Speech-to-Text API가 활성화](https://cloud.google.com/speech-to-text/v2/docs/transcribe-client-libraries#before_you_begin)된 Google Cloud 프로젝트가 있어야 합니다.

- [Google Cloud의 Speech API에 대형 모델의 힘 가져오기](https://cloud.google.com/blog/products/ai-machine-learning/bringing-power-large-models-google-clouds-speech-api)

## 설치 및 설정

먼저 `google-cloud-speech` Python 패키지를 설치해야 합니다.

[Speech-to-Text 클라이언트 라이브러리](https://cloud.google.com/speech-to-text/v2/docs/libraries) 페이지에서 더 많은 정보를 찾을 수 있습니다.

Google Cloud 문서의 [빠른 시작 가이드](https://cloud.google.com/speech-to-text/v2/docs/sync-recognize)를 따라 프로젝트를 생성하고 API를 활성화하세요.

```python
%pip install --upgrade --quiet langchain-google-community[speech]
```

## 예시

`GoogleSpeechToTextLoader`에는 `project_id`와 `file_path` 인수가 포함되어야 합니다. 오디오 파일은 Google Cloud Storage URI(`gs://...`) 또는 로컬 파일 경로로 지정할 수 있습니다.

로더에서는 동기 요청만 지원되며, 오디오 파일당 [60초 또는 10MB](https://cloud.google.com/speech-to-text/v2/docs/sync-recognize#:~:text=60%20seconds%20and/or%2010%20MB)의 제한이 있습니다.

```python
from langchain_google_community import GoogleSpeechToTextLoader

project_id = "<PROJECT_ID>"
file_path = "gs://cloud-samples-data/speech/audio.flac"
# or a local file path: file_path = "./audio.wav"

loader = GoogleSpeechToTextLoader(project_id=project_id, file_path=file_path)

docs = loader.load()
```

참고: `loader.load()`를 호출하면 전사가 완료될 때까지 차단됩니다.

전사된 텍스트는 `page_content`에서 확인할 수 있습니다:

```python
docs[0].page_content
```

```output
"How old is the Brooklyn Bridge?"
```

`metadata`에는 더 많은 메타 정보가 포함된 전체 JSON 응답이 포함됩니다:

```python
docs[0].metadata
```

```json
{
  'language_code': 'en-US',
  'result_end_offset': datetime.timedelta(seconds=1)
}
```

## 인식 구성

`config` 인수를 지정하여 다른 음성 인식 모델을 사용하고 특정 기능을 활성화할 수 있습니다.

[Speech-to-Text 인식기 문서](https://cloud.google.com/speech-to-text/v2/docs/recognizers)와 [`RecognizeRequest`](https://cloud.google.com/python/docs/reference/speech/latest/google.cloud.speech_v2.types.RecognizeRequest) API 참조를 참조하여 사용자 지정 구성을 설정하는 방법을 확인하세요.

`config`를 지정하지 않으면 다음 옵션이 자동으로 선택됩니다:

- 모델: [Chirp Universal Speech Model](https://cloud.google.com/speech-to-text/v2/docs/chirp-model)
- 언어: `en-US`
- 오디오 인코딩: 자동 감지
- 자동 구두점: 활성화

```python
from google.cloud.speech_v2 import (
    AutoDetectDecodingConfig,
    RecognitionConfig,
    RecognitionFeatures,
)
from langchain_google_community import GoogleSpeechToTextLoader

project_id = "<PROJECT_ID>"
location = "global"
recognizer_id = "<RECOGNIZER_ID>"
file_path = "./audio.wav"

config = RecognitionConfig(
    auto_decoding_config=AutoDetectDecodingConfig(),
    language_codes=["en-US"],
    model="long",
    features=RecognitionFeatures(
        enable_automatic_punctuation=False,
        profanity_filter=True,
        enable_spoken_punctuation=True,
        enable_spoken_emojis=True,
    ),
)

loader = GoogleSpeechToTextLoader(
    project_id=project_id,
    location=location,
    recognizer_id=recognizer_id,
    file_path=file_path,
    config=config,
)
```
