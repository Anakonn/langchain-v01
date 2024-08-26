---
translated: true
---

# neo4j-generation

Ce modèle associe l'extraction de graphiques de connaissances basée sur LLM avec Neo4j AuraDB, une base de données de graphiques cloud entièrement gérée.

Vous pouvez créer une instance gratuite sur [Neo4j Aura](https://neo4j.com/cloud/platform/aura-graph-database?utm_source=langchain&utm_content=langserve).

Lorsque vous initiez une instance de base de données gratuite, vous recevrez des identifiants pour accéder à la base de données.

Ce modèle est flexible et permet aux utilisateurs de guider le processus d'extraction en spécifiant une liste d'étiquettes de nœuds et de types de relations.

Pour plus de détails sur les fonctionnalités et les capacités de ce package, veuillez vous référer [à cet article de blog](https://blog.langchain.dev/constructing-knowledge-graphs-from-text-using-openai-functions/).

## Configuration de l'environnement

Vous devez définir les variables d'environnement suivantes :

```shell
OPENAI_API_KEY=<YOUR_OPENAI_API_KEY>
NEO4J_URI=<YOUR_NEO4J_URI>
NEO4J_USERNAME=<YOUR_NEO4J_USERNAME>
NEO4J_PASSWORD=<YOUR_NEO4J_PASSWORD>
```

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir installé l'interface en ligne de commande LangChain :

```shell
pip install -U langchain-cli
```

Pour créer un nouveau projet LangChain et installer celui-ci comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package neo4j-generation
```

Si vous voulez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add neo4j-generation
```

Et ajouter le code suivant à votre fichier `server.py` :

```python
from neo4j_generation.chain import chain as neo4j_generation_chain

add_routes(app, neo4j_generation_chain, path="/neo4j-generation")
```

(Facultatif) Configurons maintenant LangSmith.
LangSmith nous aidera à tracer, surveiller et déboguer les applications LangChain.
Vous pouvez vous inscrire à LangSmith [ici](https://smith.langchain.com/).
Si vous n'avez pas accès, vous pouvez ignorer cette section.

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

Si vous êtes dans ce répertoire, vous pouvez alors lancer une instance LangServe directement en exécutant :

```shell
langchain serve
```

Cela démarrera l'application FastAPI avec un serveur en cours d'exécution localement à
[http://localhost:8000](http://localhost:8000)

Nous pouvons voir tous les modèles à [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Nous pouvons accéder au playground à [http://127.0.0.1:8000/neo4j-generation/playground](http://127.0.0.1:8000/neo4j-generation/playground)

Nous pouvons accéder au modèle à partir du code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/neo4j-generation")
```
