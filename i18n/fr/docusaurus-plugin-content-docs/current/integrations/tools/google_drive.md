---
translated: true
---

# Google Drive

Ce carnet de notes explique comment connecter un LangChain à l'`API Google Drive`.

## Prérequis

1. Créez un projet Google Cloud ou utilisez un projet existant
1. Activez l'[API Google Drive](https://console.cloud.google.com/flows/enableapi?apiid=drive.googleapis.com)
1. [Autorisez les identifiants pour l'application de bureau](https://developers.google.com/drive/api/quickstart/python#authorize_credentials_for_a_desktop_application)
1. `pip install --upgrade google-api-python-client google-auth-httplib2 google-auth-oauthlib`

## Instructions pour récupérer vos données Google Docs

Par défaut, `GoogleDriveTools` et `GoogleDriveWrapper` s'attendent à ce que le fichier `credentials.json` soit `~/.credentials/credentials.json`, mais cela peut être configuré à l'aide de la variable d'environnement `GOOGLE_ACCOUNT_FILE`.
L'emplacement de `token.json` utilise le même répertoire (ou utilisez le paramètre `token_path`). Notez que `token.json` sera créé automatiquement la première fois que vous utiliserez l'outil.

`GoogleDriveSearchTool` peut récupérer une sélection de fichiers avec quelques requêtes.

Par défaut, si vous utilisez un `folder_id`, tous les fichiers à l'intérieur de ce dossier peuvent être récupérés dans `Document`, si le nom correspond à la requête.

```python
%pip install --upgrade --quiet  google-api-python-client google-auth-httplib2 google-auth-oauthlib
```

Vous pouvez obtenir l'identifiant de votre dossier et de votre document à partir de l'URL :

* Dossier : https://drive.google.com/drive/u/0/folders/1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5 -> l'identifiant du dossier est `"1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5"`
* Document : https://docs.google.com/document/d/1bfaMQ18_i56204VaQDVeAFpqEijJTgvurupdEDiaUQw/edit -> l'identifiant du document est `"1bfaMQ18_i56204VaQDVeAFpqEijJTgvurupdEDiaUQw"`

La valeur spéciale `root` est pour votre accueil personnel.

```python
folder_id = "root"
# folder_id='1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5'
```

Par défaut, tous les fichiers avec ces types MIME peuvent être convertis en `Document`.
- text/text
- text/plain
- text/html
- text/csv
- text/markdown
- image/png
- image/jpeg
- application/epub+zip
- application/pdf
- application/rtf
- application/vnd.google-apps.document (GDoc)
- application/vnd.google-apps.presentation (GSlide)
- application/vnd.google-apps.spreadsheet (GSheet)
- application/vnd.google.colaboratory (Notebook colab)
- application/vnd.openxmlformats-officedocument.presentationml.presentation (PPTX)
- application/vnd.openxmlformats-officedocument.wordprocessingml.document (DOCX)

Il est possible de mettre à jour ou de personnaliser cela. Consultez la documentation de `GoogleDriveAPIWrapper`.

Mais, les packages correspondants doivent être installés.

```python
%pip install --upgrade --quiet  unstructured
```

```python
from langchain_googldrive.tools.google_drive.tool import GoogleDriveSearchTool
from langchain_googledrive.utilities.google_drive import GoogleDriveAPIWrapper

# By default, search only in the filename.
tool = GoogleDriveSearchTool(
    api_wrapper=GoogleDriveAPIWrapper(
        folder_id=folder_id,
        num_results=2,
        template="gdrive-query-in-folder",  # Search in the body of documents
    )
)
```

```python
import logging

logging.basicConfig(level=logging.INFO)
```

```python
tool.run("machine learning")
```

```python
tool.description
```

```python
from langchain.agents import load_tools

tools = load_tools(
    ["google-drive-search"],
    folder_id=folder_id,
    template="gdrive-query-in-folder",
)
```

## Utilisation dans un Agent

```python
from langchain.agents import AgentType, initialize_agent
from langchain_openai import OpenAI

llm = OpenAI(temperature=0)
agent = initialize_agent(
    tools=tools,
    llm=llm,
    agent=AgentType.STRUCTURED_CHAT_ZERO_SHOT_REACT_DESCRIPTION,
)
```

```python
agent.run("Search in google drive, who is 'Yann LeCun' ?")
```
