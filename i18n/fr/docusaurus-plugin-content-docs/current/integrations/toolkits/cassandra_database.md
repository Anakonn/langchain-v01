---
translated: true
---

# Base de données Cassandra

Apache Cassandra® est une base de données largement utilisée pour stocker les données transactionnelles des applications. L'introduction de fonctions et d'outils dans les modèles de langage de grande taille a ouvert de passionnantes possibilités d'utilisation pour les données existantes dans les applications d'IA générative. La boîte à outils de la base de données Cassandra permet aux ingénieurs en IA d'intégrer efficacement des agents aux données Cassandra, offrant les fonctionnalités suivantes :
 - Accès rapide aux données grâce à des requêtes optimisées. La plupart des requêtes doivent s'exécuter en quelques millisecondes ou moins.
 - Introspection du schéma pour améliorer les capacités de raisonnement des LLM
 - Compatibilité avec diverses déploiements Cassandra, y compris Apache Cassandra®, DataStax Enterprise™ et DataStax Astra™
 - Actuellement, la boîte à outils se limite aux requêtes SELECT et aux opérations d'introspection du schéma. (La sécurité d'abord)

## Démarrage rapide

 - Installer la bibliothèque cassio
 - Définir les variables d'environnement pour la base de données Cassandra à laquelle vous vous connectez
 - Initialiser CassandraDatabase
 - Transmettre les outils à votre agent avec toolkit.get_tools()
 - Relaxez-vous et laissez-le faire tout le travail pour vous

## Théorie de fonctionnement

Le langage de requête Cassandra (CQL) est le moyen *centré sur l'humain* principal d'interagir avec une base de données Cassandra. Bien qu'il offre une certaine flexibilité lors de la génération de requêtes, il nécessite une connaissance des meilleures pratiques de modélisation des données Cassandra. L'appel de fonction LLM donne à un agent la capacité de raisonner et de choisir ensuite un outil pour satisfaire la demande. Les agents utilisant des LLM doivent raisonner à l'aide d'une logique spécifique à Cassandra lors du choix du bon outil ou de la bonne chaîne d'outils. Cela réduit le caractère aléatoire introduit lorsque les LLM sont forcés de fournir une solution descendante. Voulez-vous qu'un LLM ait un accès complet et sans entrave à votre base de données ? Ouais. Probablement pas. Pour y parvenir, nous fournissons une invite à utiliser lors de la construction de questions pour l'agent :

```json
You are an Apache Cassandra expert query analysis bot with the following features
and rules:
 - You will take a question from the end user about finding specific
   data in the database.
 - You will examine the schema of the database and create a query path.
 - You will provide the user with the correct query to find the data they are looking
   for, showing the steps provided by the query path.
 - You will use best practices for querying Apache Cassandra using partition keys
   and clustering columns.
 - Avoid using ALLOW FILTERING in the query.
 - The goal is to find a query path, so it may take querying other tables to get
   to the final answer.

The following is an example of a query path in JSON format:

 {
  "query_paths": [
    {
      "description": "Direct query to users table using email",
      "steps": [
        {
          "table": "user_credentials",
          "query":
             "SELECT userid FROM user_credentials WHERE email = 'example@example.com';"
        },
        {
          "table": "users",
          "query": "SELECT * FROM users WHERE userid = ?;"
        }
      ]
    }
  ]
}
```

## Outils fournis

### `cassandra_db_schema`

Rassemble toutes les informations de schéma pour la base de données connectée ou un schéma spécifique. Essentiel pour que l'agent détermine les actions.

### `cassandra_db_select_table_data`

Sélectionne les données d'un espace de clés et d'une table spécifiques. L'agent peut transmettre des paramètres pour un prédicat et des limites sur le nombre d'enregistrements renvoyés.

### `cassandra_db_query`

Alternative expérimentale à `cassandra_db_select_table_data` qui prend une chaîne de requête complètement formée par l'agent au lieu de paramètres. *Avertissement* : Cela peut conduire à des requêtes inhabituelles qui peuvent ne pas être aussi performantes (ou même fonctionner). Cela peut être supprimé dans les versions futures. S'il fait quelque chose de cool, nous voulons en entendre parler aussi. On ne sait jamais !

## Configuration de l'environnement

Installez les modules Python suivants :

```bash
pip install ipykernel python-dotenv cassio langchain_openai langchain langchain-community langchainhub
```

### Fichier .env

La connexion se fait via `cassio` en utilisant le paramètre `auto=True`, et le notebook utilise OpenAI. Vous devez créer un fichier `.env` en conséquence.

Pour Cassandra, définissez :

```bash
CASSANDRA_CONTACT_POINTS
CASSANDRA_USERNAME
CASSANDRA_PASSWORD
CASSANDRA_KEYSPACE
```

Pour Astra, définissez :

```bash
ASTRA_DB_APPLICATION_TOKEN
ASTRA_DB_DATABASE_ID
ASTRA_DB_KEYSPACE
```

Par exemple :

```bash
# Connection to Astra:
ASTRA_DB_DATABASE_ID=a1b2c3d4-...
ASTRA_DB_APPLICATION_TOKEN=AstraCS:...
ASTRA_DB_KEYSPACE=notebooks

# Also set
OPENAI_API_KEY=sk-....
```

(Vous pouvez également modifier le code ci-dessous pour vous connecter directement avec `cassio`.)

```python
from dotenv import load_dotenv

load_dotenv(override=True)
```

```python
# Import necessary libraries
import os

import cassio
from langchain import hub
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain_community.agent_toolkits.cassandra_database.toolkit import (
    CassandraDatabaseToolkit,
)
from langchain_community.tools.cassandra_database.prompt import QUERY_PATH_PROMPT
from langchain_community.tools.cassandra_database.tool import (
    GetSchemaCassandraDatabaseTool,
    GetTableDataCassandraDatabaseTool,
    QueryCassandraDatabaseTool,
)
from langchain_community.utilities.cassandra_database import CassandraDatabase
from langchain_openai import ChatOpenAI
```

## Se connecter à une base de données Cassandra

```python
cassio.init(auto=True)
session = cassio.config.resolve_session()
if not session:
    raise Exception(
        "Check environment configuration or manually configure cassio connection parameters"
    )
```

```python
# Test data pep

session = cassio.config.resolve_session()

session.execute("""DROP KEYSPACE IF EXISTS langchain_agent_test; """)

session.execute(
    """
CREATE KEYSPACE if not exists langchain_agent_test
WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};
"""
)

session.execute(
    """
    CREATE TABLE IF NOT EXISTS langchain_agent_test.user_credentials (
    user_email text PRIMARY KEY,
    user_id UUID,
    password TEXT
);
"""
)

session.execute(
    """
    CREATE TABLE IF NOT EXISTS langchain_agent_test.users (
    id UUID PRIMARY KEY,
    name TEXT,
    email TEXT
);"""
)

session.execute(
    """
    CREATE TABLE IF NOT EXISTS langchain_agent_test.user_videos (
    user_id UUID,
    video_id UUID,
    title TEXT,
    description TEXT,
    PRIMARY KEY (user_id, video_id)
);
"""
)

user_id = "522b1fe2-2e36-4cef-a667-cd4237d08b89"
video_id = "27066014-bad7-9f58-5a30-f63fe03718f6"

session.execute(
    f"""
    INSERT INTO langchain_agent_test.user_credentials (user_id, user_email)
    VALUES ({user_id}, 'patrick@datastax.com');
"""
)

session.execute(
    f"""
    INSERT INTO langchain_agent_test.users (id, name, email)
    VALUES ({user_id}, 'Patrick McFadin', 'patrick@datastax.com');
"""
)

session.execute(
    f"""
    INSERT INTO langchain_agent_test.user_videos (user_id, video_id, title)
    VALUES ({user_id}, {video_id}, 'Use Langflow to Build a LangChain LLM Application in 5 Minutes');
"""
)

session.set_keyspace("langchain_agent_test")
```

```python
# Create a CassandraDatabase instance
# Uses the cassio session to connect to the database
db = CassandraDatabase()

# Create the Cassandra Database tools
query_tool = QueryCassandraDatabaseTool(db=db)
schema_tool = GetSchemaCassandraDatabaseTool(db=db)
select_data_tool = GetTableDataCassandraDatabaseTool(db=db)
```

```python
# Choose the LLM that will drive the agent
# Only certain models support this
llm = ChatOpenAI(temperature=0, model="gpt-4-1106-preview")
toolkit = CassandraDatabaseToolkit(db=db)

tools = toolkit.get_tools()

print("Available tools:")
for tool in tools:
    print(tool.name + "\t- " + tool.description)
```

```output
Available tools:
cassandra_db_schema	-
    Input to this tool is a keyspace name, output is a table description
    of Apache Cassandra tables.
    If the query is not correct, an error message will be returned.
    If an error is returned, report back to the user that the keyspace
    doesn't exist and stop.

cassandra_db_query	-
    Execute a CQL query against the database and get back the result.
    If the query is not correct, an error message will be returned.
    If an error is returned, rewrite the query, check the query, and try again.

cassandra_db_select_table_data	-
    Tool for getting data from a table in an Apache Cassandra database.
    Use the WHERE clause to specify the predicate for the query that uses the
    primary key. A blank predicate will return all rows. Avoid this if possible.
    Use the limit to specify the number of rows to return. A blank limit will
    return all rows.
```

```python
prompt = hub.pull("hwchase17/openai-tools-agent")

# Construct the OpenAI Tools agent
agent = create_openai_tools_agent(llm, tools, prompt)
```

```python
input = (
    QUERY_PATH_PROMPT
    + "\n\nHere is your task: Find all the videos that the user with the email address 'patrick@datastax.com' has uploaded to the langchain_agent_test keyspace."
)

agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

response = agent_executor.invoke({"input": input})

print(response["output"])
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `cassandra_db_schema` with `{'keyspace': 'langchain_agent_test'}`


[0m[36;1m[1;3mTable Name: user_credentials
- Keyspace: langchain_agent_test
- Columns
  - password (text)
  - user_email (text)
  - user_id (uuid)
- Partition Keys: (user_email)
- Clustering Keys:

Table Name: user_videos
- Keyspace: langchain_agent_test
- Columns
  - description (text)
  - title (text)
  - user_id (uuid)
  - video_id (uuid)
- Partition Keys: (user_id)
- Clustering Keys: (video_id asc)


Table Name: users
- Keyspace: langchain_agent_test
- Columns
  - email (text)
  - id (uuid)
  - name (text)
- Partition Keys: (id)
- Clustering Keys:

[0m[32;1m[1;3m
Invoking: `cassandra_db_select_table_data` with `{'keyspace': 'langchain_agent_test', 'table': 'user_credentials', 'predicate': "user_email = 'patrick@datastax.com'", 'limit': 1}`


[0m[38;5;200m[1;3mRow(user_email='patrick@datastax.com', password=None, user_id=UUID('522b1fe2-2e36-4cef-a667-cd4237d08b89'))[0m[32;1m[1;3m
Invoking: `cassandra_db_select_table_data` with `{'keyspace': 'langchain_agent_test', 'table': 'user_videos', 'predicate': 'user_id = 522b1fe2-2e36-4cef-a667-cd4237d08b89', 'limit': 10}`


[0m[38;5;200m[1;3mRow(user_id=UUID('522b1fe2-2e36-4cef-a667-cd4237d08b89'), video_id=UUID('27066014-bad7-9f58-5a30-f63fe03718f6'), description='DataStax Academy is a free resource for learning Apache Cassandra.', title='DataStax Academy')[0m[32;1m[1;3mTo find all the videos that the user with the email address 'patrick@datastax.com' has uploaded to the `langchain_agent_test` keyspace, we can follow these steps:

1. Query the `user_credentials` table to find the `user_id` associated with the email 'patrick@datastax.com'.
2. Use the `user_id` obtained from the first step to query the `user_videos` table to retrieve all the videos uploaded by the user.

Here is the query path in JSON format:

\```json
{
  "query_paths": [
    {
      "description": "Find user_id from user_credentials and then query user_videos for all videos uploaded by the user",
      "steps": [
        {
          "table": "user_credentials",
          "query": "SELECT user_id FROM user_credentials WHERE user_email = 'patrick@datastax.com';"
        },
        {
          "table": "user_videos",
          "query": "SELECT * FROM user_videos WHERE user_id = 522b1fe2-2e36-4cef-a667-cd4237d08b89;"
        }
      ]
    }
  ]
}
\```

Following this query path, we found that the user with the user_id `522b1fe2-2e36-4cef-a667-cd4237d08b89` has uploaded at least one video with the title 'DataStax Academy' and the description 'DataStax Academy is a free resource for learning Apache Cassandra.' The video_id for this video is `27066014-bad7-9f58-5a30-f63fe03718f6`. If there are more videos, the same query can be used to retrieve them, possibly with an increased limit if necessary.[0m

[1m> Finished chain.[0m
To find all the videos that the user with the email address 'patrick@datastax.com' has uploaded to the `langchain_agent_test` keyspace, we can follow these steps:

1. Query the `user_credentials` table to find the `user_id` associated with the email 'patrick@datastax.com'.
2. Use the `user_id` obtained from the first step to query the `user_videos` table to retrieve all the videos uploaded by the user.

Here is the query path in JSON format:

\```json
{
  "query_paths": [
    {
      "description": "Find user_id from user_credentials and then query user_videos for all videos uploaded by the user",
      "steps": [
        {
          "table": "user_credentials",
          "query": "SELECT user_id FROM user_credentials WHERE user_email = 'patrick@datastax.com';"
        },
        {
          "table": "user_videos",
          "query": "SELECT * FROM user_videos WHERE user_id = 522b1fe2-2e36-4cef-a667-cd4237d08b89;"
        }
      ]
    }
  ]
}
\```

Following this query path, we found that the user with the user_id `522b1fe2-2e36-4cef-a667-cd4237d08b89` has uploaded at least one video with the title 'DataStax Academy' and the description 'DataStax Academy is a free resource for learning Apache Cassandra.' The video_id for this video is `27066014-bad7-9f58-5a30-f63fe03718f6`. If there are more videos, the same query can be used to retrieve them, possibly with an increased limit if necessary.

```

Pour une étude approfondie sur la création d'un agent de base de données Cassandra, consultez le [livre de recettes de l'agent CQL](https://github.com/langchain-ai/langchain/blob/master/cookbook/cql_agent.md)
