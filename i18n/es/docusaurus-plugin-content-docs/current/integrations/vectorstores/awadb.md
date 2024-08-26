---
translated: true
---

# AwaDB

>[AwaDB](https://github.com/awa-ai/awadb) es una base de datos nativa de IA para la búsqueda y el almacenamiento de vectores de incrustación utilizados por las aplicaciones LLM.

Este cuaderno muestra cómo usar la funcionalidad relacionada con `AwaDB`.

```python
%pip install --upgrade --quiet  awadb
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import AwaDB
from langchain_text_splitters import CharacterTextSplitter
```

```python
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=100, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
```

```python
db = AwaDB.from_documents(docs)
query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query)
```

```python
print(docs[0].page_content)
```

```output
And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
```

## Búsqueda de similitud con puntuación

La puntuación de distancia devuelta está entre 0 y 1. 0 es disimilar, 1 es el más similar.

```python
docs = db.similarity_search_with_score(query)
```

```python
print(docs[0])
```

```output
(Document(page_content='And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': '../../modules/state_of_the_union.txt'}), 0.561813814013747)
```

## Restaurar la tabla creada y agregar datos antes

AwaDB persiste automáticamente los datos de documentos agregados.

Si puede restaurar la tabla que creó y agregó antes, puede hacer esto como se indica a continuación:

```python
import awadb

awadb_client = awadb.Client()
ret = awadb_client.Load("langchain_awadb")
if ret:
    print("awadb load table success")
else:
    print("awadb load table failed")
```

awadb load table success
