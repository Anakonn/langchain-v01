---
translated: true
---

# Microsoft OneDrive

>[Microsoft OneDrive](https://en.wikipedia.org/wiki/OneDrive) (anciennement `SkyDrive`) est un service d'hébergement de fichiers exploité par Microsoft.

Ce cahier de notes couvre comment charger des documents à partir de `OneDrive`. Actuellement, seuls les fichiers docx, doc et pdf sont pris en charge.

## Prérequis

1. Enregistrez une application avec les [instructions de la plateforme d'identité Microsoft](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app).
2. Lorsque l'enregistrement est terminé, le portail Azure affiche le volet Vue d'ensemble de l'enregistrement de l'application. Vous voyez l'ID d'application (client). Également appelée `client ID`, cette valeur identifie de manière unique votre application sur la plateforme d'identité Microsoft.
3. Lors des étapes que vous suivrez à **l'élément 1**, vous pouvez définir l'URI de redirection sur `http://localhost:8000/callback`.
4. Lors des étapes que vous suivrez à **l'élément 1**, générez un nouveau mot de passe (`client_secret`) dans la section Secrets d'application.
5. Suivez les instructions de ce [document](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-configure-app-expose-web-apis#add-a-scope) pour ajouter les `SCOPES` suivants (`offline_access` et `Files.Read.All`) à votre application.
6. Visitez le [Graph Explorer Playground](https://developer.microsoft.com/en-us/graph/graph-explorer) pour obtenir votre `ID OneDrive`. La première étape consiste à vous assurer que vous êtes connecté avec le compte associé à votre compte OneDrive. Ensuite, vous devez faire une demande à `https://graph.microsoft.com/v1.0/me/drive` et la réponse renverra une charge utile avec un champ `id` qui contient l'ID de votre compte OneDrive.
7. Vous devez installer le package o365 à l'aide de la commande `pip install o365`.
8. À la fin des étapes, vous devez avoir les valeurs suivantes :
- `CLIENT_ID`
- `CLIENT_SECRET`
- `DRIVE_ID`

## 🧑 Instructions pour ingérer vos documents à partir d'OneDrive

### 🔑 Authentification

Par défaut, le `OneDriveLoader` s'attend à ce que les valeurs de `CLIENT_ID` et `CLIENT_SECRET` soient stockées en tant que variables d'environnement nommées `O365_CLIENT_ID` et `O365_CLIENT_SECRET` respectivement. Vous pourriez passer ces variables d'environnement via un fichier `.env` à la racine de votre application ou en utilisant la commande suivante dans votre script.

```python
os.environ['O365_CLIENT_ID'] = "YOUR CLIENT ID"
os.environ['O365_CLIENT_SECRET'] = "YOUR CLIENT SECRET"
```

Ce chargeur utilise une authentification appelée [*au nom d'un utilisateur*](https://learn.microsoft.com/en-us/graph/auth-v2-user?context=graph%2Fapi%2F1.0&view=graph-rest-1.0). Il s'agit d'une authentification en 2 étapes avec le consentement de l'utilisateur. Lorsque vous instanciez le chargeur, il imprimera une URL que l'utilisateur doit visiter pour donner son consentement à l'application sur les autorisations requises. L'utilisateur doit ensuite visiter cette URL et donner son consentement à l'application. L'utilisateur doit alors copier l'URL de la page résultante et la coller dans la console. La méthode renverra alors True si la tentative de connexion a réussi.

```python
from langchain_community.document_loaders.onedrive import OneDriveLoader

loader = OneDriveLoader(drive_id="YOUR DRIVE ID")
```

Une fois l'authentification effectuée, le chargeur stockera un jeton (`o365_token.txt`) dans le dossier `~/.credentials/`. Ce jeton pourrait être utilisé ultérieurement pour s'authentifier sans les étapes de copie/collage expliquées précédemment. Pour utiliser ce jeton pour l'authentification, vous devez changer le paramètre `auth_with_token` sur True lors de l'instanciation du chargeur.

```python
from langchain_community.document_loaders.onedrive import OneDriveLoader

loader = OneDriveLoader(drive_id="YOUR DRIVE ID", auth_with_token=True)
```

### 🗂️ Chargeur de documents

#### 📑 Chargement de documents à partir d'un répertoire OneDrive

`OneDriveLoader` peut charger des documents à partir d'un dossier spécifique dans votre OneDrive. Par exemple, vous voulez charger tous les documents stockés dans le dossier `Documents/clients` de votre OneDrive.

```python
from langchain_community.document_loaders.onedrive import OneDriveLoader

loader = OneDriveLoader(drive_id="YOUR DRIVE ID", folder_path="Documents/clients", auth_with_token=True)
documents = loader.load()
```

#### 📑 Chargement de documents à partir d'une liste d'ID de documents

Une autre possibilité est de fournir une liste d'`object_id` pour chaque document que vous voulez charger. Pour cela, vous devrez interroger l'[API Microsoft Graph](https://developer.microsoft.com/en-us/graph/graph-explorer) pour trouver tous les ID de documents qui vous intéressent. Ce [lien](https://learn.microsoft.com/en-us/graph/api/resources/onedrive?view=graph-rest-1.0#commonly-accessed-resources) fournit une liste de points de terminaison qui seront utiles pour récupérer les ID des documents.

Par exemple, pour récupérer des informations sur tous les objets stockés à la racine du dossier Documents, vous devez faire une demande à : `https://graph.microsoft.com/v1.0/drives/{YOUR DRIVE ID}/root/children`. Une fois que vous avez la liste des ID qui vous intéressent, vous pouvez alors instancier le chargeur avec les paramètres suivants.

```python
from langchain_community.document_loaders.onedrive import OneDriveLoader

loader = OneDriveLoader(drive_id="YOUR DRIVE ID", object_ids=["ID_1", "ID_2"], auth_with_token=True)
documents = loader.load()
```
