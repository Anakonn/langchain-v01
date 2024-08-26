---
translated: true
---

# GMail

Este cargador explica cómo cargar datos de GMail. Hay muchas formas en las que podrías querer cargar datos de GMail. Este cargador es actualmente bastante opinado en cómo hacerlo. La forma en que lo hace es que primero busca todos los mensajes que has enviado. Luego busca mensajes donde estás respondiendo a un correo electrónico anterior. Luego recupera ese correo electrónico anterior y crea un ejemplo de entrenamiento de ese correo electrónico, seguido de tu correo electrónico.

Tenga en cuenta que aquí hay claras limitaciones. Por ejemplo, todos los ejemplos creados solo están mirando el correo electrónico anterior para el contexto.

Para usar:

- Configurar una cuenta de desarrollador de Google: Vaya a la consola de desarrollador de Google, cree un proyecto y habilite la API de Gmail para ese proyecto. Esto le dará un archivo credentials.json que necesitará más adelante.

- Instalar la biblioteca de clientes de Google: Ejecute el siguiente comando para instalar la biblioteca de clientes de Google:

```python
%pip install --upgrade --quiet  google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client
```

```python
import os.path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]


creds = None
# The file token.json stores the user's access and refresh tokens, and is
# created automatically when the authorization flow completes for the first
# time.
if os.path.exists("email_token.json"):
    creds = Credentials.from_authorized_user_file("email_token.json", SCOPES)
# If there are no (valid) credentials available, let the user log in.
if not creds or not creds.valid:
    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
    else:
        flow = InstalledAppFlow.from_client_secrets_file(
            # your creds file here. Please create json file as here https://cloud.google.com/docs/authentication/getting-started
            "creds.json",
            SCOPES,
        )
        creds = flow.run_local_server(port=0)
    # Save the credentials for the next run
    with open("email_token.json", "w") as token:
        token.write(creds.to_json())
```

```python
from langchain_community.chat_loaders.gmail import GMailLoader
```

```python
loader = GMailLoader(creds=creds, n=3)
```

```python
data = loader.load()
```

```python
# Sometimes there can be errors which we silently ignore
len(data)
```

```output
2
```

```python
from langchain_community.chat_loaders.utils import (
    map_ai_messages,
)
```

```python
# This makes messages sent by hchase@langchain.com the AI Messages
# This means you will train an LLM to predict as if it's responding as hchase
training_data = list(
    map_ai_messages(data, sender="Harrison Chase <hchase@langchain.com>")
)
```
