---
translated: true
---

# Apache Cassandra

Esta página proporciona un inicio rápido para usar [Apache Cassandra®](https://cassandra.apache.org/) como un Vector Store.

> [Cassandra](https://cassandra.apache.org/) es una base de datos NoSQL, orientada a filas, altamente escalable y altamente disponible. A partir de la versión 5.0, la base de datos se envía con [capacidades de búsqueda de vectores](https://cassandra.apache.org/doc/trunk/cassandra/vector-search/overview.html).

_Nota: además del acceso a la base de datos, se requiere una clave API de OpenAI para ejecutar el ejemplo completo._

### Configuración y dependencias generales

El uso de la integración requiere el siguiente paquete de Python.

```python
%pip install --upgrade --quiet "cassio>=0.1.4"
```

_Nota: dependiendo de su configuración de LangChain, es posible que deba instalar/actualizar otras dependencias necesarias para esta demostración_
_(específicamente, se requieren versiones recientes de `datasets`, `openai`, `pypdf` y `tiktoken`, junto con `langchain-community`)._

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
from langchain_community.vectorstores import Cassandra
```

## Parámetros de conexión

La integración del Vector Store que se muestra en esta página se puede usar con Cassandra, así como con otras bases de datos derivadas, como Astra DB, que utilizan el protocolo CQL (Cassandra Query Language).

> DataStax [Astra DB](https://docs.datastax.com/en/astra-serverless/docs/vector-search/quickstart.html) es una base de datos serverless administrada basada en Cassandra, que ofrece la misma interfaz y fortalezas.

Dependiendo de si se conecta a un clúster de Cassandra o a Astra DB a través de CQL, proporcionará diferentes parámetros al crear el objeto del vector store.

### Conectarse a un clúster de Cassandra

Primero debe crear un objeto `cassandra.cluster.Session`, como se describe en la [documentación del controlador de Cassandra](https://docs.datastax.com/en/developer/python-driver/latest/api/cassandra/cluster/#module-cassandra.cluster). Los detalles varían (por ejemplo, con la configuración de red y la autenticación), pero esto podría ser algo así:

```python
from cassandra.cluster import Cluster

cluster = Cluster(["127.0.0.1"])
session = cluster.connect()
```

Ahora puede establecer la sesión, junto con el nombre de su keyspace deseado, como un parámetro global de CassIO:

```python
import cassio

CASSANDRA_KEYSPACE = input("CASSANDRA_KEYSPACE = ")

cassio.init(session=session, keyspace=CASSANDRA_KEYSPACE)
```

Ahora puede crear el vector store:

```python
vstore = Cassandra(
    embedding=embe,
    table_name="cassandra_vector_demo",
    # session=None, keyspace=None  # Uncomment on older versions of LangChain
)
```

_Nota: también puede pasar su sesión y keyspace directamente como parámetros al crear el vector store. Sin embargo, usar el ajuste global `cassio.init` resulta útil si su aplicación usa Cassandra de varias maneras (por ejemplo, para el vector store, la memoria del chat y el almacenamiento en caché de la respuesta de LLM), ya que le permite centralizar la gestión de credenciales y la conexión a la base de datos en un solo lugar._

### Conectarse a Astra DB a través de CQL

En este caso, inicializa CassIO con los siguientes parámetros de conexión:

- el ID de la base de datos, por ejemplo, `01234567-89ab-cdef-0123-456789abcdef`
- el Token, por ejemplo, `AstraCS:6gBhNmsk135....` (debe ser un token de "Administrador de base de datos")
- Opcionalmente, un nombre de Keyspace (si se omite, se utilizará el predeterminado para la base de datos)

```python
ASTRA_DB_ID = input("ASTRA_DB_ID = ")
ASTRA_DB_APPLICATION_TOKEN = getpass("ASTRA_DB_APPLICATION_TOKEN = ")

desired_keyspace = input("ASTRA_DB_KEYSPACE (optional, can be left empty) = ")
if desired_keyspace:
    ASTRA_DB_KEYSPACE = desired_keyspace
else:
    ASTRA_DB_KEYSPACE = None
```

```python
import cassio

cassio.init(
    database_id=ASTRA_DB_ID,
    token=ASTRA_DB_APPLICATION_TOKEN,
    keyspace=ASTRA_DB_KEYSPACE,
)
```

Ahora puede crear el vector store:

```python
vstore = Cassandra(
    embedding=embe,
    table_name="cassandra_vector_demo",
    # session=None, keyspace=None  # Uncomment on older versions of LangChain
)
```

## Cargar un conjunto de datos

Convierta cada entrada en el conjunto de datos de origen en un `Document`, luego escríbalos en el vector store:

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

En lo anterior, los diccionarios `metadata` se crean a partir de los datos de origen y forman parte del `Document`.

Agrega algunas entradas más, esta vez con `add_texts`:

```python
texts = ["I think, therefore I am.", "To the things themselves!"]
metadatas = [{"author": "descartes"}, {"author": "husserl"}]
ids = ["desc_01", "huss_xy"]

inserted_ids_2 = vstore.add_texts(texts=texts, metadatas=metadatas, ids=ids)
print(f"\nInserted {len(inserted_ids_2)} documents.")
```

_Nota: es posible que desee acelerar la ejecución de `add_texts` y `add_documents` aumentando el nivel de concurrencia para_
_estas operaciones a granel: consulte el parámetro `batch_size` de los métodos_
_para obtener más detalles. Dependiendo de la red y las especificaciones de la máquina del cliente, su elección de parámetros con mejor rendimiento puede variar._

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

Para más información, consulte una plantilla RAG completa que usa Astra DB a través de CQL [aquí](https://github.com/langchain-ai/langchain/tree/master/templates/cassandra-entomology-rag).

## Limpieza

lo siguiente esencialmente recupera el objeto `Session` de CassIO y ejecuta una instrucción `DROP TABLE` CQL con él:

_(Perderá los datos que almacenó en él)._

```python
cassio.config.resolve_session().execute(
    f"DROP TABLE {cassio.config.resolve_keyspace()}.cassandra_vector_demo;"
)
```

### Aprende más

Para obtener más información, inicios rápidos ampliados y ejemplos de uso adicionales, visite la [documentación de CassIO](https://cassio.org/frameworks/langchain/about/) para obtener más información sobre el uso del vector store `Cassandra` de LangChain.

#### Declaración de atribución

> Apache Cassandra, Cassandra y Apache son marcas comerciales registradas o marcas comerciales de la [Apache Software Foundation](http://www.apache.org/) en los Estados Unidos y/o en otros países.
