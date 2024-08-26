---
translated: true
---

# hyde

Ce modèle utilise HyDE avec RAG.

Hyde est une méthode de récupération qui signifie Hypothetical Document Embeddings (HyDE). C'est une méthode utilisée pour améliorer la récupération en générant un document hypothétique pour une requête entrante.

Le document est ensuite intégré, et cette intégration est utilisée pour rechercher les vrais documents qui sont similaires au document hypothétique.

Le concept sous-jacent est que le document hypothétique peut être plus proche dans l'espace d'intégration que la requête.

Pour une description plus détaillée, voir le document [ici](https://arxiv.org/abs/2212.10496).

## Configuration de l'environnement

Définissez la variable d'environnement `OPENAI_API_KEY` pour accéder aux modèles OpenAI.

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir installé le CLI LangChain :

```shell
pip install -U langchain-cli
```

Pour créer un nouveau projet LangChain et installer celui-ci comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package hyde
```

Si vous voulez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add hyde
```

Et ajoutez le code suivant à votre fichier `server.py` :

```python
from hyde.chain import chain as hyde_chain

add_routes(app, hyde_chain, path="/hyde")
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

Cela démarrera l'application FastAPI avec un serveur qui tourne localement sur
[http://localhost:8000](http://localhost:8000)

Nous pouvons voir tous les modèles sur [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Nous pouvons accéder au playground sur [http://127.0.0.1:8000/hyde/playground](http://127.0.0.1:8000/hyde/playground)

Nous pouvons accéder au modèle à partir du code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/hyde")
```
