---
translated: true
---

# sql-ollama

Ce modèle permet à un utilisateur d'interagir avec une base de données SQL en utilisant un langage naturel.

Il utilise [Zephyr-7b](https://huggingface.co/HuggingFaceH4/zephyr-7b-alpha) via [Ollama](https://ollama.ai/library/zephyr) pour exécuter l'inférence localement sur un ordinateur portable Mac.

## Configuration de l'environnement

Avant d'utiliser ce modèle, vous devez configurer Ollama et la base de données SQL.

1. Suivez les instructions [ici](https://python.langchain.com/docs/integrations/chat/ollama) pour télécharger Ollama.

2. Téléchargez le LLM de votre choix :

    * Ce package utilise `zephyr` : `ollama pull zephyr`
    * Vous pouvez choisir parmi de nombreux LLM [ici](https://ollama.ai/library)

3. Ce package inclut un exemple de base de données des effectifs NBA 2023. Vous pouvez voir les instructions pour construire cette base de données [ici](https://github.com/facebookresearch/llama-recipes/blob/main/demo_apps/StructuredLlama.ipynb).

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir installé le CLI LangChain :

```shell
pip install -U langchain-cli
```

Pour créer un nouveau projet LangChain et installer celui-ci comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package sql-ollama
```

Si vous voulez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add sql-ollama
```

Et ajouter le code suivant à votre fichier `server.py` :

```python
from sql_ollama import chain as sql_ollama_chain

add_routes(app, sql_ollama_chain, path="/sql-ollama")
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

Cela démarrera l'application FastAPI avec un serveur en cours d'exécution localement sur
[http://localhost:8000](http://localhost:8000)

Nous pouvons voir tous les modèles sur [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Nous pouvons accéder au playground sur [http://127.0.0.1:8000/sql-ollama/playground](http://127.0.0.1:8000/sql-ollama/playground)

Nous pouvons accéder au modèle à partir du code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/sql-ollama")
```
