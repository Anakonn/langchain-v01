---
translated: true
---

# Xata

>[Xata](https://xata.io) est une plateforme de données sans serveur, basée sur `PostgreSQL` et `Elasticsearch`. Elle fournit un SDK Python pour interagir avec votre base de données et une interface utilisateur pour gérer vos données. Avec la classe `XataChatMessageHistory`, vous pouvez utiliser les bases de données Xata pour une persistance à long terme des sessions de chat.

Ce carnet de notes couvre :

* Un exemple simple montrant ce que fait `XataChatMessageHistory`.
* Un exemple plus complexe utilisant un agent REACT qui répond aux questions en fonction d'une base de connaissances ou d'une documentation (stockée dans Xata en tant que magasin de vecteurs) et ayant également un historique de ses messages passés consultable à long terme (stocké dans Xata en tant que magasin de mémoire)

## Configuration

### Créer une base de données

Dans l'[interface utilisateur Xata](https://app.xata.io), créez une nouvelle base de données. Vous pouvez lui donner le nom que vous voulez, dans ce bloc-notes nous utiliserons `langchain`. L'intégration Langchain peut créer automatiquement la table utilisée pour stocker la mémoire, et c'est ce que nous utiliserons dans cet exemple. Si vous voulez pré-créer la table, assurez-vous qu'elle a le bon schéma et définissez `create_table` sur `False` lors de la création de la classe. La pré-création de la table évite un aller-retour à la base de données lors de chaque initialisation de session.

Commençons par installer nos dépendances :

```python
%pip install --upgrade --quiet  xata langchain-openai langchain
```

Ensuite, nous devons récupérer les variables d'environnement pour Xata. Vous pouvez créer une nouvelle clé API en visitant vos [paramètres de compte](https://app.xata.io/settings). Pour trouver l'URL de la base de données, allez dans la page des paramètres de la base de données que vous avez créée. L'URL de la base de données devrait ressembler à ceci : `https://demo-uni3q8.eu-west-1.xata.sh/db/langchain`.

```python
import getpass

api_key = getpass.getpass("Xata API key: ")
db_url = input("Xata database URL (copy it from your DB settings):")
```

## Créer un magasin de mémoire simple

Pour tester la fonctionnalité de magasin de mémoire de manière isolée, utilisons le code suivant :

```python
from langchain_community.chat_message_histories import XataChatMessageHistory

history = XataChatMessageHistory(
    session_id="session-1", api_key=api_key, db_url=db_url, table_name="memory"
)

history.add_user_message("hi!")

history.add_ai_message("whats up?")
```

Le code ci-dessus crée une session avec l'ID `session-1` et y stocke deux messages. Après avoir exécuté ce qui précède, si vous visitez l'interface utilisateur Xata, vous devriez voir une table nommée `memory` et les deux messages ajoutés.

Vous pouvez récupérer l'historique des messages pour une session particulière avec le code suivant :

```python
history.messages
```

## Chaîne de questions-réponses conversationnelle sur vos données avec mémoire

Voyons maintenant un exemple plus complexe dans lequel nous combinons OpenAI, l'intégration du magasin de vecteurs Xata et l'intégration du magasin de mémoire Xata pour créer un chatbot de questions-réponses sur vos données, avec des questions de suivi et un historique.

Nous aurons besoin d'accéder à l'API OpenAI, alors configurons la clé API :

```python
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

Pour stocker les documents que le chatbot recherchera pour trouver des réponses, ajoutez une table nommée `docs` à votre base de données `langchain` à l'aide de l'interface utilisateur Xata, et ajoutez les colonnes suivantes :

* `content` de type "Texte". Cela sert à stocker les valeurs `Document.pageContent`.
* `embedding` de type "Vecteur". Utilisez la dimension utilisée par le modèle que vous prévoyez d'utiliser. Dans ce bloc-notes, nous utilisons les embeddings OpenAI, qui ont 1536 dimensions.

Créons le magasin de vecteurs et ajoutons quelques documents d'exemple :

```python
from langchain_community.vectorstores.xata import XataVectorStore
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings()

texts = [
    "Xata is a Serverless Data platform based on PostgreSQL",
    "Xata offers a built-in vector type that can be used to store and query vectors",
    "Xata includes similarity search",
]

vector_store = XataVectorStore.from_texts(
    texts, embeddings, api_key=api_key, db_url=db_url, table_name="docs"
)
```

Après avoir exécuté la commande ci-dessus, si vous allez dans l'interface utilisateur Xata, vous devriez voir les documents chargés avec leurs embeddings dans la table `docs`.

Créons maintenant un ConversationBufferMemory pour stocker les messages de chat à la fois de l'utilisateur et de l'IA.

```python
from uuid import uuid4

from langchain.memory import ConversationBufferMemory

chat_memory = XataChatMessageHistory(
    session_id=str(uuid4()),  # needs to be unique per user session
    api_key=api_key,
    db_url=db_url,
    table_name="memory",
)
memory = ConversationBufferMemory(
    memory_key="chat_history", chat_memory=chat_memory, return_messages=True
)
```

Il est maintenant temps de créer un Agent pour utiliser à la fois le magasin de vecteurs et la mémoire de chat.

```python
from langchain.agents import AgentType, initialize_agent
from langchain.agents.agent_toolkits import create_retriever_tool
from langchain_openai import ChatOpenAI

tool = create_retriever_tool(
    vector_store.as_retriever(),
    "search_docs",
    "Searches and returns documents from the Xata manual. Useful when you need to answer questions about Xata.",
)
tools = [tool]

llm = ChatOpenAI(temperature=0)

agent = initialize_agent(
    tools,
    llm,
    agent=AgentType.CHAT_CONVERSATIONAL_REACT_DESCRIPTION,
    verbose=True,
    memory=memory,
)
```

Pour tester, disons à l'agent notre nom :

```python
agent.run(input="My name is bob")
```

Maintenant, posons à l'agent quelques questions sur Xata :

```python
agent.run(input="What is xata?")
```

Notez qu'il répond en fonction des données stockées dans le magasin de documents. Et maintenant, posons une question de suivi :

```python
agent.run(input="Does it support similarity search?")
```

Et maintenant, testons sa mémoire :

```python
agent.run(input="Did I tell you my name? What is it?")
```
