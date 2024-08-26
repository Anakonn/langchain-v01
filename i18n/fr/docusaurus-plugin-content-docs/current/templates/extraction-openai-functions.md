---
translated: true
---

# extraction-openai-functions

Ce modèle utilise [l'appel de fonction OpenAI](https://python.langchain.com/docs/modules/chains/how_to/openai_functions) pour l'extraction de sorties structurées à partir de textes non structurés.

Le schéma de sortie d'extraction peut être défini dans `chain.py`.

## Configuration de l'environnement

Définissez la variable d'environnement `OPENAI_API_KEY` pour accéder aux modèles OpenAI.

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir installé le CLI LangChain :

```shell
pip install -U langchain-cli
```

Pour créer un nouveau projet LangChain et installer celui-ci comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package extraction-openai-functions
```

Si vous voulez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add extraction-openai-functions
```

Et ajoutez le code suivant à votre fichier `server.py` :

```python
from extraction_openai_functions import chain as extraction_openai_functions_chain

add_routes(app, extraction_openai_functions_chain, path="/extraction-openai-functions")
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
Nous pouvons accéder au playground sur [http://127.0.0.1:8000/extraction-openai-functions/playground](http://127.0.0.1:8000/extraction-openai-functions/playground)

Nous pouvons accéder au modèle à partir du code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/extraction-openai-functions")
```

Par défaut, ce package est configuré pour extraire le titre et l'auteur des documents, comme spécifié dans le fichier `chain.py`.

LLM est utilisé par défaut par la fonction OpenAI.
