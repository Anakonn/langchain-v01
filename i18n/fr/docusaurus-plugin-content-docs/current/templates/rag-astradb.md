---
translated: true
---

# rag-astradb

Ce modèle effectuera un RAG (Résumé Automatique de Génération) à l'aide d'Astra DB (`AstraDB` classe de stockage vectoriel)

## Configuration de l'environnement

Une base de données [Astra DB](https://astra.datastax.com) est requise ; le niveau gratuit convient.

- Vous avez besoin de l'**endpoint API** de la base de données (comme `https://0123...-us-east1.apps.astra.datastax.com`) ...
- ... et d'un **jeton** (`AstraCS:...`).

Une **clé API OpenAI** est également nécessaire. _Notez que par défaut, cette démonstration ne prend en charge que OpenAI, sauf si vous modifiez le code._

Fournissez les paramètres de connexion et les secrets via des variables d'environnement. Veuillez vous référer à `.env.template` pour connaître les noms des variables.

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir installé le CLI LangChain :

```shell
pip install -U "langchain-cli[serve]"
```

Pour créer un nouveau projet LangChain et installer celui-ci comme seul package, vous pouvez faire :

```shell
langchain app new my-app --package rag-astradb
```

Si vous voulez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add rag-astradb
```

Et ajoutez le code suivant à votre fichier `server.py` :

```python
from astradb_entomology_rag import chain as astradb_entomology_rag_chain

add_routes(app, astradb_entomology_rag_chain, path="/rag-astradb")
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

Si vous êtes dans ce répertoire, vous pouvez lancer une instance LangServe directement en :

```shell
langchain serve
```

Cela démarrera l'application FastAPI avec un serveur en cours d'exécution localement sur
[http://localhost:8000](http://localhost:8000)

Nous pouvons voir tous les modèles sur [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Nous pouvons accéder au playground sur [http://127.0.0.1:8000/rag-astradb/playground](http://127.0.0.1:8000/rag-astradb/playground)

Nous pouvons accéder au modèle à partir du code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-astradb")
```

## Référence

Dépôt autonome avec la chaîne LangServe : [ici](https://github.com/hemidactylus/langserve_astradb_entomology_rag).
