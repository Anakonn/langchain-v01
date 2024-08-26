---
translated: true
---

# Google AlloyDB pour PostgreSQL

> [Google Cloud AlloyDB pour PostgreSQL](https://cloud.google.com/alloydb) est un service de base de données entièrement géré compatible avec `PostgreSQL` pour vos charges de travail d'entreprise les plus exigeantes. `AlloyDB` combine le meilleur de `Google Cloud` avec `PostgreSQL`, pour des performances, une évolutivité et une disponibilité supérieures. Étendez votre application de base de données pour construire des expériences alimentées par l'IA en tirant parti des intégrations `AlloyDB` Langchain.

Ce notebook explique comment utiliser `Google Cloud AlloyDB pour PostgreSQL` pour stocker l'historique des messages de chat avec la classe `AlloyDBChatMessageHistory`.

En savoir plus sur le package sur [GitHub](https://github.com/googleapis/langchain-google-alloydb-pg-python/).

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-alloydb-pg-python/blob/main/docs/chat_message_history.ipynb)

## Avant de commencer

Pour exécuter ce notebook, vous devrez faire ce qui suit :

 * [Créer un projet Google Cloud](https://developers.google.com/workspace/guides/create-project)
 * [Activer l'API AlloyDB](https://console.cloud.google.com/flows/enableapi?apiid=alloydb.googleapis.com)
 * [Créer une instance AlloyDB](https://cloud.google.com/alloydb/docs/instance-primary-create)
 * [Créer une base de données AlloyDB](https://cloud.google.com/alloydb/docs/database-create)
 * [Ajouter un utilisateur de base de données IAM à la base de données](https://cloud.google.com/alloydb/docs/manage-iam-authn) (Facultatif)

### 🦜🔗 Installation de la bibliothèque

L'intégration se trouve dans son propre package `langchain-google-alloydb-pg`, nous devons donc l'installer.

```python
%pip install --upgrade --quiet langchain-google-alloydb-pg langchain-google-vertexai
```

**Colab uniquement :** Décommentez la cellule suivante pour redémarrer le noyau ou utilisez le bouton pour redémarrer le noyau. Pour Vertex AI Workbench, vous pouvez redémarrer le terminal à l'aide du bouton en haut.

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### 🔐 Authentification

Authentifiez-vous sur Google Cloud en tant qu'utilisateur IAM connecté à ce notebook afin d'accéder à votre projet Google Cloud.

* Si vous utilisez Colab pour exécuter ce notebook, utilisez la cellule ci-dessous et continuez.
* Si vous utilisez Vertex AI Workbench, consultez les instructions de configuration [ici](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env).

```python
from google.colab import auth

auth.authenticate_user()
```

### ☁ Définissez votre projet Google Cloud

Définissez votre projet Google Cloud afin de pouvoir utiliser les ressources Google Cloud dans ce notebook.

Si vous ne connaissez pas votre ID de projet, essayez ce qui suit :

* Exécutez `gcloud config list`.
* Exécutez `gcloud projects list`.
* Consultez la page d'assistance : [Localiser l'ID du projet](https://support.google.com/googleapi/answer/7014113).

```python
# @markdown Please fill in the value below with your Google Cloud project ID and then run the cell.

PROJECT_ID = "my-project-id"  # @param {type:"string"}

# Set the project id
!gcloud config set project {PROJECT_ID}
```

### 💡 Activation de l'API

Le package `langchain-google-alloydb-pg` nécessite que vous [activiez l'API AlloyDB Admin](https://console.cloud.google.com/flows/enableapi?apiid=alloydb.googleapis.com) dans votre projet Google Cloud.

```python
# enable AlloyDB API
!gcloud services enable alloydb.googleapis.com
```

## Utilisation de base

### Définir les valeurs de la base de données AlloyDB

Trouvez vos valeurs de base de données dans la [page du cluster AlloyDB](https://console.cloud.google.com/alloydb?_ga=2.223735448.2062268965.1707700487-2088871159.1707257687).

```python
# @title Set Your Values Here { display-mode: "form" }
REGION = "us-central1"  # @param {type: "string"}
CLUSTER = "my-alloydb-cluster"  # @param {type: "string"}
INSTANCE = "my-alloydb-instance"  # @param {type: "string"}
DATABASE = "my-database"  # @param {type: "string"}
TABLE_NAME = "message_store"  # @param {type: "string"}
```

### Connexion AlloyDBEngine

L'une des exigences et des arguments pour établir AlloyDB comme mémoire de stockage de l'historique des messages de chat est un objet `AlloyDBEngine`. Le `AlloyDBEngine` configure un pool de connexions à votre base de données AlloyDB, permettant des connexions réussies à partir de votre application et suivant les meilleures pratiques de l'industrie.

Pour créer un `AlloyDBEngine` à l'aide de `AlloyDBEngine.from_instance()`, vous devez fournir seulement 5 choses :

1. `project_id` : ID du projet Google Cloud où se trouve l'instance AlloyDB.
1. `region` : Région où se trouve l'instance AlloyDB.
1. `cluster` : Le nom du cluster AlloyDB.
1. `instance` : Le nom de l'instance AlloyDB.
1. `database` : Le nom de la base de données à laquelle se connecter sur l'instance AlloyDB.

Par défaut, [l'authentification de base de données IAM](https://cloud.google.com/alloydb/docs/manage-iam-authn) sera utilisée comme méthode d'authentification de la base de données. Cette bibliothèque utilise le principal IAM appartenant aux [Application Default Credentials (ADC)](https://cloud.google.com/docs/authentication/application-default-credentials) provenant de l'environnement.

Facultativement, [l'authentification de base de données intégrée](https://cloud.google.com/alloydb/docs/database-users/about) à l'aide d'un nom d'utilisateur et d'un mot de passe pour accéder à la base de données AlloyDB peut également être utilisée. Il suffit de fournir les arguments facultatifs `user` et `password` à `AlloyDBEngine.from_instance()` :

* `user` : Utilisateur de la base de données à utiliser pour l'authentification et la connexion de la base de données intégrée
* `password` : Mot de passe de la base de données à utiliser pour l'authentification et la connexion de la base de données intégrée.

```python
from langchain_google_alloydb_pg import AlloyDBEngine

engine = AlloyDBEngine.from_instance(
    project_id=PROJECT_ID,
    region=REGION,
    cluster=CLUSTER,
    instance=INSTANCE,
    database=DATABASE,
)
```

### Initialiser une table

La classe `AlloyDBChatMessageHistory` nécessite une table de base de données avec un schéma spécifique afin de stocker l'historique des messages de chat.

Le moteur `AlloyDBEngine` dispose d'une méthode d'assistance `init_chat_history_table()` qui peut être utilisée pour créer une table avec le schéma approprié pour vous.

```python
engine.init_chat_history_table(table_name=TABLE_NAME)
```

### AlloyDBChatMessageHistory

Pour initialiser la classe `AlloyDBChatMessageHistory`, vous devez fournir seulement 3 choses :

1. `engine` - Une instance d'un moteur `AlloyDBEngine`.
1. `session_id` - Une chaîne d'identification unique qui spécifie un identifiant pour la session.
1. `table_name` : Le nom de la table dans la base de données AlloyDB pour stocker l'historique des messages de chat.

```python
from langchain_google_alloydb_pg import AlloyDBChatMessageHistory

history = AlloyDBChatMessageHistory.create_sync(
    engine, session_id="test_session", table_name=TABLE_NAME
)
history.add_user_message("hi!")
history.add_ai_message("whats up?")
```

```python
history.messages
```

#### Nettoyage

Lorsque l'historique d'une session spécifique est obsolète et peut être supprimé, cela peut être fait de la manière suivante.

**Remarque :** Une fois supprimées, les données ne sont plus stockées dans AlloyDB et sont définitivement perdues.

```python
history.clear()
```

## 🔗 Enchaînement

Nous pouvons facilement combiner cette classe d'historique des messages avec [LCEL Runnables](/docs/expression_language/how_to/message_history)

Pour ce faire, nous utiliserons l'un des [modèles de chat Vertex AI de Google](/docs/integrations/chat/google_vertex_ai_palm) qui nécessite que vous [activiez l'API Vertex AI](https://console.cloud.google.com/flows/enableapi?apiid=aiplatform.googleapis.com) dans votre projet Google Cloud.

```python
# enable Vertex AI API
!gcloud services enable aiplatform.googleapis.com
```

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_google_vertexai import ChatVertexAI
```

```python
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful assistant."),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{question}"),
    ]
)

chain = prompt | ChatVertexAI(project=PROJECT_ID)
```

```python
chain_with_history = RunnableWithMessageHistory(
    chain,
    lambda session_id: AlloyDBChatMessageHistory.create_sync(
        engine,
        session_id=session_id,
        table_name=TABLE_NAME,
    ),
    input_messages_key="question",
    history_messages_key="history",
)
```

```python
# This is where we configure the session id
config = {"configurable": {"session_id": "test_session"}}
```

```python
chain_with_history.invoke({"question": "Hi! I'm bob"}, config=config)
```

```python
chain_with_history.invoke({"question": "Whats my name"}, config=config)
```
