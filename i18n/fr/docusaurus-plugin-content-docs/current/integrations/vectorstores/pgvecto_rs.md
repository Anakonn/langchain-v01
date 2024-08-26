---
translated: true
---

# PGVecto.rs

Ce notebook montre comment utiliser les fonctionnalités liées à la base de données vectorielle Postgres ([pgvecto.rs](https://github.com/tensorchord/pgvecto.rs))).

```python
%pip install "pgvecto_rs[sdk]"
```

```python
from typing import List

from langchain_community.docstore.document import Document
from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings.fake import FakeEmbeddings
from langchain_community.vectorstores.pgvecto_rs import PGVecto_rs
from langchain_text_splitters import CharacterTextSplitter
```

```python
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = FakeEmbeddings(size=3)
```

Démarrez la base de données avec l'[image docker de démonstration officielle](https://github.com/tensorchord/pgvecto.rs#installation).

```python
! docker run --name pgvecto-rs-demo -e POSTGRES_PASSWORD=mysecretpassword -p 5432:5432 -d tensorchord/pgvecto-rs:latest
```

Ensuite, construisez l'URL de la base de données

```python
## PGVecto.rs needs the connection string to the database.
## We will load it from the environment variables.
import os

PORT = os.getenv("DB_PORT", 5432)
HOST = os.getenv("DB_HOST", "localhost")
USER = os.getenv("DB_USER", "postgres")
PASS = os.getenv("DB_PASS", "mysecretpassword")
DB_NAME = os.getenv("DB_NAME", "postgres")

# Run tests with shell:
URL = "postgresql+psycopg://{username}:{password}@{host}:{port}/{db_name}".format(
    port=PORT,
    host=HOST,
    username=USER,
    password=PASS,
    db_name=DB_NAME,
)
```

Enfin, créez le VectorStore à partir des documents :

```python
db1 = PGVecto_rs.from_documents(
    documents=docs,
    embedding=embeddings,
    db_url=URL,
    # The table name is f"collection_{collection_name}", so that it should be unique.
    collection_name="state_of_the_union",
)
```

Vous pouvez vous connecter à la table plus tard avec :

```python
# Create new empty vectorstore with collection_name.
# Or connect to an existing vectorstore in database if exists.
# Arguments should be the same as when the vectorstore was created.
db1 = PGVecto_rs.from_collection_name(
    embedding=embeddings,
    db_url=URL,
    collection_name="state_of_the_union",
)
```

Assurez-vous que l'utilisateur est autorisé à créer une table.

## Recherche de similarité avec score

### Recherche de similarité avec distance euclidienne (par défaut)

```python
query = "What did the president say about Ketanji Brown Jackson"
docs: List[Document] = db1.similarity_search(query, k=4)
for doc in docs:
    print(doc.page_content)
    print("======================")
```

### Recherche de similarité avec filtre

```python
from pgvecto_rs.sdk.filters import meta_contains

query = "What did the president say about Ketanji Brown Jackson"
docs: List[Document] = db1.similarity_search(
    query, k=4, filter=meta_contains({"source": "../../modules/state_of_the_union.txt"})
)

for doc in docs:
    print(doc.page_content)
    print("======================")
```

Ou :

```python
query = "What did the president say about Ketanji Brown Jackson"
docs: List[Document] = db1.similarity_search(
    query, k=4, filter={"source": "../../modules/state_of_the_union.txt"}
)

for doc in docs:
    print(doc.page_content)
    print("======================")
```
