---
canonical: https://python.langchain.com/v0.1/docs/integrations/vectorstores/duckdb
translated: false
---

# DuckDB

This notebook shows how to use `DuckDB` as a vector store.

```python
! pip install duckdb
```

We want to use OpenAIEmbeddings so we have to get the OpenAI API Key.

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