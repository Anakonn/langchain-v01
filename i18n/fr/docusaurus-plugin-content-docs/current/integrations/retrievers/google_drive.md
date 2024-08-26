---
translated: true
---

# Google Drive

Ce cahier de notes couvre comment récupérer des documents à partir de `Google Drive`.

## Prérequis

1. Créez un projet Google Cloud ou utilisez un projet existant
1. Activez l'[API Google Drive](https://console.cloud.google.com/flows/enableapi?apiid=drive.googleapis.com)
1. [Autorisez les identifiants pour l'application de bureau](https://developers.google.com/drive/api/quickstart/python#authorize_credentials_for_a_desktop_application)
1. `pip install --upgrade google-api-python-client google-auth-httplib2 google-auth-oauthlib`

## Récupérer les documents Google

Par défaut, le `GoogleDriveRetriever` s'attend à ce que le fichier `credentials.json` soit `~/.credentials/credentials.json`, mais cela peut être configuré en utilisant la variable d'environnement `GOOGLE_ACCOUNT_FILE`.
L'emplacement de `token.json` utilise le même répertoire (ou utilisez le paramètre `token_path`). Notez que `token.json` sera créé automatiquement la première fois que vous utiliserez le récupérateur.

`GoogleDriveRetriever` peut récupérer une sélection de fichiers avec quelques requêtes.

Par défaut, si vous utilisez un `folder_id`, tous les fichiers à l'intérieur de ce dossier peuvent être récupérés dans `Document`.

Vous pouvez obtenir l'identifiant de votre dossier et de votre document à partir de l'URL :

* Dossier : https://drive.google.com/drive/u/0/folders/1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5 -> l'identifiant du dossier est `"1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5"`
* Document : https://docs.google.com/document/d/1bfaMQ18_i56204VaQDVeAFpqEijJTgvurupdEDiaUQw/edit -> l'identifiant du document est `"1bfaMQ18_i56204VaQDVeAFpqEijJTgvurupdEDiaUQw"`

La valeur spéciale `root` est pour votre accueil personnel.

```python
from langchain_googledrive.retrievers import GoogleDriveRetriever

folder_id = "root"
# folder_id='1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5'

retriever = GoogleDriveRetriever(
    num_results=2,
)
```

Par défaut, tous les fichiers avec ces types MIME peuvent être convertis en `Document`.

- `text/text`
- `text/plain`
- `text/html`
- `text/csv`
- `text/markdown`
- `image/png`
- `image/jpeg`
- `application/epub+zip`
- `application/pdf`
- `application/rtf`
- `application/vnd.google-apps.document` (GDoc)
- `application/vnd.google-apps.presentation` (GSlide)
- `application/vnd.google-apps.spreadsheet` (GSheet)
- `application/vnd.google.colaboratory` (Notebook colab)
- `application/vnd.openxmlformats-officedocument.presentationml.presentation` (PPTX)
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (DOCX)

Il est possible de mettre à jour ou de personnaliser cela. Consultez la documentation de `GoogleDriveRetriever`.

Mais, les packages correspondants doivent être installés.

```python
%pip install --upgrade --quiet  unstructured
```

```python
retriever.invoke("machine learning")
```

Vous pouvez personnaliser les critères de sélection des fichiers. Un ensemble de filtres prédéfinis sont proposés :

| Modèle                                 | Description                                                           |
| --------------------------------------   | --------------------------------------------------------------------- |
| `gdrive-all-in-folder`                   | Renvoie tous les fichiers compatibles d'un `folder_id`                        |
| `gdrive-query`                           | Recherche `query` dans tous les drives                                          |
| `gdrive-by-name`                         | Recherche le fichier avec le nom `query`                                         |
| `gdrive-query-in-folder`                 | Recherche `query` dans `folder_id` (et les sous-dossiers avec `_recursive=true`)  |
| `gdrive-mime-type`                       | Recherche un `mime_type` spécifique                                         |
| `gdrive-mime-type-in-folder`             | Recherche un `mime_type` spécifique dans `folder_id`                          |
| `gdrive-query-with-mime-type`            | Recherche `query` avec un `mime_type` spécifique                            |
| `gdrive-query-with-mime-type-and-folder` | Recherche `query` avec un `mime_type` spécifique et dans `folder_id`         |

```python
retriever = GoogleDriveRetriever(
    template="gdrive-query",  # Search everywhere
    num_results=2,  # But take only 2 documents
)
for doc in retriever.invoke("machine learning"):
    print("---")
    print(doc.page_content.strip()[:60] + "...")
```

Sinon, vous pouvez personnaliser l'invite avec un `PromptTemplate` spécialisé

```python
from langchain_core.prompts import PromptTemplate

retriever = GoogleDriveRetriever(
    template=PromptTemplate(
        input_variables=["query"],
        # See https://developers.google.com/drive/api/guides/search-files
        template="(fullText contains '{query}') "
        "and mimeType='application/vnd.google-apps.document' "
        "and modifiedTime > '2000-01-01T00:00:00' "
        "and trashed=false",
    ),
    num_results=2,
    # See https://developers.google.com/drive/api/v3/reference/files/list
    includeItemsFromAllDrives=False,
    supportsAllDrives=False,
)
for doc in retriever.invoke("machine learning"):
    print(f"{doc.metadata['name']}:")
    print("---")
    print(doc.page_content.strip()[:60] + "...")
```

## Utiliser la métadonnée 'description' de Google Drive

Chaque Google Drive a un champ `description` dans les métadonnées (voir les *détails d'un fichier*).
Utilisez le mode `snippets` pour renvoyer la description des fichiers sélectionnés.

```python
retriever = GoogleDriveRetriever(
    template="gdrive-mime-type-in-folder",
    folder_id=folder_id,
    mime_type="application/vnd.google-apps.document",  # Only Google Docs
    num_results=2,
    mode="snippets",
    includeItemsFromAllDrives=False,
    supportsAllDrives=False,
)
retriever.invoke("machine learning")
```
