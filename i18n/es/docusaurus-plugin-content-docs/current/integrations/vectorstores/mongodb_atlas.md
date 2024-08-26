---
translated: true
---

# MongoDB Atlas

>[MongoDB Atlas](https://www.mongodb.com/docs/atlas/) es una base de datos en la nube totalmente administrada disponible en AWS, Azure y GCP. Ahora tiene soporte para Búsqueda de Vectores Nativos en sus datos de documentos MongoDB.

Este cuaderno muestra cómo usar [MongoDB Atlas Vector Search](https://www.mongodb.com/products/platform/atlas-vector-search) para almacenar sus incrustaciones en documentos MongoDB, crear un índice de búsqueda de vectores y realizar una búsqueda de KNN con un algoritmo de vecinos más cercanos aproximado (`Hierarchical Navigable Small Worlds`). Utiliza la etapa [$vectorSearch MQL](https://www.mongodb.com/docs/atlas/atlas-vector-search/vector-search-overview/).

Para usar MongoDB Atlas, primero debe implementar un clúster. Tenemos un nivel gratuito permanente de clústeres disponible. Para comenzar, vaya a Atlas aquí: [inicio rápido](https://www.mongodb.com/docs/atlas/getting-started/).

> Nota:
>
>* Se puede encontrar más documentación en el [sitio LangChain-MongoDB](https://www.mongodb.com/docs/atlas/atlas-vector-search/ai-integrations/langchain/)
>* Esta función está Disponible de Forma General y lista para implementaciones de producción.
>* La versión 0.0.305 de langchain ([notas de la versión](https://github.com/langchain-ai/langchain/releases/tag/v0.0.305))) introduce el soporte para la etapa $vectorSearch MQL, que está disponible con MongoDB Atlas 6.0.11 y 7.0.2. Los usuarios que utilizan versiones anteriores de MongoDB Atlas deben fijar su versión de LangChain a <=0.0.304
>

En el cuaderno demostraremos cómo realizar la "Generación Aumentada por Recuperación" (RAG) utilizando MongoDB Atlas, OpenAI y Langchain. Realizaremos Búsqueda de Similitud, Búsqueda de Similitud con Prefiltrado de Metadatos y Respuesta a Preguntas sobre el documento PDF del [informe técnico de GPT 4](https://arxiv.org/pdf/2303.08774.pdf) que se publicó en marzo de 2023 y, por lo tanto, no forma parte de la memoria paramétrica del Modelo de Lenguaje Grande (LLM) de OpenAI, que tenía un corte de conocimiento de septiembre de 2021.

Queremos usar `OpenAIEmbeddings`, así que necesitamos configurar nuestra clave de API de OpenAI.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

Ahora configuraremos las variables de entorno para el clúster de MongoDB Atlas

```python
%pip install --upgrade --quiet  langchain pypdf pymongo langchain-openai tiktoken
```

```python
import getpass

MONGODB_ATLAS_CLUSTER_URI = getpass.getpass("MongoDB Atlas Cluster URI:")
```

```python
from pymongo import MongoClient

# initialize MongoDB python client
client = MongoClient(MONGODB_ATLAS_CLUSTER_URI)

DB_NAME = "langchain_db"
COLLECTION_NAME = "test"
ATLAS_VECTOR_SEARCH_INDEX_NAME = "index_name"

MONGODB_COLLECTION = client[DB_NAME][COLLECTION_NAME]
```

## Crear un Índice de Búsqueda de Vectores

Ahora, creemos un índice de búsqueda de vectores en su clúster. Se pueden encontrar pasos más detallados en la sección [Crear un Índice de Búsqueda de Vectores para LangChain](https://www.mongodb.com/docs/atlas/atlas-vector-search/ai-integrations/langchain/#create-the-atlas-vector-search-index).
En el ejemplo a continuación, `embedding` es el nombre del campo que contiene el vector de incrustación. Consulte la [documentación](https://www.mongodb.com/docs/atlas/atlas-vector-search/create-index/) para obtener más detalles sobre cómo definir un índice de Búsqueda de Vectores de Atlas.
Puede nombrar el índice `{ATLAS_VECTOR_SEARCH_INDEX_NAME}` y crearlo en el espacio de nombres `{DB_NAME}.{COLLECTION_NAME}`. Finalmente, escriba la siguiente definición en el editor JSON en MongoDB Atlas:

```json
{
  "fields":[
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 1536,
      "similarity": "cosine"
    }
  ]
}
```

# Insertar Datos

```python
from langchain_community.document_loaders import PyPDFLoader

# Load the PDF
loader = PyPDFLoader("https://arxiv.org/pdf/2303.08774.pdf")
data = loader.load()
```

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter

text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)
docs = text_splitter.split_documents(data)
```

```python
print(docs[0])
```

```python
from langchain_community.vectorstores import MongoDBAtlasVectorSearch
from langchain_openai import OpenAIEmbeddings

# insert the documents in MongoDB Atlas with their embedding
vector_search = MongoDBAtlasVectorSearch.from_documents(
    documents=docs,
    embedding=OpenAIEmbeddings(disallowed_special=()),
    collection=MONGODB_COLLECTION,
    index_name=ATLAS_VECTOR_SEARCH_INDEX_NAME,
)
```

```python
# Perform a similarity search between the embedding of the query and the embeddings of the documents
query = "What were the compute requirements for training GPT 4"
results = vector_search.similarity_search(query)

print(results[0].page_content)
```

# Consultar Datos

También podemos instanciar el almacén de vectores directamente y ejecutar una consulta de la siguiente manera:

```python
from langchain_community.vectorstores import MongoDBAtlasVectorSearch
from langchain_openai import OpenAIEmbeddings

vector_search = MongoDBAtlasVectorSearch.from_connection_string(
    MONGODB_ATLAS_CLUSTER_URI,
    DB_NAME + "." + COLLECTION_NAME,
    OpenAIEmbeddings(disallowed_special=()),
    index_name=ATLAS_VECTOR_SEARCH_INDEX_NAME,
)
```

## Prefiltrado con Búsqueda de Similitud

La Búsqueda de Vectores de Atlas admite el prefiltrado utilizando operadores MQL para filtrar. A continuación se muestra un ejemplo de índice y consulta sobre los mismos datos cargados anteriormente que le permite hacer un filtrado de metadatos en el campo "page".  Puede actualizar su índice existente con el filtro definido y hacer un prefiltrado con la búsqueda de vectores.

```json
{
  "fields":[
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 1536,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "page"
    }
  ]
}
```

```python
query = "What were the compute requirements for training GPT 4"

results = vector_search.similarity_search_with_score(
    query=query, k=5, pre_filter={"page": {"$eq": 1}}
)

# Display results
for result in results:
    print(result)
```

## Búsqueda de Similitud con Puntuación

```python
query = "What were the compute requirements for training GPT 4"

results = vector_search.similarity_search_with_score(
    query=query,
    k=5,
)

# Display results
for result in results:
    print(result)
```

## Respuesta a Preguntas

```python
qa_retriever = vector_search.as_retriever(
    search_type="similarity",
    search_kwargs={"k": 25},
)
```

```python
from langchain_core.prompts import PromptTemplate

prompt_template = """Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.

{context}

Question: {question}
"""
PROMPT = PromptTemplate(
    template=prompt_template, input_variables=["context", "question"]
)
```

```python
from langchain.chains import RetrievalQA
from langchain_openai import OpenAI

qa = RetrievalQA.from_chain_type(
    llm=OpenAI(),
    chain_type="stuff",
    retriever=qa_retriever,
    return_source_documents=True,
    chain_type_kwargs={"prompt": PROMPT},
)

docs = qa({"query": "gpt-4 compute requirements"})

print(docs["result"])
print(docs["source_documents"])
```

GPT-4 requiere significativamente más cómputo que los modelos anteriores de GPT. En un conjunto de datos derivado del código interno de OpenAI, GPT-4 requiere 100p (petaflops) de cómputo para alcanzar la pérdida más baja, mientras que los modelos más pequeños requieren 1-10n (nanoflops).
