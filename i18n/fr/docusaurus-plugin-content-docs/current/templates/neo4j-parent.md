---
translated: true
---

# neo4j-parent

Ce modèle vous permet d'équilibrer les embeddings précis et la rétention du contexte en divisant les documents en plus petits morceaux et en récupérant leurs informations de texte d'origine ou plus larges.

En utilisant un index vectoriel Neo4j, le package interroge les nœuds enfants à l'aide de la recherche de similarité vectorielle et récupère le texte correspondant du parent en définissant un paramètre `retrieval_query` approprié.

## Configuration de l'environnement

Vous devez définir les variables d'environnement suivantes

```shell
OPENAI_API_KEY=<YOUR_OPENAI_API_KEY>
NEO4J_URI=<YOUR_NEO4J_URI>
NEO4J_USERNAME=<YOUR_NEO4J_USERNAME>
NEO4J_PASSWORD=<YOUR_NEO4J_PASSWORD>
```

## Remplissage avec des données

Si vous voulez remplir la base de données avec quelques données d'exemple, vous pouvez exécuter `python ingest.py`.
Le script traite et stocke les sections du texte du fichier `dune.txt` dans une base de données de graphes Neo4j.
Tout d'abord, le texte est divisé en morceaux plus importants ("parents") puis subdivisé en morceaux plus petits ("enfants"), où les morceaux parents et enfants se chevauchent légèrement pour maintenir le contexte.
Après avoir stocké ces morceaux dans la base de données, les embeddings pour les nœuds enfants sont calculés à l'aide des embeddings d'OpenAI et stockés à nouveau dans le graphe pour une récupération ou une analyse future.
De plus, un index vectoriel nommé `retrieval` est créé pour une interrogation efficace de ces embeddings.

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir installé l'interface en ligne de commande LangChain :

```shell
pip install -U langchain-cli
```

Pour créer un nouveau projet LangChain et installer celui-ci comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package neo4j-parent
```

Si vous voulez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add neo4j-parent
```

Et ajoutez le code suivant à votre fichier `server.py` :

```python
from neo4j_parent import chain as neo4j_parent_chain

add_routes(app, neo4j_parent_chain, path="/neo4j-parent")
```

(Facultatif) Configurons maintenant LangSmith.
LangSmith nous aidera à tracer, surveiller et déboguer les applications LangChain.
Vous pouvez vous inscrire à LangSmith [ici](https://smith.langchain.com/).
Si vous n'avez pas accès, vous pouvez sauter cette section

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
Nous pouvons accéder au playground à [http://127.0.0.1:8000/neo4j-parent/playground](http://127.0.0.1:8000/neo4j-parent/playground)

Nous pouvons accéder au modèle à partir du code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/neo4j-parent")
```
