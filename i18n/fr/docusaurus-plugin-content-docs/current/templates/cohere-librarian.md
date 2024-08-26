---
translated: true
---

# cohere-librarian

Ce modèle transforme Cohere en bibliothécaire.

Il démontre l'utilisation d'un routeur pour basculer entre les chaînes qui peuvent gérer différentes choses : une base de données vectorielle avec des embeddings Cohere ; un chatbot avec un prompt contenant des informations sur la bibliothèque ; et enfin un chatbot RAG qui a accès à Internet.

Pour une démonstration plus complète de la recommandation de livres, envisagez de remplacer books_with_blurbs.csv par un échantillon plus important du jeu de données suivant : https://www.kaggle.com/datasets/jdobrow/57000-books-with-metadata-and-blurbs/ .

## Configuration de l'environnement

Définissez la variable d'environnement `COHERE_API_KEY` pour accéder aux modèles Cohere.

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir installé le CLI LangChain :

```shell
pip install -U langchain-cli
```

Pour créer un nouveau projet LangChain et installer celui-ci comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package cohere-librarian
```

Si vous voulez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add cohere-librarian
```

Et ajoutez le code suivant à votre fichier `server.py` :

```python
from cohere_librarian.chain import chain as cohere_librarian_chain

add_routes(app, cohere_librarian_chain, path="/cohere-librarian")
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

Nous pouvons voir tous les modèles sur [http://localhost:8000/docs](http://localhost:8000/docs)
Nous pouvons accéder au playground sur [http://localhost:8000/cohere-librarian/playground](http://localhost:8000/cohere-librarian/playground)

Nous pouvons accéder au modèle à partir du code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/cohere-librarian")
```
