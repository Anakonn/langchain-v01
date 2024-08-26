---
translated: true
---

# Supabase (Postgres)

>[Supabase](https://supabase.com/docs) est une alternative open-source à Firebase. `Supabase` est construit sur `PostgreSQL`, qui offre de puissantes capacités de requêtage SQL et permet une interface simple avec des outils et des frameworks déjà existants.

>[PostgreSQL](https://en.wikipedia.org/wiki/PostgreSQL), également connu sous le nom de `Postgres`, est un système de gestion de base de données relationnelle (SGBDR) gratuit et open-source, mettant l'accent sur l'extensibilité et la conformité SQL.

Ce notebook montre comment utiliser `Supabase` et `pgvector` comme votre VectorStore.

Pour exécuter ce notebook, assurez-vous :
- que l'extension `pgvector` est activée
- que vous avez installé le package `supabase-py`
- que vous avez créé une fonction `match_documents` dans votre base de données
- que vous avez une table `documents` dans votre schéma `public` similaire à celle ci-dessous.

La fonction suivante détermine la similarité cosinus, mais vous pouvez l'ajuster à vos besoins.

```sql
-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create a table to store your documents
create table
  documents (
    id uuid primary key,
    content text, -- corresponds to Document.pageContent
    metadata jsonb, -- corresponds to Document.metadata
    embedding vector (1536) -- 1536 works for OpenAI embeddings, change if needed
  );

-- Create a function to search for documents
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

```python
# with pip
%pip install --upgrade --quiet  supabase

# with conda
# !conda install -c conda-forge supabase
```

Nous voulons utiliser `OpenAIEmbeddings`, donc nous devons obtenir la clé API OpenAI.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```python
os.environ["SUPABASE_URL"] = getpass.getpass("Supabase URL:")
```

```python
os.environ["SUPABASE_SERVICE_KEY"] = getpass.getpass("Supabase Service Key:")
```

```python
# If you're storing your Supabase and OpenAI API keys in a .env file, you can load them with dotenv
from dotenv import load_dotenv

load_dotenv()
```

Tout d'abord, nous allons créer un client Supabase et instancier une classe d'embeddings OpenAI.

```python
import os

from langchain_community.vectorstores import SupabaseVectorStore
from langchain_openai import OpenAIEmbeddings
from supabase.client import Client, create_client

supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

embeddings = OpenAIEmbeddings()
```

Ensuite, nous allons charger et analyser quelques données pour notre vector store (ignorez si vous avez déjà des documents avec des embeddings stockés dans votre base de données).

```python
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
```

Insérez les documents ci-dessus dans la base de données. Les embeddings seront automatiquement générés pour chaque document. Vous pouvez ajuster le `chunk_size` en fonction du nombre de documents que vous avez. La valeur par défaut est 500 mais la diminuer peut être nécessaire.

```python
vector_store = SupabaseVectorStore.from_documents(
    docs,
    embeddings,
    client=supabase,
    table_name="documents",
    query_name="match_documents",
    chunk_size=500,
)
```

Sinon, si vous avez déjà des documents avec des embeddings dans votre base de données, il vous suffit d'instancier directement un nouveau `SupabaseVectorStore` :

```python
vector_store = SupabaseVectorStore(
    embedding=embeddings,
    client=supabase,
    table_name="documents",
    query_name="match_documents",
)
```

Enfin, testez-le en effectuant une recherche de similarité :

```python
query = "What did the president say about Ketanji Brown Jackson"
matched_docs = vector_store.similarity_search(query)
```

```python
print(matched_docs[0].page_content)
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

## Recherche de similarité avec score

Le score de distance renvoyé est la distance cosinus. Par conséquent, un score plus faible est meilleur.

```python
matched_docs = vector_store.similarity_search_with_relevance_scores(query)
```

```python
matched_docs[0]
```

```output
(Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': '../../../state_of_the_union.txt'}),
 0.802509746274066)
```

## Options du Retriever

Cette section passe en revue différentes options pour utiliser SupabaseVectorStore comme un retriever.

### Recherches de pertinence marginale maximale

En plus d'utiliser la recherche de similarité dans l'objet retriever, vous pouvez également utiliser `mmr`.

```python
retriever = vector_store.as_retriever(search_type="mmr")
```

```python
matched_docs = retriever.invoke(query)
```

```python
for i, d in enumerate(matched_docs):
    print(f"\n## Document {i}\n")
    print(d.page_content)
```

```output

## Document 0

Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.

## Document 1

One was stationed at bases and breathing in toxic smoke from “burn pits” that incinerated wastes of war—medical and hazard material, jet fuel, and more.

When they came home, many of the world’s fittest and best trained warriors were never the same.

Headaches. Numbness. Dizziness.

A cancer that would put them in a flag-draped coffin.

I know.

One of those soldiers was my son Major Beau Biden.

We don’t know for sure if a burn pit was the cause of his brain cancer, or the diseases of so many of our troops.

But I’m committed to finding out everything we can.

Committed to military families like Danielle Robinson from Ohio.

The widow of Sergeant First Class Heath Robinson.

He was born a soldier. Army National Guard. Combat medic in Kosovo and Iraq.

Stationed near Baghdad, just yards from burn pits the size of football fields.

Heath’s widow Danielle is here with us tonight. They loved going to Ohio State football games. He loved building Legos with their daughter.

## Document 2

And I’m taking robust action to make sure the pain of our sanctions  is targeted at Russia’s economy. And I will use every tool at our disposal to protect American businesses and consumers.

Tonight, I can announce that the United States has worked with 30 other countries to release 60 Million barrels of oil from reserves around the world.

America will lead that effort, releasing 30 Million barrels from our own Strategic Petroleum Reserve. And we stand ready to do more if necessary, unified with our allies.

These steps will help blunt gas prices here at home. And I know the news about what’s happening can seem alarming.

But I want you to know that we are going to be okay.

When the history of this era is written Putin’s war on Ukraine will have left Russia weaker and the rest of the world stronger.

While it shouldn’t have taken something so terrible for people around the world to see what’s at stake now everyone sees it clearly.

## Document 3

We can’t change how divided we’ve been. But we can change how we move forward—on COVID-19 and other issues we must face together.

I recently visited the New York City Police Department days after the funerals of Officer Wilbert Mora and his partner, Officer Jason Rivera.

They were responding to a 9-1-1 call when a man shot and killed them with a stolen gun.

Officer Mora was 27 years old.

Officer Rivera was 22.

Both Dominican Americans who’d grown up on the same streets they later chose to patrol as police officers.

I spoke with their families and told them that we are forever in debt for their sacrifice, and we will carry on their mission to restore the trust and safety every community deserves.

I’ve worked on these issues a long time.

I know what works: Investing in crime prevention and community police officers who’ll walk the beat, who’ll know the neighborhood, and who can restore trust and safety.
```
