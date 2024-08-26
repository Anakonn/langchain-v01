---
translated: true
---

# sql-pgvector

Ce modèle permet à l'utilisateur d'utiliser `pgvector` pour combiner PostgreSQL avec la recherche sémantique / RAG.

Il utilise l'extension [PGVector](https://github.com/pgvector/pgvector) comme indiqué dans le [RAG empowered SQL cookbook](https://github.com/langchain-ai/langchain/blob/master/cookbook/retrieval_in_sql.ipynb)

## Configuration de l'environnement

Si vous utilisez `ChatOpenAI` comme LLM, assurez-vous que la variable d'environnement `OPENAI_API_KEY` est définie. Vous pouvez modifier le LLM et le modèle d'embeddings dans `chain.py`

Vous pouvez également configurer les variables d'environnement suivantes
pour utiliser le modèle (les valeurs par défaut sont entre parenthèses) :

- `POSTGRES_USER` (postgres)
- `POSTGRES_PASSWORD` (test)
- `POSTGRES_DB` (vectordb)
- `POSTGRES_HOST` (localhost)
- `POSTGRES_PORT` (5432)

Si vous n'avez pas d'instance PostgreSQL, vous pouvez en exécuter une localement dans Docker :

```bash
docker run \
  --name some-postgres \
  -e POSTGRES_PASSWORD=test \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=vectordb \
  -p 5432:5432 \
  postgres:16
```

Et pour la redémarrer plus tard, utilisez le `--name` défini ci-dessus :

```bash
docker start some-postgres
```

### Configuration de la base de données PostgreSQL

En plus d'avoir l'extension `pgvector` activée, vous devrez effectuer quelques configurations avant de pouvoir exécuter des recherches sémantiques dans vos requêtes SQL.

Pour exécuter RAG sur votre base de données PostgreSQL, vous devrez générer les embeddings pour les colonnes spécifiques que vous souhaitez.

Ce processus est décrit dans le [RAG empowered SQL cookbook](https://github.com/langchain-ai/langchain/blob/master/cookbook/retrieval_in_sql.ipynb), mais l'approche générale consiste à :
1. Interroger les valeurs uniques de la colonne
2. Générer les embeddings pour ces valeurs
3. Stocker les embeddings dans une colonne séparée ou dans une table auxiliaire.

## Utilisation

Pour utiliser ce package, vous devez d'abord avoir installé le CLI LangChain :

```shell
pip install -U langchain-cli
```

Pour créer un nouveau projet LangChain et installer uniquement ce package, vous pouvez faire :

```shell
langchain app new my-app --package sql-pgvector
```

Si vous voulez l'ajouter à un projet existant, vous pouvez simplement exécuter :

```shell
langchain app add sql-pgvector
```

Et ajouter le code suivant à votre fichier `server.py` :

```python
from sql_pgvector import chain as sql_pgvector_chain

add_routes(app, sql_pgvector_chain, path="/sql-pgvector")
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

Si vous êtes dans ce répertoire, vous pouvez lancer une instance LangServe directement en exécutant :

```shell
langchain serve
```

Cela démarrera l'application FastAPI avec un serveur en cours d'exécution localement sur
[http://localhost:8000](http://localhost:8000)

Nous pouvons voir tous les modèles sur [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Nous pouvons accéder au playground sur [http://127.0.0.1:8000/sql-pgvector/playground](http://127.0.0.1:8000/sql-pgvector/playground)

Nous pouvons accéder au modèle depuis le code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/sql-pgvector")
```
