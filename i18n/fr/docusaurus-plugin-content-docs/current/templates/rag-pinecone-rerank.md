---
translated: true
---

# rag-pinecone-rerank

Ce modèle effectue un RAG en utilisant Pinecone et OpenAI ainsi que [Cohere pour effectuer un re-classement](https://txt.cohere.com/rerank/) sur les documents récupérés.

Le re-classement fournit un moyen de classer les documents récupérés en utilisant des filtres ou des critères spécifiés.

## Configuration de l'environnement

Ce modèle utilise Pinecone comme magasin de vecteurs et nécessite que `PINECONE_API_KEY`, `PINECONE_ENVIRONMENT` et `PINECONE_INDEX` soient définis.

Définissez la variable d'environnement `OPENAI_API_KEY` pour accéder aux modèles OpenAI.

Définissez la variable d'environnement `COHERE_API_KEY` pour accéder à Cohere ReRank.

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir installé le CLI LangChain :

```shell
pip install -U langchain-cli
```

Pour créer un nouveau projet LangChain et installer celui-ci comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package rag-pinecone-rerank
```

Si vous voulez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add rag-pinecone-rerank
```

Et ajoutez le code suivant à votre fichier `server.py` :

```python
from rag_pinecone_rerank import chain as rag_pinecone_rerank_chain

add_routes(app, rag_pinecone_rerank_chain, path="/rag-pinecone-rerank")
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
Nous pouvons accéder au playground à [http://127.0.0.1:8000/rag-pinecone-rerank/playground](http://127.0.0.1:8000/rag-pinecone-rerank/playground)

Nous pouvons accéder au modèle à partir du code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-pinecone-rerank")
```
