---
translated: true
---

# Transcriptions audio AssemblyAI

Le `AssemblyAIAudioTranscriptLoader` permet de transcrire des fichiers audio avec l'[API AssemblyAI](https://www.assemblyai.com) et charge le texte transcrit dans les documents.

Pour l'utiliser, vous devez avoir le package python `assemblyai` installé et la variable d'environnement `ASSEMBLYAI_API_KEY` définie avec votre clé API. Alternativement, la clé API peut également être transmise en argument.

Plus d'informations sur AssemblyAI :

- [Site Web](https://www.assemblyai.com/)
- [Obtenir une clé API gratuite](https://www.assemblyai.com/dashboard/signup)
- [Documentation de l'API AssemblyAI](https://www.assemblyai.com/docs)

## Installation

Tout d'abord, vous devez installer le package python `assemblyai`.

Vous pouvez trouver plus d'informations à ce sujet dans le [dépôt GitHub assemblyai-python-sdk](https://github.com/AssemblyAI/assemblyai-python-sdk).

```python
%pip install --upgrade --quiet  assemblyai
```

## Exemple

Le `AssemblyAIAudioTranscriptLoader` nécessite au moins l'argument `file_path`. Les fichiers audio peuvent être spécifiés sous forme d'URL ou de chemin de fichier local.

```python
from langchain_community.document_loaders import AssemblyAIAudioTranscriptLoader

audio_file = "https://storage.googleapis.com/aai-docs-samples/nbc.mp3"
# or a local file path: audio_file = "./nbc.mp3"

loader = AssemblyAIAudioTranscriptLoader(file_path=audio_file)

docs = loader.load()
```

Remarque : L'appel de `loader.load()` bloque jusqu'à ce que la transcription soit terminée.

Le texte transcrit est disponible dans `page_content` :

```python
docs[0].page_content
```

```output
"Load time, a new president and new congressional makeup. Same old ..."
```

Les `metadata` contiennent la réponse JSON complète avec plus d'informations méta :

```python
docs[0].metadata
```

```output
{'language_code': <LanguageCode.en_us: 'en_us'>,
 'audio_url': 'https://storage.googleapis.com/aai-docs-samples/nbc.mp3',
 'punctuate': True,
 'format_text': True,
  ...
}
```

## Formats de transcription

Vous pouvez spécifier l'argument `transcript_format` pour différents formats.

Selon le format, un ou plusieurs documents sont renvoyés. Voici les différentes options de `TranscriptFormat` :

- `TEXT` : Un document avec le texte de la transcription
- `SENTENCES` : Plusieurs documents, divise la transcription par phrase
- `PARAGRAPHS` : Plusieurs documents, divise la transcription par paragraphe
- `SUBTITLES_SRT` : Un document avec la transcription exportée au format de sous-titres SRT
- `SUBTITLES_VTT` : Un document avec la transcription exportée au format de sous-titres VTT

```python
from langchain_community.document_loaders.assemblyai import TranscriptFormat

loader = AssemblyAIAudioTranscriptLoader(
    file_path="./your_file.mp3",
    transcript_format=TranscriptFormat.SENTENCES,
)

docs = loader.load()
```

## Configuration de la transcription

Vous pouvez également spécifier l'argument `config` pour utiliser différents modèles d'intelligence audio.

Visitez la [documentation de l'API AssemblyAI](https://www.assemblyai.com/docs) pour avoir un aperçu de tous les modèles disponibles !

```python
import assemblyai as aai

config = aai.TranscriptionConfig(
    speaker_labels=True, auto_chapters=True, entity_detection=True
)

loader = AssemblyAIAudioTranscriptLoader(file_path="./your_file.mp3", config=config)
```

## Transmettre la clé API en argument

En plus de définir la clé API dans la variable d'environnement `ASSEMBLYAI_API_KEY`, il est également possible de la transmettre en argument.

```python
loader = AssemblyAIAudioTranscriptLoader(
    file_path="./your_file.mp3", api_key="YOUR_KEY"
)
```
