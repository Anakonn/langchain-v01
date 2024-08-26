---
translated: true
---

# neo4j-cypher-memory

Ce modèle vous permet d'avoir des conversations avec une base de données de graphe Neo4j en langage naturel, en utilisant un LLM OpenAI.
Il transforme une question en langage naturel en une requête Cypher (utilisée pour récupérer des données des bases de données Neo4j), exécute la requête et fournit une réponse en langage naturel basée sur les résultats de la requête.
De plus, il dispose d'un module de mémoire conversationnelle qui stocke l'historique du dialogue dans la base de données de graphe Neo4j.
La mémoire de conversation est maintenue de manière unique pour chaque session d'utilisateur, assurant ainsi des interactions personnalisées.
Pour faciliter cela, veuillez fournir à la fois l'`user_id` et le `session_id` lors de l'utilisation de la chaîne de conversation.

## Configuration de l'environnement

Définissez les variables d'environnement suivantes :

```shell
OPENAI_API_KEY=<YOUR_OPENAI_API_KEY>
NEO4J_URI=<YOUR_NEO4J_URI>
NEO4J_USERNAME=<YOUR_NEO4J_USERNAME>
NEO4J_PASSWORD=<YOUR_NEO4J_PASSWORD>
```

## Configuration de la base de données Neo4j

Il existe plusieurs façons de configurer une base de données Neo4j.

### Neo4j Aura

Neo4j AuraDB est un service de base de données de graphe cloud entièrement géré.
Créez une instance gratuite sur [Neo4j Aura](https://neo4j.com/cloud/platform/aura-graph-database?utm_source=langchain&utm_content=langserve).
Lorsque vous initiez une instance de base de données gratuite, vous recevrez des identifiants pour accéder à la base de données.

## Remplissage avec des données

Si vous voulez remplir la base de données avec quelques données d'exemple, vous pouvez exécuter `python ingest.py`.
Ce script remplira la base de données avec des données d'exemple sur les films.

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir installé le CLI LangChain :

```shell
pip install -U langchain-cli
```

Pour créer un nouveau projet LangChain et installer celui-ci comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package neo4j-cypher-memory
```

Si vous voulez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add neo4j-cypher-memory
```

Et ajoutez le code suivant à votre fichier `server.py` :

```python
from neo4j_cypher_memory import chain as neo4j_cypher_memory_chain

add_routes(app, neo4j_cypher_memory_chain, path="/neo4j-cypher-memory")
```

(Facultatif) Configurons maintenant LangSmith.
LangSmith nous aidera à tracer, surveiller et déboguer les applications LangChain.
Vous pouvez vous inscrire à LangSmith [ici](https://smith.langchain.com/).
Si vous n'avez pas accès, vous pouvez sauter cette section.

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

Si vous êtes dans ce répertoire, vous pouvez lancer une instance LangServe directement en :

```shell
langchain serve
```

Cela démarrera l'application FastAPI avec un serveur en cours d'exécution localement à
[http://localhost:8000](http://localhost:8000)

Nous pouvons voir tous les modèles à [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Nous pouvons accéder au playground à [http://127.0.0.1:8000/neo4j_cypher_memory/playground](http://127.0.0.1:8000/neo4j_cypher/playground)

Nous pouvons accéder au modèle à partir du code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/neo4j-cypher-memory")
```
