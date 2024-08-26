---
translated: true
---

# Microsoft OneNote

Ce cahier couvre comment charger des documents à partir de `OneNote`.

## Prérequis

1. Enregistrez une application avec les [instructions de la plateforme d'identité Microsoft](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app).
2. Lorsque l'enregistrement est terminé, le portail Azure affiche le volet Vue d'ensemble de l'enregistrement de l'application. Vous voyez l'ID d'application (client). Également appelé `client ID`, cette valeur identifie de manière unique votre application sur la plateforme d'identité Microsoft.
3. Lors des étapes que vous suivrez à **l'élément 1**, vous pouvez définir l'URI de redirection sur `http://localhost:8000/callback`.
4. Lors des étapes que vous suivrez à **l'élément 1**, générez un nouveau mot de passe (`client_secret`) dans la section Secrets d'application.
5. Suivez les instructions de ce [document](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-configure-app-expose-web-apis#add-a-scope) pour ajouter les `SCOPES` suivants (`Notes.Read`) à votre application.
6. Vous devez installer les packages msal et bs4 à l'aide des commandes `pip install msal` et `pip install beautifulsoup4`.
7. À la fin des étapes, vous devez avoir les valeurs suivantes :
- `CLIENT_ID`
- `CLIENT_SECRET`

## 🧑 Instructions pour ingérer vos documents à partir de OneNote

### 🔑 Authentification

Par défaut, le `OneNoteLoader` s'attend à ce que les valeurs de `CLIENT_ID` et `CLIENT_SECRET` soient stockées en tant que variables d'environnement nommées `MS_GRAPH_CLIENT_ID` et `MS_GRAPH_CLIENT_SECRET` respectivement. Vous pourriez passer ces variables d'environnement via un fichier `.env` à la racine de votre application ou en utilisant la commande suivante dans votre script.

```python
os.environ['MS_GRAPH_CLIENT_ID'] = "YOUR CLIENT ID"
os.environ['MS_GRAPH_CLIENT_SECRET'] = "YOUR CLIENT SECRET"
```

Ce chargeur utilise une authentification appelée [*au nom d'un utilisateur*](https://learn.microsoft.com/en-us/graph/auth-v2-user?context=graph%2Fapi%2F1.0&view=graph-rest-1.0). Il s'agit d'une authentification en 2 étapes avec le consentement de l'utilisateur. Lorsque vous instanciez le chargeur, il imprimera une URL que l'utilisateur doit visiter pour donner son consentement à l'application sur les autorisations requises. L'utilisateur doit ensuite visiter cette URL et donner son consentement à l'application. L'utilisateur doit alors copier l'URL de la page résultante et la coller dans la console. La méthode renverra alors True si la tentative de connexion a réussi.

```python
from langchain_community.document_loaders.onenote import OneNoteLoader

loader = OneNoteLoader(notebook_name="NOTEBOOK NAME", section_name="SECTION NAME", page_title="PAGE TITLE")
```

Une fois l'authentification effectuée, le chargeur stockera un jeton (`onenote_graph_token.txt`) dans le dossier `~/.credentials/`. Ce jeton pourrait être utilisé ultérieurement pour s'authentifier sans les étapes de copie/collage expliquées précédemment. Pour utiliser ce jeton pour l'authentification, vous devez changer le paramètre `auth_with_token` sur True lors de l'instanciation du chargeur.

```python
from langchain_community.document_loaders.onenote import OneNoteLoader

loader = OneNoteLoader(notebook_name="NOTEBOOK NAME", section_name="SECTION NAME", page_title="PAGE TITLE", auth_with_token=True)
```

Alternativement, vous pouvez également transmettre le jeton directement au chargeur. Cela est utile lorsque vous voulez vous authentifier avec un jeton généré par une autre application. Par exemple, vous pouvez utiliser [l'Explorateur Microsoft Graph](https://developer.microsoft.com/en-us/graph/graph-explorer) pour générer un jeton et le transmettre ensuite au chargeur.

```python
from langchain_community.document_loaders.onenote import OneNoteLoader

loader = OneNoteLoader(notebook_name="NOTEBOOK NAME", section_name="SECTION NAME", page_title="PAGE TITLE", access_token="TOKEN")
```

### 🗂️ Chargeur de documents

#### 📑 Chargement des pages à partir d'un cahier OneNote

`OneNoteLoader` peut charger des pages à partir de cahiers OneNote stockés dans OneDrive. Vous pouvez spécifier n'importe quelle combinaison de `notebook_name`, `section_name`, `page_title` pour filtrer les pages sous un cahier spécifique, sous une section spécifique ou avec un titre spécifique respectivement. Par exemple, vous voulez charger toutes les pages qui sont stockées dans une section appelée `Recettes` dans n'importe lequel de vos cahiers OneDrive.

```python
from langchain_community.document_loaders.onenote import OneNoteLoader

loader = OneNoteLoader(section_name="Recipes", auth_with_token=True)
documents = loader.load()
```

#### 📑 Chargement des pages à partir d'une liste d'ID de page

Une autre possibilité est de fournir une liste d'`object_ids` pour chaque page que vous voulez charger. Pour cela, vous devrez interroger l'[API Microsoft Graph](https://developer.microsoft.com/en-us/graph/graph-explorer) pour trouver tous les ID de documents qui vous intéressent. Ce [lien](https://learn.microsoft.com/en-us/graph/onenote-get-content#page-collection) fournit une liste de points de terminaison qui seront utiles pour récupérer les ID des documents.

Par exemple, pour récupérer des informations sur toutes les pages stockées dans vos cahiers, vous devez faire une demande à : `https://graph.microsoft.com/v1.0/me/onenote/pages`. Une fois que vous avez la liste des ID qui vous intéressent, vous pouvez alors instancier le chargeur avec les paramètres suivants.

```python
from langchain_community.document_loaders.onenote import OneNoteLoader

loader = OneNoteLoader(object_ids=["ID_1", "ID_2"], auth_with_token=True)
documents = loader.load()
```
