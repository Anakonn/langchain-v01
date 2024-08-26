---
translated: true
---

# DuckDB

Este cuaderno muestra cómo usar `DuckDB` como un almacén de vectores.

```python
! pip install duckdb
```

Queremos usar OpenAIEmbeddings, así que tenemos que obtener la clave de la API de OpenAI.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```python
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import DuckDB
```

```python
from langchain.document_loaders import TextLoader
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()

documents = CharacterTextSplitter().split_documents(documents)
embeddings = OpenAIEmbeddings()
```

```python
docsearch = DuckDB.from_documents(documents, embeddings)

query = "What did the president say about Ketanji Brown Jackson"
docs = docsearch.similarity_search(query)
```

```python
print(docs[0].page_content)
```
