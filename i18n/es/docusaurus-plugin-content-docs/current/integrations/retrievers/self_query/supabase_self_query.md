---
translated: true
---

# Supabase (Postgres)

>[Supabase](https://supabase.com/docs) es una alternativa de código abierto a `Firebase`.
> `Supabase` se basa en `PostgreSQL`, que ofrece capacidades de consulta `SQL`
> sólidas y permite una interfaz sencilla con herramientas y marcos ya existentes.

>[PostgreSQL](https://en.wikipedia.org/wiki/PostgreSQL), también conocido como `Postgres`,
> es un sistema de gestión de bases de datos relacionales (RDBMS) de código abierto y gratuito
> que hace énfasis en la extensibilidad y el cumplimiento de `SQL`.
>
>[Supabase](https://supabase.com/docs/guides/ai) proporciona un kit de herramientas de código abierto para desarrollar aplicaciones de IA
>utilizando Postgres y pgvector. Utilice las bibliotecas de clientes de Supabase para almacenar, indexar y consultar sus incrustaciones vectoriales a escala.

En el cuaderno, demostraremos el `SelfQueryRetriever` envuelto alrededor de un almacén de vectores `Supabase`.

Específicamente, haremos:
1. Crear una base de datos Supabase
2. Habilitar la extensión `pgvector`
3. Crear una tabla `documents` y una función `match_documents` que serán utilizadas por `SupabaseVectorStore`
4. Cargar documentos de muestra en el almacén de vectores (tabla de base de datos)
5. Construir y probar un recuperador de consulta automática

## Configurar la base de datos Supabase

1. Dirígete a https://database.new para aprovisionar tu base de datos Supabase.
2. En el estudio, salta al [editor SQL](https://supabase.com/dashboard/project/_/sql/new) y ejecuta el siguiente script para habilitar `pgvector` y configurar tu base de datos como un almacén de vectores:
    ```sql
    -- Habilitar la extensión pgvector para trabajar con vectores de incrustación
    create extension if not exists vector;

    -- Crear una tabla para almacenar tus documentos
    create table
      documents (
        id uuid primary key,
        content text, -- corresponde a Document.pageContent
        metadata jsonb, -- corresponde a Document.metadata
        embedding vector (1536) -- 1536 funciona para incrustaciones de OpenAI, cambiar si es necesario
      );

    -- Crear una función para buscar documentos
    create function match_documents (
      query_embedding vector (1536),
      filter jsonb default '{}'
    ) returns table (
      id uuid,
      content text,
      metadata jsonb,
      similarity float
    ) language plpgsql as $$
    #variable_conflict use_column
    begin
      return query
      select
        id,
        content,
        metadata,
        1 - (documents.embedding <=> query_embedding) as similarity
      from documents
      where metadata @> filter
      order by documents.embedding <=> query_embedding;
    end;
    $$;
    ```

## Crear un almacén de vectores Supabase

A continuación, crearemos un almacén de vectores Supabase y lo llenaremos con algunos datos. Hemos creado un pequeño conjunto de documentos de demostración que contienen resúmenes de películas.

Asegúrate de instalar la última versión de `langchain` con soporte para `openai`:

```python
%pip install --upgrade --quiet  langchain langchain-openai tiktoken
```

El recuperador de consulta automática requiere que tengas `lark` instalado:

```python
%pip install --upgrade --quiet  lark
```

También necesitamos el paquete `supabase`:

```python
%pip install --upgrade --quiet  supabase
```

Dado que estamos utilizando `SupabaseVectorStore` y `OpenAIEmbeddings`, tenemos que cargar sus claves API.

- Para encontrar tu `SUPABASE_URL` y `SUPABASE_SERVICE_KEY`, dirígete a la [configuración de API](https://supabase.com/dashboard/project/_/settings/api) de tu proyecto Supabase.
  - `SUPABASE_URL` corresponde a la URL del proyecto
  - `SUPABASE_SERVICE_KEY` corresponde a la clave API `service_role`

- Para obtener tu `OPENAI_API_KEY`, navega a [Claves API](https://platform.openai.com/account/api-keys) en tu cuenta de OpenAI y crea una nueva clave secreta.

```python
import getpass
import os

os.environ["SUPABASE_URL"] = getpass.getpass("Supabase URL:")
os.environ["SUPABASE_SERVICE_KEY"] = getpass.getpass("Supabase Service Key:")
os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

_Opcional:_ Si estás almacenando tus claves API de Supabase y OpenAI en un archivo `.env`, puedes cargarlas con [`dotenv`](https://github.com/theskumar/python-dotenv).

```python
%pip install --upgrade --quiet  python-dotenv
```

```python
from dotenv import load_dotenv

load_dotenv()
```

Primero crearemos un cliente Supabase e instanciaremos una clase de incrustaciones de OpenAI.

```python
import os

from langchain_community.vectorstores import SupabaseVectorStore
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings
from supabase.client import Client, create_client

supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

embeddings = OpenAIEmbeddings()
```

A continuación, creemos nuestros documentos.

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

vectorstore = SupabaseVectorStore.from_documents(
    docs,
    embeddings,
    client=supabase,
    table_name="documents",
    query_name="match_documents",
)
```

## Crear nuestro recuperador de consulta automática

Ahora podemos instanciar nuestro recuperador. Para hacer esto, necesitaremos proporcionar información previa sobre los campos de metadatos que admiten nuestros documentos y una breve descripción del contenido de los documentos.

```python
from langchain.chains.query_constructor.base import AttributeInfo
from langchain.retrievers.self_query.base import SelfQueryRetriever
from langchain_openai import OpenAI

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
llm = OpenAI(temperature=0)
retriever = SelfQueryRetriever.from_llm(
    llm, vectorstore, document_content_description, metadata_field_info, verbose=True
)
```

## Probándolo

¡Y ahora podemos intentar usar realmente nuestro recuperador!

```python
# This example only specifies a relevant query
retriever.invoke("What are some movies about dinosaurs")
```

```output
query='dinosaur' filter=None limit=None
```

```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'year': 1993, 'genre': 'science fiction', 'rating': 7.7}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995, 'genre': 'animated'}),
 Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979, 'genre': 'science fiction', 'rating': 9.9, 'director': 'Andrei Tarkovsky'}),
 Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'year': 2006, 'rating': 8.6, 'director': 'Satoshi Kon'})]
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
 Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'year': 2006, 'rating': 8.6, 'director': 'Satoshi Kon'})]
```

```python
# This example specifies a query and a filter
retriever.invoke("Has Greta Gerwig directed any movies about women?")
```

```output
query='women' filter=Comparison(comparator=<Comparator.EQ: 'eq'>, attribute='director', value='Greta Gerwig') limit=None
```

```output
[Document(page_content='A bunch of normal-sized women are supremely wholesome and some men pine after them', metadata={'year': 2019, 'rating': 8.3, 'director': 'Greta Gerwig'})]
```

```python
# This example specifies a composite filter
retriever.invoke("What's a highly rated (above 8.5) science fiction film?")
```

```output
query=' ' filter=Operation(operator=<Operator.AND: 'and'>, arguments=[Comparison(comparator=<Comparator.GTE: 'gte'>, attribute='rating', value=8.5), Comparison(comparator=<Comparator.EQ: 'eq'>, attribute='genre', value='science fiction')]) limit=None
```

```output
[Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979, 'genre': 'science fiction', 'rating': 9.9, 'director': 'Andrei Tarkovsky'})]
```

```python
# This example specifies a query and composite filter
retriever.invoke(
    "What's a movie after 1990 but before (or on) 2005 that's all about toys, and preferably is animated"
)
```

```output
query='toys' filter=Operation(operator=<Operator.AND: 'and'>, arguments=[Comparison(comparator=<Comparator.GT: 'gt'>, attribute='year', value=1990), Comparison(comparator=<Comparator.LTE: 'lte'>, attribute='year', value=2005), Comparison(comparator=<Comparator.LIKE: 'like'>, attribute='genre', value='animated')]) limit=None
```

```output
[Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995, 'genre': 'animated'})]
```

## Filtrar k

También podemos usar el recuperador de consulta automática para especificar `k`: el número de documentos a recuperar.

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
# This example only specifies a relevant query
retriever.invoke("what are two movies about dinosaurs")
```

```output
query='dinosaur' filter=None limit=2
```

```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'year': 1993, 'genre': 'science fiction', 'rating': 7.7}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995, 'genre': 'animated'})]
```
