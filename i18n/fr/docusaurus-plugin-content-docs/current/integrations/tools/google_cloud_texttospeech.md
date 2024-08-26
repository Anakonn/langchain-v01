---
translated: true
---

# Google Cloud Text-to-Speech

>[Google Cloud Text-to-Speech](https://cloud.google.com/text-to-speech) permet aux développeurs de synthétiser une parole naturelle avec plus de 100 voix, disponibles dans plusieurs langues et variantes. Il applique les recherches révolutionnaires de DeepMind sur WaveNet et les puissants réseaux neuronaux de Google pour offrir la plus haute fidélité possible.

Ce notebook montre comment interagir avec l'`API Google Cloud Text-to-Speech` pour obtenir des capacités de synthèse vocale.

Tout d'abord, vous devez configurer un projet Google Cloud. Vous pouvez suivre les instructions [ici](https://cloud.google.com/text-to-speech/docs/before-you-begin).

```python
%pip install --upgrade --quiet  google-cloud-text-to-speech
```

## Utilisation

```python
from langchain_community.tools import GoogleCloudTextToSpeechTool

text_to_speak = "Hello world!"

tts = GoogleCloudTextToSpeechTool()
tts.name
```

Nous pouvons générer de l'audio, l'enregistrer dans un fichier temporaire, puis le lire.

```python
speech_file = tts.run(text_to_speak)
```
