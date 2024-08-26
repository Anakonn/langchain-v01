---
translated: true
---

# Base de datos SQL

:::note
El adaptador de utilidad `SQLDatabase` es un contenedor alrededor de una conexión a la base de datos.

Para comunicarse con bases de datos SQL, utiliza la API Core de [SQLAlchemy].
:::

Este cuaderno muestra cómo utilizar la utilidad para acceder a una base de datos SQLite.
Utiliza el ejemplo de la [Base de datos Chinook] y demuestra estas características:

- Consulta mediante SQL
- Consulta mediante seleccionable de SQLAlchemy
- Modos de recuperación `cursor`, `all` y `one`
- Enlazar parámetros de consulta

[Base de datos Chinook]: https://github.com/lerocha/chinook-database
[SQLAlchemy]: https://www.sqlalchemy.org/

Puedes usar el decorador `Tool` o `@tool` para crear una herramienta a partir de esta utilidad.

::: {.callout-caution}
Si creas una herramienta a partir de la utilidad SQLDatbase y la combinas con un LLM o la expones a un usuario final,
recuerda seguir las buenas prácticas de seguridad.

Consulta la información de seguridad: https://python.langchain.com/docs/security
:::

```python
!wget 'https://github.com/lerocha/chinook-database/releases/download/v1.4.2/Chinook_Sqlite.sql'
```

```python
!sqlite3 -bail -cmd '.read Chinook_Sqlite.sql' -cmd 'SELECT * FROM Artist LIMIT 12;' -cmd '.quit'
```

```output
1|AC/DC
2|Accept
3|Aerosmith
4|Alanis Morissette
5|Alice In Chains
6|Antônio Carlos Jobim
7|Apocalyptica
8|Audioslave
9|BackBeat
10|Billy Cobham
11|Black Label Society
12|Black Sabbath
```

```python
!sqlite3 -bail -cmd '.read Chinook_Sqlite.sql' -cmd '.save Chinook.db' -cmd '.quit'
```

## Inicializar base de datos

```python
from pprint import pprint

import sqlalchemy as sa
from langchain_community.utilities import SQLDatabase

db = SQLDatabase.from_uri("sqlite:///Chinook.db")
```

## Consulta como cursor

El modo de recuperación `cursor` devuelve los resultados como una instancia de
`CursorResult` de SQLAlchemy.

```python
result = db.run("SELECT * FROM Artist LIMIT 12;", fetch="cursor")
print(type(result))
pprint(list(result.mappings()))
```

```output
<class 'sqlalchemy.engine.cursor.CursorResult'>
[{'ArtistId': 1, 'Name': 'AC/DC'},
 {'ArtistId': 2, 'Name': 'Accept'},
 {'ArtistId': 3, 'Name': 'Aerosmith'},
 {'ArtistId': 4, 'Name': 'Alanis Morissette'},
 {'ArtistId': 5, 'Name': 'Alice In Chains'},
 {'ArtistId': 6, 'Name': 'Antônio Carlos Jobim'},
 {'ArtistId': 7, 'Name': 'Apocalyptica'},
 {'ArtistId': 8, 'Name': 'Audioslave'},
 {'ArtistId': 9, 'Name': 'BackBeat'},
 {'ArtistId': 10, 'Name': 'Billy Cobham'},
 {'ArtistId': 11, 'Name': 'Black Label Society'},
 {'ArtistId': 12, 'Name': 'Black Sabbath'}]
```

## Consulta como carga de cadena

Los modos de recuperación `all` y `one` devuelven los resultados en formato de cadena.

```python
result = db.run("SELECT * FROM Artist LIMIT 12;", fetch="all")
print(type(result))
print(result)
```

```output
<class 'str'>
[(1, 'AC/DC'), (2, 'Accept'), (3, 'Aerosmith'), (4, 'Alanis Morissette'), (5, 'Alice In Chains'), (6, 'Antônio Carlos Jobim'), (7, 'Apocalyptica'), (8, 'Audioslave'), (9, 'BackBeat'), (10, 'Billy Cobham'), (11, 'Black Label Society'), (12, 'Black Sabbath')]
```

```python
result = db.run("SELECT * FROM Artist LIMIT 12;", fetch="one")
print(type(result))
print(result)
```

```output
<class 'str'>
[(1, 'AC/DC')]
```

## Consulta con parámetros

Para enlazar parámetros de consulta, utiliza el argumento opcional `parameters`.

```python
result = db.run(
    "SELECT * FROM Artist WHERE Name LIKE :search;",
    parameters={"search": "p%"},
    fetch="cursor",
)
pprint(list(result.mappings()))
```

```output
[{'ArtistId': 35, 'Name': 'Pedro Luís & A Parede'},
 {'ArtistId': 115, 'Name': 'Page & Plant'},
 {'ArtistId': 116, 'Name': 'Passengers'},
 {'ArtistId': 117, 'Name': "Paul D'Ianno"},
 {'ArtistId': 118, 'Name': 'Pearl Jam'},
 {'ArtistId': 119, 'Name': 'Peter Tosh'},
 {'ArtistId': 120, 'Name': 'Pink Floyd'},
 {'ArtistId': 121, 'Name': 'Planet Hemp'},
 {'ArtistId': 186, 'Name': 'Pedro Luís E A Parede'},
 {'ArtistId': 256, 'Name': 'Philharmonia Orchestra & Sir Neville Marriner'},
 {'ArtistId': 275, 'Name': 'Philip Glass Ensemble'}]
```

## Consulta con seleccionable de SQLAlchemy

Además de las declaraciones SQL en texto plano, el adaptador también acepta selectables de SQLAlchemy.

```python
# In order to build a selectable on SA's Core API, you need a table definition.
metadata = sa.MetaData()
artist = sa.Table(
    "Artist",
    metadata,
    sa.Column("ArtistId", sa.INTEGER, primary_key=True),
    sa.Column("Name", sa.TEXT),
)

# Build a selectable with the same semantics of the recent query.
query = sa.select(artist).where(artist.c.Name.like("p%"))
result = db.run(query, fetch="cursor")
pprint(list(result.mappings()))
```

```output
[{'ArtistId': 35, 'Name': 'Pedro Luís & A Parede'},
 {'ArtistId': 115, 'Name': 'Page & Plant'},
 {'ArtistId': 116, 'Name': 'Passengers'},
 {'ArtistId': 117, 'Name': "Paul D'Ianno"},
 {'ArtistId': 118, 'Name': 'Pearl Jam'},
 {'ArtistId': 119, 'Name': 'Peter Tosh'},
 {'ArtistId': 120, 'Name': 'Pink Floyd'},
 {'ArtistId': 121, 'Name': 'Planet Hemp'},
 {'ArtistId': 186, 'Name': 'Pedro Luís E A Parede'},
 {'ArtistId': 256, 'Name': 'Philharmonia Orchestra & Sir Neville Marriner'},
 {'ArtistId': 275, 'Name': 'Philip Glass Ensemble'}]
```

## Consulta con opciones de ejecución

Es posible aumentar la invocación de la declaración con opciones de ejecución personalizadas.
Por ejemplo, al aplicar una traducción de nombre de esquema, las declaraciones posteriores fallarán,
porque intentarán acceder a una tabla que no existe.

```python
query = sa.select(artist).where(artist.c.Name.like("p%"))
db.run(query, fetch="cursor", execution_options={"schema_translate_map": {None: "bar"}})
```
