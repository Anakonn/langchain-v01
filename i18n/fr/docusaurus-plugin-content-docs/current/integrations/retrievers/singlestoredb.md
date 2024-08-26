---
translated: true
---

# SingleStoreDB

>[SingleStoreDB](https://singlestore.com/) est une base de données SQL distribuée haute performance qui prend en charge le déploiement à la fois dans le [cloud](https://www.singlestore.com/cloud/) et sur site. Elle fournit un stockage vectoriel et des fonctions vectorielles, notamment [dot_product](https://docs.singlestore.com/managed-service/en/reference/sql-reference/vector-functions/dot_product.html) et [euclidean_distance](https://docs.singlestore.com/managed-service/en/reference/sql-reference/vector-functions/euclidean_distance.html), permettant ainsi de prendre en charge les applications d'IA nécessitant une correspondance de similarité de texte.

Ce notebook montre comment utiliser un récupérateur qui utilise `SingleStoreDB`.

```python
# Establishing a connection to the database is facilitated through the singlestoredb Python connector.
# Please ensure that this connector is installed in your working environment.
%pip install --upgrade --quiet  singlestoredb
```

## Créer un récupérateur à partir du magasin vectoriel

```python
import getpass
import os

# We want to use OpenAIEmbeddings so we have to get the OpenAI API Key.
os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")

from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import SingleStoreDB
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()

# Setup connection url as environment variable
os.environ["SINGLESTOREDB_URL"] = "root:pass@localhost:3306/db"

# Load documents to the store
docsearch = SingleStoreDB.from_documents(
    docs,
    embeddings,
    table_name="notebook",  # use table with a custom name
)

# create retriever from the vector store
retriever = docsearch.as_retriever(search_kwargs={"k": 2})
```

## Rechercher avec le récupérateur

```python
result = retriever.invoke("What did the president say about Ketanji Brown Jackson")
print(docs[0].page_content)
```
