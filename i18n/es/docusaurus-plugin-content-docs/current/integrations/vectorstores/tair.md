---
translated: true
---

# Tair

>[Tair](https://www.alibabacloud.com/help/en/tair/latest/what-is-tair) es un servicio de base de datos en memoria nativa de la nube desarrollado por `Alibaba Cloud`.
Proporciona modelos de datos ricos y capacidades empresariales para respaldar sus escenarios en línea en tiempo real, manteniendo al mismo tiempo la compatibilidad completa con el código abierto `Redis`. `Tair` también introduce instancias optimizadas para memoria persistente que se basan en el nuevo medio de almacenamiento de memoria no volátil (NVM).

Este cuaderno muestra cómo usar la funcionalidad relacionada con la base de datos de vectores `Tair`.

Para ejecutar, debe tener una instancia `Tair` en ejecución.

```python
from langchain_community.embeddings.fake import FakeEmbeddings
from langchain_community.vectorstores import Tair
from langchain_text_splitters import CharacterTextSplitter
```

```python
from langchain_community.document_loaders import TextLoader

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = FakeEmbeddings(size=128)
```

Conéctese a Tair usando la variable de entorno `TAIR_URL`

```bash
export TAIR_URL="redis://{username}:{password}@{tair_address}:{tair_port}"
```

o el argumento de palabra clave `tair_url`.

Luego, almacene documentos y incrustaciones en Tair.

```python
tair_url = "redis://localhost:6379"

# drop first if index already exists
Tair.drop_index(tair_url=tair_url)

vector_store = Tair.from_documents(docs, embeddings, tair_url=tair_url)
```

Consultar documentos similares.

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = vector_store.similarity_search(query)
docs[0]
```

Construcción del índice de búsqueda híbrida de Tair

```python
# drop first if index already exists
Tair.drop_index(tair_url=tair_url)

vector_store = Tair.from_documents(
    docs, embeddings, tair_url=tair_url, index_params={"lexical_algorithm": "bm25"}
)
```

Búsqueda híbrida de Tair

```python
query = "What did the president say about Ketanji Brown Jackson"
# hybrid_ratio: 0.5 hybrid search, 0.9999 vector search, 0.0001 text search
kwargs = {"TEXT": query, "hybrid_ratio": 0.5}
docs = vector_store.similarity_search(query, **kwargs)
docs[0]
```
