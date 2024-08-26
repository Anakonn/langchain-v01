---
translated: true
---

# Vector de escala de tiempo (Postgres)

>[Timescale Vector](https://www.timescale.com/ai) es `PostgreSQL++` para aplicaciones de IA. Te permite almacenar y consultar de manera eficiente miles de millones de incrustaciones de vector en `PostgreSQL`.
>
>[PostgreSQL](https://en.wikipedia.org/wiki/PostgreSQL), también conocido como `Postgres`, es un sistema de gestión de bases de datos relacionales (RDBMS) gratuito y de código abierto que hace énfasis en la extensibilidad y el cumplimiento de `SQL`.

Este cuaderno muestra cómo usar la base de datos de vectores Postgres (`TimescaleVector`) para realizar consultas automáticas. En el cuaderno demostraremos el `SelfQueryRetriever` envuelto alrededor de un almacén de vectores TimescaleVector.

## ¿Qué es Timescale Vector?

**[Timescale Vector](https://www.timescale.com/ai) es PostgreSQL++ para aplicaciones de IA.**

Timescale Vector te permite almacenar y consultar de manera eficiente millones de incrustaciones de vector en `PostgreSQL`.
- Mejora `pgvector` con una búsqueda de similitud más rápida y precisa en 1000 millones+ de vectores a través del algoritmo de indexación inspirado en DiskANN.
- Permite una búsqueda rápida de vectores basada en el tiempo a través de la partición y el indexado automáticos basados en el tiempo.
- Proporciona una interfaz SQL familiar para consultar incrustaciones de vector y datos relacionales.

Timescale Vector es PostgreSQL en la nube para IA que se escala contigo desde la prueba de concepto hasta la producción:
- Simplifica las operaciones al permitirte almacenar metadatos relacionales, incrustaciones de vector y datos de series temporales en una sola base de datos.
- Se beneficia de la sólida base de PostgreSQL con características empresariales como copias de seguridad y replicación en streaming, alta disponibilidad y seguridad a nivel de fila.
- Permite una experiencia sin preocupaciones con seguridad y cumplimiento empresarial.

## Cómo acceder a Timescale Vector

Timescale Vector está disponible en [Timescale](https://www.timescale.com/ai), la plataforma PostgreSQL en la nube. (No hay una versión de autoalojamiento por el momento).

Los usuarios de LangChain obtienen un período de prueba gratuito de 90 días para Timescale Vector.
- Para comenzar, [regístrate](https://console.cloud.timescale.com/signup?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral) en Timescale, crea una nueva base de datos y ¡sigue este cuaderno!
- Consulta el [blog explicativo de Timescale Vector](https://www.timescale.com/blog/how-we-made-postgresql-the-best-vector-database/?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral) para obtener más detalles y pruebas de rendimiento.
- Consulta las [instrucciones de instalación](https://github.com/timescale/python-vector) para obtener más detalles sobre el uso de Timescale Vector en Python.

## Creación de un almacén de vectores TimescaleVector

Primero querremos crear un almacén de vectores Timescale Vector y sembrarlo con algunos datos. Hemos creado un pequeño conjunto de datos de demostración de documentos que contienen resúmenes de películas.

NOTA: El recuperador de consultas automáticas requiere que tengas `lark` instalado (`pip install lark`). También necesitamos el paquete `timescale-vector`.

```python
%pip install --upgrade --quiet  lark
```

```python
%pip install --upgrade --quiet  timescale-vector
```

En este ejemplo, usaremos `OpenAIEmbeddings`, así que carguemos tu clave API de OpenAI.

```python
# Get openAI api key by reading local .env file
# The .env file should contain a line starting with `OPENAI_API_KEY=sk-`
import os

from dotenv import find_dotenv, load_dotenv

_ = load_dotenv(find_dotenv())

OPENAI_API_KEY = os.environ["OPENAI_API_KEY"]
# Alternatively, use getpass to enter the key in a prompt
# import os
# import getpass
# os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

Para conectarte a tu base de datos PostgreSQL, necesitarás tu URI de servicio, que se puede encontrar en la hoja de trucos o el archivo `.env` que descargaste después de crear una nueva base de datos.

Si aún no lo has hecho, [regístrate en Timescale](https://console.cloud.timescale.com/signup?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral) y crea una nueva base de datos.

El URI se verá algo así: `postgres://tsdbadmin:<password>@<id>.tsdb.cloud.timescale.com:<port>/tsdb?sslmode=require`

```python
# Get the service url by reading local .env file
# The .env file should contain a line starting with `TIMESCALE_SERVICE_URL=postgresql://`
_ = load_dotenv(find_dotenv())
TIMESCALE_SERVICE_URL = os.environ["TIMESCALE_SERVICE_URL"]

# Alternatively, use getpass to enter the key in a prompt
# import os
# import getpass
# TIMESCALE_SERVICE_URL = getpass.getpass("Timescale Service URL:")
```

```python
from langchain_community.vectorstores.timescalevector import TimescaleVector
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings()
```

Aquí están los documentos de muestra que usaremos para esta demostración. Los datos son sobre películas y tienen campos de contenido y metadatos con información sobre una película en particular.

```python
docs = [
    Document(
        page_content="A bunch of scientists bring back dinosaurs and mayhem breaks loose",
        metadata={"year": 1993, "rating": 7.7, "genre": "science fiction"},
    ),
    Document(
        page_content="Leo DiCaprio gets lost in a dream within a dream within a dream within a ...",
        metadata={"year": 2010, "director": "Christopher Nolan", "rating": 8.2},
    ),
    Document(
        page_content="A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea",
        metadata={"year": 2006, "director": "Satoshi Kon", "rating": 8.6},
    ),
    Document(
        page_content="A bunch of normal-sized women are supremely wholesome and some men pine after them",
        metadata={"year": 2019, "director": "Greta Gerwig", "rating": 8.3},
    ),
    Document(
        page_content="Toys come alive and have a blast doing so",
        metadata={"year": 1995, "genre": "animated"},
    ),
    Document(
        page_content="Three men walk into the Zone, three men walk out of the Zone",
        metadata={
            "year": 1979,
            "director": "Andrei Tarkovsky",
            "genre": "science fiction",
            "rating": 9.9,
        },
    ),
]
```

Finalmente, crearemos nuestro almacén de vectores Timescale Vector. Ten en cuenta que el nombre de la colección será el nombre de la tabla PostgreSQL en la que se almacenarán los documentos.

```python
COLLECTION_NAME = "langchain_self_query_demo"
vectorstore = TimescaleVector.from_documents(
    embedding=embeddings,
    documents=docs,
    collection_name=COLLECTION_NAME,
    service_url=TIMESCALE_SERVICE_URL,
)
```

## Creación de nuestro recuperador de consultas automáticas

Ahora podemos instanciar nuestro recuperador. Para hacer esto, tendremos que proporcionar información previa sobre los campos de metadatos que admiten nuestros documentos y una breve descripción del contenido de los documentos.

```python
from langchain.chains.query_constructor.base import AttributeInfo
from langchain.retrievers.self_query.base import SelfQueryRetriever
from langchain_openai import OpenAI

# Give LLM info about the metadata fields
metadata_field_info = [
    AttributeInfo(
        name="genre",
        description="The genre of the movie",
        type="string or list[string]",
    ),
    AttributeInfo(
        name="year",
        description="The year the movie was released",
        type="integer",
    ),
    AttributeInfo(
        name="director",
        description="The name of the movie director",
        type="string",
    ),
    AttributeInfo(
        name="rating", description="A 1-10 rating for the movie", type="float"
    ),
]
document_content_description = "Brief summary of a movie"

# Instantiate the self-query retriever from an LLM
llm = OpenAI(temperature=0)
retriever = SelfQueryRetriever.from_llm(
    llm, vectorstore, document_content_description, metadata_field_info, verbose=True
)
```

## Recuperación de consultas automáticas con Timescale Vector

¡Y ahora podemos intentar usar realmente nuestro recuperador!

Ejecuta las consultas a continuación y observa cómo puedes especificar una consulta, un filtro, un filtro compuesto (filtros con AND, OR) en lenguaje natural y el recuperador de consultas automáticas lo traducirá a SQL y realizará la búsqueda en el almacén de vectores Timescale Vector (Postgres).

Esto ilustra el poder del recuperador de consultas automáticas. ¡Puedes usarlo para realizar búsquedas complejas en tu almacén de vectores sin tener que escribir SQL directamente ni tus usuarios!

```python
# This example only specifies a relevant query
retriever.invoke("What are some movies about dinosaurs")
```

```output
/Users/avtharsewrathan/sideprojects2023/timescaleai/tsv-langchain/langchain/libs/langchain/langchain/chains/llm.py:275: UserWarning: The predict_and_parse method is deprecated, instead pass an output parser directly to LLMChain.
  warnings.warn(

query='dinosaur' filter=None limit=None
```

```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'year': 1993, 'genre': 'science fiction', 'rating': 7.7}),
 Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'year': 1993, 'genre': 'science fiction', 'rating': 7.7}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995, 'genre': 'animated'}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995, 'genre': 'animated'})]
```

```python
# This example only specifies a filter
retriever.invoke("I want to watch a movie rated higher than 8.5")
```

```output
query=' ' filter=Comparison(comparator=<Comparator.GT: 'gt'>, attribute='rating', value=8.5) limit=None
```

```output
[Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979, 'genre': 'science fiction', 'rating': 9.9, 'director': 'Andrei Tarkovsky'}),
 Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979, 'genre': 'science fiction', 'rating': 9.9, 'director': 'Andrei Tarkovsky'}),
 Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'year': 2006, 'rating': 8.6, 'director': 'Satoshi Kon'}),
 Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'year': 2006, 'rating': 8.6, 'director': 'Satoshi Kon'})]
```

```python
# This example specifies a query and a filter
retriever.invoke("Has Greta Gerwig directed any movies about women")
```

```output
query='women' filter=Comparison(comparator=<Comparator.EQ: 'eq'>, attribute='director', value='Greta Gerwig') limit=None
```

```output
[Document(page_content='A bunch of normal-sized women are supremely wholesome and some men pine after them', metadata={'year': 2019, 'rating': 8.3, 'director': 'Greta Gerwig'}),
 Document(page_content='A bunch of normal-sized women are supremely wholesome and some men pine after them', metadata={'year': 2019, 'rating': 8.3, 'director': 'Greta Gerwig'})]
```

```python
# This example specifies a composite filter
retriever.invoke("What's a highly rated (above 8.5) science fiction film?")
```

```output
query=' ' filter=Operation(operator=<Operator.AND: 'and'>, arguments=[Comparison(comparator=<Comparator.GTE: 'gte'>, attribute='rating', value=8.5), Comparison(comparator=<Comparator.EQ: 'eq'>, attribute='genre', value='science fiction')]) limit=None
```

```output
[Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979, 'genre': 'science fiction', 'rating': 9.9, 'director': 'Andrei Tarkovsky'}),
 Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979, 'genre': 'science fiction', 'rating': 9.9, 'director': 'Andrei Tarkovsky'})]
```

```python
# This example specifies a query and composite filter
retriever.invoke(
    "What's a movie after 1990 but before 2005 that's all about toys, and preferably is animated"
)
```

```output
query='toys' filter=Operation(operator=<Operator.AND: 'and'>, arguments=[Comparison(comparator=<Comparator.GT: 'gt'>, attribute='year', value=1990), Comparison(comparator=<Comparator.LT: 'lt'>, attribute='year', value=2005), Comparison(comparator=<Comparator.EQ: 'eq'>, attribute='genre', value='animated')]) limit=None
```

```output
[Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995, 'genre': 'animated'})]
```

### Filtrar k

También podemos usar el recuperador de consultas automáticas para especificar `k`: el número de documentos a recuperar.

Podemos hacer esto pasando `enable_limit=True` al constructor.

```python
retriever = SelfQueryRetriever.from_llm(
    llm,
    vectorstore,
    document_content_description,
    metadata_field_info,
    enable_limit=True,
    verbose=True,
)
```

```python
# This example specifies a query with a LIMIT value
retriever.invoke("what are two movies about dinosaurs")
```

```output
query='dinosaur' filter=None limit=2
```

```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'year': 1993, 'genre': 'science fiction', 'rating': 7.7}),
 Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'year': 1993, 'genre': 'science fiction', 'rating': 7.7})]
```
