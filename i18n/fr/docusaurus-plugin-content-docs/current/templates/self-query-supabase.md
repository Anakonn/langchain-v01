---
translated: true
---

# self-query-supabase

Ce modèle permet une interrogation structurée en langage naturel de Supabase.

[Supabase](https://supabase.com/docs) est une alternative open-source à Firebase, construite sur [PostgreSQL](https://en.wikipedia.org/wiki/PostgreSQL).

Il utilise [pgvector](https://github.com/pgvector/pgvector) pour stocker les embeddings dans vos tables.

## Configuration de l'environnement

Définissez la variable d'environnement `OPENAI_API_KEY` pour accéder aux modèles OpenAI.

Pour obtenir votre `OPENAI_API_KEY`, accédez à [API keys](https://platform.openai.com/account/api-keys) sur votre compte OpenAI et créez une nouvelle clé secrète.

Pour trouver votre `SUPABASE_URL` et `SUPABASE_SERVICE_KEY`, rendez-vous dans les [paramètres API](https://supabase.com/dashboard/project/_/settings/api) de votre projet Supabase.

- `SUPABASE_URL` correspond à l'URL du projet
- `SUPABASE_SERVICE_KEY` correspond à la clé API `service_role`

```shell
export SUPABASE_URL=
export SUPABASE_SERVICE_KEY=
export OPENAI_API_KEY=
```

## Configuration de la base de données Supabase

Suivez ces étapes pour configurer votre base de données Supabase si ce n'est pas déjà fait.

1. Rendez-vous sur https://database.new pour provisionner votre base de données Supabase.
2. Dans le studio, accédez à l'[éditeur SQL](https://supabase.com/dashboard/project/_/sql/new) et exécutez le script suivant pour activer `pgvector` et configurer votre base de données en tant que magasin de vecteurs :

   ```sql
   -- Activer l'extension pgvector pour travailler avec les vecteurs d'embeddings
   create extension if not exists vector;

   -- Créer une table pour stocker vos documents
   create table
     documents (
       id uuid primary key,
       content text, -- correspond à Document.pageContent
       metadata jsonb, -- correspond à Document.metadata
       embedding vector (1536) -- 1536 fonctionne pour les embeddings OpenAI, à modifier si nécessaire
     );

   -- Créer une fonction pour rechercher des documents
   create function match_documents (
     query_embedding vector (1536),
     filter jsonb default '{}'
   ) returns table (
     id uuid,
     content text,
     metadata jsonb,
     similarity float
   ) language plpgsql as $$
   #variable_conflict use_column
   begin
     return query
     select
       id,
       content,
       metadata,
       1 - (documents.embedding <=> query_embedding) as similarity
     from documents
     where metadata @> filter
     order by documents.embedding <=> query_embedding;
   end;
   $$;
   ```

## Utilisation

Pour utiliser ce package, installez d'abord l'interface en ligne de commande LangChain :

```shell
pip install -U langchain-cli
```

Créez un nouveau projet LangChain et installez ce package comme seul dépendance :

```shell
langchain app new my-app --package self-query-supabase
```

Pour l'ajouter à un projet existant, exécutez :

```shell
langchain app add self-query-supabase
```

Ajoutez le code suivant à votre fichier `server.py` :

```python
from self_query_supabase.chain import chain as self_query_supabase_chain

add_routes(app, self_query_supabase_chain, path="/self-query-supabase")
```

(Facultatif) Si vous avez accès à LangSmith, configurez-le pour aider au traçage, à la surveillance et au débogage des applications LangChain. Si vous n'y avez pas accès, ignorez cette section.

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

Vous pouvez voir tous les modèles sur [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Accédez au playground sur [http://127.0.0.1:8000/self-query-supabase/playground](http://127.0.0.1:8000/self-query-supabase/playground)

Accédez au modèle depuis le code avec :

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/self-query-supabase")
```

TODO : Instructions pour configurer la base de données Supabase et installer le package.
