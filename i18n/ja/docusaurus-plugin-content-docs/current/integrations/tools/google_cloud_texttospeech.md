---
translated: true
---

# Google Cloud Text-to-Speech

>[Google Cloud Text-to-Speech](https://cloud.google.com/text-to-speech) は、100を超える音声、複数の言語とバリアントで自然な音声合成を可能にするデベロッパー向けのサービスです。DeepMindの革新的なWaveNetの研究とGoogleの強力なニューラルネットワークを活用し、最高の音質を実現しています。

このノートブックでは、`Google Cloud Text-to-Speech API`を使用して音声合成機能を実現する方法を示します。

まず、Google Cloudプロジェクトを設定する必要があります。[ここ](https://cloud.google.com/text-to-speech/docs/before-you-begin)の手順に従ってください。

```python
%pip install --upgrade --quiet  google-cloud-text-to-speech
```

## 使用方法

```python
from langchain_community.tools import GoogleCloudTextToSpeechTool

text_to_speak = "Hello world!"

tts = GoogleCloudTextToSpeechTool()
tts.name
```

オーディオを生成し、一時ファイルに保存してから再生することができます。

```python
speech_file = tts.run(text_to_speak)
```
