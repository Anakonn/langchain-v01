---
translated: true
---

# Récupérateur basé sur le magasin de vecteurs Kinetica

>[Kinetica](https://www.kinetica.com/) est une base de données avec un support intégré pour la recherche de similarité vectorielle

Elle prend en charge :
- la recherche de plus proches voisins exacte et approximative
- la distance L2, le produit intérieur et la distance de cosinus

Ce notebook montre comment utiliser un récupérateur basé sur le magasin de vecteurs Kinetica (`Kinetica`).

```python
# Please ensure that this connector is installed in your working environment.
%pip install gpudb==7.2.0.1
```

Nous voulons utiliser `OpenAIEmbeddings`, donc nous devons obtenir la clé API OpenAI.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```python
## Loading Environment Variables
from dotenv import load_dotenv

load_dotenv()
```

```python
from langchain.docstore.document import Document
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import (
    Kinetica,
    KineticaSettings,
)
from langchain_openai import OpenAIEmbeddings
```

```python
# Kinetica needs the connection to the database.
# This is how to set it up.
HOST = os.getenv("KINETICA_HOST", "http://127.0.0.1:9191")
USERNAME = os.getenv("KINETICA_USERNAME", "")
PASSWORD = os.getenv("KINETICA_PASSWORD", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")


def create_config() -> KineticaSettings:
    return KineticaSettings(host=HOST, username=USERNAME, password=PASSWORD)
```

## Créer un récupérateur à partir du magasin de vecteurs

```python
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()

# The Kinetica Module will try to create a table with the name of the collection.
# So, make sure that the collection name is unique and the user has the permission to create a table.

COLLECTION_NAME = "state_of_the_union_test"
connection = create_config()

db = Kinetica.from_documents(
    embedding=embeddings,
    documents=docs,
    collection_name=COLLECTION_NAME,
    config=connection,
)

# create retriever from the vector store
retriever = db.as_retriever(search_kwargs={"k": 2})
```

## Rechercher avec le récupérateur

```python
result = retriever.get_relevant_documents(
    "What did the president say about Ketanji Brown Jackson"
)
print(docs[0].page_content)
```
