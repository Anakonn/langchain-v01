---
translated: true
---

# Langchain - Serveur d'actions Robocorp

Ce modèle permet d'utiliser les actions servies par le [Serveur d'actions Robocorp](https://github.com/robocorp/robocorp) comme outils pour un agent.

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir installé le CLI LangChain :

```shell
pip install -U langchain-cli
```

Pour créer un nouveau projet LangChain et installer celui-ci comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package robocorp-action-server
```

Si vous voulez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add robocorp-action-server
```

Et ajouter le code suivant à votre fichier `server.py` :

```python
from robocorp_action_server import agent_executor as action_server_chain

add_routes(app, action_server_chain, path="/robocorp-action-server")
```

### Exécution du serveur d'actions

Pour exécuter le serveur d'actions, vous devez avoir installé le serveur d'actions Robocorp

```bash
pip install -U robocorp-action-server
```

Vous pouvez ensuite exécuter le serveur d'actions avec :

```bash
action-server new
cd ./your-project-name
action-server start
```

### Configuration de LangSmith (facultatif)

LangSmith nous aidera à tracer, surveiller et déboguer les applications LangChain.
Vous pouvez vous inscrire à LangSmith [ici](https://smith.langchain.com/).
Si vous n'avez pas accès, vous pouvez ignorer cette section.

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

### Démarrage de l'instance LangServe

Si vous êtes dans ce répertoire, vous pouvez lancer une instance LangServe directement en :

```shell
langchain serve
```

Cela démarrera l'application FastAPI avec un serveur en cours d'exécution localement à
[http://localhost:8000](http://localhost:8000)

Nous pouvons voir tous les modèles à [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Nous pouvons accéder au playground à [http://127.0.0.1:8000/robocorp-action-server/playground](http://127.0.0.1:8000/robocorp-action-server/playground)

Nous pouvons accéder au modèle à partir du code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/robocorp-action-server")
```
