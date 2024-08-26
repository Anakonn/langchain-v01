---
translated: true
---

# rag-jaguardb

Ce modèle effectue un RAG (Résumé Automatique Généré) à l'aide de JaguarDB et d'OpenAI.

## Configuration de l'environnement

Vous devez exporter deux variables d'environnement, l'une étant votre URI Jaguar, l'autre étant votre clé API OpenAI.
Si vous n'avez pas encore configuré JaguarDB, consultez la section "Configuration de Jaguar" ci-dessous pour obtenir des instructions sur la façon de le faire.

```shell
export JAGUAR_API_KEY=...
export OPENAI_API_KEY=...
```

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir installé le CLI LangChain :

```shell
pip install -U langchain-cli
```

Pour créer un nouveau projet LangChain et installer celui-ci comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package rag-jaguardb
```

Si vous voulez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add rag-jagaurdb
```

Et ajouter le code suivant à votre fichier `server.py` :

```python
from rag_jaguardb import chain as rag_jaguardb

add_routes(app, rag_jaguardb_chain, path="/rag-jaguardb")
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
Nous pouvons accéder au playground sur [http://127.0.0.1:8000/rag-jaguardb/playground](http://127.0.0.1:8000/rag-jaguardb/playground)

Nous pouvons accéder au modèle à partir du code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-jaguardb")
```

## Configuration de JaguarDB

Pour utiliser JaguarDB, vous pouvez utiliser les commandes docker pull et docker run pour configurer rapidement JaguarDB.

```shell
docker pull jaguardb/jaguardb
docker run -d -p 8888:8888 --name jaguardb jaguardb/jaguardb
```

Pour lancer le terminal client JaguarDB afin d'interagir avec le serveur JaguarDB :

```shell
docker exec -it jaguardb /home/jaguar/jaguar/bin/jag

```

Une autre option consiste à télécharger un package binaire de JaguarDB déjà construit sur Linux, et à déployer la base de données sur un seul nœud ou dans un cluster de nœuds. Le processus simplifié vous permet de commencer rapidement à utiliser JaguarDB et de tirer parti de ses puissantes fonctionnalités. [ici](http://www.jaguardb.com/download.html).
