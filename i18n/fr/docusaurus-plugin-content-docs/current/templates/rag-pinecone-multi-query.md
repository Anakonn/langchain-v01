---
translated: true
---

# rag-pinecone-multi-query

Ce modèle effectue un RAG (Retrieval Augmented Generation) en utilisant Pinecone et OpenAI avec un récupérateur de requêtes multiples.

Il utilise un LLM (Language Model de Grande Taille) pour générer plusieurs requêtes à partir de différentes perspectives basées sur la requête de l'utilisateur.

Pour chaque requête, il récupère un ensemble de documents pertinents et prend l'union unique de tous les résultats pour la synthèse de la réponse.

## Configuration de l'environnement

Ce modèle utilise Pinecone comme magasin de vecteurs et nécessite que `PINECONE_API_KEY`, `PINECONE_ENVIRONMENT` et `PINECONE_INDEX` soient définis.

Définissez la variable d'environnement `OPENAI_API_KEY` pour accéder aux modèles OpenAI.

## Utilisation

Pour utiliser ce package, vous devez d'abord installer le CLI LangChain :

```shell
pip install -U langchain-cli
```

Pour créer un nouveau projet LangChain et installer ce package, faites :

```shell
langchain app new my-app --package rag-pinecone-multi-query
```

Pour ajouter ce package à un projet existant, exécutez :

```shell
langchain app add rag-pinecone-multi-query
```

Et ajoutez le code suivant à votre fichier `server.py` :

```python
from rag_pinecone_multi_query import chain as rag_pinecone_multi_query_chain

add_routes(app, rag_pinecone_multi_query_chain, path="/rag-pinecone-multi-query")
```

(Facultatif) Maintenant, configurons LangSmith. LangSmith nous aidera à tracer, surveiller et déboguer les applications LangChain. Vous pouvez vous inscrire à LangSmith [ici](https://smith.langchain.com/). Si vous n'avez pas accès, vous pouvez ignorer cette section.

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

Si vous êtes dans ce répertoire, vous pouvez lancer une instance LangServe directement en :

```shell
langchain serve
```

Cela démarrera l'application FastAPI avec un serveur s'exécutant localement sur [http://localhost:8000](http://localhost:8000)

Vous pouvez voir tous les modèles sur [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Vous pouvez accéder au playground sur [http://127.0.0.1:8000/rag-pinecone-multi-query/playground](http://127.0.0.1:8000/rag-pinecone-multi-query/playground)

Pour accéder au modèle à partir du code, utilisez :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-pinecone-multi-query")
```
