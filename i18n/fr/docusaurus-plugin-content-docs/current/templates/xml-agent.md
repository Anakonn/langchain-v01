---
translated: true
---

# xml-agent

Ce package crée un agent qui utilise la syntaxe XML pour communiquer ses décisions sur les actions à entreprendre. Il utilise les modèles Claude d'Anthropic pour écrire la syntaxe XML et peut éventuellement effectuer des recherches sur Internet à l'aide de DuckDuckGo.

## Configuration de l'environnement

Deux variables d'environnement doivent être définies :

- `ANTHROPIC_API_KEY` : Requis pour utiliser Anthropic

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir installé le CLI LangChain :

```shell
pip install -U langchain-cli
```

Pour créer un nouveau projet LangChain et installer ce package comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package xml-agent
```

Si vous voulez ajouter ce package à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add xml-agent
```

Et ajouter le code suivant à votre fichier `server.py` :

```python
from xml_agent import agent_executor as xml_agent_chain

add_routes(app, xml_agent_chain, path="/xml-agent")
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

Si vous êtes dans ce répertoire, vous pouvez alors démarrer une instance LangServe directement en exécutant :

```shell
langchain serve
```

Cela démarrera l'application FastAPI avec un serveur en cours d'exécution localement sur
[http://localhost:8000](http://localhost:8000)

Nous pouvons voir tous les modèles sur [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Nous pouvons accéder au playground sur [http://127.0.0.1:8000/xml-agent/playground](http://127.0.0.1:8000/xml-agent/playground)

Nous pouvons accéder au modèle à partir du code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/xml-agent")
```
