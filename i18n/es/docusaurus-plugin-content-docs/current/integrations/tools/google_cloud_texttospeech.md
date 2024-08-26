---
translated: true
---

# Google Cloud Text-to-Speech

>[Google Cloud Text-to-Speech](https://cloud.google.com/text-to-speech) permite a los desarrolladores sintetizar un habla natural con más de 100 voces, disponibles en varios idiomas y variantes. Aplica la investigación pionera de DeepMind en WaveNet y las poderosas redes neuronales de Google para ofrecer la máxima fidelidad posible.

Este cuaderno muestra cómo interactuar con la `Google Cloud Text-to-Speech API` para lograr capacidades de síntesis de voz.

Primero, debe configurar un proyecto de Google Cloud. Puede seguir las instrucciones [aquí](https://cloud.google.com/text-to-speech/docs/before-you-begin).

```python
%pip install --upgrade --quiet  google-cloud-text-to-speech
```

## Uso

```python
from langchain_community.tools import GoogleCloudTextToSpeechTool

text_to_speak = "Hello world!"

tts = GoogleCloudTextToSpeechTool()
tts.name
```

Podemos generar audio, guardarlo en el archivo temporal y luego reproducirlo.

```python
speech_file = tts.run(text_to_speak)
```
