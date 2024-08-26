---
translated: true
---

# agent-fonctions-gemini

Ce modèle crée un agent qui utilise l'appel de fonction Google Gemini pour communiquer ses décisions sur les actions à entreprendre.

Cet exemple crée un agent qui peut éventuellement rechercher des informations sur Internet à l'aide du moteur de recherche de Tavily.

[Voir un exemple de trace LangSmith ici](https://smith.langchain.com/public/0ebf1bd6-b048-4019-b4de-25efe8d3d18c/r)

## Configuration de l'environnement

Les variables d'environnement suivantes doivent être définies :

Définissez la variable d'environnement `TAVILY_API_KEY` pour accéder à Tavily

Définissez la variable d'environnement `GOOGLE_API_KEY` pour accéder aux API Google Gemini.

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir installé le CLI LangChain :

```shell
pip install -U langchain-cli
```

Pour créer un nouveau projet LangChain et installer celui-ci comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package gemini-functions-agent
```

Si vous voulez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add gemini-functions-agent
```

Et ajoutez le code suivant à votre fichier `server.py` :

```python
from gemini_functions_agent import agent_executor as gemini_functions_agent_chain

add_routes(app, gemini_functions_agent_chain, path="/openai-functions-agent")
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

Si vous êtes dans ce répertoire, vous pouvez alors lancer une instance LangServe directement en :

```shell
langchain serve
```

Cela démarrera l'application FastAPI avec un serveur en cours d'exécution localement à
[http://localhost:8000](http://localhost:8000)

Nous pouvons voir tous les modèles à [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Nous pouvons accéder au playground à [http://127.0.0.1:8000/gemini-functions-agent/playground](http://127.0.0.1:8000/gemini-functions-agent/playground)

Nous pouvons accéder au modèle à partir du code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/gemini-functions-agent")
```
