---
translated: true
---

# rag-singlestoredb

Ce modèle effectue un RAG (Recherche Assistée par Génération) à l'aide de SingleStoreDB et d'OpenAI.

## Configuration de l'environnement

Ce modèle utilise SingleStoreDB comme magasin de vecteurs et nécessite que la variable d'environnement `SINGLESTOREDB_URL` soit définie. Elle doit prendre la forme `admin:password@svc-xxx.svc.singlestore.com:port/db_name`.

Définissez la variable d'environnement `OPENAI_API_KEY` pour accéder aux modèles OpenAI.

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir installé l'interface en ligne de commande LangChain :

```shell
pip install -U langchain-cli
```

Pour créer un nouveau projet LangChain et installer celui-ci comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package rag-singlestoredb
```

Si vous voulez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add rag-singlestoredb
```

Et ajouter le code suivant à votre fichier `server.py` :

```python
from rag_singlestoredb import chain as rag_singlestoredb_chain

add_routes(app, rag_singlestoredb_chain, path="/rag-singlestoredb")
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
Nous pouvons accéder au playground sur [http://127.0.0.1:8000/rag-singlestoredb/playground](http://127.0.0.1:8000/rag-singlestoredb/playground)

Nous pouvons accéder au modèle à partir du code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-singlestoredb")
```
