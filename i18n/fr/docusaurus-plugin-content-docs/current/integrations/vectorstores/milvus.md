---
translated: true
---

# Milvus

>[Milvus](https://milvus.io/docs/overview.md) est une base de données qui stocke, indexe et gère des vecteurs d'intégration massive générés par des réseaux neuronaux profonds et d'autres modèles d'apprentissage automatique (ML).

Ce notebook montre comment utiliser les fonctionnalités liées à la base de données vectorielle Milvus.

Pour l'exécuter, vous devez avoir une [instance Milvus en cours d'exécution](https://milvus.io/docs/install_standalone-docker.md).

```python
%pip install --upgrade --quiet  pymilvus
```

Nous voulons utiliser OpenAIEmbeddings, donc nous devons obtenir la clé API OpenAI.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```output
OpenAI API Key:········
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import Milvus
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

```python
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

```python
vector_db = Milvus.from_documents(
    docs,
    embeddings,
    connection_args={"host": "127.0.0.1", "port": "19530"},
)
```

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = vector_db.similarity_search(query)
```

```python
docs[0].page_content
```

```output
'Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.'
```

### Compartimentez les données avec les collections Milvus

Vous pouvez stocker différents documents non liés dans différentes collections au sein de la même instance Milvus pour maintenir le contexte.

Voici comment vous pouvez créer une nouvelle collection.

```python
vector_db = Milvus.from_documents(
    docs,
    embeddings,
    collection_name="collection_1",
    connection_args={"host": "127.0.0.1", "port": "19530"},
)
```

Et voici comment vous pouvez récupérer cette collection stockée.

```python
vector_db = Milvus(
    embeddings,
    connection_args={"host": "127.0.0.1", "port": "19530"},
    collection_name="collection_1",
)
```

Après la récupération, vous pouvez continuer à l'interroger comme d'habitude.

### Récupération par utilisateur

Lors de la construction d'une application de récupération, vous devez souvent la construire en pensant à plusieurs utilisateurs. Cela signifie que vous pouvez stocker des données non seulement pour un utilisateur, mais pour de nombreux utilisateurs différents, et ils ne doivent pas pouvoir voir les données des autres.

Milvus recommande d'utiliser [partition_key](https://milvus.io/docs/multi_tenancy.md#Partition-key-based-multi-tenancy) pour mettre en œuvre le multi-locataire, voici un exemple.

```python
from langchain_core.documents import Document

docs = [
    Document(page_content="i worked at kensho", metadata={"namespace": "harrison"}),
    Document(page_content="i worked at facebook", metadata={"namespace": "ankush"}),
]
vectorstore = Milvus.from_documents(
    docs,
    embeddings,
    connection_args={"host": "127.0.0.1", "port": "19530"},
    drop_old=True,
    partition_key_field="namespace",  # Use the "namespace" field as the partition key
)
```

Pour effectuer une recherche à l'aide de la clé de partition, vous devez inclure l'une des options suivantes dans l'expression booléenne de la requête de recherche :

`search_kwargs={"expr": '<partition_key> == "xxxx"'}`

`search_kwargs={"expr": '<partition_key> == in ["xxx", "xxx"]'}`

Remplacez `<partition_key>` par le nom du champ désigné comme clé de partition.

Milvus change de partition en fonction de la clé de partition spécifiée, filtre les entités selon la clé de partition et recherche parmi les entités filtrées.

```python
# This will only get documents for Ankush
vectorstore.as_retriever(search_kwargs={"expr": 'namespace == "ankush"'}).invoke(
    "where did i work?"
)
```

```output
[Document(page_content='i worked at facebook', metadata={'namespace': 'ankush'})]
```

```python
# This will only get documents for Harrison
vectorstore.as_retriever(search_kwargs={"expr": 'namespace == "harrison"'}).invoke(
    "where did i work?"
)
```

```output
[Document(page_content='i worked at kensho', metadata={'namespace': 'harrison'})]
```

**Pour supprimer ou mettre à jour (mettre à jour/insérer) une ou plusieurs entités :**

```python
from langchain_community.docstore.document import Document

# Insert data sample
docs = [
    Document(page_content="foo", metadata={"id": 1}),
    Document(page_content="bar", metadata={"id": 2}),
    Document(page_content="baz", metadata={"id": 3}),
]
vector_db = Milvus.from_documents(
    docs,
    embeddings,
    connection_args={"host": "127.0.0.1", "port": "19530"},
)

# Search pks (primary keys) using expression
expr = "id in [1,2]"
pks = vector_db.get_pks(expr)

# Delete entities by pks
result = vector_db.delete(pks)

# Upsert (Update/Insert)
new_docs = [
    Document(page_content="new_foo", metadata={"id": 1}),
    Document(page_content="new_bar", metadata={"id": 2}),
    Document(page_content="upserted_bak", metadata={"id": 3}),
]
upserted_pks = vector_db.upsert(pks, new_docs)
```
