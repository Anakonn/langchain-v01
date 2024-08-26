---
translated: true
---

# Yellowbrick

[Yellowbrick](https://yellowbrick.com/yellowbrick-data-warehouse/) es una base de datos SQL de procesamiento paralelo elástica y masiva (MPP) que se ejecuta en la nube y en las instalaciones, utilizando kubernetes para escalar, resistir y ser portátil en la nube. Yellowbrick está diseñado para abordar los casos de uso de almacenamiento de datos empresariales más grandes y complejos. La eficiencia a escala que proporciona Yellowbrick también le permite utilizarse como una base de datos vectorial de alto rendimiento y escalable para almacenar y buscar vectores con SQL.

## Usar Yellowbrick como el almacén de vectores para ChatGpt

Este tutorial demuestra cómo crear un chatbot simple respaldado por ChatGpt que utiliza Yellowbrick como un almacén de vectores para admitir la Generación Aumentada por Recuperación (RAG). Lo que necesitarás:

1. Una cuenta en el [sandbox de Yellowbrick](https://cloudlabs.yellowbrick.com/)
2. Una clave de api de [OpenAI](https://platform.openai.com/)

El tutorial se divide en cinco partes. Primero usaremos langchain para crear un chatbot de referencia para interactuar con ChatGpt sin un almacén de vectores. En segundo lugar, crearemos una tabla de incrustaciones en Yellowbrick que representará el almacén de vectores. En tercer lugar, cargaremos una serie de documentos (el capítulo de Administración del Manual de Yellowbrick). En cuarto lugar, crearemos la representación vectorial de esos documentos y la almacenaremos en una tabla de Yellowbrick. Por último, enviaremos las mismas consultas al chatbox mejorado para ver los resultados.

```python
# Install all needed libraries
%pip install --upgrade --quiet  langchain
%pip install --upgrade --quiet  langchain-openai
%pip install --upgrade --quiet  psycopg2-binary
%pip install --upgrade --quiet  tiktoken
```

## Configuración: Ingrese la información utilizada para conectarse a Yellowbrick y la API de OpenAI

Nuestro chatbot se integra con ChatGpt a través de la biblioteca langchain, por lo que primero necesitarás una clave API de OpenAI:

Para obtener una clave de api de OpenAI:
1. Regístrate en https://platform.openai.com/
2. Agrega un método de pago: es poco probable que superes el cupo gratuito
3. Crea una clave API

También necesitarás tu Nombre de usuario, Contraseña y Nombre de base de datos del correo electrónico de bienvenida cuando te registres en la Cuenta de Sandbox de Yellowbrick.

Lo siguiente debe modificarse para incluir la información de tu base de datos de Yellowbrick y la clave de OpenAPI

```python
# Modify these values to match your Yellowbrick Sandbox and OpenAI API Key
YBUSER = "[SANDBOX USER]"
YBPASSWORD = "[SANDBOX PASSWORD]"
YBDATABASE = "[SANDBOX_DATABASE]"
YBHOST = "trialsandbox.sandbox.aws.yellowbrickcloud.com"

OPENAI_API_KEY = "[OPENAI API KEY]"
```

```python
# Import libraries and setup keys / login info
import os
import pathlib
import re
import sys
import urllib.parse as urlparse
from getpass import getpass

import psycopg2
from IPython.display import Markdown, display
from langchain.chains import LLMChain, RetrievalQAWithSourcesChain
from langchain.schema import Document
from langchain_community.vectorstores import Yellowbrick
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

# Establish connection parameters to Yellowbrick.  If you've signed up for Sandbox, fill in the information from your welcome mail here:
yellowbrick_connection_string = (
    f"postgres://{urlparse.quote(YBUSER)}:{YBPASSWORD}@{YBHOST}:5432/{YBDATABASE}"
)

YB_DOC_DATABASE = "sample_data"
YB_DOC_TABLE = "yellowbrick_documentation"
embedding_table = "my_embeddings"

# API Key for OpenAI.  Signup at https://platform.openai.com
os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY

from langchain_core.prompts.chat import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
)
```

## Parte 1: Crear un chatbot de referencia respaldado por ChatGpt sin un almacén de vectores

Usaremos langchain para consultar a ChatGPT. Como no hay un almacén de vectores, ChatGPT no tendrá contexto para responder la pregunta.

```python
# Set up the chat model and specific prompt
system_template = """If you don't know the answer, Make up your best guess."""
messages = [
    SystemMessagePromptTemplate.from_template(system_template),
    HumanMessagePromptTemplate.from_template("{question}"),
]
prompt = ChatPromptTemplate.from_messages(messages)

chain_type_kwargs = {"prompt": prompt}
llm = ChatOpenAI(
    model_name="gpt-3.5-turbo",  # Modify model_name if you have access to GPT-4
    temperature=0,
    max_tokens=256,
)

chain = LLMChain(
    llm=llm,
    prompt=prompt,
    verbose=False,
)


def print_result_simple(query):
    result = chain(query)
    output_text = f"""### Question:
  {query}
  ### Answer:
  {result['text']}
    """
    display(Markdown(output_text))


# Use the chain to query
print_result_simple("How many databases can be in a Yellowbrick Instance?")

print_result_simple("What's an easy way to add users in bulk to Yellowbrick?")
```

## Parte 2: Conectarse a Yellowbrick y crear las tablas de incrustaciones

Para cargar las incrustaciones de tus documentos en Yellowbrick, debes crear tu propia tabla para almacenarlas. Tenga en cuenta que la base de datos de Yellowbrick en la que se encuentra la tabla debe estar codificada en UTF-8.

Crea una tabla en una base de datos UTF-8 con el siguiente esquema, proporcionando un nombre de tabla de tu elección:

```python
# Establish a connection to the Yellowbrick database
try:
    conn = psycopg2.connect(yellowbrick_connection_string)
except psycopg2.Error as e:
    print(f"Error connecting to the database: {e}")
    exit(1)

# Create a cursor object using the connection
cursor = conn.cursor()

# Define the SQL statement to create a table
create_table_query = f"""
CREATE TABLE IF NOT EXISTS {embedding_table} (
    doc_id uuid NOT NULL,
    embedding_id smallint NOT NULL,
    embedding double precision NOT NULL
)
DISTRIBUTE ON (doc_id);
truncate table {embedding_table};
"""

# Execute the SQL query to create a table
try:
    cursor.execute(create_table_query)
    print(f"Table '{embedding_table}' created successfully!")
except psycopg2.Error as e:
    print(f"Error creating table: {e}")
    conn.rollback()

# Commit changes and close the cursor and connection
conn.commit()
cursor.close()
conn.close()
```

## Parte 3: Extraer los documentos a indexar de una tabla existente en Yellowbrick

Extraer rutas de documentos y contenidos de una tabla existente de Yellowbrick. Usaremos estos documentos para crear incrustaciones a continuación.

```python
yellowbrick_doc_connection_string = (
    f"postgres://{urlparse.quote(YBUSER)}:{YBPASSWORD}@{YBHOST}:5432/{YB_DOC_DATABASE}"
)

print(yellowbrick_doc_connection_string)

# Establish a connection to the Yellowbrick database
conn = psycopg2.connect(yellowbrick_doc_connection_string)

# Create a cursor object
cursor = conn.cursor()

# Query to select all documents from the table
query = f"SELECT path, document FROM {YB_DOC_TABLE}"

# Execute the query
cursor.execute(query)

# Fetch all documents
yellowbrick_documents = cursor.fetchall()

print(f"Extracted {len(yellowbrick_documents)} documents successfully!")

# Close the cursor and connection
cursor.close()
conn.close()
```

## Parte 4: Cargar el almacén de vectores de Yellowbrick con documentos

Recorre los documentos, divídelos en trozos digeribles, crea la incrustación e insértala en la tabla de Yellowbrick. Esto tarda aproximadamente 5 minutos.

```python
# Split documents into chunks for conversion to embeddings
DOCUMENT_BASE_URL = "https://docs.yellowbrick.com/6.7.1/"  # Actual URL


separator = "\n## "  # This separator assumes Markdown docs from the repo uses ### as logical main header most of the time
chunk_size_limit = 2000
max_chunk_overlap = 200

documents = [
    Document(
        page_content=document[1],
        metadata={"source": DOCUMENT_BASE_URL + document[0].replace(".md", ".html")},
    )
    for document in yellowbrick_documents
]

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=chunk_size_limit,
    chunk_overlap=max_chunk_overlap,
    separators=[separator, "\nn", "\n", ",", " ", ""],
)
split_docs = text_splitter.split_documents(documents)

docs_text = [doc.page_content for doc in split_docs]

embeddings = OpenAIEmbeddings()
vector_store = Yellowbrick.from_documents(
    documents=split_docs,
    embedding=embeddings,
    connection_info=yellowbrick_connection_string,
    table=embedding_table,
)

print(f"Created vector store with {len(documents)} documents")
```

## Parte 5: Crear un chatbot que use Yellowbrick como el almacén de vectores

A continuación, agregamos Yellowbrick como un almacén de vectores. El almacén de vectores se ha poblado con incrustaciones que representan el capítulo administrativo de la documentación del producto Yellowbrick.

Enviaremos las mismas consultas que antes para ver las respuestas mejoradas.

```python
system_template = """Use the following pieces of context to answer the users question.
Take note of the sources and include them in the answer in the format: "SOURCES: source1 source2", use "SOURCES" in capital letters regardless of the number of sources.
If you don't know the answer, just say that "I don't know", don't try to make up an answer.
----------------
{summaries}"""
messages = [
    SystemMessagePromptTemplate.from_template(system_template),
    HumanMessagePromptTemplate.from_template("{question}"),
]
prompt = ChatPromptTemplate.from_messages(messages)

vector_store = Yellowbrick(
    OpenAIEmbeddings(),
    yellowbrick_connection_string,
    embedding_table,  # Change the table name to reflect your embeddings
)

chain_type_kwargs = {"prompt": prompt}
llm = ChatOpenAI(
    model_name="gpt-3.5-turbo",  # Modify model_name if you have access to GPT-4
    temperature=0,
    max_tokens=256,
)
chain = RetrievalQAWithSourcesChain.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=vector_store.as_retriever(search_kwargs={"k": 5}),
    return_source_documents=True,
    chain_type_kwargs=chain_type_kwargs,
)


def print_result_sources(query):
    result = chain(query)
    output_text = f"""### Question:
  {query}
  ### Answer:
  {result['answer']}
  ### Sources:
  {result['sources']}
  ### All relevant sources:
  {', '.join(list(set([doc.metadata['source'] for doc in result['source_documents']])))}
    """
    display(Markdown(output_text))


# Use the chain to query

print_result_sources("How many databases can be in a Yellowbrick Instance?")

print_result_sources("Whats an easy way to add users in bulk to Yellowbrick?")
```

## Parte 6: Introducir un índice para aumentar el rendimiento

Yellowbrick también admite indexación utilizando el enfoque de Hash Sensible a la Localidad. Esta es una técnica de búsqueda aproximada de vecinos más cercanos, y permite compensar el tiempo de búsqueda de similitud a expensas de la precisión. El índice introduce dos nuevos parámetros ajustables:

- El número de hiperplanos, que se proporciona como argumento a `create_lsh_index(num_hyperplanes)`. Cuantos más documentos, más hiperplanos se necesitan. LSH es una forma de reducción de dimensionalidad. Las incrustaciones originales se transforman en vectores de dimensión inferior donde el número de componentes es el mismo que el número de hiperplanos.
- La distancia de Hamming, un entero que representa el ancho de la búsqueda. Distancias de Hamming más pequeñas dan como resultado una recuperación más rápida pero una precisión más baja.

Aquí se muestra cómo puede crear un índice en las incrustaciones que cargamos en Yellowbrick. También volveremos a ejecutar la sesión de chat anterior, pero esta vez la recuperación utilizará el índice. Tenga en cuenta que para un número tan pequeño de documentos, no verá el beneficio del indexado en términos de rendimiento.

```python
system_template = """Use the following pieces of context to answer the users question.
Take note of the sources and include them in the answer in the format: "SOURCES: source1 source2", use "SOURCES" in capital letters regardless of the number of sources.
If you don't know the answer, just say that "I don't know", don't try to make up an answer.
----------------
{summaries}"""
messages = [
    SystemMessagePromptTemplate.from_template(system_template),
    HumanMessagePromptTemplate.from_template("{question}"),
]
prompt = ChatPromptTemplate.from_messages(messages)

vector_store = Yellowbrick(
    OpenAIEmbeddings(),
    yellowbrick_connection_string,
    embedding_table,  # Change the table name to reflect your embeddings
)

lsh_params = Yellowbrick.IndexParams(
    Yellowbrick.IndexType.LSH, {"num_hyperplanes": 8, "hamming_distance": 2}
)
vector_store.create_index(lsh_params)

chain_type_kwargs = {"prompt": prompt}
llm = ChatOpenAI(
    model_name="gpt-3.5-turbo",  # Modify model_name if you have access to GPT-4
    temperature=0,
    max_tokens=256,
)
chain = RetrievalQAWithSourcesChain.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=vector_store.as_retriever(
        k=5, search_kwargs={"index_params": lsh_params}
    ),
    return_source_documents=True,
    chain_type_kwargs=chain_type_kwargs,
)


def print_result_sources(query):
    result = chain(query)
    output_text = f"""### Question:
  {query}
  ### Answer:
  {result['answer']}
  ### Sources:
  {result['sources']}
  ### All relevant sources:
  {', '.join(list(set([doc.metadata['source'] for doc in result['source_documents']])))}
    """
    display(Markdown(output_text))


# Use the chain to query

print_result_sources("How many databases can be in a Yellowbrick Instance?")

print_result_sources("Whats an easy way to add users in bulk to Yellowbrick?")
```

## Próximos pasos:

Este código se puede modificar para hacer diferentes preguntas. También puedes cargar tus propios documentos en el almacén de vectores. El módulo langchain es muy flexible y puede analizar una gran variedad de archivos (incluidos HTML, PDF, etc.).

También puedes modificarlo para usar modelos de incrustaciones de Huggingface y el LLM de Llama 2 de Meta para una experiencia de chatbox completamente privada.
