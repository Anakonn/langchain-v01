---
translated: true
---

# sql-llama2

Ce modèle permet à un utilisateur d'interagir avec une base de données SQL en utilisant un langage naturel.

Il utilise LLamA2-13b hébergé par [Replicate](https://python.langchain.com/docs/integrations/llms/replicate), mais peut être adapté à n'importe quelle API prenant en charge LLaMA2, y compris [Fireworks](https://python.langchain.com/docs/integrations/chat/fireworks).

Le modèle inclut un exemple de base de données des effectifs NBA 2023.

Pour plus d'informations sur la façon de construire cette base de données, voir [ici](https://github.com/facebookresearch/llama-recipes/blob/main/demo_apps/StructuredLlama.ipynb).

## Configuration de l'environnement

Assurez-vous que le `REPLICATE_API_TOKEN` est défini dans votre environnement.

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir installé le CLI LangChain :

```shell
pip install -U langchain-cli
```

Pour créer un nouveau projet LangChain et installer celui-ci comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package sql-llama2
```

Si vous voulez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add sql-llama2
```

Et ajouter le code suivant à votre fichier `server.py` :

```python
from sql_llama2 import chain as sql_llama2_chain

add_routes(app, sql_llama2_chain, path="/sql-llama2")
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

Si vous êtes dans ce répertoire, vous pouvez alors lancer une instance LangServe directement en :

```shell
langchain serve
```

Cela démarrera l'application FastAPI avec un serveur en cours d'exécution localement sur
[http://localhost:8000](http://localhost:8000)

Nous pouvons voir tous les modèles sur [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Nous pouvons accéder au playground sur [http://127.0.0.1:8000/sql-llama2/playground](http://127.0.0.1:8000/sql-llama2/playground)

Nous pouvons accéder au modèle à partir du code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/sql-llama2")
```
