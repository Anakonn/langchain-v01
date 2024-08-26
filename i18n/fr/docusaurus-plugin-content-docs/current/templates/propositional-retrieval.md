---
translated: true
---

# propositional-retrieval

Ce modèle démontre la stratégie d'indexation multi-vecteur proposée par Chen et al. dans leur article [Dense X Retrieval: What Retrieval Granularity Should We Use?](https://arxiv.org/abs/2312.06648). L'invite, que vous pouvez [essayer sur le hub](https://smith.langchain.com/hub/wfh/proposal-indexing), demande à un LLM de générer des "propositions" décontextualisées qui peuvent être vectorisées pour augmenter la précision de la récupération. Vous pouvez voir la définition complète dans `proposal_chain.py`.

## Stockage

Pour cette démonstration, nous indexons un simple article universitaire à l'aide de RecursiveUrlLoader et stockons toutes les informations du récupérateur localement (à l'aide de chroma et d'un bytestore stocké sur le système de fichiers local). Vous pouvez modifier la couche de stockage dans `storage.py`.

## Configuration de l'environnement

Définissez la variable d'environnement `OPENAI_API_KEY` pour accéder aux classes `gpt-3.5` et OpenAI Embeddings.

## Indexation

Créez l'index en exécutant ce qui suit :

```python
poetry install
poetry run python propositional_retrieval/ingest.py
```

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir installé le CLI LangChain :

```shell
pip install -U langchain-cli
```

Pour créer un nouveau projet LangChain et installer celui-ci comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package propositional-retrieval
```

Si vous voulez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add propositional-retrieval
```

Et ajoutez le code suivant à votre fichier `server.py` :

```python
from propositional_retrieval import chain

add_routes(app, chain, path="/propositional-retrieval")
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
Nous pouvons accéder au playground sur [http://127.0.0.1:8000/propositional-retrieval/playground](http://127.0.0.1:8000/propositional-retrieval/playground)

Nous pouvons accéder au modèle à partir du code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/propositional-retrieval")
```
