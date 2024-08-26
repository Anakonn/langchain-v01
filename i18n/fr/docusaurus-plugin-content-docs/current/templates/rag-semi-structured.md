---
translated: true
---

# rag-semi-structuré

Ce modèle effectue RAG sur des données semi-structurées, comme un PDF avec du texte et des tableaux.

Voir [ce livre de recettes](https://github.com/langchain-ai/langchain/blob/master/cookbook/Semi_Structured_RAG.ipynb) comme référence.

## Configuration de l'environnement

Définissez la variable d'environnement `OPENAI_API_KEY` pour accéder aux modèles OpenAI.

Cela utilise [Unstructured](https://unstructured-io.github.io/unstructured/) pour l'analyse de PDF, ce qui nécessite l'installation de certains packages au niveau du système.

Sur Mac, vous pouvez installer les packages nécessaires avec la commande suivante :

```shell
brew install tesseract poppler
```

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir installé le CLI LangChain :

```shell
pip install -U langchain-cli
```

Pour créer un nouveau projet LangChain et installer celui-ci comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package rag-semi-structured
```

Si vous voulez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add rag-semi-structured
```

Et ajouter le code suivant à votre fichier `server.py` :

```python
from rag_semi_structured import chain as rag_semi_structured_chain

add_routes(app, rag_semi_structured_chain, path="/rag-semi-structured")
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

Si vous êtes dans ce répertoire, vous pouvez lancer une instance LangServe directement en exécutant :

```shell
langchain serve
```

Cela démarrera l'application FastAPI avec un serveur en cours d'exécution localement sur
[http://localhost:8000](http://localhost:8000)

Nous pouvons voir tous les modèles sur [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Nous pouvons accéder au playground sur [http://127.0.0.1:8000/rag-semi-structured/playground](http://127.0.0.1:8000/rag-semi-structured/playground)

Nous pouvons accéder au modèle à partir du code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-semi-structured")
```

Pour plus de détails sur la connexion au modèle, reportez-vous au notebook Jupyter `rag_semi_structured`.
