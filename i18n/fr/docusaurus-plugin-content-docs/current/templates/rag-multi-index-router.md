---
translated: true
---

# RAG avec plusieurs index (routage)

Une application QA qui achemine entre différents récupérateurs spécifiques au domaine étant donné une question d'utilisateur.

## Configuration de l'environnement

Cette application interroge PubMed, ArXiv, Wikipédia et [Kay AI](https://www.kay.ai) (pour les dépôts SEC).

Vous devrez créer un compte gratuit Kay AI et [obtenir votre clé API ici](https://www.kay.ai).
Ensuite, définissez la variable d'environnement :

```bash
export KAY_API_KEY="<YOUR_API_KEY>"
```

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir installé le CLI LangChain :

```shell
pip install -U langchain-cli
```

Pour créer un nouveau projet LangChain et installer celui-ci comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package rag-multi-index-router
```

Si vous voulez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add rag-multi-index-router
```

Et ajoutez le code suivant à votre fichier `server.py` :

```python
from rag_multi_index_router import chain as rag_multi_index_router_chain

add_routes(app, rag_multi_index_router_chain, path="/rag-multi-index-router")
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

Nous pouvons voir tous les modèles sur [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Nous pouvons accéder au playground sur [http://127.0.0.1:8000/rag-multi-index-router/playground](http://127.0.0.1:8000/rag-multi-index-router/playground)

Nous pouvons accéder au modèle à partir du code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-multi-index-router")
```
