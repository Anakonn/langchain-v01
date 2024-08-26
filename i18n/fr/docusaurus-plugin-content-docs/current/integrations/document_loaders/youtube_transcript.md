---
translated: true
---

# Transcriptions YouTube

>[YouTube](https://www.youtube.com/) est une plateforme de partage de vidéos en ligne et de médias sociaux créée par Google.

Ce cahier de notes couvre comment charger des documents à partir de `transcriptions YouTube`.

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

### Ajouter les informations de la vidéo

```python
%pip install --upgrade --quiet  pytube
```

```python
loader = YoutubeLoader.from_youtube_url(
    "https://www.youtube.com/watch?v=QsYGlZkevEg", add_video_info=True
)
loader.load()
```

### Ajouter les préférences linguistiques

Paramètre de langue : C'est une liste de codes de langue dans un ordre de priorité décroissant, `en` par défaut.

Paramètre de traduction : C'est une préférence de traduction, vous pouvez traduire la transcription disponible dans votre langue préférée.

```python
loader = YoutubeLoader.from_youtube_url(
    "https://www.youtube.com/watch?v=QsYGlZkevEg",
    add_video_info=True,
    language=["en", "id"],
    translation="en",
)
loader.load()
```

## Chargeur YouTube à partir de Google Cloud

### Prérequis

1. Créez un projet Google Cloud ou utilisez un projet existant
1. Activez l'[API YouTube](https://console.cloud.google.com/apis/enableflow?apiid=youtube.googleapis.com&project=sixth-grammar-344520)
1. [Autorisez les identifiants pour l'application de bureau](https://developers.google.com/drive/api/quickstart/python#authorize_credentials_for_a_desktop_application)
1. `pip install --upgrade google-api-python-client google-auth-httplib2 google-auth-oauthlib youtube-transcript-api`

### 🧑 Instructions pour ingérer vos données Google Docs

Par défaut, le `GoogleDriveLoader` s'attend à ce que le fichier `credentials.json` soit `~/.credentials/credentials.json`, mais cela peut être configuré à l'aide de l'argument de mot-clé `credentials_file`. Même chose avec `token.json`. Notez que `token.json` sera créé automatiquement la première fois que vous utiliserez le chargeur.

`GoogleApiYoutubeLoader` peut charger à partir d'une liste d'identifiants de documents Google Docs ou d'un identifiant de dossier. Vous pouvez obtenir l'identifiant de votre dossier et de votre document à partir de l'URL :
Notez que selon votre configuration, le `service_account_path` doit être configuré. Voir [ici](https://developers.google.com/drive/api/v3/quickstart/python) pour plus de détails.

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
