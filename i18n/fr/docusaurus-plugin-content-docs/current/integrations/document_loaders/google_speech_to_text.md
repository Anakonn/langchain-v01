---
translated: true
---

# Transcriptions audio Google Speech-to-Text

Le `GoogleSpeechToTextLoader` permet de transcrire des fichiers audio avec l'[API Google Cloud Speech-to-Text](https://cloud.google.com/speech-to-text) et charge le texte transcrit dans les documents.

Pour l'utiliser, vous devez avoir le package python `google-cloud-speech` installé et un projet Google Cloud avec l'[API Speech-to-Text activée](https://cloud.google.com/speech-to-text/v2/docs/transcribe-client-libraries#before_you_begin).

- [Apporter la puissance des grands modèles à l'API Speech de Google Cloud](https://cloud.google.com/blog/products/ai-machine-learning/bringing-power-large-models-google-clouds-speech-api)

## Installation et configuration

Tout d'abord, vous devez installer le package python `google-cloud-speech`.

Vous pouvez trouver plus d'informations à ce sujet sur la page [Bibliothèques clientes Speech-to-Text](https://cloud.google.com/speech-to-text/v2/docs/libraries).

Suivez le [guide de démarrage rapide](https://cloud.google.com/speech-to-text/v2/docs/sync-recognize) dans la documentation Google Cloud pour créer un projet et activer l'API.

```python
%pip install --upgrade --quiet langchain-google-community[speech]
```

## Exemple

Le `GoogleSpeechToTextLoader` doit inclure les arguments `project_id` et `file_path`. Les fichiers audio peuvent être spécifiés comme un URI Google Cloud Storage (`gs://...`) ou un chemin de fichier local.

Seules les requêtes synchrones sont prises en charge par le chargeur, qui a une [limite de 60 secondes ou 10 Mo](https://cloud.google.com/speech-to-text/v2/docs/sync-recognize#:~:text=60%20seconds%20and/or%2010%20MB) par fichier audio.

```python
from langchain_google_community import GoogleSpeechToTextLoader

project_id = "<PROJECT_ID>"
file_path = "gs://cloud-samples-data/speech/audio.flac"
# or a local file path: file_path = "./audio.wav"

loader = GoogleSpeechToTextLoader(project_id=project_id, file_path=file_path)

docs = loader.load()
```

Remarque : Appeler `loader.load()` bloque jusqu'à ce que la transcription soit terminée.

Le texte transcrit est disponible dans `page_content` :

```python
docs[0].page_content
```

```output
"How old is the Brooklyn Bridge?"
```

Les `metadata` contiennent la réponse JSON complète avec plus d'informations méta :

```python
docs[0].metadata
```

```json
{
  'language_code': 'en-US',
  'result_end_offset': datetime.timedelta(seconds=1)
}
```

## Configuration de la reconnaissance

Vous pouvez spécifier l'argument `config` pour utiliser différents modèles de reconnaissance vocale et activer des fonctionnalités spécifiques.

Reportez-vous à la [documentation des reconnaisseurs Speech-to-Text](https://cloud.google.com/speech-to-text/v2/docs/recognizers) et à la référence de l'API [`RecognizeRequest`](https://cloud.google.com/python/docs/reference/speech/latest/google.cloud.speech_v2.types.RecognizeRequest) pour obtenir des informations sur la façon de définir une configuration personnalisée.

Si vous ne spécifiez pas de `config`, les options suivantes seront sélectionnées automatiquement :

- Modèle : [Modèle de parole universel Chirp](https://cloud.google.com/speech-to-text/v2/docs/chirp-model)
- Langue : `en-US`
- Codage audio : Détecté automatiquement
- Ponctuation automatique : Activée

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
