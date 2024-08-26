---
translated: true
---

# AnalyticDB

>[AnalyticDB for PostgreSQL](https://www.alibabacloud.com/help/en/analyticdb-for-postgresql/latest/product-introduction-overview) est un service d'entreposage de données à traitement massivement parallèle (MPP) conçu pour analyser de grands volumes de données en ligne.

>`AnalyticDB for PostgreSQL` est développé sur la base du projet open-source `Greenplum Database` et est amélioré avec des extensions approfondies par `Alibaba Cloud`. AnalyticDB for PostgreSQL est compatible avec la syntaxe ANSI SQL 2003 et les écosystèmes de bases de données PostgreSQL et Oracle. AnalyticDB for PostgreSQL prend également en charge le stockage en ligne et le stockage en colonne. AnalyticDB for PostgreSQL traite des pétaoctets de données hors ligne à un niveau de performance élevé et prend en charge des requêtes en ligne hautement concurrentes.

Ce notebook montre comment utiliser les fonctionnalités liées à la base de données vectorielle `AnalyticDB`.
Pour l'exécuter, vous devez avoir une instance [AnalyticDB](https://www.alibabacloud.com/help/en/analyticdb-for-postgresql/latest/product-introduction-overview) en cours d'exécution :
- Utilisation de [AnalyticDB Cloud Vector Database](https://www.alibabacloud.com/product/hybriddb-postgresql). Cliquez ici pour le déployer rapidement.

```python
from langchain_community.vectorstores import AnalyticDB
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

Divisez les documents et obtenez des embeddings en appelant l'API OpenAI

```python
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

Connectez-vous à AnalyticDB en configurant les ENVIRONNEMENTS concernés.

```bash
export PG_HOST={your_analyticdb_hostname}
export PG_PORT={your_analyticdb_port} # Optional, default is 5432
export PG_DATABASE={your_database} # Optional, default is postgres
export PG_USER={database_username}
export PG_PASSWORD={database_password}
```

Ensuite, stockez vos embeddings et documents dans AnalyticDB

```python
import os

connection_string = AnalyticDB.connection_string_from_db_params(
    driver=os.environ.get("PG_DRIVER", "psycopg2cffi"),
    host=os.environ.get("PG_HOST", "localhost"),
    port=int(os.environ.get("PG_PORT", "5432")),
    database=os.environ.get("PG_DATABASE", "postgres"),
    user=os.environ.get("PG_USER", "postgres"),
    password=os.environ.get("PG_PASSWORD", "postgres"),
)

vector_db = AnalyticDB.from_documents(
    docs,
    embeddings,
    connection_string=connection_string,
)
```

Interroger et récupérer des données

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = vector_db.similarity_search(query)
```

```python
print(docs[0].page_content)
```

```output
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```
