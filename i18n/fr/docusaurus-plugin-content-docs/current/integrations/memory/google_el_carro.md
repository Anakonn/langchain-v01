---
translated: true
---

# Google El Carro Oracle

> [Google Cloud El Carro Oracle](https://github.com/GoogleCloudPlatform/elcarro-oracle-operator) offre un moyen d'exécuter des bases de données `Oracle` dans `Kubernetes` en tant que système d'orchestration de conteneurs portable, open source, piloté par la communauté et sans verrouillage fournisseur. `El Carro` fournit une API déclarative puissante pour une configuration et un déploiement complets et cohérents, ainsi que pour des opérations et une surveillance en temps réel. Étendez les capacités de votre base de données `Oracle` pour construire des expériences alimentées par l'IA en tirant parti de l'intégration `El Carro` Langchain.

Ce guide explique comment utiliser l'intégration `El Carro` Langchain pour stocker l'historique des messages de chat avec la classe `ElCarroChatMessageHistory`. Cette intégration fonctionne pour toute base de données `Oracle`, quel que soit l'endroit où elle s'exécute.

En savoir plus sur le package sur [GitHub](https://github.com/googleapis/langchain-google-el-carro-python/).

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-el-carro-python/blob/main/docs/chat_message_history.ipynb)

## Avant de commencer

Pour exécuter ce notebook, vous devrez faire ce qui suit :

 * Terminez la section [Démarrage](https://github.com/googleapis/langchain-google-el-carro-python/tree/main/README.md#getting-started) si vous souhaitez exécuter votre base de données Oracle avec El Carro.

### 🦜🔗 Installation de la bibliothèque

L'intégration se trouve dans son propre package `langchain-google-el-carro`, nous devons donc l'installer.

```python
%pip install --upgrade --quiet langchain-google-el-carro langchain-google-vertexai langchain
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
# from google.colab import auth

# auth.authenticate_user()
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

## Utilisation de base

### Configurer la connexion à la base de données Oracle

Remplissez la variable suivante avec les détails de connexion à votre base de données Oracle.

```python
# @title Set Your Values Here { display-mode: "form" }
HOST = "127.0.0.1"  # @param {type: "string"}
PORT = 3307  # @param {type: "integer"}
DATABASE = "my-database"  # @param {type: "string"}
TABLE_NAME = "message_store"  # @param {type: "string"}
USER = "my-user"  # @param {type: "string"}
PASSWORD = input("Please provide a password to be used for the database user: ")
```

Si vous utilisez `El Carro`, vous pouvez trouver les valeurs d'hôte et de port dans le
statut de l'instance Kubernetes `El Carro`.
Utilisez le mot de passe utilisateur que vous avez créé pour votre PDB.
Exemple

kubectl get -w instances.oracle.db.anthosapis.com -n db
NAME   DB ENGINE   VERSION   EDITION      ENDPOINT      URL                DB NAMES   BACKUP ID   READYSTATUS   READYREASON        DBREADYSTATUS   DBREADYREASON
mydb   Oracle      18c       Express      mydb-svc.db   34.71.69.25:6021                          False         CreateInProgress

### Pool de connexions ElCarroEngine

`ElCarroEngine` configure un pool de connexions à votre base de données Oracle, permettant des connexions réussies depuis votre application et suivant les meilleures pratiques de l'industrie.

```python
from langchain_google_el_carro import ElCarroEngine

elcarro_engine = ElCarroEngine.from_instance(
    db_host=HOST,
    db_port=PORT,
    db_name=DATABASE,
    db_user=USER,
    db_password=PASSWORD,
)
```

### Initialiser une table

La classe `ElCarroChatMessageHistory` nécessite une table de base de données avec un schéma spécifique afin de stocker l'historique des messages de chat.

La classe `ElCarroEngine` a une
méthode `init_chat_history_table()` qui peut être utilisée pour créer une table avec le
schéma approprié pour vous.

```python
elcarro_engine.init_chat_history_table(table_name=TABLE_NAME)
```

### ElCarroChatMessageHistory

Pour initialiser la classe `ElCarroChatMessageHistory`, vous n'avez besoin que de 3
choses :

1. `elcarro_engine` - Une instance d'un moteur `ElCarroEngine`.
1. `session_id` - Une chaîne d'identification unique qui spécifie un identifiant pour la
   session.
1. `table_name` : Le nom de la table dans la base de données Oracle pour stocker l'
   historique des messages de chat.

```python
from langchain_google_el_carro import ElCarroChatMessageHistory

history = ElCarroChatMessageHistory(
    elcarro_engine=elcarro_engine, session_id="test_session", table_name=TABLE_NAME
)
history.add_user_message("hi!")
history.add_ai_message("whats up?")
```

```python
history.messages
```

#### Nettoyage

Lorsque l'historique d'une session spécifique est obsolète et peut être supprimé, cela peut être fait de la manière suivante.

**Remarque :** Une fois supprimées, les données ne sont plus stockées dans votre base de données et sont définitivement perdues.

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
    lambda session_id: ElCarroChatMessageHistory(
        elcarro_engine,
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
