---
translated: true
---

# Google SQL pour PostgreSQL

> [Google Cloud SQL](https://cloud.google.com/sql) est un service de base de données relationnelle entièrement géré qui offre des performances élevées, une intégration transparente et une évolutivité impressionnante. Il propose les moteurs de base de données `MySQL`, `PostgreSQL` et `SQL Server`. Étendez votre application de base de données pour construire des expériences alimentées par l'IA en tirant parti des intégrations Langchain de Cloud SQL.

Ce notebook explique comment utiliser `Google Cloud SQL pour PostgreSQL` pour stocker l'historique des messages de discussion avec la classe `PostgresChatMessageHistory`.

En savoir plus sur le package sur [GitHub](https://github.com/googleapis/langchain-google-cloud-sql-pg-python/).

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-cloud-sql-pg-python/blob/main/docs/chat_message_history.ipynb)

## Avant de commencer

Pour exécuter ce notebook, vous devrez effectuer les étapes suivantes :

 * [Créer un projet Google Cloud](https://developers.google.com/workspace/guides/create-project)
 * [Activer l'API Cloud SQL Admin.](https://console.cloud.google.com/marketplace/product/google/sqladmin.googleapis.com)
 * [Créer une instance Cloud SQL pour PostgreSQL](https://cloud.google.com/sql/docs/postgres/create-instance)
 * [Créer une base de données Cloud SQL](https://cloud.google.com/sql/docs/mysql/create-manage-databases)
 * [Ajouter un utilisateur de base de données IAM à la base de données](https://cloud.google.com/sql/docs/postgres/add-manage-iam-users#creating-a-database-user) (Facultatif)

### 🦜🔗 Installation de la bibliothèque

L'intégration se trouve dans le package `langchain-google-cloud-sql-pg`, nous devons donc l'installer.

```python
%pip install --upgrade --quiet langchain-google-cloud-sql-pg langchain-google-vertexai
```

**Colab uniquement :** Décommentez la cellule suivante pour redémarrer le noyau ou utilisez le bouton pour le faire. Pour Vertex AI Workbench, vous pouvez redémarrer le terminal à l'aide du bouton en haut.

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

Le package `langchain-google-cloud-sql-pg` nécessite que vous [activiez l'API Cloud SQL Admin](https://console.cloud.google.com/flows/enableapi?apiid=sqladmin.googleapis.com) dans votre projet Google Cloud.

```python
# enable Cloud SQL Admin API
!gcloud services enable sqladmin.googleapis.com
```

## Utilisation de base

### Définir les valeurs de la base de données Cloud SQL

Trouvez vos valeurs de base de données dans la [page des instances Cloud SQL](https://console.cloud.google.com/sql?_ga=2.223735448.2062268965.1707700487-2088871159.1707257687).

```python
# @title Set Your Values Here { display-mode: "form" }
REGION = "us-central1"  # @param {type: "string"}
INSTANCE = "my-postgresql-instance"  # @param {type: "string"}
DATABASE = "my-database"  # @param {type: "string"}
TABLE_NAME = "message_store"  # @param {type: "string"}
```

### Pool de connexions PostgresEngine

L'une des exigences et des arguments pour établir Cloud SQL en tant que mémoire de stockage des messages de discussion est un objet `PostgresEngine`. Le `PostgresEngine` configure un pool de connexions à votre base de données Cloud SQL, permettant des connexions réussies depuis votre application et suivant les meilleures pratiques de l'industrie.

Pour créer un `PostgresEngine` à l'aide de `PostgresEngine.from_instance()`, vous devez fournir seulement 4 éléments :

1.   `project_id` : ID du projet Google Cloud où se trouve l'instance Cloud SQL.
1. `region` : Région où se trouve l'instance Cloud SQL.
1. `instance` : Le nom de l'instance Cloud SQL.
1. `database` : Le nom de la base de données à laquelle se connecter sur l'instance Cloud SQL.

Par défaut, [l'authentification de base de données IAM](https://cloud.google.com/sql/docs/postgres/iam-authentication#iam-db-auth) sera utilisée comme méthode d'authentification de la base de données. Cette bibliothèque utilise le principal IAM appartenant aux [Application Default Credentials (ADC)](https://cloud.google.com/docs/authentication/application-default-credentials) provenant de l'environnement.

Pour plus d'informations sur l'authentification de base de données IAM, veuillez consulter :

* [Configurer une instance pour l'authentification de base de données IAM](https://cloud.google.com/sql/docs/postgres/create-edit-iam-instances)
* [Gérer les utilisateurs avec l'authentification de base de données IAM](https://cloud.google.com/sql/docs/postgres/add-manage-iam-users)

Facultativement, [l'authentification de base de données intégrée](https://cloud.google.com/sql/docs/postgres/built-in-authentication) utilisant un nom d'utilisateur et un mot de passe pour accéder à la base de données Cloud SQL peut également être utilisée. Il suffit de fournir les arguments facultatifs `user` et `password` à `PostgresEngine.from_instance()` :

* `user` : Utilisateur de base de données à utiliser pour l'authentification de base de données intégrée et la connexion
* `password` : Mot de passe de base de données à utiliser pour l'authentification de base de données intégrée et la connexion.

```python
from langchain_google_cloud_sql_pg import PostgresEngine

engine = PostgresEngine.from_instance(
    project_id=PROJECT_ID, region=REGION, instance=INSTANCE, database=DATABASE
)
```

### Initialiser une table

La classe `PostgresChatMessageHistory` nécessite une table de base de données avec un schéma spécifique afin de stocker l'historique des messages de discussion.

Le moteur `PostgresEngine` dispose d'une méthode d'assistance `init_chat_history_table()` qui peut être utilisée pour créer une table avec le schéma approprié pour vous.

```python
engine.init_chat_history_table(table_name=TABLE_NAME)
```

### PostgresChatMessageHistory

Pour initialiser la classe `PostgresChatMessageHistory`, vous devez fournir seulement 3 éléments :

1. `engine` - Une instance d'un moteur `PostgresEngine`.
1. `session_id` - Une chaîne d'identification unique qui spécifie un identifiant pour la session.
1. `table_name` : Le nom de la table dans la base de données Cloud SQL pour stocker l'historique des messages de discussion.

```python
from langchain_google_cloud_sql_pg import PostgresChatMessageHistory

history = PostgresChatMessageHistory.create_sync(
    engine, session_id="test_session", table_name=TABLE_NAME
)
history.add_user_message("hi!")
history.add_ai_message("whats up?")
```

```python
history.messages
```

```output
[HumanMessage(content='hi!'), AIMessage(content='whats up?')]
```

#### Nettoyage

Lorsque l'historique d'une session spécifique est obsolète et peut être supprimé, cela peut être fait de la manière suivante.

**Remarque :** Une fois supprimées, les données ne sont plus stockées dans Cloud SQL et sont définitivement perdues.

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
    lambda session_id: PostgresChatMessageHistory.create_sync(
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

```output
AIMessage(content=' Hello Bob, how can I help you today?')
```

```python
chain_with_history.invoke({"question": "Whats my name"}, config=config)
```

```output
AIMessage(content=' Your name is Bob.')
```
