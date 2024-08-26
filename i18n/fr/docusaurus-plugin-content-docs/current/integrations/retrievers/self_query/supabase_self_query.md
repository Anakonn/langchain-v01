---
translated: true
---

# Supabase (Postgres)

>[Supabase](https://supabase.com/docs) est une alternative open-source à `Firebase`.
> `Supabase` est construit sur `PostgreSQL`, qui offre de puissantes capacités de requêtage `SQL`
> et permet une interface simple avec des outils et frameworks déjà existants.

>[PostgreSQL](https://en.wikipedia.org/wiki/PostgreSQL), également connu sous le nom de `Postgres`,
> est un système de gestion de base de données relationnelle (SGBDR) gratuit et open-source
> mettant l'accent sur l'extensibilité et la conformité `SQL`.
>
>[Supabase](https://supabase.com/docs/guides/ai) fournit une boîte à outils open-source pour le développement d'applications IA
>utilisant Postgres et pgvector. Utilisez les bibliothèques clientes Supabase pour stocker, indexer et interroger vos embeddings vectoriels à grande échelle.

Dans le notebook, nous allons démontrer le `SelfQueryRetriever` enveloppé autour d'un `Supabase` vector store.

Plus précisément, nous allons :
1. Créer une base de données Supabase
2. Activer l'extension `pgvector`
3. Créer une table `documents` et une fonction `match_documents` qui seront utilisées par `SupabaseVectorStore`
4. Charger des documents d'exemple dans le vector store (table de base de données)
5. Construire et tester un retrieveur auto-interrogateur

## Configuration de la base de données Supabase

1. Rendez-vous sur https://database.new pour provisionner votre base de données Supabase.
2. Dans le studio, accédez à l'[éditeur SQL](https://supabase.com/dashboard/project/_/sql/new) et exécutez le script suivant pour activer `pgvector` et configurer votre base de données en tant que vector store :
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

## Création d'un vector store Supabase

Ensuite, nous allons créer un vector store Supabase et le remplir avec quelques données. Nous avons créé un petit ensemble de documents de démonstration contenant des résumés de films.

Assurez-vous d'installer la dernière version de `langchain` avec le support `openai` :

```python
%pip install --upgrade --quiet  langchain langchain-openai tiktoken
```

Le retrieveur auto-interrogateur nécessite que vous ayez `lark` installé :

```python
%pip install --upgrade --quiet  lark
```

Nous avons également besoin du package `supabase` :

```python
%pip install --upgrade --quiet  supabase
```

Puisque nous utilisons `SupabaseVectorStore` et `OpenAIEmbeddings`, nous devons charger leurs clés API.

- Pour trouver votre `SUPABASE_URL` et `SUPABASE_SERVICE_KEY`, rendez-vous dans les [paramètres API](https://supabase.com/dashboard/project/_/settings/api) de votre projet Supabase.
  - `SUPABASE_URL` correspond à l'URL du projet
  - `SUPABASE_SERVICE_KEY` correspond à la clé API `service_role`

- Pour obtenir votre `OPENAI_API_KEY`, accédez aux [clés API](https://platform.openai.com/account/api-keys) de votre compte OpenAI et créez une nouvelle clé secrète.

```python
import getpass
import os

os.environ["SUPABASE_URL"] = getpass.getpass("Supabase URL:")
os.environ["SUPABASE_SERVICE_KEY"] = getpass.getpass("Supabase Service Key:")
os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

_Optionnel :_ Si vous stockez vos clés API Supabase et OpenAI dans un fichier `.env`, vous pouvez les charger avec [`dotenv`](https://github.com/theskumar/python-dotenv).

```python
%pip install --upgrade --quiet  python-dotenv
```

```python
from dotenv import load_dotenv

load_dotenv()
```

Tout d'abord, nous allons créer un client Supabase et instancier une classe d'embeddings OpenAI.

```python
import os

from langchain_community.vectorstores import SupabaseVectorStore
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings
from supabase.client import Client, create_client

supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

embeddings = OpenAIEmbeddings()
```

Ensuite, créons nos documents.

```python
docs = [
    Document(
        page_content="A bunch of scientists bring back dinosaurs and mayhem breaks loose",
        metadata={"year": 1993, "rating": 7.7, "genre": "science fiction"},
    ),
    Document(
        page_content="Leo DiCaprio gets lost in a dream within a dream within a dream within a ...",
        metadata={"year": 2010, "director": "Christopher Nolan", "rating": 8.2},
    ),
    Document(
        page_content="A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea",
        metadata={"year": 2006, "director": "Satoshi Kon", "rating": 8.6},
    ),
    Document(
        page_content="A bunch of normal-sized women are supremely wholesome and some men pine after them",
        metadata={"year": 2019, "director": "Greta Gerwig", "rating": 8.3},
    ),
    Document(
        page_content="Toys come alive and have a blast doing so",
        metadata={"year": 1995, "genre": "animated"},
    ),
    Document(
        page_content="Three men walk into the Zone, three men walk out of the Zone",
        metadata={
            "year": 1979,
            "director": "Andrei Tarkovsky",
            "genre": "science fiction",
            "rating": 9.9,
        },
    ),
]

vectorstore = SupabaseVectorStore.from_documents(
    docs,
    embeddings,
    client=supabase,
    table_name="documents",
    query_name="match_documents",
)
```

## Création de notre retrieveur auto-interrogateur

Maintenant, nous pouvons instancier notre retrieveur. Pour ce faire, nous devrons fournir des informations préalables sur les champs de métadonnées pris en charge par nos documents et une brève description du contenu des documents.

```python
from langchain.chains.query_constructor.base import AttributeInfo
from langchain.retrievers.self_query.base import SelfQueryRetriever
from langchain_openai import OpenAI

metadata_field_info = [
    AttributeInfo(
        name="genre",
        description="The genre of the movie",
        type="string or list[string]",
    ),
    AttributeInfo(
        name="year",
        description="The year the movie was released",
        type="integer",
    ),
    AttributeInfo(
        name="director",
        description="The name of the movie director",
        type="string",
    ),
    AttributeInfo(
        name="rating", description="A 1-10 rating for the movie", type="float"
    ),
]
document_content_description = "Brief summary of a movie"
llm = OpenAI(temperature=0)
retriever = SelfQueryRetriever.from_llm(
    llm, vectorstore, document_content_description, metadata_field_info, verbose=True
)
```

## Test

Et maintenant, nous pouvons essayer d'utiliser notre retrieveur !

```python
# This example only specifies a relevant query
retriever.invoke("What are some movies about dinosaurs")
```

```output
query='dinosaur' filter=None limit=None
```

```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'year': 1993, 'genre': 'science fiction', 'rating': 7.7}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995, 'genre': 'animated'}),
 Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979, 'genre': 'science fiction', 'rating': 9.9, 'director': 'Andrei Tarkovsky'}),
 Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'year': 2006, 'rating': 8.6, 'director': 'Satoshi Kon'})]
```

```python
# This example only specifies a filter
retriever.invoke("I want to watch a movie rated higher than 8.5")
```

```output
query=' ' filter=Comparison(comparator=<Comparator.GT: 'gt'>, attribute='rating', value=8.5) limit=None
```

```output
[Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979, 'genre': 'science fiction', 'rating': 9.9, 'director': 'Andrei Tarkovsky'}),
 Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'year': 2006, 'rating': 8.6, 'director': 'Satoshi Kon'})]
```

```python
# This example specifies a query and a filter
retriever.invoke("Has Greta Gerwig directed any movies about women?")
```

```output
query='women' filter=Comparison(comparator=<Comparator.EQ: 'eq'>, attribute='director', value='Greta Gerwig') limit=None
```

```output
[Document(page_content='A bunch of normal-sized women are supremely wholesome and some men pine after them', metadata={'year': 2019, 'rating': 8.3, 'director': 'Greta Gerwig'})]
```

```python
# This example specifies a composite filter
retriever.invoke("What's a highly rated (above 8.5) science fiction film?")
```

```output
query=' ' filter=Operation(operator=<Operator.AND: 'and'>, arguments=[Comparison(comparator=<Comparator.GTE: 'gte'>, attribute='rating', value=8.5), Comparison(comparator=<Comparator.EQ: 'eq'>, attribute='genre', value='science fiction')]) limit=None
```

```output
[Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979, 'genre': 'science fiction', 'rating': 9.9, 'director': 'Andrei Tarkovsky'})]
```

```python
# This example specifies a query and composite filter
retriever.invoke(
    "What's a movie after 1990 but before (or on) 2005 that's all about toys, and preferably is animated"
)
```

```output
query='toys' filter=Operation(operator=<Operator.AND: 'and'>, arguments=[Comparison(comparator=<Comparator.GT: 'gt'>, attribute='year', value=1990), Comparison(comparator=<Comparator.LTE: 'lte'>, attribute='year', value=2005), Comparison(comparator=<Comparator.LIKE: 'like'>, attribute='genre', value='animated')]) limit=None
```

```output
[Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995, 'genre': 'animated'})]
```

## Filtrer k

Nous pouvons également utiliser le retrieveur auto-interrogateur pour spécifier `k` : le nombre de documents à récupérer.

Nous pouvons le faire en passant `enable_limit=True` au constructeur.

```python
retriever = SelfQueryRetriever.from_llm(
    llm,
    vectorstore,
    document_content_description,
    metadata_field_info,
    enable_limit=True,
    verbose=True,
)
```

```python
# This example only specifies a relevant query
retriever.invoke("what are two movies about dinosaurs")
```

```output
query='dinosaur' filter=None limit=2
```

```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'year': 1993, 'genre': 'science fiction', 'rating': 7.7}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995, 'genre': 'animated'})]
```
