---
translated: true
---

# Recherche hybride dans Weaviate

Ce modèle vous montre comment utiliser la fonctionnalité de recherche hybride dans Weaviate. La recherche hybride combine plusieurs algorithmes de recherche pour améliorer la précision et la pertinence des résultats de recherche.

Weaviate utilise à la fois des vecteurs épars et denses pour représenter le sens et le contexte des requêtes de recherche et des documents. Les résultats utilisent une combinaison du classement `bm25` et de la recherche vectorielle pour renvoyer les meilleurs résultats.

##  Configurations

Connectez-vous à votre Weaviate Vectorstore hébergé en définissant quelques variables d'environnement dans `chain.py` :

* `WEAVIATE_ENVIRONMENT`
* `WEAVIATE_API_KEY`

Vous devrez également définir votre `OPENAI_API_KEY` pour utiliser les modèles OpenAI.

## Démarrer

Pour utiliser ce package, vous devez d'abord avoir installé l'interface en ligne de commande LangChain :

```shell
pip install -U langchain-cli
```

Pour créer un nouveau projet LangChain et installer celui-ci comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package hybrid-search-weaviate
```

Si vous voulez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add hybrid-search-weaviate
```

Et ajouter le code suivant à votre fichier `server.py` :

```python
from hybrid_search_weaviate import chain as hybrid_search_weaviate_chain

add_routes(app, hybrid_search_weaviate_chain, path="/hybrid-search-weaviate")
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

Si vous êtes dans ce répertoire, vous pouvez alors lancer une instance LangServe directement en exécutant :

```shell
langchain serve
```

Cela démarrera l'application FastAPI avec un serveur en cours d'exécution localement sur
[http://localhost:8000](http://localhost:8000)

Nous pouvons voir tous les modèles sur [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Nous pouvons accéder au playground sur [http://127.0.0.1:8000/hybrid-search-weaviate/playground](http://127.0.0.1:8000/hybrid-search-weaviate/playground)

Nous pouvons accéder au modèle à partir du code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/hybrid-search-weaviate")
```
