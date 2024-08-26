---
translated: true
---

# neo4j-cypher-ft

Ce modèle vous permet d'interagir avec une base de données de graphe Neo4j en utilisant le langage naturel, en tirant parti du LLM d'OpenAI.

Sa principale fonction est de convertir les questions en langage naturel en requêtes Cypher (le langage utilisé pour interroger les bases de données Neo4j), d'exécuter ces requêtes et de fournir des réponses en langage naturel basées sur les résultats de la requête.

Le package utilise un index de recherche en texte intégral pour un mappage efficace des valeurs de texte aux entrées de la base de données, améliorant ainsi la génération de déclarations Cypher précises.

Dans l'exemple fourni, l'index de recherche en texte intégral est utilisé pour mapper les noms de personnes et de films à partir de la requête de l'utilisateur aux entrées correspondantes de la base de données.

## Configuration de l'environnement

Les variables d'environnement suivantes doivent être définies :

```shell
OPENAI_API_KEY=<YOUR_OPENAI_API_KEY>
NEO4J_URI=<YOUR_NEO4J_URI>
NEO4J_USERNAME=<YOUR_NEO4J_USERNAME>
NEO4J_PASSWORD=<YOUR_NEO4J_PASSWORD>
```

De plus, si vous souhaitez remplir la base de données avec quelques données d'exemple, vous pouvez exécuter `python ingest.py`.
Ce script remplira la base de données avec des données d'exemple sur les films et créera un index de recherche en texte intégral nommé `entity`, qui est utilisé pour mapper les personnes et les films à partir de l'entrée de l'utilisateur aux valeurs de la base de données pour une génération précise des déclarations Cypher.

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir installé le CLI LangChain :

```shell
pip install -U langchain-cli
```

Pour créer un nouveau projet LangChain et installer celui-ci comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package neo4j-cypher-ft
```

Si vous voulez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add neo4j-cypher-ft
```

Et ajouter le code suivant à votre fichier `server.py` :

```python
from neo4j_cypher_ft import chain as neo4j_cypher_ft_chain

add_routes(app, neo4j_cypher_ft_chain, path="/neo4j-cypher-ft")
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

Cela démarrera l'application FastAPI avec un serveur s'exécutant localement sur
[http://localhost:8000](http://localhost:8000)

Nous pouvons voir tous les modèles sur [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Nous pouvons accéder au playground sur [http://127.0.0.1:8000/neo4j-cypher-ft/playground](http://127.0.0.1:8000/neo4j-cypher-ft/playground)

Nous pouvons accéder au modèle à partir du code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/neo4j-cypher-ft")
```
