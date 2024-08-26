---
translated: true
---

# rag-weaviate

Ce modèle effectue le RAG avec Weaviate.

## Configuration de l'environnement

Définissez la variable d'environnement `OPENAI_API_KEY` pour accéder aux modèles OpenAI.

Assurez-vous également que les variables d'environnement suivantes sont définies :
* `WEAVIATE_ENVIRONMENT`
* `WEAVIATE_API_KEY`

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir installé le CLI LangChain :

```shell
pip install -U langchain-cli
```

Pour créer un nouveau projet LangChain et installer celui-ci comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package rag-weaviate
```

Si vous voulez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add rag-weaviate
```

Et ajoutez le code suivant à votre fichier `server.py` :

```python
from rag_weaviate import chain as rag_weaviate_chain

add_routes(app, rag_weaviate_chain, path="/rag-weaviate")
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

Si vous êtes dans ce répertoire, vous pouvez alors lancer une instance LangServe directement en exécutant :

```shell
langchain serve
```

Cela démarrera l'application FastAPI avec un serveur en cours d'exécution localement sur
[http://localhost:8000](http://localhost:8000)

Nous pouvons voir tous les modèles à l'adresse [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Nous pouvons accéder au playground à l'adresse [http://127.0.0.1:8000/rag-weaviate/playground](http://127.0.0.1:8000/rag-weaviate/playground)

Nous pouvons accéder au modèle à partir du code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-weaviate")
```
