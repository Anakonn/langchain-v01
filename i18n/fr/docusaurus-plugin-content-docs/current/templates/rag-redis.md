---
translated: true
---

# rag-redis

Ce modèle effectue un RAG (Retrieval Augmented Generation) à l'aide de Redis (base de données vectorielle) et d'OpenAI (LLM) sur les documents des rapports 10k de Nike.

Il s'appuie sur le transformateur de phrases `all-MiniLM-L6-v2` pour incorporer les fragments du PDF et les questions de l'utilisateur.

## Configuration de l'environnement

Définissez la variable d'environnement `OPENAI_API_KEY` pour accéder aux modèles [OpenAI](https://platform.openai.com) :

```bash
export OPENAI_API_KEY= <YOUR OPENAI API KEY>
```

Définissez les variables d'environnement suivantes pour [Redis](https://redis.com/try-free) :

```bash
export REDIS_HOST = <YOUR REDIS HOST>
export REDIS_PORT = <YOUR REDIS PORT>
export REDIS_USER = <YOUR REDIS USER NAME>
export REDIS_PASSWORD = <YOUR REDIS PASSWORD>
```

## Paramètres pris en charge

Nous utilisons diverses variables d'environnement pour configurer cette application

| Variable d'environnement | Description                       | Valeur par défaut |
|----------------------|-----------------------------------|---------------|
| `DEBUG`            | Activer ou désactiver les journaux de débogage Langchain       | True         |
| `REDIS_HOST`           | Nom d'hôte du serveur Redis     | "localhost"   |
| `REDIS_PORT`           | Port du serveur Redis         | 6379          |
| `REDIS_USER`           | Utilisateur du serveur Redis         | "" |
| `REDIS_PASSWORD`       | Mot de passe du serveur Redis     | "" |
| `REDIS_URL`            | URL complète pour se connecter à Redis  | `None`, Construit à partir de l'utilisateur, du mot de passe, de l'hôte et du port s'il n'est pas fourni |
| `INDEX_NAME`           | Nom de l'index vectoriel          | "rag-redis"   |

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir installé l'interface en ligne de commande LangChain et Pydantic dans un environnement virtuel Python :

```shell
pip install -U langchain-cli pydantic==1.10.13
```

Pour créer un nouveau projet LangChain et installer celui-ci comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package rag-redis
```

Si vous voulez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add rag-redis
```

Et ajoutez le code suivant à votre fichier `app/server.py` :

```python
from rag_redis.chain import chain as rag_redis_chain

add_routes(app, rag_redis_chain, path="/rag-redis")
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

Cela démarrera l'application FastAPI avec un serveur en cours d'exécution localement sur
[http://localhost:8000](http://localhost:8000)

Nous pouvons voir tous les modèles sur [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Nous pouvons accéder au playground sur [http://127.0.0.1:8000/rag-redis/playground](http://127.0.0.1:8000/rag-redis/playground)

Nous pouvons accéder au modèle à partir du code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-redis")
```
