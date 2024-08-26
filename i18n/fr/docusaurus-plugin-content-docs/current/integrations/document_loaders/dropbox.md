---
translated: true
---

# Dropbox

[Dropbox](https://en.wikipedia.org/wiki/Dropbox) est un service d'hébergement de fichiers qui rassemble tout - fichiers traditionnels, contenu cloud et raccourcis web - en un seul endroit.

Ce notebook couvre comment charger des documents à partir de *Dropbox*. En plus des fichiers courants tels que les fichiers texte et PDF, il prend également en charge les fichiers *Dropbox Paper*.

## Prérequis

1. Créez une application Dropbox.
2. Accordez à l'application ces autorisations de portée : `files.metadata.read` et `files.content.read`.
3. Générez un jeton d'accès : https://www.dropbox.com/developers/apps/create.
4. `pip install dropbox` (nécessite `pip install "unstructured[pdf]"` pour le type de fichier PDF).

## Instructions

`DropboxLoader`` nécessite que vous créiez une application Dropbox et génériez un jeton d'accès. Cela peut être fait à partir de https://www.dropbox.com/developers/apps/create. Vous devez également avoir le SDK Python Dropbox installé (pip install dropbox).

DropboxLoader peut charger des données à partir d'une liste de chemins de fichiers Dropbox ou d'un seul chemin de dossier Dropbox. Les deux chemins doivent être relatifs au répertoire racine du compte Dropbox lié au jeton d'accès.

```python
pip install dropbox
```

```output
Requirement already satisfied: dropbox in /Users/rbarragan/.local/share/virtualenvs/langchain-kv0dsrF5/lib/python3.11/site-packages (11.36.2)
Requirement already satisfied: requests>=2.16.2 in /Users/rbarragan/.local/share/virtualenvs/langchain-kv0dsrF5/lib/python3.11/site-packages (from dropbox) (2.31.0)
Requirement already satisfied: six>=1.12.0 in /Users/rbarragan/.local/share/virtualenvs/langchain-kv0dsrF5/lib/python3.11/site-packages (from dropbox) (1.16.0)
Requirement already satisfied: stone>=2 in /Users/rbarragan/.local/share/virtualenvs/langchain-kv0dsrF5/lib/python3.11/site-packages (from dropbox) (3.3.1)
Requirement already satisfied: charset-normalizer<4,>=2 in /Users/rbarragan/.local/share/virtualenvs/langchain-kv0dsrF5/lib/python3.11/site-packages (from requests>=2.16.2->dropbox) (3.2.0)
Requirement already satisfied: idna<4,>=2.5 in /Users/rbarragan/.local/share/virtualenvs/langchain-kv0dsrF5/lib/python3.11/site-packages (from requests>=2.16.2->dropbox) (3.4)
Requirement already satisfied: urllib3<3,>=1.21.1 in /Users/rbarragan/.local/share/virtualenvs/langchain-kv0dsrF5/lib/python3.11/site-packages (from requests>=2.16.2->dropbox) (2.0.4)
Requirement already satisfied: certifi>=2017.4.17 in /Users/rbarragan/.local/share/virtualenvs/langchain-kv0dsrF5/lib/python3.11/site-packages (from requests>=2.16.2->dropbox) (2023.7.22)
Requirement already satisfied: ply>=3.4 in /Users/rbarragan/.local/share/virtualenvs/langchain-kv0dsrF5/lib/python3.11/site-packages (from stone>=2->dropbox) (3.11)
Note: you may need to restart the kernel to use updated packages.
```

```python
from langchain_community.document_loaders import DropboxLoader
```

```python
# Generate access token: https://www.dropbox.com/developers/apps/create.
dropbox_access_token = "<DROPBOX_ACCESS_TOKEN>"
# Dropbox root folder
dropbox_folder_path = ""
```

```python
loader = DropboxLoader(
    dropbox_access_token=dropbox_access_token,
    dropbox_folder_path=dropbox_folder_path,
    recursive=False,
)
```

```python
documents = loader.load()
```

```output
File /JHSfLKn0.jpeg could not be decoded as text. Skipping.
File /A REPORT ON WILES’ CAMBRIDGE LECTURES.pdf could not be decoded as text. Skipping.
```

```python
for document in documents:
    print(document)
```
