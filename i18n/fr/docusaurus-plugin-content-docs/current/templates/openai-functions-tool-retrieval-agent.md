---
translated: true
---

# openai-functions-outil-agent-de-récupération

L'idée novatrice présentée dans ce modèle est l'utilisation de la récupération pour sélectionner l'ensemble des outils à utiliser pour répondre à une requête d'agent. Cela est utile lorsque vous avez de nombreux outils à sélectionner. Vous ne pouvez pas placer la description de tous les outils dans l'invite (à cause des problèmes de longueur de contexte), donc à la place, vous sélectionnez dynamiquement les N outils que vous voulez prendre en compte à l'exécution.

Dans ce modèle, nous allons créer un exemple quelque peu artificiel. Nous aurons un outil légitime (recherche) et ensuite 99 faux outils qui ne sont que du non-sens. Nous ajouterons ensuite une étape dans le modèle d'invite qui prend l'entrée de l'utilisateur et récupère les outils pertinents à la requête.

Ce modèle est basé sur [ce Agent How-To](https://python.langchain.com/docs/modules/agents/how_to/custom_agent_with_tool_retrieval).

## Configuration de l'environnement

Les variables d'environnement suivantes doivent être définies :

Définissez la variable d'environnement `OPENAI_API_KEY` pour accéder aux modèles OpenAI.

Définissez la variable d'environnement `TAVILY_API_KEY` pour accéder à Tavily.

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir installé le CLI LangChain :

```shell
pip install -U langchain-cli
```

Pour créer un nouveau projet LangChain et installer celui-ci comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package openai-functions-tool-retrieval-agent
```

Si vous voulez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add openai-functions-tool-retrieval-agent
```

Et ajouter le code suivant à votre fichier `server.py` :

```python
from openai_functions_tool_retrieval_agent import agent_executor as openai_functions_tool_retrieval_agent_chain

add_routes(app, openai_functions_tool_retrieval_agent_chain, path="/openai-functions-tool-retrieval-agent")
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

Cela démarrera l'application FastAPI avec un serveur qui tourne localement sur
[http://localhost:8000](http://localhost:8000)

Nous pouvons voir tous les modèles sur [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Nous pouvons accéder au playground sur [http://127.0.0.1:8000/openai-functions-tool-retrieval-agent/playground](http://127.0.0.1:8000/openai-functions-tool-retrieval-agent/playground)

Nous pouvons accéder au modèle à partir du code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/openai-functions-tool-retrieval-agent")
```
