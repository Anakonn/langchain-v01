---
translated: true
---

# Vector de Timescale (Postgres)

>[Vector de Timescale](https://www.timescale.com/ai?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral) es una base de datos de vectores `PostgreSQL++` para aplicaciones de IA.

Este notebook muestra cómo usar la base de datos de vectores Postgres `Vector de Timescale`. Aprenderás a usar Vector de Timescale para (1) búsqueda semántica, (2) búsqueda de vectores basada en el tiempo, (3) auto-consulta, y (4) cómo crear índices para acelerar las consultas.

## ¿Qué es Vector de Timescale?

`Vector de Timescale` te permite almacenar y consultar eficientemente millones de incrustaciones de vectores en `PostgreSQL`.
- Mejora `pgvector` con búsqueda de similitud más rápida y precisa en 100M+ vectores a través del algoritmo de indexación inspirado en `DiskANN`.
- Permite una búsqueda rápida de vectores basada en el tiempo a través de la partición y indexación automática basada en el tiempo.
- Proporciona una interfaz SQL familiar para consultar incrustaciones de vectores y datos relacionales.

`Vector de Timescale` es `PostgreSQL` en la nube para IA que escala contigo desde POC hasta producción:
- Simplifica las operaciones permitiéndote almacenar metadatos relacionales, incrustaciones de vectores y datos de series temporales en una sola base de datos.
- Se beneficia de la sólida base de PostgreSQL con características de nivel empresarial como copias de seguridad en streaming y replicación, alta disponibilidad y seguridad a nivel de fila.
- Permite una experiencia sin preocupaciones con seguridad y cumplimiento de nivel empresarial.

## Cómo acceder a Vector de Timescale

`Vector de Timescale` está disponible en [Timescale](https://www.timescale.com/ai?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral), la plataforma de PostgreSQL en la nube. (No hay una versión autohospedada en este momento.)

Los usuarios de LangChain obtienen una prueba gratuita de 90 días para Vector de Timescale.
- Para comenzar, [regístrate](https://console.cloud.timescale.com/signup?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral) en Timescale, crea una nueva base de datos y sigue este notebook.
- Consulta el [blog explicativo de Vector de Timescale](https://www.timescale.com/blog/how-we-made-postgresql-the-best-vector-database/?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral) para más detalles y referencias de rendimiento.
- Consulta las [instrucciones de instalación](https://github.com/timescale/python-vector) para más detalles sobre el uso de Vector de Timescale en Python.

## Configuración

Sigue estos pasos para estar listo para seguir este tutorial.

```python
# Pip install necessary packages
%pip install --upgrade --quiet  timescale-vector
%pip install --upgrade --quiet  langchain-openai
%pip install --upgrade --quiet  tiktoken
```

En este ejemplo, usaremos `OpenAIEmbeddings`, así que carguemos tu clave API de OpenAI.

```python
import os

# Run export OPENAI_API_KEY=sk-YOUR_OPENAI_API_KEY...
# Get openAI api key by reading local .env file
from dotenv import find_dotenv, load_dotenv

_ = load_dotenv(find_dotenv())
OPENAI_API_KEY = os.environ["OPENAI_API_KEY"]
```

```python
# Get the API key and save it as an environment variable
# import os
# import getpass
# os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")

```

```python
from typing import Tuple
```

A continuación, importaremos las bibliotecas necesarias de Python y las bibliotecas de LangChain. Ten en cuenta que importamos la biblioteca `timescale-vector` así como el vectorstore de TimescaleVector LangChain.

```python
from datetime import datetime, timedelta

from langchain_community.docstore.document import Document
from langchain_community.document_loaders import TextLoader
from langchain_community.document_loaders.json_loader import JSONLoader
from langchain_community.vectorstores.timescalevector import TimescaleVector
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

## 1. Búsqueda de Similitud con Distancia Euclidiana (Predeterminada)

Primero, veremos un ejemplo de cómo hacer una consulta de búsqueda de similitud en el discurso del Estado de la Unión para encontrar las frases más similares a una frase de consulta dada. Utilizaremos la [distancia euclidiana](https://en.wikipedia.org/wiki/Euclidean_distance) como nuestra métrica de similitud.

```python
# Load the text and split it into chunks
loader = TextLoader("../../../extras/modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

A continuación, cargaremos la URL del servicio para nuestra base de datos de Timescale.

Si aún no lo has hecho, [regístrate en Timescale](https://console.cloud.timescale.com/signup?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral) y crea una nueva base de datos.

Luego, para conectarte a tu base de datos PostgreSQL, necesitarás tu URI de servicio, que se puede encontrar en el cheatsheet o el archivo `.env` que descargaste después de crear una nueva base de datos.

El URI se verá algo así: `postgres://tsdbadmin:<password>@<id>.tsdb.cloud.timescale.com:<port>/tsdb?sslmode=require`.

```python
# Timescale Vector needs the service url to your cloud database. You can see this as soon as you create the
# service in the cloud UI or in your credentials.sql file
SERVICE_URL = os.environ["TIMESCALE_SERVICE_URL"]

# Specify directly if testing
# SERVICE_URL = "postgres://tsdbadmin:<password>@<id>.tsdb.cloud.timescale.com:<port>/tsdb?sslmode=require"

# # You can get also it from an environment variables. We suggest using a .env file.
# import os
# SERVICE_URL = os.environ.get("TIMESCALE_SERVICE_URL", "")
```

A continuación, creamos un vectorstore de TimescaleVector. Especificamos un nombre de colección, que será el nombre de la tabla en la que se almacenarán nuestros datos.

Nota: Al crear una nueva instancia de TimescaleVector, el Módulo de TimescaleVector intentará crear una tabla con el nombre de la colección. Así que asegúrate de que el nombre de la colección sea único (es decir, que no exista ya).

```python
# The TimescaleVector Module will create a table with the name of the collection.
COLLECTION_NAME = "state_of_the_union_test"

# Create a Timescale Vector instance from the collection of documents
db = TimescaleVector.from_documents(
    embedding=embeddings,
    documents=docs,
    collection_name=COLLECTION_NAME,
    service_url=SERVICE_URL,
)
```

Ahora que hemos cargado nuestros datos, podemos realizar una búsqueda de similitud.

```python
query = "What did the president say about Ketanji Brown Jackson"
docs_with_score = db.similarity_search_with_score(query)
```

```python
for doc, score in docs_with_score:
    print("-" * 80)
    print("Score: ", score)
    print(doc.page_content)
    print("-" * 80)
```

```output
--------------------------------------------------------------------------------
Score:  0.18443380687035138
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.18452197313308139
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.21720781018594182
A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans.

And if we are to advance liberty and justice, we need to secure the Border and fix the immigration system.

We can do both. At our border, we’ve installed new technology like cutting-edge scanners to better detect drug smuggling.

We’ve set up joint patrols with Mexico and Guatemala to catch more human traffickers.

We’re putting in place dedicated immigration judges so families fleeing persecution and violence can have their cases heard faster.

We’re securing commitments and supporting partners in South and Central America to host more refugees and secure their own borders.
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.21724902288621384
A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans.

And if we are to advance liberty and justice, we need to secure the Border and fix the immigration system.

We can do both. At our border, we’ve installed new technology like cutting-edge scanners to better detect drug smuggling.

We’ve set up joint patrols with Mexico and Guatemala to catch more human traffickers.

We’re putting in place dedicated immigration judges so families fleeing persecution and violence can have their cases heard faster.

We’re securing commitments and supporting partners in South and Central America to host more refugees and secure their own borders.
--------------------------------------------------------------------------------
```

### Usando un Vector de Timescale como Recuperador

Después de inicializar una tienda de TimescaleVector, puedes usarla como un [recuperador](/docs/modules/data_connection/retrievers/).

```python
# Use TimescaleVector as a retriever
retriever = db.as_retriever()
```

```python
print(retriever)
```

```output
tags=['TimescaleVector', 'OpenAIEmbeddings'] metadata=None vectorstore=<langchain_community.vectorstores.timescalevector.TimescaleVector object at 0x10fc8d070> search_type='similarity' search_kwargs={}
```

Veamos un ejemplo de cómo usar Vector de Timescale como recuperador con la cadena RetrievalQA y la cadena de documentos stuff.

En este ejemplo, haremos la misma consulta que antes, pero esta vez pasaremos los documentos relevantes devueltos por Vector de Timescale a un LLM para usarlos como contexto para responder a nuestra pregunta.

Primero crearemos nuestra cadena stuff:

```python
# Initialize GPT3.5 model
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(temperature=0.1, model="gpt-3.5-turbo-16k")

# Initialize a RetrievalQA class from a stuff chain
from langchain.chains import RetrievalQA

qa_stuff = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=retriever,
    verbose=True,
)
```

```python
query = "What did the president say about Ketanji Brown Jackson?"
response = qa_stuff.run(query)
```

```output


[1m> Entering new RetrievalQA chain...[0m

[1m> Finished chain.[0m
```

```python
print(response)
```

```output
The President said that he nominated Circuit Court of Appeals Judge Ketanji Brown Jackson, who is one of our nation's top legal minds and will continue Justice Breyer's legacy of excellence. He also mentioned that since her nomination, she has received a broad range of support from various groups, including the Fraternal Order of Police and former judges appointed by Democrats and Republicans.
```

## 2. Búsqueda de Similitud con filtro basado en tiempo

Un caso de uso clave para Vector de Timescale es la búsqueda eficiente de vectores basada en el tiempo. Vector de Timescale permite esto al particionar automáticamente los vectores (y los metadatos asociados) por tiempo. Esto te permite consultar eficientemente los vectores tanto por similitud con un vector de consulta como por tiempo.

La funcionalidad de búsqueda de vectores basada en el tiempo es útil para aplicaciones como:
- Almacenar y recuperar el historial de respuestas de LLM (por ejemplo, chatbots)
- Encontrar las incrustaciones más recientes que son similares a un vector de consulta (por ejemplo, noticias recientes).
- Restringir la búsqueda de similitud a un rango de tiempo relevante (por ejemplo, hacer preguntas basadas en el tiempo sobre una base de conocimiento)

Para ilustrar cómo usar la funcionalidad de búsqueda de vectores basada en el tiempo de TimescaleVector, haremos preguntas sobre el historial de registro de git para TimescaleDB. Ilustraremos cómo agregar documentos con un uuid basado en el tiempo y cómo ejecutar búsquedas de similitud con filtros de rango de tiempo.

### Extraer contenido y metadatos del JSON de registro de git

Primero, carguemos los datos del registro de git en una nueva colección en nuestra base de datos PostgreSQL llamada `timescale_commits`.

Definiremos una función auxiliar para crear un uuid para un documento y la incrustación de vector asociada basada en su timestamp. Usaremos esta función para crear un uuid para cada entrada del registro de git.

Nota importante: Si estás trabajando con documentos y quieres que la fecha y hora actuales estén asociadas con el vector para la búsqueda basada en el tiempo, puedes omitir este paso. Se generará automáticamente un uuid cuando se ingieran los documentos por defecto.

```python
from timescale_vector import client


# Function to take in a date string in the past and return a uuid v1
def create_uuid(date_string: str):
    if date_string is None:
        return None
    time_format = "%a %b %d %H:%M:%S %Y %z"
    datetime_obj = datetime.strptime(date_string, time_format)
    uuid = client.uuid_from_time(datetime_obj)
    return str(uuid)
```

A continuación, definiremos una función de metadatos para extraer los metadatos relevantes del registro JSON. Pasaremos esta función al JSONLoader. Consulta los [documentos de carga de documentos JSON](/docs/modules/data_connection/document_loaders/json) para más detalles.

```python
# Helper function to split name and email given an author string consisting of Name Lastname <email>
def split_name(input_string: str) -> Tuple[str, str]:
    if input_string is None:
        return None, None
    start = input_string.find("<")
    end = input_string.find(">")
    name = input_string[:start].strip()
    email = input_string[start + 1 : end].strip()
    return name, email


# Helper function to transform a date string into a timestamp_tz string
def create_date(input_string: str) -> datetime:
    if input_string is None:
        return None
    # Define a dictionary to map month abbreviations to their numerical equivalents
    month_dict = {
        "Jan": "01",
        "Feb": "02",
        "Mar": "03",
        "Apr": "04",
        "May": "05",
        "Jun": "06",
        "Jul": "07",
        "Aug": "08",
        "Sep": "09",
        "Oct": "10",
        "Nov": "11",
        "Dec": "12",
    }

    # Split the input string into its components
    components = input_string.split()
    # Extract relevant information
    day = components[2]
    month = month_dict[components[1]]
    year = components[4]
    time = components[3]
    timezone_offset_minutes = int(components[5])  # Convert the offset to minutes
    timezone_hours = timezone_offset_minutes // 60  # Calculate the hours
    timezone_minutes = timezone_offset_minutes % 60  # Calculate the remaining minutes
    # Create a formatted string for the timestamptz in PostgreSQL format
    timestamp_tz_str = (
        f"{year}-{month}-{day} {time}+{timezone_hours:02}{timezone_minutes:02}"
    )
    return timestamp_tz_str


# Metadata extraction function to extract metadata from a JSON record
def extract_metadata(record: dict, metadata: dict) -> dict:
    record_name, record_email = split_name(record["author"])
    metadata["id"] = create_uuid(record["date"])
    metadata["date"] = create_date(record["date"])
    metadata["author_name"] = record_name
    metadata["author_email"] = record_email
    metadata["commit_hash"] = record["commit"]
    return metadata
```

A continuación, necesitarás [descargar el conjunto de datos de muestra](https://s3.amazonaws.com/assets.timescale.com/ai/ts_git_log.json) y colocarlo en el mismo directorio que este notebook.

Puedes usar el siguiente comando:

```python
# Download the file using curl and save it as commit_history.csv
# Note: Execute this command in your terminal, in the same directory as the notebook
!curl -O https://s3.amazonaws.com/assets.timescale.com/ai/ts_git_log.json
```

Finalmente, podemos inicializar el cargador JSON para analizar los registros JSON. También eliminamos los registros vacíos para simplificar.

```python
# Define path to the JSON file relative to this notebook
# Change this to the path to your JSON file
FILE_PATH = "../../../../../ts_git_log.json"

# Load data from JSON file and extract metadata
loader = JSONLoader(
    file_path=FILE_PATH,
    jq_schema=".commit_history[]",
    text_content=False,
    metadata_func=extract_metadata,
)
documents = loader.load()

# Remove documents with None dates
documents = [doc for doc in documents if doc.metadata["date"] is not None]
```

```python
print(documents[0])
```

```output
page_content='{"commit": "44e41c12ab25e36c202f58e068ced262eadc8d16", "author": "Lakshmi Narayanan Sreethar<lakshmi@timescale.com>", "date": "Tue Sep 5 21:03:21 2023 +0530", "change summary": "Fix segfault in set_integer_now_func", "change details": "When an invalid function oid is passed to set_integer_now_func, it finds out that the function oid is invalid but before throwing the error, it calls ReleaseSysCache on an invalid tuple causing a segfault. Fixed that by removing the invalid call to ReleaseSysCache.  Fixes #6037 "}' metadata={'source': '/Users/avtharsewrathan/sideprojects2023/timescaleai/tsv-langchain/ts_git_log.json', 'seq_num': 1, 'id': '8b407680-4c01-11ee-96a6-b82284ddccc6', 'date': '2023-09-5 21:03:21+0850', 'author_name': 'Lakshmi Narayanan Sreethar', 'author_email': 'lakshmi@timescale.com', 'commit_hash': '44e41c12ab25e36c202f58e068ced262eadc8d16'}
```

### Cargar documentos y metadatos en el vectorstore de TimescaleVector

Ahora que hemos preparado nuestros documentos, procesémoslos y carguémoslos, junto con sus representaciones de incrustación de vectores en nuestro vectorstore de TimescaleVector.

Dado que esta es una demostración, solo cargaremos los primeros 500 registros. En la práctica, puedes cargar tantos registros como desees.

```python
NUM_RECORDS = 500
documents = documents[:NUM_RECORDS]
```

Luego usamos el CharacterTextSplitter para dividir los documentos en fragmentos más pequeños si es necesario para facilitar la incrustación. Ten en cuenta que este proceso de división conserva los metadatos para cada documento.

```python
# Split the documents into chunks for embedding
text_splitter = CharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
)
docs = text_splitter.split_documents(documents)
```

A continuación, crearemos una instancia de Vector de Timescale a partir de la colección de documentos que terminamos de preprocesar.

Primero, definiremos un nombre de colección, que será el nombre de nuestra tabla en la base de datos PostgreSQL.

También definiremos un delta de tiempo, que pasaremos al argumento `time_partition_interval`, que se utilizará como el intervalo para particionar los datos por tiempo. Cada partición consistirá en datos para la longitud de tiempo especificada. Usaremos 7 días por simplicidad, pero puedes elegir cualquier valor que tenga sentido para tu caso de uso: por ejemplo, si consultas vectores recientes con frecuencia, podrías usar un delta de tiempo más pequeño como 1 día, o si consultas vectores durante un período de tiempo de una década, podrías usar un delta de tiempo más grande como 6 meses o 1 año.

Finalmente, crearemos la instancia de TimescaleVector. Especificamos el argumento `ids` para que sea el campo `uuid` en nuestros metadatos que creamos en el paso de preprocesamiento anterior. Hacemos esto porque queremos que la parte temporal de nuestros uuids refleje fechas en el pasado (es decir, cuando se hizo el commit). Sin embargo, si quisiéramos que la fecha y hora actuales se asociaran con nuestro documento, podemos eliminar el argumento id y los uuid se crearán automáticamente con la fecha y hora actuales.

```python
# Define collection name
COLLECTION_NAME = "timescale_commits"
embeddings = OpenAIEmbeddings()

# Create a Timescale Vector instance from the collection of documents
db = TimescaleVector.from_documents(
    embedding=embeddings,
    ids=[doc.metadata["id"] for doc in docs],
    documents=docs,
    collection_name=COLLECTION_NAME,
    service_url=SERVICE_URL,
    time_partition_interval=timedelta(days=7),
)
```

### Consultar vectores por tiempo y similitud

Ahora que hemos cargado nuestros documentos en TimescaleVector, podemos consultarlos por tiempo y similitud.

TimescaleVector proporciona múltiples métodos para consultar vectores mediante la búsqueda de similitud con filtrado basado en el tiempo.

Vamos a echar un vistazo a cada método a continuación:

```python
# Time filter variables
start_dt = datetime(2023, 8, 1, 22, 10, 35)  # Start date = 1 August 2023, 22:10:35
end_dt = datetime(2023, 8, 30, 22, 10, 35)  # End date = 30 August 2023, 22:10:35
td = timedelta(days=7)  # Time delta = 7 days

query = "What's new with TimescaleDB functions?"
```

Método 1: Filtrar dentro de una fecha de inicio y una fecha de fin proporcionadas.

```python
# Method 1: Query for vectors between start_date and end_date
docs_with_score = db.similarity_search_with_score(
    query, start_date=start_dt, end_date=end_dt
)

for doc, score in docs_with_score:
    print("-" * 80)
    print("Score: ", score)
    print("Date: ", doc.metadata["date"])
    print(doc.page_content)
    print("-" * 80)
```

```output
--------------------------------------------------------------------------------
Score:  0.17488396167755127
Date:  2023-08-29 18:13:24+0320
{"commit": " e4facda540286b0affba47ccc63959fefe2a7b26", "author": "Sven Klemm<sven@timescale.com>", "date": "Tue Aug 29 18:13:24 2023 +0200", "change summary": "Add compatibility layer for _timescaledb_internal functions", "change details": "With timescaledb 2.12 all the functions present in _timescaledb_internal were moved into the _timescaledb_functions schema to improve schema security. This patch adds a compatibility layer so external callers of these internal functions will not break and allow for more flexibility when migrating. "}
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.18102192878723145
Date:  2023-08-20 22:47:10+0320
{"commit": " 0a66bdb8d36a1879246bd652e4c28500c4b951ab", "author": "Sven Klemm<sven@timescale.com>", "date": "Sun Aug 20 22:47:10 2023 +0200", "change summary": "Move functions to _timescaledb_functions schema", "change details": "To increase schema security we do not want to mix our own internal objects with user objects. Since chunks are created in the _timescaledb_internal schema our internal functions should live in a different dedicated schema. This patch make the necessary adjustments for the following functions:  - to_unix_microseconds(timestamptz) - to_timestamp(bigint) - to_timestamp_without_timezone(bigint) - to_date(bigint) - to_interval(bigint) - interval_to_usec(interval) - time_to_internal(anyelement) - subtract_integer_from_now(regclass, bigint) "}
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.18150119891755445
Date:  2023-08-22 12:01:19+0320
{"commit": " cf04496e4b4237440274eb25e4e02472fc4e06fc", "author": "Sven Klemm<sven@timescale.com>", "date": "Tue Aug 22 12:01:19 2023 +0200", "change summary": "Move utility functions to _timescaledb_functions schema", "change details": "To increase schema security we do not want to mix our own internal objects with user objects. Since chunks are created in the _timescaledb_internal schema our internal functions should live in a different dedicated schema. This patch make the necessary adjustments for the following functions:  - generate_uuid() - get_git_commit() - get_os_info() - tsl_loaded() "}
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.18422493887617963
Date:  2023-08-9 15:26:03+0500
{"commit": " 44eab9cf9bef34274c88efd37a750eaa74cd8044", "author": "Konstantina Skovola<konstantina@timescale.com>", "date": "Wed Aug 9 15:26:03 2023 +0300", "change summary": "Release 2.11.2", "change details": "This release contains bug fixes since the 2.11.1 release. We recommend that you upgrade at the next available opportunity.  **Features** * #5923 Feature flags for TimescaleDB features  **Bugfixes** * #5680 Fix DISTINCT query with JOIN on multiple segmentby columns * #5774 Fixed two bugs in decompression sorted merge code * #5786 Ensure pg_config --cppflags are passed * #5906 Fix quoting owners in sql scripts. * #5912 Fix crash in 1-step integer policy creation  **Thanks** * @mrksngl for submitting a PR to fix extension upgrade scripts * @ericdevries for reporting an issue with DISTINCT queries using segmentby columns of compressed hypertable "}
--------------------------------------------------------------------------------
```

Observe cómo la consulta solo devuelve resultados dentro del rango de fechas especificado.

Método 2: Filtrar dentro de una fecha de inicio proporcionada, y un delta de tiempo posterior.

```python
# Method 2: Query for vectors between start_dt and a time delta td later
# Most relevant vectors between 1 August and 7 days later
docs_with_score = db.similarity_search_with_score(
    query, start_date=start_dt, time_delta=td
)

for doc, score in docs_with_score:
    print("-" * 80)
    print("Score: ", score)
    print("Date: ", doc.metadata["date"])
    print(doc.page_content)
    print("-" * 80)
```

```output
--------------------------------------------------------------------------------
Score:  0.18458807468414307
Date:  2023-08-3 14:30:23+0500
{"commit": " 7aeed663b9c0f337b530fd6cad47704a51a9b2ec", "author": "Dmitry Simonenko<dmitry@timescale.com>", "date": "Thu Aug 3 14:30:23 2023 +0300", "change summary": "Feature flags for TimescaleDB features", "change details": "This PR adds several GUCs which allow to enable/disable major timescaledb features:  - enable_hypertable_create - enable_hypertable_compression - enable_cagg_create - enable_policy_create "}
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.20492422580718994
Date:  2023-08-7 18:31:40+0320
{"commit": " 07762ea4cedefc88497f0d1f8712d1515cdc5b6e", "author": "Sven Klemm<sven@timescale.com>", "date": "Mon Aug 7 18:31:40 2023 +0200", "change summary": "Test timescaledb debian 12 packages in CI", "change details": ""}
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.21106326580047607
Date:  2023-08-3 14:36:39+0500
{"commit": " 2863daf3df83c63ee36c0cf7b66c522da5b4e127", "author": "Dmitry Simonenko<dmitry@timescale.com>", "date": "Thu Aug 3 14:36:39 2023 +0300", "change summary": "Support CREATE INDEX ONLY ON main table", "change details": "This PR adds support for CREATE INDEX ONLY ON clause which allows to create index only on the main table excluding chunks.  Fix #5908 "}
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.21698051691055298
Date:  2023-08-2 20:24:14+0140
{"commit": " 3af0d282ea71d9a8f27159a6171e9516e62ec9cb", "author": "Lakshmi Narayanan Sreethar<lakshmi@timescale.com>", "date": "Wed Aug 2 20:24:14 2023 +0100", "change summary": "PG16: ExecInsertIndexTuples requires additional parameter", "change details": "PG16 adds a new boolean parameter to the ExecInsertIndexTuples function to denote if the index is a BRIN index, which is then used to determine if the index update can be skipped. The fix also removes the INDEX_ATTR_BITMAP_ALL enum value.  Adapt these changes by updating the compat function to accomodate the new parameter added to the ExecInsertIndexTuples function and using an alternative for the removed INDEX_ATTR_BITMAP_ALL enum value.  postgres/postgres@19d8e23 "}
--------------------------------------------------------------------------------
```

Una vez más, observe cómo obtenemos resultados dentro del filtro de tiempo especificado, diferente de la consulta anterior.

Método 3: Filtrar dentro de una fecha de fin proporcionada y un delta de tiempo anterior.

```python
# Method 3: Query for vectors between end_dt and a time delta td earlier
# Most relevant vectors between 30 August and 7 days earlier
docs_with_score = db.similarity_search_with_score(query, end_date=end_dt, time_delta=td)

for doc, score in docs_with_score:
    print("-" * 80)
    print("Score: ", score)
    print("Date: ", doc.metadata["date"])
    print(doc.page_content)
    print("-" * 80)
```

```output
--------------------------------------------------------------------------------
Score:  0.17488396167755127
Date:  2023-08-29 18:13:24+0320
{"commit": " e4facda540286b0affba47ccc63959fefe2a7b26", "author": "Sven Klemm<sven@timescale.com>", "date": "Tue Aug 29 18:13:24 2023 +0200", "change summary": "Add compatibility layer for _timescaledb_internal functions", "change details": "With timescaledb 2.12 all the functions present in _timescaledb_internal were moved into the _timescaledb_functions schema to improve schema security. This patch adds a compatibility layer so external callers of these internal functions will not break and allow for more flexibility when migrating. "}
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.18496227264404297
Date:  2023-08-29 10:49:47+0320
{"commit": " a9751ccd5eb030026d7b975d22753f5964972389", "author": "Sven Klemm<sven@timescale.com>", "date": "Tue Aug 29 10:49:47 2023 +0200", "change summary": "Move partitioning functions to _timescaledb_functions schema", "change details": "To increase schema security we do not want to mix our own internal objects with user objects. Since chunks are created in the _timescaledb_internal schema our internal functions should live in a different dedicated schema. This patch make the necessary adjustments for the following functions:  - get_partition_for_key(val anyelement) - get_partition_hash(val anyelement) "}
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.1871250867843628
Date:  2023-08-28 23:26:23+0320
{"commit": " b2a91494a11d8b82849b6f11f9ea6dc26ef8a8cb", "author": "Sven Klemm<sven@timescale.com>", "date": "Mon Aug 28 23:26:23 2023 +0200", "change summary": "Move ddl_internal functions to _timescaledb_functions schema", "change details": "To increase schema security we do not want to mix our own internal objects with user objects. Since chunks are created in the _timescaledb_internal schema our internal functions should live in a different dedicated schema. This patch make the necessary adjustments for the following functions:  - chunk_constraint_add_table_constraint(_timescaledb_catalog.chunk_constraint) - chunk_drop_replica(regclass,name) - chunk_index_clone(oid) - chunk_index_replace(oid,oid) - create_chunk_replica_table(regclass,name) - drop_stale_chunks(name,integer[]) - health() - hypertable_constraint_add_table_fk_constraint(name,name,name,integer) - process_ddl_event() - wait_subscription_sync(name,name,integer,numeric) "}
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.18867712088363497
Date:  2023-08-27 13:20:04+0320
{"commit": " e02b1f348eb4c48def00b7d5227238b4d9d41a4a", "author": "Sven Klemm<sven@timescale.com>", "date": "Sun Aug 27 13:20:04 2023 +0200", "change summary": "Simplify schema move update script", "change details": "Use dynamic sql to create the ALTER FUNCTION statements for those functions that may not exist in previous versions. "}
--------------------------------------------------------------------------------
```

Método 4: También podemos filtrar todos los vectores después de una fecha dada especificando solo una fecha de inicio en nuestra consulta.

Método 5: De manera similar, podemos filtrar todos los vectores antes de una fecha dada especificando solo una fecha de fin en nuestra consulta.

```python
# Method 4: Query all vectors after start_date
docs_with_score = db.similarity_search_with_score(query, start_date=start_dt)

for doc, score in docs_with_score:
    print("-" * 80)
    print("Score: ", score)
    print("Date: ", doc.metadata["date"])
    print(doc.page_content)
    print("-" * 80)
```

```output
--------------------------------------------------------------------------------
Score:  0.17488396167755127
Date:  2023-08-29 18:13:24+0320
{"commit": " e4facda540286b0affba47ccc63959fefe2a7b26", "author": "Sven Klemm<sven@timescale.com>", "date": "Tue Aug 29 18:13:24 2023 +0200", "change summary": "Add compatibility layer for _timescaledb_internal functions", "change details": "With timescaledb 2.12 all the functions present in _timescaledb_internal were moved into the _timescaledb_functions schema to improve schema security. This patch adds a compatibility layer so external callers of these internal functions will not break and allow for more flexibility when migrating. "}
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.18102192878723145
Date:  2023-08-20 22:47:10+0320
{"commit": " 0a66bdb8d36a1879246bd652e4c28500c4b951ab", "author": "Sven Klemm<sven@timescale.com>", "date": "Sun Aug 20 22:47:10 2023 +0200", "change summary": "Move functions to _timescaledb_functions schema", "change details": "To increase schema security we do not want to mix our own internal objects with user objects. Since chunks are created in the _timescaledb_internal schema our internal functions should live in a different dedicated schema. This patch make the necessary adjustments for the following functions:  - to_unix_microseconds(timestamptz) - to_timestamp(bigint) - to_timestamp_without_timezone(bigint) - to_date(bigint) - to_interval(bigint) - interval_to_usec(interval) - time_to_internal(anyelement) - subtract_integer_from_now(regclass, bigint) "}
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.18150119891755445
Date:  2023-08-22 12:01:19+0320
{"commit": " cf04496e4b4237440274eb25e4e02472fc4e06fc", "author": "Sven Klemm<sven@timescale.com>", "date": "Tue Aug 22 12:01:19 2023 +0200", "change summary": "Move utility functions to _timescaledb_functions schema", "change details": "To increase schema security we do not want to mix our own internal objects with user objects. Since chunks are created in the _timescaledb_internal schema our internal functions should live in a different dedicated schema. This patch make the necessary adjustments for the following functions:  - generate_uuid() - get_git_commit() - get_os_info() - tsl_loaded() "}
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.18422493887617963
Date:  2023-08-9 15:26:03+0500
{"commit": " 44eab9cf9bef34274c88efd37a750eaa74cd8044", "author": "Konstantina Skovola<konstantina@timescale.com>", "date": "Wed Aug 9 15:26:03 2023 +0300", "change summary": "Release 2.11.2", "change details": "This release contains bug fixes since the 2.11.1 release. We recommend that you upgrade at the next available opportunity.  **Features** * #5923 Feature flags for TimescaleDB features  **Bugfixes** * #5680 Fix DISTINCT query with JOIN on multiple segmentby columns * #5774 Fixed two bugs in decompression sorted merge code * #5786 Ensure pg_config --cppflags are passed * #5906 Fix quoting owners in sql scripts. * #5912 Fix crash in 1-step integer policy creation  **Thanks** * @mrksngl for submitting a PR to fix extension upgrade scripts * @ericdevries for reporting an issue with DISTINCT queries using segmentby columns of compressed hypertable "}
--------------------------------------------------------------------------------
```

```python
# Method 5: Query all vectors before end_date
docs_with_score = db.similarity_search_with_score(query, end_date=end_dt)

for doc, score in docs_with_score:
    print("-" * 80)
    print("Score: ", score)
    print("Date: ", doc.metadata["date"])
    print(doc.page_content)
    print("-" * 80)
```

```output
--------------------------------------------------------------------------------
Score:  0.16723191738128662
Date:  2023-04-11 22:01:14+0320
{"commit": " 0595ff0888f2ffb8d313acb0bda9642578a9ade3", "author": "Sven Klemm<sven@timescale.com>", "date": "Tue Apr 11 22:01:14 2023 +0200", "change summary": "Move type support functions into _timescaledb_functions schema", "change details": ""}
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.1706540584564209
Date:  2023-04-6 13:00:00+0320
{"commit": " 04f43335dea11e9c467ee558ad8edfc00c1a45ed", "author": "Sven Klemm<sven@timescale.com>", "date": "Thu Apr 6 13:00:00 2023 +0200", "change summary": "Move aggregate support function into _timescaledb_functions", "change details": "This patch moves the support functions for histogram, first and last into the _timescaledb_functions schema. Since we alter the schema of the existing functions in upgrade scripts and do not change the aggregates this should work completely transparently for any user objects using those aggregates. "}
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.17462033033370972
Date:  2023-03-31 08:22:57+0320
{"commit": " feef9206facc5c5f506661de4a81d96ef059b095", "author": "Sven Klemm<sven@timescale.com>", "date": "Fri Mar 31 08:22:57 2023 +0200", "change summary": "Add _timescaledb_functions schema", "change details": "Currently internal user objects like chunks and our functions live in the same schema making locking down that schema hard. This patch adds a new schema _timescaledb_functions that is meant to be the schema used for timescaledb internal functions to allow separation of code and chunks or other user objects. "}
--------------------------------------------------------------------------------
--------------------------------------------------------------------------------
Score:  0.17488396167755127
Date:  2023-08-29 18:13:24+0320
{"commit": " e4facda540286b0affba47ccc63959fefe2a7b26", "author": "Sven Klemm<sven@timescale.com>", "date": "Tue Aug 29 18:13:24 2023 +0200", "change summary": "Add compatibility layer for _timescaledb_internal functions", "change details": "With timescaledb 2.12 all the functions present in _timescaledb_internal were moved into the _timescaledb_functions schema to improve schema security. This patch adds a compatibility layer so external callers of these internal functions will not break and allow for more flexibility when migrating. "}
--------------------------------------------------------------------------------
```

La conclusión principal es que en cada resultado anterior, solo se devuelven vectores dentro del rango de tiempo especificado. Estas consultas son muy eficientes ya que solo necesitan buscar en las particiones relevantes.

También podemos usar esta funcionalidad para responder preguntas, donde queremos encontrar los vectores más relevantes dentro de un rango de tiempo especificado para usar como contexto para responder una pregunta. Veamos un ejemplo a continuación, usando Timescale Vector como recuperador:

```python
# Set timescale vector as a retriever and specify start and end dates via kwargs
retriever = db.as_retriever(search_kwargs={"start_date": start_dt, "end_date": end_dt})
```

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(temperature=0.1, model="gpt-3.5-turbo-16k")

from langchain.chains import RetrievalQA

qa_stuff = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=retriever,
    verbose=True,
)

query = (
    "What's new with the timescaledb functions? Tell me when these changes were made."
)
response = qa_stuff.run(query)
print(response)
```

```output


[1m> Entering new RetrievalQA chain...[0m

[1m> Finished chain.[0m
The following changes were made to the timescaledb functions:

1. "Add compatibility layer for _timescaledb_internal functions" - This change was made on Tue Aug 29 18:13:24 2023 +0200.
2. "Move functions to _timescaledb_functions schema" - This change was made on Sun Aug 20 22:47:10 2023 +0200.
3. "Move utility functions to _timescaledb_functions schema" - This change was made on Tue Aug 22 12:01:19 2023 +0200.
4. "Move partitioning functions to _timescaledb_functions schema" - This change was made on Tue Aug 29 10:49:47 2023 +0200.
```

Note que el contexto que el LLM usa para componer una respuesta proviene de documentos recuperados solo dentro del rango de fechas especificado.

Esto muestra cómo puede usar Timescale Vector para mejorar la generación aumentada por recuperación recuperando documentos dentro de rangos de tiempo relevantes para su consulta.

## 3. Uso de índices de búsqueda ANN para acelerar consultas

Puede acelerar las consultas de similitud creando un índice en la columna de incrustación. Solo debe hacer esto una vez que haya ingerido una gran parte de sus datos.

Timescale Vector soporta los siguientes índices:
- índice timescale_vector (tsv): un índice de gráfico inspirado en disk-ann para búsqueda de similitud rápida (predeterminado).
- índice HNSW de pgvector: un índice de gráfico de pequeño mundo navegable jerárquico para búsqueda de similitud rápida.
- índice IVFFLAT de pgvector: un índice de archivo invertido para búsqueda de similitud rápida.

Nota importante: En PostgreSQL, cada tabla solo puede tener un índice en una columna en particular. Así que si desea probar el rendimiento de diferentes tipos de índices, puede hacerlo ya sea (1) creando múltiples tablas con diferentes índices, (2) creando múltiples columnas de vectores en la misma tabla y creando diferentes índices en cada columna, o (3) eliminando y recreando el índice en la misma columna y comparando resultados.

```python
# Initialize an existing TimescaleVector store
COLLECTION_NAME = "timescale_commits"
embeddings = OpenAIEmbeddings()
db = TimescaleVector(
    collection_name=COLLECTION_NAME,
    service_url=SERVICE_URL,
    embedding_function=embeddings,
)
```

Usar la función `create_index()` sin argumentos adicionales creará un timescale_vector_index por defecto, usando los parámetros predeterminados.

```python
# create an index
# by default this will create a Timescale Vector (DiskANN) index
db.create_index()
```

También puede especificar los parámetros para el índice. Consulte la documentación de Timescale Vector para una discusión completa de los diferentes parámetros y sus efectos en el rendimiento.

Nota: No necesita especificar parámetros ya que establecemos valores predeterminados inteligentes. Pero siempre puede especificar sus propios parámetros si desea experimentar y obtener más rendimiento para su conjunto de datos específico.

```python
# drop the old index
db.drop_index()

# create an index
# Note: You don't need to specify m and ef_construction parameters as we set smart defaults.
db.create_index(index_type="tsv", max_alpha=1.0, num_neighbors=50)
```

Timescale Vector también soporta el algoritmo de indexación HNSW ANN, así como el algoritmo de indexación ivfflat ANN. Simplemente especifique en el argumento `index_type` cuál índice le gustaría crear, y opcionalmente especifique los parámetros para el índice.

```python
# drop the old index
db.drop_index()

# Create an HNSW index
# Note: You don't need to specify m and ef_construction parameters as we set smart defaults.
db.create_index(index_type="hnsw", m=16, ef_construction=64)
```

```python
# drop the old index
db.drop_index()

# Create an IVFFLAT index
# Note: You don't need to specify num_lists and num_records parameters as we set smart defaults.
db.create_index(index_type="ivfflat", num_lists=20, num_records=1000)
```

En general, recomendamos usar el índice vectorial de timescale predeterminado, o el índice HNSW.

```python
# drop the old index
db.drop_index()
# Create a new timescale vector index
db.create_index()
```

## 4. Recuperador de auto-consulta con Timescale Vector

Timescale Vector también soporta la funcionalidad del recuperador de auto-consulta, lo que le da la capacidad de consultarse a sí mismo. Dada una consulta en lenguaje natural con una declaración de consulta y filtros (simples o compuestos), el recuperador usa una cadena LLM de construcción de consultas para escribir una consulta SQL y luego la aplica a la base de datos subyacente PostgreSQL en el vectorstore de Timescale Vector.

Para más sobre auto-consulta, [consulte la documentación](/docs/modules/data_connection/retrievers/self_query/).

Para ilustrar la auto-consulta con Timescale Vector, usaremos el mismo conjunto de datos gitlog de la Parte 3.

```python
COLLECTION_NAME = "timescale_commits"
vectorstore = TimescaleVector(
    embedding_function=OpenAIEmbeddings(),
    collection_name=COLLECTION_NAME,
    service_url=SERVICE_URL,
)
```

A continuación, crearemos nuestro recuperador de auto-consulta. Para hacerlo, necesitaremos proporcionar alguna información previa sobre los campos de metadatos que soportan nuestros documentos y una breve descripción del contenido del documento.

```python
from langchain.chains.query_constructor.base import AttributeInfo
from langchain.retrievers.self_query.base import SelfQueryRetriever
from langchain_openai import OpenAI

# Give LLM info about the metadata fields
metadata_field_info = [
    AttributeInfo(
        name="id",
        description="A UUID v1 generated from the date of the commit",
        type="uuid",
    ),
    AttributeInfo(
        name="date",
        description="The date of the commit in timestamptz format",
        type="timestamptz",
    ),
    AttributeInfo(
        name="author_name",
        description="The name of the author of the commit",
        type="string",
    ),
    AttributeInfo(
        name="author_email",
        description="The email address of the author of the commit",
        type="string",
    ),
]
document_content_description = "The git log commit summary containing the commit hash, author, date of commit, change summary and change details"

# Instantiate the self-query retriever from an LLM
llm = OpenAI(temperature=0)
retriever = SelfQueryRetriever.from_llm(
    llm,
    vectorstore,
    document_content_description,
    metadata_field_info,
    enable_limit=True,
    verbose=True,
)
```

Ahora vamos a probar el recuperador de auto-consulta en nuestro conjunto de datos gitlog.

Ejecute las consultas a continuación y observe cómo puede especificar una consulta, una consulta con un filtro y una consulta con un filtro compuesto (filtros con AND, OR) en lenguaje natural y el recuperador de auto-consulta traducirá esa consulta a SQL y realizará la búsqueda en el vectorstore PostgreSQL de Timescale Vector.

Esto ilustra el poder del recuperador de auto-consulta. ¡Puede usarlo para realizar búsquedas complejas en su vectorstore sin que usted o sus usuarios tengan que escribir ningún SQL directamente!

```python
# This example specifies a relevant query
retriever.invoke("What are improvements made to continuous aggregates?")
```

```output
/Users/avtharsewrathan/sideprojects2023/timescaleai/tsv-langchain/langchain/libs/langchain/langchain/chains/llm.py:275: UserWarning: The predict_and_parse method is deprecated, instead pass an output parser directly to LLMChain.
  warnings.warn(

query='improvements to continuous aggregates' filter=None limit=None
```

```output
[Document(page_content='{"commit": " 35c91204987ccb0161d745af1a39b7eb91bc65a5", "author": "Fabr\\u00edzio de Royes Mello<fabriziomello@gmail.com>", "date": "Thu Nov 24 13:19:36 2022 -0300", "change summary": "Add Hierarchical Continuous Aggregates validations", "change details": "Commit 3749953e introduce Hierarchical Continuous Aggregates (aka Continuous Aggregate on top of another Continuous Aggregate) but it lacks of some basic validations.  Validations added during the creation of a Hierarchical Continuous Aggregate:  * Forbid create a continuous aggregate with fixed-width bucket on top of   a continuous aggregate with variable-width bucket.  * Forbid incompatible bucket widths:   - should not be equal;   - bucket width of the new continuous aggregate should be greater than     the source continuous aggregate;   - bucket width of the new continuous aggregate should be multiple of     the source continuous aggregate. "}', metadata={'id': 'c98d1c00-6c13-11ed-9bbe-23925ce74d13', 'date': '2022-11-24 13:19:36+-500', 'source': '/Users/avtharsewrathan/sideprojects2023/timescaleai/tsv-langchain/langchain/docs/docs/modules/ts_git_log.json', 'seq_num': 446, 'author_name': 'Fabrízio de Royes Mello', 'commit_hash': ' 35c91204987ccb0161d745af1a39b7eb91bc65a5', 'author_email': 'fabriziomello@gmail.com'}),
 Document(page_content='{"commit": " 3749953e9704e45df8f621607989ada0714ce28d", "author": "Fabr\\u00edzio de Royes Mello<fabriziomello@gmail.com>", "date": "Wed Oct 5 18:45:40 2022 -0300", "change summary": "Hierarchical Continuous Aggregates", "change details": "Enable users create Hierarchical Continuous Aggregates (aka Continuous Aggregates on top of another Continuous Aggregates).  With this PR users can create levels of aggregation granularity in Continuous Aggregates making the refresh process even faster.  A problem with this feature can be in upper levels we can end up with the \\"average of averages\\". But to get the \\"real average\\" we can rely on \\"stats_aggs\\" TimescaleDB Toolkit function that calculate and store the partials that can be finalized with other toolkit functions like \\"average\\" and \\"sum\\".  Closes #1400 "}', metadata={'id': '0df31a00-44f7-11ed-9794-ebcc1227340f', 'date': '2022-10-5 18:45:40+-500', 'source': '/Users/avtharsewrathan/sideprojects2023/timescaleai/tsv-langchain/langchain/docs/docs/modules/ts_git_log.json', 'seq_num': 470, 'author_name': 'Fabrízio de Royes Mello', 'commit_hash': ' 3749953e9704e45df8f621607989ada0714ce28d', 'author_email': 'fabriziomello@gmail.com'}),
 Document(page_content='{"commit": " a6ff7ba6cc15b280a275e5acd315741ec9c86acc", "author": "Mats Kindahl<mats@timescale.com>", "date": "Tue Feb 28 12:04:17 2023 +0100", "change summary": "Rename columns in old-style continuous aggregates", "change details": "For continuous aggregates with the old-style partial aggregates renaming columns that are not in the group-by clause will generate an error when upgrading to a later version. The reason is that it is implicitly assumed that the name of the column is the same as for the direct view. This holds true for new-style continous aggregates, but is not always true for old-style continuous aggregates. In particular, columns that are not part of the `GROUP BY` clause can have an internally generated name.  This commit fixes that by extracting the name of the column from the partial view and use that when renaming the partial view column and the materialized table column. "}', metadata={'id': 'a49ace80-b757-11ed-8138-2390fd44ffd9', 'date': '2023-02-28 12:04:17+0140', 'source': '/Users/avtharsewrathan/sideprojects2023/timescaleai/tsv-langchain/langchain/docs/docs/modules/ts_git_log.json', 'seq_num': 294, 'author_name': 'Mats Kindahl', 'commit_hash': ' a6ff7ba6cc15b280a275e5acd315741ec9c86acc', 'author_email': 'mats@timescale.com'}),
 Document(page_content='{"commit": " 5bba74a2ec083728f8e93e09d03d102568fd72b5", "author": "Fabr\\u00edzio de Royes Mello<fabriziomello@gmail.com>", "date": "Mon Aug 7 19:49:47 2023 -0300", "change summary": "Relax strong table lock when refreshing a CAGG", "change details": "When refreshing a Continuous Aggregate we take a table lock on _timescaledb_catalog.continuous_aggs_invalidation_threshold when processing the invalidation logs (the first transaction of the refresh Continuous Aggregate procedure). It means that even two different Continuous Aggregates over two different hypertables will wait each other in the first phase of the refreshing procedure. Also it lead to problems when a pg_dump is running because it take an AccessShareLock on tables so Continuous Aggregate refresh execution will wait until the pg_dump finish.  Improved it by relaxing the strong table-level lock to a row-level lock so now the Continuous Aggregate refresh procedure can be executed in multiple sessions with less locks.  Fix #3554 "}', metadata={'id': 'b5583780-3574-11ee-a5ba-2e305874a58f', 'date': '2023-08-7 19:49:47+-500', 'source': '/Users/avtharsewrathan/sideprojects2023/timescaleai/tsv-langchain/langchain/docs/docs/modules/ts_git_log.json', 'seq_num': 27, 'author_name': 'Fabrízio de Royes Mello', 'commit_hash': ' 5bba74a2ec083728f8e93e09d03d102568fd72b5', 'author_email': 'fabriziomello@gmail.com'})]
```

```python
# This example specifies a filter
retriever.invoke("What commits did Sven Klemm add?")
```

```output
query=' ' filter=Comparison(comparator=<Comparator.EQ: 'eq'>, attribute='author_name', value='Sven Klemm') limit=None
```

```output
[Document(page_content='{"commit": " e2e7ae304521b74ac6b3f157a207da047d44ab06", "author": "Sven Klemm<sven@timescale.com>", "date": "Fri Mar 3 11:22:06 2023 +0100", "change summary": "Don\'t run sanitizer test on individual PRs", "change details": "Sanitizer tests take a long time to run so we don\'t want to run them on individual PRs but instead run them nightly and on commits to master. "}', metadata={'id': '3f401b00-b9ad-11ed-b5ea-a3fd40b9ac16', 'date': '2023-03-3 11:22:06+0140', 'source': '/Users/avtharsewrathan/sideprojects2023/timescaleai/tsv-langchain/langchain/docs/docs/modules/ts_git_log.json', 'seq_num': 295, 'author_name': 'Sven Klemm', 'commit_hash': ' e2e7ae304521b74ac6b3f157a207da047d44ab06', 'author_email': 'sven@timescale.com'}),
 Document(page_content='{"commit": " d8f19e57a04d17593df5f2c694eae8775faddbc7", "author": "Sven Klemm<sven@timescale.com>", "date": "Wed Feb 1 08:34:20 2023 +0100", "change summary": "Bump version of setup-wsl github action", "change details": "The currently used version pulls in Node.js 12 which is deprecated on github.  https://github.blog/changelog/2022-09-22-github-actions-all-actions-will-begin-running-on-node16-instead-of-node12/ "}', metadata={'id': 'd70de600-a202-11ed-85d6-30b6df240f49', 'date': '2023-02-1 08:34:20+0140', 'source': '/Users/avtharsewrathan/sideprojects2023/timescaleai/tsv-langchain/langchain/docs/docs/modules/ts_git_log.json', 'seq_num': 350, 'author_name': 'Sven Klemm', 'commit_hash': ' d8f19e57a04d17593df5f2c694eae8775faddbc7', 'author_email': 'sven@timescale.com'}),
 Document(page_content='{"commit": " 83b13cf6f73a74656dde9cc6ec6cf76740cddd3c", "author": "Sven Klemm<sven@timescale.com>", "date": "Fri Nov 25 08:27:45 2022 +0100", "change summary": "Use packaged postgres for sqlsmith and coverity CI", "change details": "The sqlsmith and coverity workflows used the cache postgres build but could not produce a build by themselves and therefore relied on other workflows to produce the cached binaries. This patch changes those workflows to use normal postgres packages instead of custom built postgres to remove that dependency. "}', metadata={'id': 'a786ae80-6c92-11ed-bd6c-a57bd3348b97', 'date': '2022-11-25 08:27:45+0140', 'source': '/Users/avtharsewrathan/sideprojects2023/timescaleai/tsv-langchain/langchain/docs/docs/modules/ts_git_log.json', 'seq_num': 447, 'author_name': 'Sven Klemm', 'commit_hash': ' 83b13cf6f73a74656dde9cc6ec6cf76740cddd3c', 'author_email': 'sven@timescale.com'}),
 Document(page_content='{"commit": " b1314e63f2ff6151ab5becfb105afa3682286a4d", "author": "Sven Klemm<sven@timescale.com>", "date": "Thu Dec 22 12:03:35 2022 +0100", "change summary": "Fix RPM package test for PG15 on centos 7", "change details": "Installing PG15 on Centos 7 requires the EPEL repository to satisfy the dependencies. "}', metadata={'id': '477b1d80-81e8-11ed-9c8c-9b5abbd67c98', 'date': '2022-12-22 12:03:35+0140', 'source': '/Users/avtharsewrathan/sideprojects2023/timescaleai/tsv-langchain/langchain/docs/docs/modules/ts_git_log.json', 'seq_num': 408, 'author_name': 'Sven Klemm', 'commit_hash': ' b1314e63f2ff6151ab5becfb105afa3682286a4d', 'author_email': 'sven@timescale.com'})]
```

```python
# This example specifies a query and filter
retriever.invoke("What commits about timescaledb_functions did Sven Klemm add?")
```

```output
query='timescaledb_functions' filter=Comparison(comparator=<Comparator.EQ: 'eq'>, attribute='author_name', value='Sven Klemm') limit=None
```

```output
[Document(page_content='{"commit": " 04f43335dea11e9c467ee558ad8edfc00c1a45ed", "author": "Sven Klemm<sven@timescale.com>", "date": "Thu Apr 6 13:00:00 2023 +0200", "change summary": "Move aggregate support function into _timescaledb_functions", "change details": "This patch moves the support functions for histogram, first and last into the _timescaledb_functions schema. Since we alter the schema of the existing functions in upgrade scripts and do not change the aggregates this should work completely transparently for any user objects using those aggregates. "}', metadata={'id': '2cb47800-d46a-11ed-8f0e-2b624245c561', 'date': '2023-04-6 13:00:00+0320', 'source': '/Users/avtharsewrathan/sideprojects2023/timescaleai/tsv-langchain/langchain/docs/docs/modules/ts_git_log.json', 'seq_num': 233, 'author_name': 'Sven Klemm', 'commit_hash': ' 04f43335dea11e9c467ee558ad8edfc00c1a45ed', 'author_email': 'sven@timescale.com'}),
 Document(page_content='{"commit": " feef9206facc5c5f506661de4a81d96ef059b095", "author": "Sven Klemm<sven@timescale.com>", "date": "Fri Mar 31 08:22:57 2023 +0200", "change summary": "Add _timescaledb_functions schema", "change details": "Currently internal user objects like chunks and our functions live in the same schema making locking down that schema hard. This patch adds a new schema _timescaledb_functions that is meant to be the schema used for timescaledb internal functions to allow separation of code and chunks or other user objects. "}', metadata={'id': '7a257680-cf8c-11ed-848c-a515e8687479', 'date': '2023-03-31 08:22:57+0320', 'source': '/Users/avtharsewrathan/sideprojects2023/timescaleai/tsv-langchain/langchain/docs/docs/modules/ts_git_log.json', 'seq_num': 239, 'author_name': 'Sven Klemm', 'commit_hash': ' feef9206facc5c5f506661de4a81d96ef059b095', 'author_email': 'sven@timescale.com'}),
 Document(page_content='{"commit": " 0a66bdb8d36a1879246bd652e4c28500c4b951ab", "author": "Sven Klemm<sven@timescale.com>", "date": "Sun Aug 20 22:47:10 2023 +0200", "change summary": "Move functions to _timescaledb_functions schema", "change details": "To increase schema security we do not want to mix our own internal objects with user objects. Since chunks are created in the _timescaledb_internal schema our internal functions should live in a different dedicated schema. This patch make the necessary adjustments for the following functions:  - to_unix_microseconds(timestamptz) - to_timestamp(bigint) - to_timestamp_without_timezone(bigint) - to_date(bigint) - to_interval(bigint) - interval_to_usec(interval) - time_to_internal(anyelement) - subtract_integer_from_now(regclass, bigint) "}', metadata={'id': 'bb99db00-3f9a-11ee-a8dc-0b9c1a5a37c4', 'date': '2023-08-20 22:47:10+0320', 'source': '/Users/avtharsewrathan/sideprojects2023/timescaleai/tsv-langchain/langchain/docs/docs/modules/ts_git_log.json', 'seq_num': 41, 'author_name': 'Sven Klemm', 'commit_hash': ' 0a66bdb8d36a1879246bd652e4c28500c4b951ab', 'author_email': 'sven@timescale.com'}),
 Document(page_content='{"commit": " 56ea8b4de93cefc38e002202d8ac96947dcbaa77", "author": "Sven Klemm<sven@timescale.com>", "date": "Thu Apr 13 13:16:14 2023 +0200", "change summary": "Move trigger functions to _timescaledb_functions schema", "change details": "To increase schema security we do not want to mix our own internal objects with user objects. Since chunks are created in the _timescaledb_internal schema our internal functions should live in a different dedicated schema. This patch make the necessary adjustments for our trigger functions. "}', metadata={'id': '9a255300-d9ec-11ed-988f-7086c8ca463a', 'date': '2023-04-13 13:16:14+0320', 'source': '/Users/avtharsewrathan/sideprojects2023/timescaleai/tsv-langchain/langchain/docs/docs/modules/ts_git_log.json', 'seq_num': 44, 'author_name': 'Sven Klemm', 'commit_hash': ' 56ea8b4de93cefc38e002202d8ac96947dcbaa77', 'author_email': 'sven@timescale.com'})]
```

```python
# This example specifies a time-based filter
retriever.invoke("What commits were added in July 2023?")
```

```output
query=' ' filter=Operation(operator=<Operator.AND: 'and'>, arguments=[Comparison(comparator=<Comparator.GTE: 'gte'>, attribute='date', value='2023-07-01T00:00:00Z'), Comparison(comparator=<Comparator.LTE: 'lte'>, attribute='date', value='2023-07-31T23:59:59Z')]) limit=None
```

```output
[Document(page_content='{"commit": " 5cf354e2469ee7e43248bed382a4b49fc7ccfecd", "author": "Markus Engel<engel@sero-systems.de>", "date": "Mon Jul 31 11:28:25 2023 +0200", "change summary": "Fix quoting owners in sql scripts.", "change details": "When referring to a role from a string type, it must be properly quoted using pg_catalog.quote_ident before it can be casted to regrole. Fixed this, especially in update scripts. "}', metadata={'id': '99590280-2f84-11ee-915b-5715b2447de4', 'date': '2023-07-31 11:28:25+0320', 'source': '/Users/avtharsewrathan/sideprojects2023/timescaleai/tsv-langchain/langchain/docs/docs/modules/ts_git_log.json', 'seq_num': 76, 'author_name': 'Markus Engel', 'commit_hash': ' 5cf354e2469ee7e43248bed382a4b49fc7ccfecd', 'author_email': 'engel@sero-systems.de'}),
 Document(page_content='{"commit": " 88aaf23ae37fe7f47252b87325eb570aa417c607", "author": "noctarius aka Christoph Engelbert<me@noctarius.com>", "date": "Wed Jul 12 14:53:40 2023 +0200", "change summary": "Allow Replica Identity (Alter Table) on CAGGs (#5868)", "change details": "This commit is a follow up of #5515, which added support for ALTER TABLE\\r ... REPLICA IDENTITY (FULL | INDEX) on hypertables.\\r \\r This commit allows the execution against materialized hypertables to\\r enable update / delete operations on continuous aggregates when logical\\r replication in enabled for them."}', metadata={'id': '1fcfa200-20b3-11ee-9a18-370561c7cb1a', 'date': '2023-07-12 14:53:40+0320', 'source': '/Users/avtharsewrathan/sideprojects2023/timescaleai/tsv-langchain/langchain/docs/docs/modules/ts_git_log.json', 'seq_num': 96, 'author_name': 'noctarius aka Christoph Engelbert', 'commit_hash': ' 88aaf23ae37fe7f47252b87325eb570aa417c607', 'author_email': 'me@noctarius.com'}),
 Document(page_content='{"commit": " d5268c36fbd23fa2a93c0371998286e8688247bb", "author": "Alexander Kuzmenkov<36882414+akuzm@users.noreply.github.com>", "date": "Fri Jul 28 13:35:05 2023 +0200", "change summary": "Fix SQLSmith workflow", "change details": "The build was failing because it was picking up the wrong version of Postgres. Remove it. "}', metadata={'id': 'cc0fba80-2d3a-11ee-ae7d-36dc25cad3b8', 'date': '2023-07-28 13:35:05+0320', 'source': '/Users/avtharsewrathan/sideprojects2023/timescaleai/tsv-langchain/langchain/docs/docs/modules/ts_git_log.json', 'seq_num': 82, 'author_name': 'Alexander Kuzmenkov', 'commit_hash': ' d5268c36fbd23fa2a93c0371998286e8688247bb', 'author_email': '36882414+akuzm@users.noreply.github.com'}),
 Document(page_content='{"commit": " 61c288ec5eb966a9b4d8ed90cd026ffc5e3543c9", "author": "Lakshmi Narayanan Sreethar<lakshmi@timescale.com>", "date": "Tue Jul 25 16:11:35 2023 +0530", "change summary": "Fix broken CI after PG12 removal", "change details": "The commit cdea343cc updated the gh_matrix_builder.py script but failed to import PG_LATEST variable into the script thus breaking the CI. Import that variable to fix the CI tests. "}', metadata={'id': 'd3835980-2ad7-11ee-b98d-c4e3092e076e', 'date': '2023-07-25 16:11:35+0850', 'source': '/Users/avtharsewrathan/sideprojects2023/timescaleai/tsv-langchain/langchain/docs/docs/modules/ts_git_log.json', 'seq_num': 84, 'author_name': 'Lakshmi Narayanan Sreethar', 'commit_hash': ' 61c288ec5eb966a9b4d8ed90cd026ffc5e3543c9', 'author_email': 'lakshmi@timescale.com'})]
```

```python
# This example specifies a query and a LIMIT value
retriever.invoke("What are two commits about hierarchical continuous aggregates?")
```

```output
query='hierarchical continuous aggregates' filter=None limit=2
```

```output
[Document(page_content='{"commit": " 35c91204987ccb0161d745af1a39b7eb91bc65a5", "author": "Fabr\\u00edzio de Royes Mello<fabriziomello@gmail.com>", "date": "Thu Nov 24 13:19:36 2022 -0300", "change summary": "Add Hierarchical Continuous Aggregates validations", "change details": "Commit 3749953e introduce Hierarchical Continuous Aggregates (aka Continuous Aggregate on top of another Continuous Aggregate) but it lacks of some basic validations.  Validations added during the creation of a Hierarchical Continuous Aggregate:  * Forbid create a continuous aggregate with fixed-width bucket on top of   a continuous aggregate with variable-width bucket.  * Forbid incompatible bucket widths:   - should not be equal;   - bucket width of the new continuous aggregate should be greater than     the source continuous aggregate;   - bucket width of the new continuous aggregate should be multiple of     the source continuous aggregate. "}', metadata={'id': 'c98d1c00-6c13-11ed-9bbe-23925ce74d13', 'date': '2022-11-24 13:19:36+-500', 'source': '/Users/avtharsewrathan/sideprojects2023/timescaleai/tsv-langchain/langchain/docs/docs/modules/ts_git_log.json', 'seq_num': 446, 'author_name': 'Fabrízio de Royes Mello', 'commit_hash': ' 35c91204987ccb0161d745af1a39b7eb91bc65a5', 'author_email': 'fabriziomello@gmail.com'}),
 Document(page_content='{"commit": " 3749953e9704e45df8f621607989ada0714ce28d", "author": "Fabr\\u00edzio de Royes Mello<fabriziomello@gmail.com>", "date": "Wed Oct 5 18:45:40 2022 -0300", "change summary": "Hierarchical Continuous Aggregates", "change details": "Enable users create Hierarchical Continuous Aggregates (aka Continuous Aggregates on top of another Continuous Aggregates).  With this PR users can create levels of aggregation granularity in Continuous Aggregates making the refresh process even faster.  A problem with this feature can be in upper levels we can end up with the \\"average of averages\\". But to get the \\"real average\\" we can rely on \\"stats_aggs\\" TimescaleDB Toolkit function that calculate and store the partials that can be finalized with other toolkit functions like \\"average\\" and \\"sum\\".  Closes #1400 "}', metadata={'id': '0df31a00-44f7-11ed-9794-ebcc1227340f', 'date': '2022-10-5 18:45:40+-500', 'source': '/Users/avtharsewrathan/sideprojects2023/timescaleai/tsv-langchain/langchain/docs/docs/modules/ts_git_log.json', 'seq_num': 470, 'author_name': 'Fabrízio de Royes Mello', 'commit_hash': ' 3749953e9704e45df8f621607989ada0714ce28d', 'author_email': 'fabriziomello@gmail.com'})]
```

## 5. Trabajando con un vectorstore de TimescaleVector existente

En los ejemplos anteriores, creamos un vectorstore a partir de una colección de documentos. Sin embargo, a menudo queremos insertar datos en y consultar datos de un vectorstore existente. Veamos cómo inicializar, agregar documentos y consultar una colección existente de documentos en un vectorstore de TimescaleVector.

Para trabajar con un vectorstore de Timescale Vector existente, necesitamos saber el nombre de la tabla que queremos consultar (`COLLECTION_NAME`) y la URL de la base de datos en la nube PostgreSQL (`SERVICE_URL`).

```python
# Initialize the existing
COLLECTION_NAME = "timescale_commits"
embeddings = OpenAIEmbeddings()
vectorstore = TimescaleVector(
    collection_name=COLLECTION_NAME,
    service_url=SERVICE_URL,
    embedding_function=embeddings,
)
```

Para cargar nuevos datos en la tabla, usamos la función `add_document()`. Esta función toma una lista de documentos y una lista de metadatos. Los metadatos deben contener un id único para cada documento.

Si desea que sus documentos estén asociados con la fecha y hora actual, no necesita crear una lista de ids. Se generará automáticamente un uuid para cada documento.

Si desea que sus documentos estén asociados con una fecha y hora pasadas, puede crear una lista de ids usando la función `uuid_from_time` en la biblioteca de python `timecale-vector`, como se muestra en la Sección 2 anterior. Esta función toma un objeto datetime y devuelve un uuid con la fecha y hora codificadas en el uuid.

```python
# Add documents to a collection in TimescaleVector
ids = vectorstore.add_documents([Document(page_content="foo")])
ids
```

```output
['a34f2b8a-53d7-11ee-8cc3-de1e4b2a0118']
```

```python
# Query the vectorstore for similar documents
docs_with_score = vectorstore.similarity_search_with_score("foo")
```

```python
docs_with_score[0]
```

```output
(Document(page_content='foo', metadata={}), 5.006789860928507e-06)
```

```python
docs_with_score[1]
```

```output
(Document(page_content='{"commit": " 00b566dfe478c11134bcf1e7bcf38943e7fafe8f", "author": "Fabr\\u00edzio de Royes Mello<fabriziomello@gmail.com>", "date": "Mon Mar 6 15:51:03 2023 -0300", "change summary": "Remove unused functions", "change details": "We don\'t use `ts_catalog_delete[_only]` functions anywhere and instead we rely on `ts_catalog_delete_tid[_only]` functions so removing it from our code base. "}', metadata={'id': 'd7f5c580-bc4f-11ed-9712-ffa0126a201a', 'date': '2023-03-6 15:51:03+-500', 'source': '/Users/avtharsewrathan/sideprojects2023/timescaleai/tsv-langchain/langchain/docs/docs/modules/ts_git_log.json', 'seq_num': 285, 'author_name': 'Fabrízio de Royes Mello', 'commit_hash': ' 00b566dfe478c11134bcf1e7bcf38943e7fafe8f', 'author_email': 'fabriziomello@gmail.com'}),
 0.23607668446580354)
```

### Eliminando datos

Puede eliminar datos por uuid o por un filtro en los metadatos.

```python
ids = vectorstore.add_documents([Document(page_content="Bar")])

vectorstore.delete(ids)
```

```output
True
```

Eliminar usando metadatos es especialmente útil si desea actualizar periódicamente la información extraída de una fuente particular, o una fecha particular o algún otro atributo de metadatos.

```python
vectorstore.add_documents(
    [Document(page_content="Hello World", metadata={"source": "www.example.com/hello"})]
)
vectorstore.add_documents(
    [Document(page_content="Adios", metadata={"source": "www.example.com/adios"})]
)

vectorstore.delete_by_metadata({"source": "www.example.com/adios"})

vectorstore.add_documents(
    [
        Document(
            page_content="Adios, but newer!",
            metadata={"source": "www.example.com/adios"},
        )
    ]
)
```

```output
['c6367004-53d7-11ee-8cc3-de1e4b2a0118']
```

### Sobrescribir un vectorstore

Si tiene una colección existente, puede sobrescribirla haciendo `from_documents` y configurando `pre_delete_collection` = True

```python
db = TimescaleVector.from_documents(
    documents=docs,
    embedding=embeddings,
    collection_name=COLLECTION_NAME,
    service_url=SERVICE_URL,
    pre_delete_collection=True,
)
```

```python
docs_with_score = db.similarity_search_with_score("foo")
```

```python
docs_with_score[0]
```
