---
translated: true
---

# neo4j-vector-memory

Ce modèle vous permet d'intégrer un LLM (Language Model) à un système de récupération basé sur les vecteurs en utilisant Neo4j comme magasin de vecteurs.
De plus, il utilise les capacités de graphe de la base de données Neo4j pour stocker et récupérer l'historique des dialogues d'une session utilisateur spécifique.
Le fait d'avoir l'historique des dialogues stocké sous forme de graphe permet des flux de conversation fluides, mais vous donne également la possibilité d'analyser le comportement des utilisateurs et la récupération des fragments de texte via l'analyse des graphes.

## Configuration de l'environnement

Vous devez définir les variables d'environnement suivantes :

```shell
OPENAI_API_KEY=<YOUR_OPENAI_API_KEY>
NEO4J_URI=<YOUR_NEO4J_URI>
NEO4J_USERNAME=<YOUR_NEO4J_USERNAME>
NEO4J_PASSWORD=<YOUR_NEO4J_PASSWORD>
```

## Remplissage avec des données

Si vous voulez remplir la base de données avec quelques données d'exemple, vous pouvez exécuter `python ingest.py`.
Le script traite et stocke des sections du texte du fichier `dune.txt` dans une base de données de graphes Neo4j.
De plus, un index vectoriel nommé `dune` est créé pour une interrogation efficace de ces embeddings.

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir installé l'interface en ligne de commande LangChain :

```shell
pip install -U langchain-cli
```

Pour créer un nouveau projet LangChain et installer celui-ci comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package neo4j-vector-memory
```

Si vous voulez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add neo4j-vector-memory
```

Et ajouter le code suivant à votre fichier `server.py` :

```python
from neo4j_vector_memory import chain as neo4j_vector_memory_chain

add_routes(app, neo4j_vector_memory_chain, path="/neo4j-vector-memory")
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

Si vous êtes dans ce répertoire, vous pouvez lancer une instance LangServe directement en exécutant :

```shell
langchain serve
```

Cela démarrera l'application FastAPI avec un serveur en cours d'exécution localement sur
[http://localhost:8000](http://localhost:8000)

Nous pouvons voir tous les modèles sur [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Nous pouvons accéder au playground sur [http://127.0.0.1:8000/neo4j-vector-memory/playground](http://127.0.0.1:8000/neo4j-parent/playground)

Nous pouvons accéder au modèle à partir du code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/neo4j-vector-memory")
```
