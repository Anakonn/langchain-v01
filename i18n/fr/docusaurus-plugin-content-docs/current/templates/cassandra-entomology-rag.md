---
translated: true
---

# cassandra-entomologie-rag

Ce modèle effectuera un RAG en utilisant Apache Cassandra® ou Astra DB via CQL (`classe de magasin vectoriel Cassandra`)

## Configuration de l'environnement

Pour la configuration, vous aurez besoin de :
- une base de données vectorielle [Astra](https://astra.datastax.com). Vous devez avoir un [jeton d'administrateur de base de données](https://awesome-astra.github.io/docs/pages/astra/create-token/#c-procedure), plus précisément la chaîne commençant par `AstraCS:...`.
- [ID de base de données](https://awesome-astra.github.io/docs/pages/astra/faq/#where-should-i-find-a-database-identifier).
- une **clé API OpenAI**. (Plus d'informations [ici](https://cassio.org/start_here/#llm-access))

Vous pouvez également utiliser un cluster Cassandra régulier. Dans ce cas, fournissez l'entrée `USE_CASSANDRA_CLUSTER` comme indiqué dans `.env.template` et les variables d'environnement suivantes pour spécifier comment s'y connecter.

Les paramètres de connexion et les secrets doivent être fournis via des variables d'environnement. Reportez-vous à `.env.template` pour connaître les variables requises.

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir installé le CLI LangChain :

```shell
pip install -U langchain-cli
```

Pour créer un nouveau projet LangChain et installer celui-ci comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package cassandra-entomology-rag
```

Si vous voulez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add cassandra-entomology-rag
```

Et ajoutez le code suivant à votre fichier `server.py` :

```python
from cassandra_entomology_rag import chain as cassandra_entomology_rag_chain

add_routes(app, cassandra_entomology_rag_chain, path="/cassandra-entomology-rag")
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

Si vous êtes dans ce répertoire, vous pouvez lancer une instance LangServe directement en :

```shell
langchain serve
```

Cela démarrera l'application FastAPI avec un serveur en cours d'exécution localement à
[http://localhost:8000](http://localhost:8000)

Nous pouvons voir tous les modèles à [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Nous pouvons accéder au playground à [http://127.0.0.1:8000/cassandra-entomology-rag/playground](http://127.0.0.1:8000/cassandra-entomology-rag/playground)

Nous pouvons accéder au modèle à partir du code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/cassandra-entomology-rag")
```

## Référence

Dépôt autonome avec la chaîne LangServe : [ici](https://github.com/hemidactylus/langserve_cassandra_entomology_rag).
