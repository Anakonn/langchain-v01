---
translated: true
---

# rag-momento-vector-index

Ce modèle effectue un RAG (Recherche Assistée par Génération) à l'aide de Momento Vector Index (MVI) et OpenAI.

> MVI : l'index vectoriel serverless le plus productif et le plus facile à utiliser pour vos données. Pour commencer avec MVI, il suffit de s'inscrire à un compte. Aucun besoin de gérer l'infrastructure, de gérer des serveurs ou de se soucier de la mise à l'échelle. MVI est un service qui se met à l'échelle automatiquement pour répondre à vos besoins. Combinez-le avec d'autres services Momento comme Momento Cache pour mettre en cache les invites et comme un magasin de session ou Momento Topics comme un système de publication-souscription pour diffuser des événements à votre application.

Pour vous inscrire et accéder à MVI, visitez le [Momento Console](https://console.gomomento.com/).

## Configuration de l'environnement

Ce modèle utilise Momento Vector Index comme vectorstore et nécessite que `MOMENTO_API_KEY` et `MOMENTO_INDEX_NAME` soient définis.

Allez sur le [console](https://console.gomomento.com/) pour obtenir une clé API.

Définissez la variable d'environnement `OPENAI_API_KEY` pour accéder aux modèles OpenAI.

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir installé le CLI LangChain :

```shell
pip install -U langchain-cli
```

Pour créer un nouveau projet LangChain et installer celui-ci comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package rag-momento-vector-index
```

Si vous voulez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add rag-momento-vector-index
```

Et ajoutez le code suivant à votre fichier `server.py` :

```python
from rag_momento_vector_index import chain as rag_momento_vector_index_chain

add_routes(app, rag_momento_vector_index_chain, path="/rag-momento-vector-index")
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

Cela démarrera l'application FastAPI avec un serveur en cours d'exécution localement à
[http://localhost:8000](http://localhost:8000)

Nous pouvons voir tous les modèles à [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Nous pouvons accéder au playground à [http://127.0.0.1:8000/rag-momento-vector-index/playground](http://127.0.0.1:8000/rag-momento-vector-index/playground)

Nous pouvons accéder au modèle à partir du code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-momento-vector-index")
```

## Indexation des données

Nous avons inclus un module d'exemple pour indexer les données. Il est disponible dans `rag_momento_vector_index/ingest.py`. Vous verrez une ligne commentée dans `chain.py` qui invoque celui-ci. Décommentez-la pour l'utiliser.
