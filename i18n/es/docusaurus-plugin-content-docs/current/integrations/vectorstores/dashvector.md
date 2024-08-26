---
translated: true
---

# DashVector

> [DashVector](https://help.aliyun.com/document_detail/2510225.html) es un servicio de vectorDB totalmente administrado que admite vectores densos y dispersos de alta dimensión, inserción en tiempo real y búsqueda filtrada. Está diseñado para escalarse automáticamente y adaptarse a diferentes requisitos de aplicación.

Este cuaderno muestra cómo usar la funcionalidad relacionada con la base de datos de vectores `DashVector`.

Para usar DashVector, debe tener una clave API.
Aquí están las [instrucciones de instalación](https://help.aliyun.com/document_detail/2510223.html).

## Instalar

```python
%pip install --upgrade --quiet  dashvector dashscope
```

Queremos usar `DashScopeEmbeddings`, así que también tenemos que obtener la clave API de Dashscope.

```python
import getpass
import os

os.environ["DASHVECTOR_API_KEY"] = getpass.getpass("DashVector API Key:")
os.environ["DASHSCOPE_API_KEY"] = getpass.getpass("DashScope API Key:")
```

## Ejemplo

```python
from langchain_community.embeddings.dashscope import DashScopeEmbeddings
from langchain_community.vectorstores import DashVector
from langchain_text_splitters import CharacterTextSplitter
```

```python
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = DashScopeEmbeddings()
```

Podemos crear DashVector a partir de documentos.

```python
dashvector = DashVector.from_documents(docs, embeddings)

query = "What did the president say about Ketanji Brown Jackson"
docs = dashvector.similarity_search(query)
print(docs)
```

Podemos agregar textos con metadatos e identificadores, y buscar con filtro de metadatos.

```python
texts = ["foo", "bar", "baz"]
metadatas = [{"key": i} for i in range(len(texts))]
ids = ["0", "1", "2"]

dashvector.add_texts(texts, metadatas=metadatas, ids=ids)

docs = dashvector.similarity_search("foo", filter="key = 2")
print(docs)
```

```output
[Document(page_content='baz', metadata={'key': 2})]
```

### Parámetros de `partición` de la banda operativa

El parámetro `partición` predeterminado es predeterminado, y si se pasa un parámetro `partición` que no existe, la `partición` se creará automáticamente.

```python
texts = ["foo", "bar", "baz"]
metadatas = [{"key": i} for i in range(len(texts))]
ids = ["0", "1", "2"]
partition = "langchain"

# add texts
dashvector.add_texts(texts, metadatas=metadatas, ids=ids, partition=partition)

# similarity search
query = "What did the president say about Ketanji Brown Jackson"
docs = dashvector.similarity_search(query, partition=partition)

# delete
dashvector.delete(ids=ids, partition=partition)
```
