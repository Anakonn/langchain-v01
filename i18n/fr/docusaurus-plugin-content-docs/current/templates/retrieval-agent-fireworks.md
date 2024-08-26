---
translated: true
---

# agent-de-recherche-fireworks

Ce package utilise des modèles open source hébergés sur FireworksAI pour effectuer une recherche à l'aide d'une architecture d'agent. Par défaut, cette recherche se fait sur Arxiv.

Nous utiliserons `Mixtral8x7b-instruct-v0.1`, qui, comme indiqué dans ce blog, donne des résultats raisonnables avec l'appel de fonction, même s'il n'est pas affiné pour cette tâche : https://huggingface.co/blog/open-source-llms-as-agents

## Configuration de l'environnement

Il existe de nombreuses excellentes façons d'exécuter les modèles OSS. Nous utiliserons FireworksAI comme moyen simple d'exécuter les modèles. Voir [ici](https://python.langchain.com/docs/integrations/providers/fireworks) pour plus d'informations.

Définissez la variable d'environnement `FIREWORKS_API_KEY` pour accéder à Fireworks.

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir installé l'interface en ligne de commande LangChain :

```shell
pip install -U langchain-cli
```

Pour créer un nouveau projet LangChain et installer celui-ci comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package retrieval-agent-fireworks
```

Si vous voulez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add retrieval-agent-fireworks
```

Et ajoutez le code suivant à votre fichier `server.py` :

```python
from retrieval_agent_fireworks import chain as retrieval_agent_fireworks_chain

add_routes(app, retrieval_agent_fireworks_chain, path="/retrieval-agent-fireworks")
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

Nous pouvons voir tous les modèles à l'adresse [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Nous pouvons accéder au playground à l'adresse [http://127.0.0.1:8000/retrieval-agent-fireworks/playground](http://127.0.0.1:8000/retrieval-agent-fireworks/playground)

Nous pouvons accéder au modèle à partir du code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/retrieval-agent-fireworks")
```
