---
translated: true
---

# rag-opensearch

Ce modèle effectue un RAG (Retrieval Augmented Generation) à l'aide d'[OpenSearch](https://python.langchain.com/docs/integrations/vectorstores/opensearch).

## Configuration de l'environnement

Définissez les variables d'environnement suivantes.

- `OPENAI_API_KEY` - Pour accéder aux embeddings et modèles OpenAI.

Et définissez éventuellement les variables d'OpenSearch si vous n'utilisez pas les valeurs par défaut :

- `OPENSEARCH_URL` - URL de l'instance OpenSearch hébergée
- `OPENSEARCH_USERNAME` - Nom d'utilisateur pour l'instance OpenSearch
- `OPENSEARCH_PASSWORD` - Mot de passe pour l'instance OpenSearch
- `OPENSEARCH_INDEX_NAME` - Nom de l'index

Pour exécuter l'instance OpenSeach par défaut dans Docker, vous pouvez utiliser la commande

```shell
docker run -p 9200:9200 -p 9600:9600 -e "discovery.type=single-node" --name opensearch-node -d opensearchproject/opensearch:latest
```

Remarque : Pour charger un index factice nommé `langchain-test` avec des documents factices, exécutez `python dummy_index_setup.py` dans le package

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir installé l'interface en ligne de commande LangChain :

```shell
pip install -U langchain-cli
```

Pour créer un nouveau projet LangChain et installer ce package comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package rag-opensearch
```

Si vous voulez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add rag-opensearch
```

Et ajoutez le code suivant à votre fichier `server.py` :

```python
from rag_opensearch import chain as rag_opensearch_chain

add_routes(app, rag_opensearch_chain, path="/rag-opensearch")
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

Cela démarrera l'application FastAPI avec un serveur en cours d'exécution localement sur
[http://localhost:8000](http://localhost:8000)

Nous pouvons voir tous les modèles sur [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Nous pouvons accéder au playground sur [http://127.0.0.1:8000/rag-opensearch/playground](http://127.0.0.1:8000/rag-opensearch/playground)

Nous pouvons accéder au modèle à partir du code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-opensearch")
```
