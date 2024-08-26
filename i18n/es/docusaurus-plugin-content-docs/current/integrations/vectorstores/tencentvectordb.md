---
translated: true
---

# Tencent Cloud VectorDB

>[Tencent Cloud VectorDB](https://cloud.tencent.com/document/product/1709) es un servicio de base de datos distribuida de nivel empresarial, totalmente administrado y desarrollado internamente, diseñado para almacenar, recuperar y analizar datos vectoriales multidimensionales. La base de datos admite múltiples tipos de índices y métodos de cálculo de similitud. Un solo índice puede admitir una escala de vectores de hasta 1 mil millones y puede admitir millones de QPS y una latencia de consulta de nivel de milisegundos. Tencent Cloud Vector Database no solo puede proporcionar una base de conocimientos externa para que los modelos grandes mejoren la precisión de las respuestas de los modelos grandes, sino que también se puede utilizar ampliamente en campos de IA como sistemas de recomendación, servicios de PLN, visión por computadora y servicio al cliente inteligente.

Este cuaderno muestra cómo usar la funcionalidad relacionada con la base de datos de vectores de Tencent.

Para ejecutar, debe tener una [instancia de base de datos.](https://cloud.tencent.com/document/product/1709/95101)

## Uso básico

```python
!pip3 install tcvectordb
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings.fake import FakeEmbeddings
from langchain_community.vectorstores import TencentVectorDB
from langchain_community.vectorstores.tencentvectordb import ConnectionParams
from langchain_text_splitters import CharacterTextSplitter
```

cargar los documentos, dividirlos en fragmentos.

```python
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)
```

Admitimos dos formas de incrustar los documentos:
- Utilice cualquier modelo de incrustaciones compatible con Langchain Embeddings.
- Especifique el nombre del modelo de incrustación de la base de datos Tencent VectorStore, las opciones son:
    - `bge-base-zh`, dimensión: 768
    - `m3e-base`, dimensión: 768
    - `text2vec-large-chinese`, dimensión: 1024
    - `e5-large-v2`, dimensión: 1024
    - `multilingual-e5-base`, dimensión: 768

El código que sigue muestra ambas formas de incrustar los documentos, puede elegir una de ellas comentando la otra:

```python
##  you can use a Langchain Embeddings model, like OpenAIEmbeddings:

# from langchain_community.embeddings.openai import OpenAIEmbeddings
#
# embeddings = OpenAIEmbeddings()
# t_vdb_embedding = None

## Or you can use a Tencent Embedding model, like `bge-base-zh`:

t_vdb_embedding = "bge-base-zh"  # bge-base-zh is the default model
embeddings = None
```

Ahora podemos crear una instancia de TencentVectorDB, debe proporcionar al menos uno de los parámetros `embeddings` o `t_vdb_embedding`. si se proporcionan ambos, se utilizará el parámetro `embeddings`:

```python
conn_params = ConnectionParams(
    url="http://10.0.X.X",
    key="eC4bLRy2va******************************",
    username="root",
    timeout=20,
)

vector_db = TencentVectorDB.from_documents(
    docs, embeddings, connection_params=conn_params, t_vdb_embedding=t_vdb_embedding
)
```

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = vector_db.similarity_search(query)
docs[0].page_content
```

```output
'Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.'
```

```python
vector_db = TencentVectorDB(embeddings, conn_params)

vector_db.add_texts(["Ankush went to Princeton"])
query = "Where did Ankush go to college?"
docs = vector_db.max_marginal_relevance_search(query)
docs[0].page_content
```

```output
'Ankush went to Princeton'
```

## Metadatos y filtrado

Tencent VectorDB admite metadatos y [filtrado](https://cloud.tencent.com/document/product/1709/95099#c6f6d3a3-02c5-4891-b0a1-30fe4daf18d8). Puede agregar metadatos a los documentos y filtrar los resultados de la búsqueda en función de los metadatos.

Ahora crearemos una nueva colección de TencentVectorDB con metadatos y demostraremos cómo filtrar los resultados de la búsqueda en función de los metadatos:

```python
from langchain_community.vectorstores.tencentvectordb import (
    META_FIELD_TYPE_STRING,
    META_FIELD_TYPE_UINT64,
    ConnectionParams,
    MetaField,
    TencentVectorDB,
)
from langchain_core.documents import Document

meta_fields = [
    MetaField(name="year", data_type=META_FIELD_TYPE_UINT64, index=True),
    MetaField(name="rating", data_type=META_FIELD_TYPE_STRING, index=False),
    MetaField(name="genre", data_type=META_FIELD_TYPE_STRING, index=True),
    MetaField(name="director", data_type=META_FIELD_TYPE_STRING, index=True),
]

docs = [
    Document(
        page_content="The Shawshank Redemption is a 1994 American drama film written and directed by Frank Darabont.",
        metadata={
            "year": 1994,
            "rating": "9.3",
            "genre": "drama",
            "director": "Frank Darabont",
        },
    ),
    Document(
        page_content="The Godfather is a 1972 American crime film directed by Francis Ford Coppola.",
        metadata={
            "year": 1972,
            "rating": "9.2",
            "genre": "crime",
            "director": "Francis Ford Coppola",
        },
    ),
    Document(
        page_content="The Dark Knight is a 2008 superhero film directed by Christopher Nolan.",
        metadata={
            "year": 2008,
            "rating": "9.0",
            "genre": "superhero",
            "director": "Christopher Nolan",
        },
    ),
    Document(
        page_content="Inception is a 2010 science fiction action film written and directed by Christopher Nolan.",
        metadata={
            "year": 2010,
            "rating": "8.8",
            "genre": "science fiction",
            "director": "Christopher Nolan",
        },
    ),
]

vector_db = TencentVectorDB.from_documents(
    docs,
    None,
    connection_params=ConnectionParams(
        url="http://10.0.X.X",
        key="eC4bLRy2va******************************",
        username="root",
        timeout=20,
    ),
    collection_name="movies",
    meta_fields=meta_fields,
)

query = "film about dream by Christopher Nolan"

# you can use the tencentvectordb filtering syntax with the `expr` parameter:
result = vector_db.similarity_search(query, expr='director="Christopher Nolan"')

# you can either use the langchain filtering syntax with the `filter` parameter:
# result = vector_db.similarity_search(query, filter='eq("director", "Christopher Nolan")')

result
```

```output
[Document(page_content='The Dark Knight is a 2008 superhero film directed by Christopher Nolan.', metadata={'year': 2008, 'rating': '9.0', 'genre': 'superhero', 'director': 'Christopher Nolan'}),
 Document(page_content='The Dark Knight is a 2008 superhero film directed by Christopher Nolan.', metadata={'year': 2008, 'rating': '9.0', 'genre': 'superhero', 'director': 'Christopher Nolan'}),
 Document(page_content='The Dark Knight is a 2008 superhero film directed by Christopher Nolan.', metadata={'year': 2008, 'rating': '9.0', 'genre': 'superhero', 'director': 'Christopher Nolan'}),
 Document(page_content='Inception is a 2010 science fiction action film written and directed by Christopher Nolan.', metadata={'year': 2010, 'rating': '8.8', 'genre': 'science fiction', 'director': 'Christopher Nolan'})]
```
