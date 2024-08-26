---
translated: true
---

# Google Cloud 텍스트-음성 변환

>[Google Cloud 텍스트-음성 변환](https://cloud.google.com/text-to-speech)은 개발자가 100개 이상의 음성으로 자연스러운 음성을 합성할 수 있게 해줍니다. 다양한 언어와 변종이 제공됩니다. DeepMind의 혁신적인 WaveNet 연구와 Google의 강력한 신경망을 적용하여 최고의 음질을 제공합니다.

이 노트북은 `Google Cloud 텍스트-음성 변환 API`를 사용하여 음성 합성 기능을 구현하는 방법을 보여줍니다.

먼저 Google Cloud 프로젝트를 설정해야 합니다. [여기](https://cloud.google.com/text-to-speech/docs/before-you-begin)의 지침을 따르세요.

```python
%pip install --upgrade --quiet  google-cloud-text-to-speech
```

## 사용법

```python
from langchain_community.tools import GoogleCloudTextToSpeechTool

text_to_speak = "Hello world!"

tts = GoogleCloudTextToSpeechTool()
tts.name
```

오디오를 생성하고 임시 파일에 저장한 다음 재생할 수 있습니다.

```python
speech_file = tts.run(text_to_speak)
```
