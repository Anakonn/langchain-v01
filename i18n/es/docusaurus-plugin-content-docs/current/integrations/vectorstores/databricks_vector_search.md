---
translated: true
---

# Búsqueda de vectores de Databricks

Databricks Vector Search es un motor de búsqueda de similitud sin servidor que le permite almacenar una representación vectorial de sus datos, incluidos los metadatos, en una base de datos de vectores. Con Vector Search, puede crear índices de búsqueda de vectores que se actualizan automáticamente a partir de tablas Delta administradas por Unity Catalog y consultarlos con una API simple para devolver los vectores más similares.

Este cuaderno muestra cómo usar LangChain con Databricks Vector Search.

Instalar `databricks-vectorsearch` y los paquetes de Python relacionados utilizados en este cuaderno.

```python
%pip install --upgrade --quiet  langchain-core databricks-vectorsearch langchain-openai tiktoken
```

Usar `OpenAIEmbeddings` para los incrustaciones.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

Dividir documentos y obtener incrustaciones.

```python
from langchain_community.document_loaders import TextLoader
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
emb_dim = len(embeddings.embed_query("hello"))
```

## Configurar el cliente de Databricks Vector Search

```python
from databricks.vector_search.client import VectorSearchClient

vsc = VectorSearchClient()
```

## Crear un punto final de búsqueda de vectores

Este punto final se usa para crear y acceder a los índices de búsqueda de vectores.

```python
vsc.create_endpoint(name="vector_search_demo_endpoint", endpoint_type="STANDARD")
```

## Crear un índice de acceso directo a vectores

El índice de acceso directo a vectores admite la lectura y escritura directas de vectores de incrustación y metadatos a través de una API REST o un SDK. Para este índice, usted administra los vectores de incrustación y las actualizaciones de índice.

```python
vector_search_endpoint_name = "vector_search_demo_endpoint"
index_name = "ml.llm.demo_index"

index = vsc.create_direct_access_index(
    endpoint_name=vector_search_endpoint_name,
    index_name=index_name,
    primary_key="id",
    embedding_dimension=emb_dim,
    embedding_vector_column="text_vector",
    schema={
        "id": "string",
        "text": "string",
        "text_vector": "array<float>",
        "source": "string",
    },
)

index.describe()
```

```python
from langchain_community.vectorstores import DatabricksVectorSearch

dvs = DatabricksVectorSearch(
    index, text_column="text", embedding=embeddings, columns=["source"]
)
```

## Agregar documentos al índice

```python
dvs.add_documents(docs)
```

## Búsqueda de similitud

```python
query = "What did the president say about Ketanji Brown Jackson"
dvs.similarity_search(query)
print(docs[0].page_content)
```

## Trabajar con el índice de sincronización de Delta

También puede usar `DatabricksVectorSearch` para buscar en un índice de sincronización de Delta. El índice de sincronización de Delta se sincroniza automáticamente desde una tabla Delta. No necesita llamar a `add_text`/`add_documents` manualmente. Consulte la [página de documentación de Databricks](https://docs.databricks.com/en/generative-ai/vector-search.html#delta-sync-index-with-managed-embeddings) para obtener más detalles.

```python
dvs_delta_sync = DatabricksVectorSearch("catalog_name.schema_name.delta_sync_index")
dvs_delta_sync.similarity_search(query)
```
