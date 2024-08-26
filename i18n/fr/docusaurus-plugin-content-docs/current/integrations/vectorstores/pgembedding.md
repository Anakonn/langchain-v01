---
translated: true
---

# Intégration de Postgres

> [Intégration de Postgres](https://github.com/neondatabase/pg_embedding) est une recherche de similarité vectorielle open-source pour `Postgres` qui utilise `Hierarchical Navigable Small Worlds (HNSW)` pour la recherche approximative du plus proche voisin.

>Il prend en charge :
>- recherche exacte et approximative du plus proche voisin en utilisant HNSW
>- distance L2

Ce notebook montre comment utiliser la base de données vectorielle Postgres (`PGEmbedding`).

> L'intégration PGEmbedding crée l'extension pg_embedding pour vous, mais vous exécutez la requête Postgres suivante pour l'ajouter :

```sql
CREATE EXTENSION embedding;
```

```python
# Pip install necessary package
%pip install --upgrade --quiet  langchain-openai
%pip install --upgrade --quiet  psycopg2-binary
%pip install --upgrade --quiet  tiktoken
```

Ajoutez la clé API OpenAI aux variables d'environnement pour utiliser `OpenAIEmbeddings`.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```output
OpenAI API Key:········
```

```python
## Loading Environment Variables
from typing import List, Tuple
```

```python
from langchain_community.docstore.document import Document
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import PGEmbedding
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

```python
os.environ["DATABASE_URL"] = getpass.getpass("Database Url:")
```

```output
Database Url:········
```

```python
loader = TextLoader("state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
connection_string = os.environ.get("DATABASE_URL")
collection_name = "state_of_the_union"
```

```python
db = PGEmbedding.from_documents(
    embedding=embeddings,
    documents=docs,
    collection_name=collection_name,
    connection_string=connection_string,
)

query = "What did the president say about Ketanji Brown Jackson"
docs_with_score: List[Tuple[Document, float]] = db.similarity_search_with_score(query)
```

```python
for doc, score in docs_with_score:
    print("-" * 80)
    print("Score: ", score)
    print(doc.page_content)
    print("-" * 80)
```

## Travailler avec vectorstore dans Postgres

### Télécharger un vectorstore dans PG

```python
db = PGEmbedding.from_documents(
    embedding=embeddings,
    documents=docs,
    collection_name=collection_name,
    connection_string=connection_string,
    pre_delete_collection=False,
)
```

### Créer un index HNSW

Par défaut, l'extension effectue une recherche par balayage séquentiel, avec un rappel de 100%. Vous pourriez envisager de créer un index HNSW pour une recherche approximative du plus proche voisin (ANN) afin d'accélérer le temps d'exécution de `similarity_search_with_score`. Pour créer l'index HNSW sur votre colonne vectorielle, utilisez une fonction `create_hnsw_index` :

```python
PGEmbedding.create_hnsw_index(
    max_elements=10000, dims=1536, m=8, ef_construction=16, ef_search=16
)
```

La fonction ci-dessus équivaut à exécuter la requête SQL ci-dessous :

```sql
CREATE INDEX ON vectors USING hnsw(vec) WITH (maxelements=10000, dims=1536, m=3, efconstruction=16, efsearch=16);
```

Les options de l'index HNSW utilisées dans la déclaration ci-dessus incluent :

- maxelements : Définit le nombre maximum d'éléments indexés. Ceci est un paramètre requis. L'exemple montré ci-dessus a une valeur de 3. Un exemple réel aurait une valeur beaucoup plus grande, telle que 1000000. Un "élément" fait référence à un point de données (un vecteur) dans l'ensemble de données, qui est représenté comme un nœud dans le graphe HNSW. Typiquement, vous définiriez cette option à une valeur capable d'accommoder le nombre de lignes dans votre ensemble de données.
- dims : Définit le nombre de dimensions dans vos données vectorielles. Ceci est un paramètre requis. Une petite valeur est utilisée dans l'exemple ci-dessus. Si vous stockez des données générées à l'aide du modèle text-embedding-ada-002 de OpenAI, qui prend en charge 1536 dimensions, vous définiriez une valeur de 1536, par exemple.
- m : Définit le nombre maximum de liens bidirectionnels (également appelés "arêtes") créés pour chaque nœud lors de la construction du graphe.
Les options d'index supplémentaires suivantes sont prises en charge :

- efConstruction : Définit le nombre de plus proches voisins considérés lors de la construction de l'index. La valeur par défaut est 32.
- efsearch : Définit le nombre de plus proches voisins considérés lors de la recherche dans l'index. La valeur par défaut est 32.
Pour des informations sur la manière dont vous pouvez configurer ces options pour influencer l'algorithme HNSW, consultez [Ajustement de l'algorithme HNSW](https://neon.tech/docs/extensions/pg_embedding#tuning-the-hnsw-algorithm).

### Récupérer un vectorstore dans PG

```python
store = PGEmbedding(
    connection_string=connection_string,
    embedding_function=embeddings,
    collection_name=collection_name,
)

retriever = store.as_retriever()
```

```python
retriever
```

```output
VectorStoreRetriever(vectorstore=<langchain_community.vectorstores.pghnsw.HNSWVectoreStore object at 0x121d3c8b0>, search_type='similarity', search_kwargs={})
```

```python
db1 = PGEmbedding.from_existing_index(
    embedding=embeddings,
    collection_name=collection_name,
    pre_delete_collection=False,
    connection_string=connection_string,
)

query = "What did the president say about Ketanji Brown Jackson"
docs_with_score: List[Tuple[Document, float]] = db1.similarity_search_with_score(query)
```

```python
for doc, score in docs_with_score:
    print("-" * 80)
    print("Score: ", score)
    print(doc.page_content)
    print("-" * 80)
```
