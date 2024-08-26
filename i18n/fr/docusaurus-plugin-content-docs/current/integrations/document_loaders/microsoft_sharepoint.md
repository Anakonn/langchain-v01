---
translated: true
---

# Microsoft SharePoint

> [Microsoft SharePoint](https://en.wikipedia.org/wiki/SharePoint) est un système de collaboration basé sur un site web qui utilise des applications de workflow, des bases de données "liste" et d'autres éléments web et fonctionnalités de sécurité pour permettre aux équipes d'entreprise de travailler ensemble, développé par Microsoft.

Ce cahier couvre comment charger des documents à partir de la [bibliothèque de documents SharePoint](https://support.microsoft.com/en-us/office/what-is-a-document-library-3b5976dd-65cf-4c9e-bf5a-713c10ca2872). Actuellement, seuls les fichiers docx, doc et pdf sont pris en charge.

## Prérequis

1. Enregistrez une application avec les [instructions de la plateforme d'identité Microsoft](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app).
2. Lorsque l'enregistrement est terminé, le portail Azure affiche le volet Vue d'ensemble de l'enregistrement de l'application. Vous voyez l'ID d'application (client). Également appelée `client ID`, cette valeur identifie de manière unique votre application sur la plateforme d'identité Microsoft.
3. Lors des étapes que vous suivrez à **l'élément 1**, vous pouvez définir l'URI de redirection sur `https://login.microsoftonline.com/common/oauth2/nativeclient`
4. Lors des étapes que vous suivrez à **l'élément 1**, générez un nouveau mot de passe (`client_secret`) dans la section Secrets d'application.
5. Suivez les instructions de ce [document](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-configure-app-expose-web-apis#add-a-scope) pour ajouter les `SCOPES` suivants (`offline_access` et `Sites.Read.All`) à votre application.
6. Pour récupérer des fichiers à partir de votre **bibliothèque de documents**, vous aurez besoin de son ID. Pour l'obtenir, vous aurez besoin des valeurs de `Nom du locataire`, `ID de collection` et `ID de sous-site`.
7. Pour trouver votre `Nom du locataire`, suivez les instructions de ce [document](https://learn.microsoft.com/en-us/azure/active-directory-b2c/tenant-management-read-tenant-name). Une fois que vous l'avez, supprimez simplement `.onmicrosoft.com` de la valeur et conservez le reste comme votre `Nom du locataire`.
8. Pour obtenir votre `ID de collection` et votre `ID de sous-site`, vous aurez besoin de votre **nom de site SharePoint**. L'URL de votre site **SharePoint** a le format suivant `https://<nom-locataire>.sharepoint.com/sites/<nom-site>`. La dernière partie de cette URL est le `nom-site`.
9. Pour obtenir l'ID de site `Collection ID`, accédez à cette URL dans le navigateur : `https://<locataire>.sharepoint.com/sites/<nom-site>/_api/site/id` et copiez la valeur de la propriété `Edm.Guid`.
10. Pour obtenir l'`ID de sous-site` (ou ID de site web), utilisez : `https://<locataire>.sharepoint.com/sites/<nom-site>/_api/web/id` et copiez la valeur de la propriété `Edm.Guid`.
11. L'`ID de site SharePoint` a le format suivant : `<nom-locataire>.sharepoint.com,<ID de collection>,<ID de sous-site>`. Vous pouvez conserver cette valeur pour l'utiliser à l'étape suivante.
12. Visitez le [Graph Explorer Playground](https://developer.microsoft.com/en-us/graph/graph-explorer) pour obtenir votre `ID de bibliothèque de documents`. La première étape consiste à vous assurer que vous êtes connecté avec le compte associé à votre site **SharePoint**. Ensuite, vous devez faire une demande à `https://graph.microsoft.com/v1.0/sites/<ID de site SharePoint>/drive` et la réponse renverra une charge utile avec un champ `id` qui contient l'ID de votre `ID de bibliothèque de documents`.

## 🧑 Instructions pour ingérer vos documents à partir de la bibliothèque de documents SharePoint

### 🔑 Authentification

Par défaut, le `SharePointLoader` s'attend à ce que les valeurs de `CLIENT_ID` et `CLIENT_SECRET` soient stockées en tant que variables d'environnement nommées `O365_CLIENT_ID` et `O365_CLIENT_SECRET` respectivement. Vous pourriez passer ces variables d'environnement via un fichier `.env` à la racine de votre application ou en utilisant la commande suivante dans votre script.

```python
os.environ['O365_CLIENT_ID'] = "YOUR CLIENT ID"
os.environ['O365_CLIENT_SECRET'] = "YOUR CLIENT SECRET"
```

Ce chargeur utilise une authentification appelée [*au nom d'un utilisateur*](https://learn.microsoft.com/en-us/graph/auth-v2-user?context=graph%2Fapi%2F1.0&view=graph-rest-1.0). C'est une authentification en 2 étapes avec le consentement de l'utilisateur. Lorsque vous instanciez le chargeur, il imprimera une URL que l'utilisateur doit visiter pour donner son consentement à l'application sur les autorisations requises. L'utilisateur doit alors visiter cette URL et donner son consentement à l'application. L'utilisateur doit ensuite copier l'URL de la page résultante et la coller dans la console. La méthode renverra alors True si la tentative de connexion a réussi.

```python
from langchain_community.document_loaders.sharepoint import SharePointLoader

loader = SharePointLoader(document_library_id="YOUR DOCUMENT LIBRARY ID")
```

Une fois l'authentification effectuée, le chargeur stockera un jeton (`o365_token.txt`) dans le dossier `~/.credentials/`. Ce jeton pourrait être utilisé ultérieurement pour s'authentifier sans les étapes de copie/collage expliquées précédemment. Pour utiliser ce jeton pour l'authentification, vous devez changer le paramètre `auth_with_token` sur True lors de l'instanciation du chargeur.

```python
from langchain_community.document_loaders.sharepoint import SharePointLoader

loader = SharePointLoader(document_library_id="YOUR DOCUMENT LIBRARY ID", auth_with_token=True)
```

### 🗂️ Chargeur de documents

#### 📑 Chargement de documents à partir d'un répertoire de bibliothèque de documents

`SharePointLoader` peut charger des documents à partir d'un dossier spécifique dans votre bibliothèque de documents. Par exemple, vous voulez charger tous les documents stockés dans le dossier `Documents/marketing` de votre bibliothèque de documents.

```python
from langchain_community.document_loaders.sharepoint import SharePointLoader

loader = SharePointLoader(document_library_id="YOUR DOCUMENT LIBRARY ID", folder_path="Documents/marketing", auth_with_token=True)
documents = loader.load()
```

Si vous recevez l'erreur `Resource not found for the segment`, essayez d'utiliser `folder_id` au lieu du chemin du dossier, qui peut être obtenu à partir de l'[API Microsoft Graph](https://developer.microsoft.com/en-us/graph/graph-explorer)

```python
loader = SharePointLoader(document_library_id="YOUR DOCUMENT LIBRARY ID", auth_with_token=True
                          folder_id="<folder-id>")
documents = loader.load()
```

Si vous souhaitez charger des documents à partir du répertoire racine, vous pouvez omettre `folder_id`, `folder_path` et `documents_ids` et le chargeur chargera le répertoire racine.

```python
# loads documents from root directory
loader = SharePointLoader(document_library_id="YOUR DOCUMENT LIBRARY ID", auth_with_token=True)
documents = loader.load()
```

Combiné avec `recursive=True`, vous pouvez simplement charger tous les documents de l'ensemble de SharePoint :

```python
# loads documents from root directory
loader = SharePointLoader(document_library_id="YOUR DOCUMENT LIBRARY ID",
                          recursive=True,
                          auth_with_token=True)
documents = loader.load()
```

#### 📑 Chargement de documents à partir d'une liste d'ID de documents

Une autre possibilité est de fournir une liste d'`object_id` pour chaque document que vous souhaitez charger. Pour cela, vous devrez interroger l'[API Microsoft Graph](https://developer.microsoft.com/en-us/graph/graph-explorer) pour trouver tous les ID de documents qui vous intéressent. Ce [lien](https://learn.microsoft.com/en-us/graph/api/resources/onedrive?view=graph-rest-1.0#commonly-accessed-resources) fournit une liste de points de terminaison qui vous seront utiles pour récupérer les ID des documents.

Par exemple, pour récupérer des informations sur tous les objets stockés dans le dossier `data/finance/`, vous devez faire une demande à : `https://graph.microsoft.com/v1.0/drives/<document-library-id>/root:/data/finance:/children`. Une fois que vous avez la liste des ID qui vous intéressent, vous pouvez alors instancier le chargeur avec les paramètres suivants.

```python
from langchain_community.document_loaders.sharepoint import SharePointLoader

loader = SharePointLoader(document_library_id="YOUR DOCUMENT LIBRARY ID", object_ids=["ID_1", "ID_2"], auth_with_token=True)
documents = loader.load()
```
