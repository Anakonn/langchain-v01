---
translated: true
---

# GMail

Ce chargeur explique comment charger des données à partir de GMail. Il existe de nombreuses façons dont vous pourriez vouloir charger des données à partir de GMail. Ce chargeur est actuellement assez opinionné sur la manière de le faire. La façon dont il procède est qu'il recherche d'abord tous les messages que vous avez envoyés. Il recherche ensuite les messages où vous répondez à un e-mail précédent. Il récupère ensuite cet e-mail précédent et crée un exemple d'entraînement de cet e-mail, suivi de votre e-mail.

Notez qu'il y a des limites évidentes ici. Par exemple, tous les exemples créés ne tiennent compte que du précédent e-mail pour le contexte.

Pour utiliser :

- Configurez un compte de développeur Google : Allez sur la console de développement Google, créez un projet et activez l'API Gmail pour ce projet. Cela vous donnera un fichier `credentials.json` dont vous aurez besoin plus tard.

- Installez la bibliothèque client Google : Exécutez la commande suivante pour installer la bibliothèque client Google :

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
