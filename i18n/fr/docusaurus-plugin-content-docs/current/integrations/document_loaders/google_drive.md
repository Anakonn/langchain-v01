---
translated: true
---

# Google Drive

>[Google Drive](https://en.wikipedia.org/wiki/Google_Drive) est un service de stockage et de synchronisation de fichiers développé par Google.

Ce notebook couvre comment charger des documents à partir de `Google Drive`. Actuellement, seuls les `Google Docs` sont pris en charge.

## Prérequis

1. Créez un projet Google Cloud ou utilisez un projet existant
1. Activez l'[API Google Drive](https://console.cloud.google.com/flows/enableapi?apiid=drive.googleapis.com)
1. [Autorisez les identifiants pour l'application de bureau](https://developers.google.com/drive/api/quickstart/python#authorize_credentials_for_a_desktop_application)
1. `pip install --upgrade google-api-python-client google-auth-httplib2 google-auth-oauthlib`

## 🧑 Instructions pour ingérer vos données Google Docs

Définissez la variable d'environnement `GOOGLE_APPLICATION_CREDENTIALS` sur une chaîne vide (`""`).

Par défaut, le `GoogleDriveLoader` s'attend à ce que le fichier `credentials.json` soit situé dans `~/.credentials/credentials.json`, mais cela est configurable à l'aide de l'argument de mot-clé `credentials_path`. Même chose pour `token.json` - chemin par défaut : `~/.credentials/token.json`, paramètre du constructeur : `token_path`.

La première fois que vous utilisez GoogleDriveLoader, l'écran de consentement s'affichera dans votre navigateur pour l'authentification de l'utilisateur. Après l'authentification, `token.json` sera créé automatiquement dans le chemin fourni ou le chemin par défaut. De plus, s'il y a déjà un `token.json` à ce chemin, vous ne serez pas invité à vous authentifier.

`GoogleDriveLoader` peut charger à partir d'une liste d'identifiants de documents Google Docs ou d'un identifiant de dossier. Vous pouvez obtenir l'identifiant de votre dossier et de votre document à partir de l'URL :

* Dossier : https://drive.google.com/drive/u/0/folders/1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5 -> l'identifiant du dossier est `"1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5"`
* Document : https://docs.google.com/document/d/1bfaMQ18_i56204VaQDVeAFpqEijJTgvurupdEDiaUQw/edit -> l'identifiant du document est `"1bfaMQ18_i56204VaQDVeAFpqEijJTgvurupdEDiaUQw"`

```python
%pip install --upgrade --quiet langchain-google-community[drive]
```

```python
from langchain_google_community import GoogleDriveLoader
```

```python
loader = GoogleDriveLoader(
    folder_id="1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5",
    token_path="/path/where/you/want/token/to/be/created/google_token.json",
    # Optional: configure whether to recursively fetch files from subfolders. Defaults to False.
    recursive=False,
)
```

```python
docs = loader.load()
```

Lorsque vous passez un `folder_id`, par défaut, tous les fichiers de type document, feuille de calcul et pdf sont chargés. Vous pouvez modifier ce comportement en passant un argument `file_types`

```python
loader = GoogleDriveLoader(
    folder_id="1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5",
    file_types=["document", "sheet"],
    recursive=False,
)
```

## Passer des chargeurs de fichiers en option

Lors du traitement de fichiers autres que Google Docs et Google Sheets, il peut être utile de passer un chargeur de fichiers en option à `GoogleDriveLoader`. Si vous passez un chargeur de fichiers, ce chargeur de fichiers sera utilisé sur les documents qui n'ont pas de type MIME Google Docs ou Google Sheets. Voici un exemple de la façon de charger un document Excel à partir de Google Drive à l'aide d'un chargeur de fichiers.

```python
from langchain_community.document_loaders import UnstructuredFileIOLoader
from langchain_google_community import GoogleDriveLoader
```

```python
file_id = "1x9WBtFPWMEAdjcJzPScRsjpjQvpSo_kz"
loader = GoogleDriveLoader(
    file_ids=[file_id],
    file_loader_cls=UnstructuredFileIOLoader,
    file_loader_kwargs={"mode": "elements"},
)
```

```python
docs = loader.load()
```

```python
docs[0]
```

Vous pouvez également traiter un dossier avec un mélange de fichiers et de Google Docs/Sheets à l'aide du modèle suivant :

```python
folder_id = "1asMOHY1BqBS84JcRbOag5LOJac74gpmD"
loader = GoogleDriveLoader(
    folder_id=folder_id,
    file_loader_cls=UnstructuredFileIOLoader,
    file_loader_kwargs={"mode": "elements"},
)
```

```python
docs = loader.load()
```

```python
docs[0]
```

## Utilisation étendue

Un composant externe (non officiel) peut gérer la complexité de Google Drive : `langchain-googledrive`
Il est compatible avec le `langchain_community.document_loaders.GoogleDriveLoader` et peut être utilisé
à sa place.

Pour être compatible avec les conteneurs, l'authentification utilise une variable d'environnement `GOOGLE_ACCOUNT_FILE` pour le fichier d'identification (pour l'utilisateur ou le service).

```python
%pip install --upgrade --quiet  langchain-googledrive
```

```python
folder_id = "root"
# folder_id='1yucgL9WGgWZdM1TOuKkeghlPizuzMYb5'
```

```python
# Use the advanced version.
from langchain_googledrive.document_loaders import GoogleDriveLoader
```

```python
loader = GoogleDriveLoader(
    folder_id=folder_id,
    recursive=False,
    num_results=2,  # Maximum number of file to load
)
```

Par défaut, tous les fichiers avec ce type MIME peuvent être convertis en `Document`.
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

Il est possible de mettre à jour ou de personnaliser cela. Consultez la documentation de `GDriveLoader`.

Mais, les packages correspondants doivent être installés.

```python
%pip install --upgrade --quiet  unstructured
```

```python
for doc in loader.load():
    print("---")
    print(doc.page_content.strip()[:60] + "...")
```

### Chargement des identités d'authentification

Les identités autorisées pour chaque fichier ingéré par Google Drive Loader peuvent être chargées avec les métadonnées par Document.

```python
from langchain_google_community import GoogleDriveLoader

loader = GoogleDriveLoader(
    folder_id=folder_id,
    load_auth=True,
    # Optional: configure whether to load authorized identities for each Document.
)

doc = loader.load()
```

Vous pouvez passer load_auth=True, pour ajouter les identités d'accès aux documents Google Drive aux métadonnées.

```python
doc[0].metadata
```

### Chargement des métadonnées étendues

Les champs supplémentaires suivants peuvent également être récupérés dans les métadonnées de chaque Document :
 - full_path - Chemin complet du/des fichier(s) dans Google Drive.
 - owner - propriétaire du/des fichier(s).
 - size - taille du/des fichier(s).

```python
from langchain_google_community import GoogleDriveLoader

loader = GoogleDriveLoader(
    folder_id=folder_id,
    load_extended_matadata=True,
    # Optional: configure whether to load extended metadata for each Document.
)

doc = loader.load()
```

Vous pouvez passer load_extended_matadata=True, pour ajouter les détails étendus des documents Google Drive aux métadonnées.

```python
doc[0].metadata
```

### Personnaliser le modèle de recherche

Tous les paramètres compatibles avec l'API Google [`list()`](https://developers.google.com/drive/api/v3/reference/files/list) peuvent être définis.

Pour spécifier le nouveau modèle de la requête Google, vous pouvez utiliser un `PromptTemplate()`. 
Les variables pour l'invite peuvent être définies avec `kwargs` dans le constructeur.
Certaines requêtes pré-formatées sont proposées (utilisez `{query}`, `{folder_id}` et/ou `{mime_type}`):

Vous pouvez personnaliser les critères de sélection des fichiers. Un ensemble de filtres prédéfinis sont proposés :

| modèle                                | description                                                           |
| -------------------------------------- | --------------------------------------------------------------------- |
| gdrive-all-in-folder                   | Renvoie tous les fichiers compatibles d'un `folder_id`                |
| gdrive-query                           | Recherche `query` dans tous les disques                              |
| gdrive-by-name                         | Recherche le fichier avec le nom `query`                            |
| gdrive-query-in-folder                 | Recherche `query` dans `folder_id` (et les sous-dossiers si `recursive=true`) |
| gdrive-mime-type                       | Recherche un `mime_type` spécifique                                 |
| gdrive-mime-type-in-folder             | Recherche un `mime_type` spécifique dans `folder_id`                |
| gdrive-query-with-mime-type            | Recherche `query` avec un `mime_type` spécifique                   |
| gdrive-query-with-mime-type-and-folder | Recherche `query` avec un `mime_type` spécifique et dans `folder_id` |

```python
loader = GoogleDriveLoader(
    folder_id=folder_id,
    recursive=False,
    template="gdrive-query",  # Default template to use
    query="machine learning",
    num_results=2,  # Maximum number of file to load
    supportsAllDrives=False,  # GDrive `list()` parameter
)
for doc in loader.load():
    print("---")
    print(doc.page_content.strip()[:60] + "...")
```

Vous pouvez personnaliser votre modèle.

```python
from langchain_core.prompts.prompt import PromptTemplate

loader = GoogleDriveLoader(
    folder_id=folder_id,
    recursive=False,
    template=PromptTemplate(
        input_variables=["query", "query_name"],
        template="fullText contains '{query}' and name contains '{query_name}' and trashed=false",
    ),  # Default template to use
    query="machine learning",
    query_name="ML",
    num_results=2,  # Maximum number of file to load
)
for doc in loader.load():
    print("---")
    print(doc.page_content.strip()[:60] + "...")
```

La conversion peut gérer le format Markdown :
- puce
- lien
- tableau
- titres

Définissez l'attribut `return_link` sur `True` pour exporter les liens.

#### Modes pour GSlide et GSheet

Le paramètre mode accepte différentes valeurs :

- "document" : renvoie le corps de chaque document
- "snippets" : renvoie la description de chaque fichier (définie dans les métadonnées des fichiers Google Drive).

Le paramètre `gslide_mode` accepte différentes valeurs :

- "single" : un document avec &lt;SAUT DE PAGE&gt;
- "slide" : un document par diapositive
- "elements" : un document pour chaque élément.

```python
loader = GoogleDriveLoader(
    template="gdrive-mime-type",
    mime_type="application/vnd.google-apps.presentation",  # Only GSlide files
    gslide_mode="slide",
    num_results=2,  # Maximum number of file to load
)
for doc in loader.load():
    print("---")
    print(doc.page_content.strip()[:60] + "...")
```

Le paramètre `gsheet_mode` accepte différentes valeurs :
- `"single"` : Générer un document par ligne
- `"elements"` : un document avec un tableau markdown et des balises &lt;SAUT DE PAGE&gt;.

```python
loader = GoogleDriveLoader(
    template="gdrive-mime-type",
    mime_type="application/vnd.google-apps.spreadsheet",  # Only GSheet files
    gsheet_mode="elements",
    num_results=2,  # Maximum number of file to load
)
for doc in loader.load():
    print("---")
    print(doc.page_content.strip()[:60] + "...")
```

### Utilisation avancée

Tous les fichiers Google ont une 'description' dans les métadonnées. Ce champ peut être utilisé pour mémoriser un résumé du document ou d'autres balises indexées (voir la méthode `lazy_update_description_with_summary()`).

Si vous utilisez le `mode="snippet"`, seule la description sera utilisée pour le corps. Sinon, le `metadata['summary']` a le champ.

Parfois, un filtre spécifique peut être utilisé pour extraire certaines informations du nom de fichier, pour sélectionner certains fichiers avec des critères spécifiques. Vous pouvez utiliser un filtre.

Parfois, de nombreux documents sont renvoyés. Il n'est pas nécessaire d'avoir tous les documents en mémoire en même temps. Vous pouvez utiliser les versions paresseuses des méthodes, pour obtenir un document à la fois. Il est préférable d'utiliser une requête complexe plutôt qu'une recherche récursive. Pour chaque dossier, une requête doit être appliquée si vous activez `recursive=True`.

```python
import os

loader = GoogleDriveLoader(
    gdrive_api_file=os.environ["GOOGLE_ACCOUNT_FILE"],
    num_results=2,
    template="gdrive-query",
    filter=lambda search, file: "#test" not in file.get("description", ""),
    query="machine learning",
    supportsAllDrives=False,
)
for doc in loader.load():
    print("---")
    print(doc.page_content.strip()[:60] + "...")
```
