---
translated: true
---

# neo4j-semantic-layer

Ce modèle est conçu pour mettre en œuvre un agent capable d'interagir avec une base de données de graphes comme Neo4j via une couche sémantique en utilisant l'appel de fonction OpenAI.
La couche sémantique équipe l'agent d'un ensemble d'outils robustes, lui permettant d'interagir avec la base de données de graphes en fonction de l'intention de l'utilisateur.
En savoir plus sur le modèle de couche sémantique dans le [billet de blog correspondant](https://medium.com/towards-data-science/enhancing-interaction-between-language-models-and-graph-databases-via-a-semantic-layer-0a78ad3eba49).

## Outils

L'agent utilise plusieurs outils pour interagir efficacement avec la base de données de graphes Neo4j :

1. **Outil d'information** :
   - Récupère les données sur les films ou les personnes, assurant que l'agent ait accès aux informations les plus récentes et les plus pertinentes.
2. **Outil de recommandation** :
   - Fournit des recommandations de films en fonction des préférences et des entrées de l'utilisateur.
3. **Outil de mémoire** :
   - Stocke les informations sur les préférences de l'utilisateur dans le graphe de connaissances, permettant une expérience personnalisée sur plusieurs interactions.

## Configuration de l'environnement

Vous devez définir les variables d'environnement suivantes

```shell
OPENAI_API_KEY=<YOUR_OPENAI_API_KEY>
NEO4J_URI=<YOUR_NEO4J_URI>
NEO4J_USERNAME=<YOUR_NEO4J_USERNAME>
NEO4J_PASSWORD=<YOUR_NEO4J_PASSWORD>
```

## Remplissage avec des données

Si vous voulez remplir la base de données avec un jeu de données d'exemple sur les films, vous pouvez exécuter `python ingest.py`.
Le script importe des informations sur les films et leur notation par les utilisateurs.
De plus, le script crée deux [index de texte intégral](https://neo4j.com/docs/cypher-manual/current/indexes-for-full-text-search/), qui sont utilisés pour faire correspondre les informations de l'entrée de l'utilisateur à la base de données.

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir installé le CLI LangChain :

```shell
pip install -U "langchain-cli[serve]"
```

Pour créer un nouveau projet LangChain et installer celui-ci comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package neo4j-semantic-layer
```

Si vous voulez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add neo4j-semantic-layer
```

Et ajoutez le code suivant à votre fichier `server.py` :

```python
from neo4j_semantic_layer import agent_executor as neo4j_semantic_agent

add_routes(app, neo4j_semantic_agent, path="/neo4j-semantic-layer")
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

Si vous êtes dans ce répertoire, vous pouvez alors lancer une instance LangServe directement en :

```shell
langchain serve
```

Cela démarrera l'application FastAPI avec un serveur en cours d'exécution localement à
[http://localhost:8000](http://localhost:8000)

Nous pouvons voir tous les modèles à [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Nous pouvons accéder au playground à [http://127.0.0.1:8000/neo4j-semantic-layer/playground](http://127.0.0.1:8000/neo4j-semantic-layer/playground)

Nous pouvons accéder au modèle à partir du code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/neo4j-semantic-layer")
```
