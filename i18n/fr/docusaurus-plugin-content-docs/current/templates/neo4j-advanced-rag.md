---
translated: true
---

# neo4j-advanced-rag

Ce modèle vous permet d'équilibrer des embeddings précis et la rétention du contexte en mettant en œuvre des stratégies de récupération avancées.

## Stratégies

1. **Typical RAG** :
   - Méthode traditionnelle où les données exactes indexées sont les données récupérées.
2. **Parent retriever** :
   - Au lieu d'indexer des documents entiers, les données sont divisées en plus petits morceaux, appelés documents parents et enfants.
   - Les documents enfants sont indexés pour une meilleure représentation de concepts spécifiques, tandis que les documents parents sont récupérés pour assurer la rétention du contexte.
3. **Hypothetical Questions** :
     - Les documents sont traités pour déterminer les questions potentielles auxquelles ils pourraient répondre.
     - Ces questions sont ensuite indexées pour une meilleure représentation de concepts spécifiques, tandis que les documents parents sont récupérés pour assurer la rétention du contexte.
4. **Summaries** :
     - Au lieu d'indexer le document entier, un résumé du document est créé et indexé.
     - De même, le document parent est récupéré dans une application RAG.

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
Le script traite et stocke des sections du texte du fichier `dune.txt` dans une base de données de graphe Neo4j.
Tout d'abord, le texte est divisé en plus gros morceaux ("parents") puis subdivisé en plus petits morceaux ("enfants"), où les morceaux parents et enfants se chevauchent légèrement pour maintenir le contexte.
Après avoir stocké ces morceaux dans la base de données, les embeddings pour les nœuds enfants sont calculés à l'aide des embeddings d'OpenAI et stockés dans le graphe pour une récupération ou une analyse future.
Pour chaque nœud parent, des questions hypothétiques et des résumés sont générés, intégrés et ajoutés à la base de données.
De plus, un index vectoriel pour chaque stratégie de récupération est créé pour une interrogation efficace de ces embeddings.

*Notez que l'ingestion peut prendre une minute ou deux en raison de la vitesse des LLM pour générer des questions hypothétiques et des résumés.*

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir installé le CLI LangChain :

```shell
pip install -U "langchain-cli[serve]"
```

Pour créer un nouveau projet LangChain et installer celui-ci comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package neo4j-advanced-rag
```

Si vous voulez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add neo4j-advanced-rag
```

Et ajoutez le code suivant à votre fichier `server.py` :

```python
from neo4j_advanced_rag import chain as neo4j_advanced_chain

add_routes(app, neo4j_advanced_chain, path="/neo4j-advanced-rag")
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

Si vous êtes dans ce répertoire, vous pouvez lancer une instance LangServe directement en :

```shell
langchain serve
```

Cela démarrera l'application FastAPI avec un serveur en cours d'exécution localement sur
[http://localhost:8000](http://localhost:8000)

Nous pouvons voir tous les modèles sur [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Nous pouvons accéder au playground sur [http://127.0.0.1:8000/neo4j-advanced-rag/playground](http://127.0.0.1:8000/neo4j-advanced-rag/playground)

Nous pouvons accéder au modèle à partir du code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/neo4j-advanced-rag")
```
