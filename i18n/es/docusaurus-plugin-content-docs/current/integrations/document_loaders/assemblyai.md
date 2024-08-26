---
translated: true
---

# Transcripciones de audio de AssemblyAI

El `AssemblyAIAudioTranscriptLoader` permite transcribir archivos de audio con la [API de AssemblyAI](https://www.assemblyai.com) y cargar el texto transcrito en documentos.

Para usarlo, debe tener instalado el paquete de python `assemblyai` y la variable de entorno `ASSEMBLYAI_API_KEY` establecida con su clave API. Alternativamente, la clave API también se puede pasar como argumento.

Más información sobre AssemblyAI:

- [Sitio web](https://www.assemblyai.com/)
- [Obtener una clave API gratuita](https://www.assemblyai.com/dashboard/signup)
- [Documentación de la API de AssemblyAI](https://www.assemblyai.com/docs)

## Instalación

Primero, debe instalar el paquete de python `assemblyai`.

Puede encontrar más información sobre él en el [repositorio de GitHub de assemblyai-python-sdk](https://github.com/AssemblyAI/assemblyai-python-sdk).

```python
%pip install --upgrade --quiet  assemblyai
```

## Ejemplo

El `AssemblyAIAudioTranscriptLoader` necesita al menos el argumento `file_path`. Los archivos de audio se pueden especificar como una URL o una ruta de archivo local.

```python
from langchain_community.document_loaders import AssemblyAIAudioTranscriptLoader

audio_file = "https://storage.googleapis.com/aai-docs-samples/nbc.mp3"
# or a local file path: audio_file = "./nbc.mp3"

loader = AssemblyAIAudioTranscriptLoader(file_path=audio_file)

docs = loader.load()
```

Nota: Llamar a `loader.load()` bloquea hasta que se complete la transcripción.

El texto transcrito está disponible en `page_content`:

```python
docs[0].page_content
```

```output
"Load time, a new president and new congressional makeup. Same old ..."
```

El `metadata` contiene la respuesta JSON completa con más información de metadatos:

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

## Formatos de transcripción

Puede especificar el argumento `transcript_format` para diferentes formatos.

Dependiendo del formato, se devuelven uno o más documentos. Estas son las diferentes opciones de `TranscriptFormat`:

- `TEXT`: Un documento con el texto de la transcripción
- `SENTENCES`: Varios documentos, divide la transcripción por cada oración
- `PARAGRAPHS`: Varios documentos, divide la transcripción por cada párrafo
- `SUBTITLES_SRT`: Un documento con la transcripción exportada en formato de subtítulos SRT
- `SUBTITLES_VTT`: Un documento con la transcripción exportada en formato de subtítulos VTT

```python
from langchain_community.document_loaders.assemblyai import TranscriptFormat

loader = AssemblyAIAudioTranscriptLoader(
    file_path="./your_file.mp3",
    transcript_format=TranscriptFormat.SENTENCES,
)

docs = loader.load()
```

## Configuración de transcripción

También puede especificar el argumento `config` para usar diferentes modelos de inteligencia de audio.

¡Visite la [Documentación de la API de AssemblyAI](https://www.assemblyai.com/docs) para obtener una descripción general de todos los modelos disponibles!

```python
import assemblyai as aai

config = aai.TranscriptionConfig(
    speaker_labels=True, auto_chapters=True, entity_detection=True
)

loader = AssemblyAIAudioTranscriptLoader(file_path="./your_file.mp3", config=config)
```

## Pasar la clave API como argumento

Además de establecer la clave API como variable de entorno `ASSEMBLYAI_API_KEY`, también es posible pasarla como argumento.

```python
loader = AssemblyAIAudioTranscriptLoader(
    file_path="./your_file.mp3", api_key="YOUR_KEY"
)
```
