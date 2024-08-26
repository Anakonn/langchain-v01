---
translated: true
---

# SurrealDB

>[SurrealDB](https://surrealdb.com/) es una base de datos integral y nativa de la nube diseñada para aplicaciones modernas, incluyendo web, móvil, sin servidor, Jamstack, backend y aplicaciones tradicionales. Con SurrealDB, puedes simplificar tu infraestructura de base de datos y API, reducir el tiempo de desarrollo y construir aplicaciones seguras y de alto rendimiento de manera rápida y rentable.
>
>**Las características clave de SurrealDB incluyen:**
>
>* **Reduce el tiempo de desarrollo:** SurrealDB simplifica tu pila de base de datos y API al eliminar la necesidad de la mayoría de los componentes del lado del servidor, lo que te permite construir aplicaciones seguras y de alto rendimiento más rápido y a un menor costo.
>* **Servicio de backend de API de colaboración en tiempo real:** SurrealDB funciona como una base de datos y un servicio de backend de API, lo que permite la colaboración en tiempo real.
>* **Soporte para múltiples lenguajes de consulta:** SurrealDB admite consultas SQL desde dispositivos cliente, GraphQL, transacciones ACID, conexiones WebSocket, datos estructurados y no estructurados, consultas de gráficos, indexación de texto completo y consultas geoespaciales.
>* **Control de acceso granular:** SurrealDB proporciona un control de acceso basado en permisos a nivel de fila, lo que te permite administrar el acceso a los datos con precisión.
>
>Ver las [características](https://surrealdb.com/features), los [lanzamientos](https://surrealdb.com/releases) más recientes y la [documentación](https://surrealdb.com/docs).

Este cuaderno muestra cómo usar la funcionalidad relacionada con `SurrealDBStore`.

## Configuración

Descomenta las celdas a continuación para instalar surrealdb.

```python
# %pip install --upgrade --quiet  surrealdb langchain langchain-community
```

## Uso de SurrealDBStore

```python
# add this import for running in jupyter notebook
import nest_asyncio

nest_asyncio.apply()
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import SurrealDBStore
from langchain_text_splitters import CharacterTextSplitter
```

```python
documents = TextLoader("../../modules/state_of_the_union.txt").load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = HuggingFaceEmbeddings()
```

### Creación de un objeto SurrealDBStore

```python
db = SurrealDBStore(
    dburl="ws://localhost:8000/rpc",  # url for the hosted SurrealDB database
    embedding_function=embeddings,
    db_user="root",  # SurrealDB credentials if needed: db username
    db_pass="root",  # SurrealDB credentials if needed: db password
    # ns="langchain", # namespace to use for vectorstore
    # db="database",  # database to use for vectorstore
    # collection="documents", #collection to use for vectorstore
)

# this is needed to initialize the underlying async library for SurrealDB
await db.initialize()

# delete all existing documents from the vectorstore collection
await db.adelete()

# add documents to the vectorstore
ids = await db.aadd_documents(docs)

# document ids of the added documents
ids[:5]
```

```output
['documents:38hz49bv1p58f5lrvrdc',
 'documents:niayw63vzwm2vcbh6w2s',
 'documents:it1fa3ktplbuye43n0ch',
 'documents:il8f7vgbbp9tywmsn98c',
 'documents:vza4c6cqje0avqd58gal']
```

### (Alternativamente) Crear un objeto SurrealDBStore y agregar documentos

```python
await db.adelete()

db = await SurrealDBStore.afrom_documents(
    dburl="ws://localhost:8000/rpc",  # url for the hosted SurrealDB database
    embedding=embeddings,
    documents=docs,
    db_user="root",  # SurrealDB credentials if needed: db username
    db_pass="root",  # SurrealDB credentials if needed: db password
    # ns="langchain", # namespace to use for vectorstore
    # db="database",  # database to use for vectorstore
    # collection="documents", #collection to use for vectorstore
)
```

### Búsqueda de similitud

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = await db.asimilarity_search(query)
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

### Búsqueda de similitud con puntuación

La puntuación de distancia devuelta es la distancia coseno. Por lo tanto, una puntuación más baja es mejor.

```python
docs = await db.asimilarity_search_with_score(query)
```

```python
docs[0]
```

```output
(Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'id': 'documents:slgdlhjkfknhqo15xz0w', 'source': '../../modules/state_of_the_union.txt'}),
 0.39839531721941895)
```
