---
translated: true
---

# agent-csv

Ce modèle utilise un [agent csv](https://python.langchain.com/docs/integrations/toolkits/csv) avec des outils (Python REPL) et une mémoire (vectorstore) pour interagir (répondre aux questions) avec des données textuelles.

## Configuration de l'environnement

Définissez la variable d'environnement `OPENAI_API_KEY` pour accéder aux modèles OpenAI.

Pour configurer l'environnement, le script `ingest.py` doit être exécuté pour gérer l'ingestion dans un vectorstore.

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir installé le CLI LangChain :

```shell
pip install -U langchain-cli
```

Pour créer un nouveau projet LangChain et installer celui-ci comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package csv-agent
```

Si vous voulez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add csv-agent
```

Et ajoutez le code suivant à votre fichier `server.py` :

```python
from csv_agent.agent import agent_executor as csv_agent_chain

add_routes(app, csv_agent_chain, path="/csv-agent")
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

Cela démarrera l'application FastAPI avec un serveur en cours d'exécution localement sur
[http://localhost:8000](http://localhost:8000)

Nous pouvons voir tous les modèles sur [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Nous pouvons accéder au playground sur [http://127.0.0.1:8000/csv-agent/playground](http://127.0.0.1:8000/csv-agent/playground)

Nous pouvons accéder au modèle à partir du code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/csv-agent")
```
