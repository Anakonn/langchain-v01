---
translated: true
---

# Astra DB

Esta página proporciona un inicio rápido para usar [Astra DB](https://docs.datastax.com/en/astra/home/astra.html) como un Vector Store.

> DataStax [Astra DB](https://docs.datastax.com/en/astra/home/astra.html) es una base de datos sin servidor capaz de vectores, construida sobre Apache Cassandra® y puesta a disposición de manera conveniente a través de una API JSON fácil de usar.

_Nota: además del acceso a la base de datos, se requiere una clave API de OpenAI para ejecutar el ejemplo completo._

## Configuración y dependencias generales

El uso de la integración requiere el paquete de Python correspondiente:

```python
pip install --upgrade langchain-astradb
```

_**Nota.** los siguientes son todos los paquetes necesarios para ejecutar la demostración completa en esta página. Dependiendo de tu configuración de LangChain, es posible que algunos de ellos deban instalarse:_

```python
pip install langchain langchain-openai datasets pypdf
```

### Importar dependencias

```python
import os
from getpass import getpass

from datasets import (
    load_dataset,
)
from langchain_community.document_loaders import PyPDFLoader
from langchain_core.documents import Document
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
```

```python
os.environ["OPENAI_API_KEY"] = getpass("OPENAI_API_KEY = ")
```

```python
embe = OpenAIEmbeddings()
```

## Importar el Vector Store

```python
from langchain_astradb import AstraDBVectorStore
```

## Parámetros de conexión

Estos se encuentran en el panel de control de tu Astra DB:

- el punto final de la API se ve como `https://01234567-89ab-cdef-0123-456789abcdef-us-east1.apps.astra.datastax.com`
- el Token se ve como `AstraCS:6gBhNmsk135....`
- opcionalmente, puedes proporcionar un _Namespace_ como `my_namespace`

```python
ASTRA_DB_API_ENDPOINT = input("ASTRA_DB_API_ENDPOINT = ")
ASTRA_DB_APPLICATION_TOKEN = getpass("ASTRA_DB_APPLICATION_TOKEN = ")

desired_namespace = input("(optional) Namespace = ")
if desired_namespace:
    ASTRA_DB_KEYSPACE = desired_namespace
else:
    ASTRA_DB_KEYSPACE = None
```

Ahora puedes crear el vector store:

```python
vstore = AstraDBVectorStore(
    embedding=embe,
    collection_name="astra_vector_demo",
    api_endpoint=ASTRA_DB_API_ENDPOINT,
    token=ASTRA_DB_APPLICATION_TOKEN,
    namespace=ASTRA_DB_KEYSPACE,
)
```

## Cargar un conjunto de datos

Convierte cada entrada en el conjunto de datos de origen en un `Document`, luego escríbelos en el vector store:

```python
philo_dataset = load_dataset("datastax/philosopher-quotes")["train"]

docs = []
for entry in philo_dataset:
    metadata = {"author": entry["author"]}
    doc = Document(page_content=entry["quote"], metadata=metadata)
    docs.append(doc)

inserted_ids = vstore.add_documents(docs)
print(f"\nInserted {len(inserted_ids)} documents.")
```

En lo anterior, los diccionarios `metadata` se crean a partir de los datos de origen y son parte del `Document`.

_Nota: revisa la [Documentación de la API de Astra DB](https://docs.datastax.com/en/astra-serverless/docs/develop/dev-with-json.html#_json_api_limits) para conocer los nombres de campo de metadatos válidos: algunos caracteres están reservados y no se pueden usar._

Agrega algunas entradas más, esta vez con `add_texts`:

```python
texts = ["I think, therefore I am.", "To the things themselves!"]
metadatas = [{"author": "descartes"}, {"author": "husserl"}]
ids = ["desc_01", "huss_xy"]

inserted_ids_2 = vstore.add_texts(texts=texts, metadatas=metadatas, ids=ids)
print(f"\nInserted {len(inserted_ids_2)} documents.")
```

_Nota: es posible que desees acelerar la ejecución de `add_texts` y `add_documents` aumentando el nivel de concurrencia para_
_estas operaciones masivas: consulta los parámetros `*_concurrency` en el constructor de la clase y los docstrings de `add_texts`_
_para obtener más detalles. Dependiendo de la red y las especificaciones de la máquina cliente, tu mejor opción de rendimiento puede variar._

## Ejecutar búsquedas

Esta sección demuestra el filtrado de metadatos y la obtención de los puntajes de similitud:

```python
results = vstore.similarity_search("Our life is what we make of it", k=3)
for res in results:
    print(f"* {res.page_content} [{res.metadata}]")
```

```python
results_filtered = vstore.similarity_search(
    "Our life is what we make of it",
    k=3,
    filter={"author": "plato"},
)
for res in results_filtered:
    print(f"* {res.page_content} [{res.metadata}]")
```

```python
results = vstore.similarity_search_with_score("Our life is what we make of it", k=3)
for res, score in results:
    print(f"* [SIM={score:3f}] {res.page_content} [{res.metadata}]")
```

### Búsqueda MMR (Relevancia marginal máxima)

```python
results = vstore.max_marginal_relevance_search(
    "Our life is what we make of it",
    k=3,
    filter={"author": "aristotle"},
)
for res in results:
    print(f"* {res.page_content} [{res.metadata}]")
```

### Asíncrono

Tenga en cuenta que el vector store de Astra DB admite todos los métodos completamente asíncronos (`asimilarity_search`, `afrom_texts`, `adelete` y similares) de forma nativa, es decir, sin envoltura de subprocesos involucrada.

## Eliminar documentos almacenados

```python
delete_1 = vstore.delete(inserted_ids[:3])
print(f"all_succeed={delete_1}")  # True, all documents deleted
```

```python
delete_2 = vstore.delete(inserted_ids[2:5])
print(f"some_succeeds={delete_2}")  # True, though some IDs were gone already
```

## Una cadena RAG mínima

Las siguientes celdas implementarán una pipeline RAG simple:
- descargar un archivo PDF de muestra y cargarlo en la tienda;
- crear una cadena RAG con LCEL (LangChain Expression Language), con el vector store en su corazón;
- ejecutar la cadena de preguntas y respuestas.

```python
!curl -L \
    "https://github.com/awesome-astra/datasets/blob/main/demo-resources/what-is-philosophy/what-is-philosophy.pdf?raw=true" \
    -o "what-is-philosophy.pdf"
```

```python
pdf_loader = PyPDFLoader("what-is-philosophy.pdf")
splitter = RecursiveCharacterTextSplitter(chunk_size=512, chunk_overlap=64)
docs_from_pdf = pdf_loader.load_and_split(text_splitter=splitter)

print(f"Documents from PDF: {len(docs_from_pdf)}.")
inserted_ids_from_pdf = vstore.add_documents(docs_from_pdf)
print(f"Inserted {len(inserted_ids_from_pdf)} documents.")
```

```python
retriever = vstore.as_retriever(search_kwargs={"k": 3})

philo_template = """
You are a philosopher that draws inspiration from great thinkers of the past
to craft well-thought answers to user questions. Use the provided context as the basis
for your answers and do not make up new reasoning paths - just mix-and-match what you are given.
Your answers must be concise and to the point, and refrain from answering about other topics than philosophy.

CONTEXT:
{context}

QUESTION: {question}

YOUR ANSWER:"""

philo_prompt = ChatPromptTemplate.from_template(philo_template)

llm = ChatOpenAI()

chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | philo_prompt
    | llm
    | StrOutputParser()
)
```

```python
chain.invoke("How does Russel elaborate on Peirce's idea of the security blanket?")
```

Para más, consulta una plantilla RAG completa que usa Astra DB [aquí](https://github.com/langchain-ai/langchain/tree/master/templates/rag-astradb).

## Limpieza

Si deseas eliminar por completo la colección de tu instancia de Astra DB, ejecuta esto.

_(Perderás los datos que almacenaste en ella.)_

```python
vstore.delete_collection()
```
