---
translated: true
---

# llama2-functions

Ce modèle effectue l'extraction de données structurées à partir de données non structurées à l'aide d'un [modèle LLaMA2 qui prend en charge un schéma de sortie JSON spécifié](https://github.com/ggerganov/llama.cpp/blob/master/grammars/README.md).

Le schéma d'extraction peut être défini dans `chain.py`.

## Configuration de l'environnement

Cela utilisera un [modèle LLaMA2-13b hébergé par Replicate](https://replicate.com/andreasjansson/llama-2-13b-chat-gguf/versions).

Assurez-vous que `REPLICATE_API_TOKEN` est défini dans votre environnement.

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir installé l'interface en ligne de commande LangChain :

```shell
pip install -U langchain-cli
```

Pour créer un nouveau projet LangChain et installer celui-ci comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package llama2-functions
```

Si vous voulez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add llama2-functions
```

Et ajoutez le code suivant à votre fichier `server.py` :

```python
from llama2_functions import chain as llama2_functions_chain

add_routes(app, llama2_functions_chain, path="/llama2-functions")
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

Nous pouvons voir tous les modèles sur [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Nous pouvons accéder au playground sur [http://127.0.0.1:8000/llama2-functions/playground](http://127.0.0.1:8000/llama2-functions/playground)

Nous pouvons accéder au modèle à partir du code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/llama2-functions")
```
