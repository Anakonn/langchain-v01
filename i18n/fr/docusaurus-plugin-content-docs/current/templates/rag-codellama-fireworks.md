---
translated: true
---

# rag-codellama-fireworks

Ce modèle effectue un RAG sur une base de code.

Il utilise codellama-34b hébergé par l'API d'inférence de Fireworks [LLM](https://blog.fireworks.ai/accelerating-code-completion-with-fireworks-fast-llm-inference-f4e8b5ec534a).

## Configuration de l'environnement

Définissez la variable d'environnement `FIREWORKS_API_KEY` pour accéder aux modèles Fireworks.

Vous pouvez l'obtenir à partir de [ici](https://app.fireworks.ai/login?callbackURL=https://app.fireworks.ai).

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir installé l'interface en ligne de commande LangChain :

```shell
pip install -U langchain-cli
```

Pour créer un nouveau projet LangChain et installer celui-ci comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package rag-codellama-fireworks
```

Si vous voulez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add rag-codellama-fireworks
```

Et ajoutez le code suivant à votre fichier `server.py` :

```python
from rag_codellama_fireworks import chain as rag_codellama_fireworks_chain

add_routes(app, rag_codellama_fireworks_chain, path="/rag-codellama-fireworks")
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
Nous pouvons accéder au playground à l'adresse [http://127.0.0.1:8000/rag-codellama-fireworks/playground](http://127.0.0.1:8000/rag-codellama-fireworks/playground)

Nous pouvons accéder au modèle à partir du code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-codellama-fireworks")
```
