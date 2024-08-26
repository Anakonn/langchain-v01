---
translated: true
---

# Bases de datos grandes

Para escribir consultas válidas en una base de datos, necesitamos proporcionar al modelo los nombres de las tablas, los esquemas de las tablas y los valores de las características para que pueda consultarlos. Cuando hay muchas tablas, columnas y/o columnas de alta cardinalidad, es imposible que podamos volcar toda la información sobre nuestra base de datos en cada solicitud. En su lugar, debemos encontrar formas de insertar dinámicamente en la solicitud solo la información más relevante. Veamos algunas técnicas para hacer esto.

## Configuración

Primero, obtén los paquetes necesarios y establece las variables de entorno:

```python
%pip install --upgrade --quiet  langchain langchain-community langchain-openai
```

```output

[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m A new release of pip is available: [0m[31;49m23.2.1[0m[39;49m -> [0m[32;49m23.3.2[0m
[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m To update, run: [0m[32;49mpip install --upgrade pip[0m
Note: you may need to restart the kernel to use updated packages.
```

Utilizamos modelos de OpenAI de forma predeterminada en esta guía, pero puedes cambiarlos por el proveedor de modelos de tu elección.

```python
import getpass
import os

# os.environ["OPENAI_API_KEY"] = getpass.getpass()

# Uncomment the below to use LangSmith. Not required.
os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
```

```output
 ········
```

El siguiente ejemplo utilizará una conexión SQLite con la base de datos Chinook. Sigue [estos pasos de instalación](https://database.guide/2-sample-databases-sqlite/) para crear `Chinook.db` en el mismo directorio que este cuaderno:

* Guarda [este archivo](https://raw.githubusercontent.com/lerocha/chinook-database/master/ChinookDatabase/DataSources/Chinook_Sqlite.sql) como `Chinook_Sqlite.sql`
* Ejecuta `sqlite3 Chinook.db`
* Ejecuta `.read Chinook_Sqlite.sql`
* Prueba `SELECT * FROM Artist LIMIT 10;`

Ahora, `Chinhook.db` está en nuestro directorio y podemos interactuar con él usando la clase [SQLDatabase](https://api.python.langchain.com/en/latest/utilities/langchain_community.utilities.sql_database.SQLDatabase.html) impulsada por SQLAlchemy:

```python
from langchain_community.utilities import SQLDatabase

db = SQLDatabase.from_uri("sqlite:///Chinook.db")
print(db.dialect)
print(db.get_usable_table_names())
db.run("SELECT * FROM Artist LIMIT 10;")
```

```output
sqlite
['Album', 'Artist', 'Customer', 'Employee', 'Genre', 'Invoice', 'InvoiceLine', 'MediaType', 'Playlist', 'PlaylistTrack', 'Track']
```

```output
"[(1, 'AC/DC'), (2, 'Accept'), (3, 'Aerosmith'), (4, 'Alanis Morissette'), (5, 'Alice In Chains'), (6, 'Antônio Carlos Jobim'), (7, 'Apocalyptica'), (8, 'Audioslave'), (9, 'BackBeat'), (10, 'Billy Cobham')]"
```

## Muchas tablas

Una de las principales piezas de información que necesitamos incluir en nuestra solicitud son los esquemas de las tablas relevantes. Cuando tenemos muchas tablas, no podemos ajustar todos los esquemas en una sola solicitud. Lo que podemos hacer en esos casos es primero extraer los nombres de las tablas relacionadas con la entrada del usuario y luego incluir solo sus esquemas.

Una forma fácil y confiable de hacer esto es usando la llamada de función de OpenAI y los modelos Pydantic. LangChain viene con una cadena [create_extraction_chain_pydantic](https://api.python.langchain.com/en/latest/chains/langchain.chains.openai_tools.extraction.create_extraction_chain_pydantic.html) incorporada que nos permite hacer precisamente esto:

```python
from langchain.chains.openai_tools import create_extraction_chain_pydantic
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo-1106", temperature=0)


class Table(BaseModel):
    """Table in SQL database."""

    name: str = Field(description="Name of table in SQL database.")


table_names = "\n".join(db.get_usable_table_names())
system = f"""Return the names of ALL the SQL tables that MIGHT be relevant to the user question. \
The tables are:

{table_names}

Remember to include ALL POTENTIALLY RELEVANT tables, even if you're not sure that they're needed."""
table_chain = create_extraction_chain_pydantic(Table, llm, system_message=system)
table_chain.invoke({"input": "What are all the genres of Alanis Morisette songs"})
```

```output
[Table(name='Genre'), Table(name='Artist'), Table(name='Track')]
```

¡Esto funciona bastante bien! Excepto que, como veremos a continuación, en realidad necesitamos algunas otras tablas también. Esto sería bastante difícil para el modelo saber solo por la pregunta del usuario. En este caso, podríamos pensar en simplificar el trabajo de nuestro modelo agrupando las tablas. Simplemente le pediremos al modelo que elija entre las categorías "Música" y "Negocios", y luego nos encargaremos de seleccionar todas las tablas relevantes desde allí:

```python
system = """Return the names of the SQL tables that are relevant to the user question. \
The tables are:

Music
Business"""
category_chain = create_extraction_chain_pydantic(Table, llm, system_message=system)
category_chain.invoke({"input": "What are all the genres of Alanis Morisette songs"})
```

```output
[Table(name='Music')]
```

```python
from typing import List


def get_tables(categories: List[Table]) -> List[str]:
    tables = []
    for category in categories:
        if category.name == "Music":
            tables.extend(
                [
                    "Album",
                    "Artist",
                    "Genre",
                    "MediaType",
                    "Playlist",
                    "PlaylistTrack",
                    "Track",
                ]
            )
        elif category.name == "Business":
            tables.extend(["Customer", "Employee", "Invoice", "InvoiceLine"])
    return tables


table_chain = category_chain | get_tables  # noqa
table_chain.invoke({"input": "What are all the genres of Alanis Morisette songs"})
```

```output
['Album', 'Artist', 'Genre', 'MediaType', 'Playlist', 'PlaylistTrack', 'Track']
```

Ahora que tenemos una cadena que puede generar las tablas relevantes para cualquier consulta, podemos combinarla con nuestro [create_sql_query_chain](https://api.python.langchain.com/en/latest/chains/langchain.chains.sql_database.query.create_sql_query_chain.html), que puede aceptar una lista de `table_names_to_use` para determinar qué esquemas de tabla se incluyen en la solicitud:

```python
from operator import itemgetter

from langchain.chains import create_sql_query_chain
from langchain_core.runnables import RunnablePassthrough

query_chain = create_sql_query_chain(llm, db)
# Convert "question" key to the "input" key expected by current table_chain.
table_chain = {"input": itemgetter("question")} | table_chain
# Set table_names_to_use using table_chain.
full_chain = RunnablePassthrough.assign(table_names_to_use=table_chain) | query_chain
```

```python
query = full_chain.invoke(
    {"question": "What are all the genres of Alanis Morisette songs"}
)
print(query)
```

```output
SELECT "Genre"."Name"
FROM "Genre"
JOIN "Track" ON "Genre"."GenreId" = "Track"."GenreId"
JOIN "Album" ON "Track"."AlbumId" = "Album"."AlbumId"
JOIN "Artist" ON "Album"."ArtistId" = "Artist"."ArtistId"
WHERE "Artist"."Name" = 'Alanis Morissette'
```

```python
db.run(query)
```

```output
"[('Rock',), ('Rock',), ('Rock',), ('Rock',), ('Rock',), ('Rock',), ('Rock',), ('Rock',), ('Rock',), ('Rock',), ('Rock',), ('Rock',), ('Rock',)]"
```

Podríamos reformular ligeramente nuestra pregunta para eliminar la redundancia en la respuesta

```python
query = full_chain.invoke(
    {"question": "What is the set of all unique genres of Alanis Morisette songs"}
)
print(query)
```

```output
SELECT DISTINCT g.Name
FROM Genre g
JOIN Track t ON g.GenreId = t.GenreId
JOIN Album a ON t.AlbumId = a.AlbumId
JOIN Artist ar ON a.ArtistId = ar.ArtistId
WHERE ar.Name = 'Alanis Morissette'
```

```python
db.run(query)
```

```output
"[('Rock',)]"
```

Puedes ver el [rastro de LangSmith](https://smith.langchain.com/public/20b8ef90-1dac-4754-90f0-6bc11203c50a/r) para esta ejecución aquí.

Hemos visto cómo incluir dinámicamente un subconjunto de esquemas de tabla en una solicitud dentro de una cadena. Otro enfoque posible para este problema es permitir que un Agente decida por sí mismo cuándo buscar tablas, dándole una Herramienta para hacerlo. Puedes ver un ejemplo de esto en la guía [SQL: Agentes](/docs/use_cases/sql/agents).

## Columnas de alta cardinalidad

Para filtrar columnas que contienen nombres propios como direcciones, nombres de canciones o artistas, primero debemos verificar la ortografía para filtrar los datos correctamente.

Una estrategia ingenua es crear un almacén de vectores con todos los nombres propios distintos que existen en la base de datos. Luego podemos consultar ese almacén de vectores en cada entrada del usuario e inyectar los nombres propios más relevantes en la solicitud.

Primero necesitamos los valores únicos para cada entidad que queremos, para lo cual definimos una función que analiza el resultado en una lista de elementos:

```python
import ast
import re


def query_as_list(db, query):
    res = db.run(query)
    res = [el for sub in ast.literal_eval(res) for el in sub if el]
    res = [re.sub(r"\b\d+\b", "", string).strip() for string in res]
    return res


proper_nouns = query_as_list(db, "SELECT Name FROM Artist")
proper_nouns += query_as_list(db, "SELECT Title FROM Album")
proper_nouns += query_as_list(db, "SELECT Name FROM Genre")
len(proper_nouns)
proper_nouns[:5]
```

```output
['AC/DC', 'Accept', 'Aerosmith', 'Alanis Morissette', 'Alice In Chains']
```

Ahora podemos incrustar y almacenar todos nuestros valores en una base de datos de vectores:

```python
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings

vector_db = FAISS.from_texts(proper_nouns, OpenAIEmbeddings())
retriever = vector_db.as_retriever(search_kwargs={"k": 15})
```

Y reunir una cadena de construcción de consultas que primero recupera los valores de la base de datos y los inserta en la solicitud:

```python
from operator import itemgetter

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough

system = """You are a SQLite expert. Given an input question, create a syntactically \
correct SQLite query to run. Unless otherwise specificed, do not return more than \
{top_k} rows.\n\nHere is the relevant table info: {table_info}\n\nHere is a non-exhaustive \
list of possible feature values. If filtering on a feature value make sure to check its spelling \
against this list first:\n\n{proper_nouns}"""

prompt = ChatPromptTemplate.from_messages([("system", system), ("human", "{input}")])

query_chain = create_sql_query_chain(llm, db, prompt=prompt)
retriever_chain = (
    itemgetter("question")
    | retriever
    | (lambda docs: "\n".join(doc.page_content for doc in docs))
)
chain = RunnablePassthrough.assign(proper_nouns=retriever_chain) | query_chain
```

Para probar nuestra cadena, veamos qué sucede cuando intentamos filtrar por "elenis moriset", una mala ortografía de Alanis Morissette, con y sin recuperación:

```python
# Without retrieval
query = query_chain.invoke(
    {"question": "What are all the genres of elenis moriset songs", "proper_nouns": ""}
)
print(query)
db.run(query)
```

```output
SELECT DISTINCT Genre.Name
FROM Genre
JOIN Track ON Genre.GenreId = Track.GenreId
JOIN Album ON Track.AlbumId = Album.AlbumId
JOIN Artist ON Album.ArtistId = Artist.ArtistId
WHERE Artist.Name = 'Elenis Moriset'
```

```output
''
```

```python
# With retrieval
query = chain.invoke({"question": "What are all the genres of elenis moriset songs"})
print(query)
db.run(query)
```

```output
SELECT DISTINCT Genre.Name
FROM Genre
JOIN Track ON Genre.GenreId = Track.GenreId
JOIN Album ON Track.AlbumId = Album.AlbumId
JOIN Artist ON Album.ArtistId = Artist.ArtistId
WHERE Artist.Name = 'Alanis Morissette'
```

```output
"[('Rock',)]"
```

Podemos ver que con la recuperación somos capaces de corregir la ortografía y obtener un resultado válido.

Otro enfoque posible para este problema es permitir que un Agente decida por sí mismo cuándo buscar nombres propios. Puedes ver un ejemplo de esto en la guía [SQL: Agentes](/docs/use_cases/sql/agents).
