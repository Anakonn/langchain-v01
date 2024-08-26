---
translated: true
---

# Hologres

>[Hologres](https://www.alibabacloud.com/help/en/hologres/latest/introduction) est un service de stockage de données en temps réel unifié développé par Alibaba Cloud. Vous pouvez utiliser Hologres pour écrire, mettre à jour, traiter et analyser de grandes quantités de données en temps réel.
>Hologres prend en charge la syntaxe SQL standard, est compatible avec PostgreSQL et prend en charge la plupart des fonctions PostgreSQL. Hologres prend en charge le traitement analytique en ligne (OLAP) et l'analyse ad hoc pour des pétaoctets de données, et fournit des services de données en ligne à haute concurrence et à faible latence.

>Hologres fournit des fonctionnalités de **base de données vectorielle** en adoptant [Proxima](https://www.alibabacloud.com/help/en/hologres/latest/vector-processing).
>Proxima est une bibliothèque logicielle haute performance développée par Alibaba DAMO Academy. Elle permet de rechercher les plus proches voisins de vecteurs. Proxima offre une plus grande stabilité et des performances supérieures aux logiciels open source similaires comme Faiss. Proxima vous permet de rechercher des embeddings de texte ou d'image similaires avec un débit élevé et une faible latence. Hologres est profondément intégré à Proxima pour fournir un service de recherche vectorielle haute performance.

Ce notebook montre comment utiliser les fonctionnalités liées à la base de données vectorielle `Hologres Proxima`.
Cliquez [ici](https://www.alibabacloud.com/zh/product/hologres) pour déployer rapidement une instance cloud Hologres.

```python
%pip install --upgrade --quiet  hologres-vector
```

```python
from langchain_community.vectorstores import Hologres
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

Diviser les documents et obtenir les embeddings en appelant l'API OpenAI

```python
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

Se connecter à Hologres en définissant les ENVIRONNEMENTS correspondants.

```bash
export PG_HOST={host}
export PG_PORT={port} # Optional, default is 80
export PG_DATABASE={db_name} # Optional, default is postgres
export PG_USER={username}
export PG_PASSWORD={password}
```

Ensuite, stockez vos embeddings et vos documents dans Hologres

```python
import os

connection_string = Hologres.connection_string_from_db_params(
    host=os.environ.get("PGHOST", "localhost"),
    port=int(os.environ.get("PGPORT", "80")),
    database=os.environ.get("PGDATABASE", "postgres"),
    user=os.environ.get("PGUSER", "postgres"),
    password=os.environ.get("PGPASSWORD", "postgres"),
)

vector_db = Hologres.from_documents(
    docs,
    embeddings,
    connection_string=connection_string,
    table_name="langchain_example_embeddings",
)
```

Interroger et récupérer les données

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
