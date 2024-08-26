---
translated: true
---

# Búsqueda de vectores de IA de Oracle: Almacén de vectores

La búsqueda de vectores de IA de Oracle está diseñada para cargas de trabajo de Inteligencia Artificial (IA) que le permiten consultar datos en función de la semántica, en lugar de palabras clave.
Uno de los mayores beneficios de la búsqueda de vectores de IA de Oracle es que la búsqueda semántica en datos no estructurados se puede combinar con la búsqueda relacional en datos empresariales en un solo sistema.
Esto no solo es poderoso, sino que también es significativamente más efectivo porque no necesita agregar una base de datos de vectores especializada, eliminando el dolor de la fragmentación de datos entre múltiples sistemas.

Además, dado que Oracle ha estado construyendo tecnologías de bases de datos durante tanto tiempo, sus vectores pueden beneficiarse de las características más poderosas de Oracle Database, como las siguientes:

 * Soporte de particionamiento
 * Escalabilidad de Real Application Clusters
 * Escaneos inteligentes de Exadata
 * Procesamiento de fragmentos en bases de datos distribuidas geográficamente
 * Transacciones
 * SQL paralelo
 * Recuperación ante desastres
 * Seguridad
 * Oracle Machine Learning
 * Oracle Graph Database
 * Oracle Spatial and Graph
 * Oracle Blockchain
 * JSON

### Requisitos previos para usar Langchain con Oracle AI Vector Search

Instale el controlador del cliente de Python de Oracle para usar Langchain con Oracle AI Vector Search.

```python
# pip install oracledb
```

### Conectarse a Oracle AI Vector Search

```python
import oracledb

username = "username"
password = "password"
dsn = "ipaddress:port/orclpdb1"

try:
    connection = oracledb.connect(user=username, password=password, dsn=dsn)
    print("Connection successful!")
except Exception as e:
    print("Connection failed!")
```

### Importar las dependencias requeridas para trabajar con Oracle AI Vector Search

```python
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import oraclevs
from langchain_community.vectorstores.oraclevs import OracleVS
from langchain_community.vectorstores.utils import DistanceStrategy
from langchain_core.documents import Document
```

### Cargar documentos

```python
# Define a list of documents (These dummy examples are 5 random documents from Oracle Concepts Manual )

documents_json_list = [
    {
        "id": "cncpt_15.5.3.2.2_P4",
        "text": "If the answer to any preceding questions is yes, then the database stops the search and allocates space from the specified tablespace; otherwise, space is allocated from the database default shared temporary tablespace.",
        "link": "https://docs.oracle.com/en/database/oracle/oracle-database/23/cncpt/logical-storage-structures.html#GUID-5387D7B2-C0CA-4C1E-811B-C7EB9B636442",
    },
    {
        "id": "cncpt_15.5.5_P1",
        "text": "A tablespace can be online (accessible) or offline (not accessible) whenever the database is open.\nA tablespace is usually online so that its data is available to users. The SYSTEM tablespace and temporary tablespaces cannot be taken offline.",
        "link": "https://docs.oracle.com/en/database/oracle/oracle-database/23/cncpt/logical-storage-structures.html#GUID-D02B2220-E6F5-40D9-AFB5-BC69BCEF6CD4",
    },
    {
        "id": "cncpt_22.3.4.3.1_P2",
        "text": "The database stores LOBs differently from other data types. Creating a LOB column implicitly creates a LOB segment and a LOB index. The tablespace containing the LOB segment and LOB index, which are always stored together, may be different from the tablespace containing the table.\nSometimes the database can store small amounts of LOB data in the table itself rather than in a separate LOB segment.",
        "link": "https://docs.oracle.com/en/database/oracle/oracle-database/23/cncpt/concepts-for-database-developers.html#GUID-3C50EAB8-FC39-4BB3-B680-4EACCE49E866",
    },
    {
        "id": "cncpt_22.3.4.3.1_P3",
        "text": "The LOB segment stores data in pieces called chunks. A chunk is a logically contiguous set of data blocks and is the smallest unit of allocation for a LOB. A row in the table stores a pointer called a LOB locator, which points to the LOB index. When the table is queried, the database uses the LOB index to quickly locate the LOB chunks.",
        "link": "https://docs.oracle.com/en/database/oracle/oracle-database/23/cncpt/concepts-for-database-developers.html#GUID-3C50EAB8-FC39-4BB3-B680-4EACCE49E866",
    },
]
```

```python
# Create Langchain Documents

documents_langchain = []

for doc in documents_json_list:
    metadata = {"id": doc["id"], "link": doc["link"]}
    doc_langchain = Document(page_content=doc["text"], metadata=metadata)
    documents_langchain.append(doc_langchain)
```

### Usar la búsqueda de vectores de IA para crear varios almacenes de vectores con diferentes estrategias de distancia

Primero crearemos tres almacenes de vectores, cada uno con diferentes funciones de distancia. Dado que aún no hemos creado índices en ellos, simplemente crearán tablas por ahora. Más adelante usaremos estos almacenes de vectores para crear índices HNSW.

Puede conectarse manualmente a la base de datos de Oracle y verá tres tablas: Documents_DOT, Documents_COSINE y Documents_EUCLIDEAN.

Luego crearemos tres tablas adicionales: Documents_DOT_IVF, Documents_COSINE_IVF y Documents_EUCLIDEAN_IVF, que se utilizarán para crear índices IVF en las tablas en lugar de índices HNSW.

```python
# Ingest documents into Oracle Vector Store using different distance strategies

model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2")

vector_store_dot = OracleVS.from_documents(
    documents_langchain,
    model,
    client=connection,
    table_name="Documents_DOT",
    distance_strategy=DistanceStrategy.DOT_PRODUCT,
)
vector_store_max = OracleVS.from_documents(
    documents_langchain,
    model,
    client=connection,
    table_name="Documents_COSINE",
    distance_strategy=DistanceStrategy.COSINE,
)
vector_store_euclidean = OracleVS.from_documents(
    documents_langchain,
    model,
    client=connection,
    table_name="Documents_EUCLIDEAN",
    distance_strategy=DistanceStrategy.EUCLIDEAN_DISTANCE,
)

# Ingest documents into Oracle Vector Store using different distance strategies
vector_store_dot_ivf = OracleVS.from_documents(
    documents_langchain,
    model,
    client=connection,
    table_name="Documents_DOT_IVF",
    distance_strategy=DistanceStrategy.DOT_PRODUCT,
)
vector_store_max_ivf = OracleVS.from_documents(
    documents_langchain,
    model,
    client=connection,
    table_name="Documents_COSINE_IVF",
    distance_strategy=DistanceStrategy.COSINE,
)
vector_store_euclidean_ivf = OracleVS.from_documents(
    documents_langchain,
    model,
    client=connection,
    table_name="Documents_EUCLIDEAN_IVF",
    distance_strategy=DistanceStrategy.EUCLIDEAN_DISTANCE,
)
```

### Demostración de operaciones de agregar, eliminar y búsqueda de similitud básica para textos

```python
def manage_texts(vector_stores):
    """
    Adds texts to each vector store, demonstrates error handling for duplicate additions,
    and performs deletion of texts. Showcases similarity searches and index creation for each vector store.

    Args:
    - vector_stores (list): A list of OracleVS instances.
    """
    texts = ["Rohan", "Shailendra"]
    metadata = [
        {"id": "100", "link": "Document Example Test 1"},
        {"id": "101", "link": "Document Example Test 2"},
    ]

    for i, vs in enumerate(vector_stores, start=1):
        # Adding texts
        try:
            vs.add_texts(texts, metadata)
            print(f"\n\n\nAdd texts complete for vector store {i}\n\n\n")
        except Exception as ex:
            print(f"\n\n\nExpected error on duplicate add for vector store {i}\n\n\n")

        # Deleting texts using the value of 'id'
        vs.delete([metadata[0]["id"]])
        print(f"\n\n\nDelete texts complete for vector store {i}\n\n\n")

        # Similarity search
        results = vs.similarity_search("How are LOBS stored in Oracle Database", 2)
        print(f"\n\n\nSimilarity search results for vector store {i}: {results}\n\n\n")


vector_store_list = [
    vector_store_dot,
    vector_store_max,
    vector_store_euclidean,
    vector_store_dot_ivf,
    vector_store_max_ivf,
    vector_store_euclidean_ivf,
]
manage_texts(vector_store_list)
```

### Demostración de la creación de índices con parámetros específicos para cada estrategia de distancia

```python
def create_search_indices(connection):
    """
    Creates search indices for the vector stores, each with specific parameters tailored to their distance strategy.
    """
    # Index for DOT_PRODUCT strategy
    # Notice we are creating a HNSW index with default parameters
    # This will default to creating a HNSW index with 8 Parallel Workers and use the Default Accuracy used by Oracle AI Vector Search
    oraclevs.create_index(
        connection,
        vector_store_dot,
        params={"idx_name": "hnsw_idx1", "idx_type": "HNSW"},
    )

    # Index for COSINE strategy with specific parameters
    # Notice we are creating a HNSW index with parallel 16 and Target Accuracy Specification as 97 percent
    oraclevs.create_index(
        connection,
        vector_store_max,
        params={
            "idx_name": "hnsw_idx2",
            "idx_type": "HNSW",
            "accuracy": 97,
            "parallel": 16,
        },
    )

    # Index for EUCLIDEAN_DISTANCE strategy with specific parameters
    # Notice we are creating a HNSW index by specifying Power User Parameters which are neighbors = 64 and efConstruction = 100
    oraclevs.create_index(
        connection,
        vector_store_euclidean,
        params={
            "idx_name": "hnsw_idx3",
            "idx_type": "HNSW",
            "neighbors": 64,
            "efConstruction": 100,
        },
    )

    # Index for DOT_PRODUCT strategy with specific parameters
    # Notice we are creating an IVF index with default parameters
    # This will default to creating an IVF index with 8 Parallel Workers and use the Default Accuracy used by Oracle AI Vector Search
    oraclevs.create_index(
        connection,
        vector_store_dot_ivf,
        params={
            "idx_name": "ivf_idx1",
            "idx_type": "IVF",
        },
    )

    # Index for COSINE strategy with specific parameters
    # Notice we are creating an IVF index with parallel 32 and Target Accuracy Specification as 90 percent
    oraclevs.create_index(
        connection,
        vector_store_max_ivf,
        params={
            "idx_name": "ivf_idx2",
            "idx_type": "IVF",
            "accuracy": 90,
            "parallel": 32,
        },
    )

    # Index for EUCLIDEAN_DISTANCE strategy with specific parameters
    # Notice we are creating an IVF index by specifying Power User Parameters which is neighbor_part = 64
    oraclevs.create_index(
        connection,
        vector_store_euclidean_ivf,
        params={"idx_name": "ivf_idx3", "idx_type": "IVF", "neighbor_part": 64},
    )

    print("Index creation complete.")


create_search_indices(connection)
```

### Ahora realizaremos una serie de búsquedas avanzadas en los seis almacenes de vectores. Cada una de estas tres búsquedas tiene una versión con y sin filtro. El filtro solo selecciona el documento con el id 101 y filtra todo lo demás

```python
# Conduct advanced searches after creating the indices
def conduct_advanced_searches(vector_stores):
    query = "How are LOBS stored in Oracle Database"
    # Constructing a filter for direct comparison against document metadata
    # This filter aims to include documents whose metadata 'id' is exactly '2'
    filter_criteria = {"id": ["101"]}  # Direct comparison filter

    for i, vs in enumerate(vector_stores, start=1):
        print(f"\n--- Vector Store {i} Advanced Searches ---")
        # Similarity search without a filter
        print("\nSimilarity search results without filter:")
        print(vs.similarity_search(query, 2))

        # Similarity search with a filter
        print("\nSimilarity search results with filter:")
        print(vs.similarity_search(query, 2, filter=filter_criteria))

        # Similarity search with relevance score
        print("\nSimilarity search with relevance score:")
        print(vs.similarity_search_with_score(query, 2))

        # Similarity search with relevance score with filter
        print("\nSimilarity search with relevance score with filter:")
        print(vs.similarity_search_with_score(query, 2, filter=filter_criteria))

        # Max marginal relevance search
        print("\nMax marginal relevance search results:")
        print(vs.max_marginal_relevance_search(query, 2, fetch_k=20, lambda_mult=0.5))

        # Max marginal relevance search with filter
        print("\nMax marginal relevance search results with filter:")
        print(
            vs.max_marginal_relevance_search(
                query, 2, fetch_k=20, lambda_mult=0.5, filter=filter_criteria
            )
        )


conduct_advanced_searches(vector_store_list)
```

### Demostración de principio a fin

Consulte nuestra guía de demostración completa [Guía de demostración de Oracle AI Vector Search de principio a fin](https://github.com/langchain-ai/langchain/tree/master/cookbook/oracleai_demo.md) para construir una canalización RAG de principio a fin con la ayuda de Oracle AI Vector Search.
