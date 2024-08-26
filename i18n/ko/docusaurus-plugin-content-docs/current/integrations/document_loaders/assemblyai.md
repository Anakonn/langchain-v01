---
translated: true
---

# AssemblyAI 오디오 트랜스크립트

`AssemblyAIAudioTranscriptLoader`를 사용하면 [AssemblyAI API](https://www.assemblyai.com)를 사용하여 오디오 파일을 전사(transcribe)할 수 있으며, 전사된 텍스트를 문서에 로드할 수 있습니다.

이를 사용하려면 `assemblyai` Python 패키지가 설치되어 있어야 하며, `ASSEMBLYAI_API_KEY` 환경 변수에 API 키가 설정되어 있어야 합니다. 또는 API 키를 인수로 전달할 수도 있습니다.

AssemblyAI에 대한 자세한 정보:

- [웹사이트](https://www.assemblyai.com/)
- [무료 API 키 받기](https://www.assemblyai.com/dashboard/signup)
- [AssemblyAI API 문서](https://www.assemblyai.com/docs)

## 설치

먼저 `assemblyai` 파이썬 패키지를 설치해야 합니다.

[assemblyai-python-sdk GitHub 저장소](https://github.com/AssemblyAI/assemblyai-python-sdk)에서 더 자세한 정보를 확인할 수 있습니다.

```python
%pip install --upgrade --quiet  assemblyai
```

## 예시

`AssemblyAIAudioTranscriptLoader`에는 최소한 `file_path` 인수가 필요합니다. 오디오 파일은 URL 또는 로컬 파일 경로로 지정할 수 있습니다.

```python
from langchain_community.document_loaders import AssemblyAIAudioTranscriptLoader

audio_file = "https://storage.googleapis.com/aai-docs-samples/nbc.mp3"
# or a local file path: audio_file = "./nbc.mp3"

loader = AssemblyAIAudioTranscriptLoader(file_path=audio_file)

docs = loader.load()
```

참고: `loader.load()` 호출은 전사가 완료될 때까지 차단됩니다.

전사된 텍스트는 `page_content`에서 사용할 수 있습니다:

```python
docs[0].page_content
```

```
"Load time, a new president and new congressional makeup. Same old ..."
```

`metadata`에는 추가 메타 정보가 포함된 전체 JSON 응답이 포함되어 있습니다:

```python
docs[0].metadata
```

```
{'language_code': <LanguageCode.en_us: 'en_us'>,
 'audio_url': 'https://storage.googleapis.com/aai-docs-samples/nbc.mp3',
 'punctuate': True,
 'format_text': True,
  ...
}
```

## 전사 형식(Transcript Formats)

`transcript_format` 인수를 사용하여 다양한 형식을 지정할 수 있습니다.

형식에 따라 하나 이상의 문서가 반환됩니다. 다음은 다른 `TranscriptFormat` 옵션들입니다:

- `TEXT`: 전사 텍스트가 포함된 하나의 문서

- `SENTENCES`: 여러 개의 문서로, 전사를 각 문장별로 분할

- `PARAGRAPHS`: 여러 개의 문서로, 전사를 각 단락별로 분할

- `SUBTITLES_SRT`: SRT 자막 형식으로 내보낸 전사가 포함된 하나의 문서

- `SUBTITLES_VTT`: VTT 자막 형식으로 내보낸 전사가 포함된 하나의 문서

```python
from langchain_community.document_loaders.assemblyai import TranscriptFormat

loader = AssemblyAIAudioTranscriptLoader(
    file_path="./your_file.mp3",
    transcript_format=TranscriptFormat.SENTENCES,
)

docs = loader.load()
```

## 트랜스크립션 구성

`config` 인수를 지정하여 다양한 오디오 인텔리전스 모델을 사용할 수 있습니다.

[AssemblyAI API 문서](https://www.assemblyai.com/docs)를 방문하여 사용 가능한 모든 모델에 대한 개요를 확인하세요!

```python
import assemblyai as aai

config = aai.TranscriptionConfig(
    speaker_labels=True, auto_chapters=True, entity_detection=True
)

loader = AssemblyAIAudioTranscriptLoader(file_path="./your_file.mp3", config=config)
```

## API 키 인수로 전달하기

환경 변수 `ASSEMBLYAI_API_KEY`에 API 키를 설정하는 것 외에도 인수로 전달하는 것이 가능합니다.

```python
loader = AssemblyAIAudioTranscriptLoader(
    file_path="./your_file.mp3", api_key="YOUR_KEY"
)
```

