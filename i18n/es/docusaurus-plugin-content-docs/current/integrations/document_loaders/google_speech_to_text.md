---
translated: true
---

# Transcripciones de audio de Google Speech-to-Text

El `GoogleSpeechToTextLoader` permite transcribir archivos de audio con la [API de Google Cloud Speech-to-Text](https://cloud.google.com/speech-to-text) y carga el texto transcrito en los documentos.

Para usarlo, debe tener instalado el paquete de Python `google-cloud-speech` y un proyecto de Google Cloud con la [API de Speech-to-Text habilitada](https://cloud.google.com/speech-to-text/v2/docs/transcribe-client-libraries#before_you_begin).

- [Llevando el poder de los modelos grandes a la API de Speech de Google Cloud](https://cloud.google.com/blog/products/ai-machine-learning/bringing-power-large-models-google-clouds-speech-api)

## Instalación y configuración

Primero, debe instalar el paquete de Python `google-cloud-speech`.

Puede encontrar más información sobre él en la página de [Bibliotecas de cliente de Speech-to-Text](https://cloud.google.com/speech-to-text/v2/docs/libraries).

Siga la [guía de inicio rápido](https://cloud.google.com/speech-to-text/v2/docs/sync-recognize) en la documentación de Google Cloud para crear un proyecto y habilitar la API.

```python
%pip install --upgrade --quiet langchain-google-community[speech]
```

## Ejemplo

El `GoogleSpeechToTextLoader` debe incluir los argumentos `project_id` y `file_path`. Los archivos de audio se pueden especificar como un URI de Google Cloud Storage (`gs://...`) o una ruta de archivo local.

El cargador solo admite solicitudes sincrónicas, que tienen un [límite de 60 segundos o 10 MB](https://cloud.google.com/speech-to-text/v2/docs/sync-recognize#:~:text=60%20seconds%20and/or%2010%20MB) por archivo de audio.

```python
from langchain_google_community import GoogleSpeechToTextLoader

project_id = "<PROJECT_ID>"
file_path = "gs://cloud-samples-data/speech/audio.flac"
# or a local file path: file_path = "./audio.wav"

loader = GoogleSpeechToTextLoader(project_id=project_id, file_path=file_path)

docs = loader.load()
```

Nota: Llamar a `loader.load()` bloquea hasta que se complete la transcripción.

El texto transcrito está disponible en `page_content`:

```python
docs[0].page_content
```

```output
"How old is the Brooklyn Bridge?"
```

El `metadata` contiene la respuesta JSON completa con más información de metadatos:

```python
docs[0].metadata
```

```json
{
  'language_code': 'en-US',
  'result_end_offset': datetime.timedelta(seconds=1)
}
```

## Configuración de reconocimiento

Puede especificar el argumento `config` para usar diferentes modelos de reconocimiento de voz y habilitar funciones específicas.

Consulte la [documentación de los reconocedores de Speech-to-Text](https://cloud.google.com/speech-to-text/v2/docs/recognizers) y la referencia de la API [`RecognizeRequest`](https://cloud.google.com/python/docs/reference/speech/latest/google.cloud.speech_v2.types.RecognizeRequest) para obtener información sobre cómo configurar una configuración personalizada.

Si no especifica una `config`, se seleccionarán automáticamente las siguientes opciones:

- Modelo: [Chirp Universal Speech Model](https://cloud.google.com/speech-to-text/v2/docs/chirp-model)
- Idioma: `en-US`
- Codificación de audio: Detectada automáticamente
- Puntuación automática: Habilitada

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
