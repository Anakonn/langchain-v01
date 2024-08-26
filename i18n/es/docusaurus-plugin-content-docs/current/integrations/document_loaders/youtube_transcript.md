---
translated: true
---

# Transcripciones de YouTube

>[YouTube](https://www.youtube.com/) es una plataforma de video en línea y redes sociales creada por Google.

Este cuaderno cubre cómo cargar documentos de `transcripciones de YouTube`.

```python
from langchain_community.document_loaders import YoutubeLoader
```

```python
%pip install --upgrade --quiet  youtube-transcript-api
```

```python
loader = YoutubeLoader.from_youtube_url(
    "https://www.youtube.com/watch?v=QsYGlZkevEg", add_video_info=False
)
```

```python
loader.load()
```

### Agregar información del video

```python
%pip install --upgrade --quiet  pytube
```

```python
loader = YoutubeLoader.from_youtube_url(
    "https://www.youtube.com/watch?v=QsYGlZkevEg", add_video_info=True
)
loader.load()
```

### Agregar preferencias de idioma

Parámetro de idioma: es una lista de códigos de idioma en orden de prioridad descendente, `en` de forma predeterminada.

Parámetro de traducción: es una preferencia de traducción, puede traducir la transcripción disponible a su idioma preferido.

```python
loader = YoutubeLoader.from_youtube_url(
    "https://www.youtube.com/watch?v=QsYGlZkevEg",
    add_video_info=True,
    language=["en", "id"],
    translation="en",
)
loader.load()
```

## Cargador de YouTube desde Google Cloud

### Requisitos previos

1. Crea un proyecto de Google Cloud o usa un proyecto existente
1. Habilita la [API de YouTube](https://console.cloud.google.com/apis/enableflow?apiid=youtube.googleapis.com&project=sixth-grammar-344520)
1. [Autoriza las credenciales para la aplicación de escritorio](https://developers.google.com/drive/api/quickstart/python#authorize_credentials_for_a_desktop_application)
1. `pip install --upgrade google-api-python-client google-auth-httplib2 google-auth-oauthlib youtube-transcript-api`

### 🧑 Instrucciones para ingerir tus datos de Google Docs

De forma predeterminada, el `GoogleDriveLoader` espera que el archivo `credentials.json` esté en `~/.credentials/credentials.json`, pero esto se puede configurar usando el argumento de palabra clave `credentials_file`. Lo mismo ocurre con `token.json`. Tenga en cuenta que `token.json` se creará automáticamente la primera vez que use el cargador.

`GoogleApiYoutubeLoader` puede cargar a partir de una lista de identificadores de documentos de Google Docs o un identificador de carpeta. Puede obtener el identificador de su carpeta y documento a partir de la URL:
Tenga en cuenta que, dependiendo de su configuración, es necesario configurar la `service_account_path`. Consulte [aquí](https://developers.google.com/drive/api/v3/quickstart/python) para obtener más detalles.

```python
# Init the GoogleApiClient
from pathlib import Path

from langchain_community.document_loaders import GoogleApiClient, GoogleApiYoutubeLoader

google_api_client = GoogleApiClient(credentials_path=Path("your_path_creds.json"))


# Use a Channel
youtube_loader_channel = GoogleApiYoutubeLoader(
    google_api_client=google_api_client,
    channel_name="Reducible",
    captions_language="en",
)

# Use Youtube Ids

youtube_loader_ids = GoogleApiYoutubeLoader(
    google_api_client=google_api_client, video_ids=["TrdevFK_am4"], add_video_info=True
)

# returns a list of Documents
youtube_loader_channel.load()
```
