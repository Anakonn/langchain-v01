---
translated: true
---

# SingleStoreDB

>[SingleStoreDB](https://singlestore.com/) es una base de datos SQL distribuida de alto rendimiento que admite el despliegue tanto en la [nube](https://www.singlestore.com/cloud/) como en las instalaciones. Proporciona almacenamiento de vectores y funciones de vectores, incluidos [dot_product](https://docs.singlestore.com/managed-service/en/reference/sql-reference/vector-functions/dot_product.html) y [euclidean_distance](https://docs.singlestore.com/managed-service/en/reference/sql-reference/vector-functions/euclidean_distance.html), lo que permite admitir aplicaciones de IA que requieren coincidencia de similitud de texto.

Este cuaderno muestra cómo usar un buscador que utiliza `SingleStoreDB`.

```python
# Establishing a connection to the database is facilitated through the singlestoredb Python connector.
# Please ensure that this connector is installed in your working environment.
%pip install --upgrade --quiet  singlestoredb
```

## Crear un buscador a partir de un almacén de vectores

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

## Buscar con el buscador

```python
result = retriever.invoke("What did the president say about Ketanji Brown Jackson")
print(docs[0].page_content)
```
