---
translated: true
---

# Base de données SQL

:::note
L'utilitaire d'adaptateur `SQLDatabase` est un wrapper autour d'une connexion à la base de données.

Pour communiquer avec les bases de données SQL, il utilise l'API Core de [SQLAlchemy].
:::

Ce notebook montre comment utiliser l'utilitaire pour accéder à une base de données SQLite.
Il utilise l'exemple de la [base de données Chinook] et démontre ces fonctionnalités :

- Requête à l'aide de SQL
- Requête à l'aide de SQLAlchemy selectable
- Modes de récupération `cursor`, `all` et `one`
- Liaison des paramètres de requête

[Base de données Chinook] : https://github.com/lerocha/chinook-database
[SQLAlchemy] : https://www.sqlalchemy.org/

Vous pouvez utiliser le décorateur `Tool` ou `@tool` pour créer un outil à partir de cet utilitaire.

::: {.callout-caution}
Lors de la création d'un outil à partir de l'utilitaire SQLDatbase et de sa combinaison avec un LLM ou de son exposition à un utilisateur final,
n'oubliez pas de suivre de bonnes pratiques de sécurité.

Voir les informations de sécurité : https://python.langchain.com/docs/security
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

## Initialiser la base de données

```python
from pprint import pprint

import sqlalchemy as sa
from langchain_community.utilities import SQLDatabase

db = SQLDatabase.from_uri("sqlite:///Chinook.db")
```

## Requête en mode curseur

Le mode de récupération `cursor` renvoie les résultats sous forme d'instance `CursorResult` de SQLAlchemy.

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

## Requête en tant que charge utile de chaîne

Les modes de récupération `all` et `one` renvoient les résultats sous forme de chaîne de caractères.

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

## Requête avec paramètres

Afin de lier les paramètres de requête, utilisez l'argument facultatif `parameters`.

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

## Requête avec SQLAlchemy selectable

Outre les instructions SQL en texte brut, l'adaptateur accepte également les selectables SQLAlchemy.

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

## Requête avec options d'exécution

Il est possible d'augmenter l'invocation de l'instruction avec des options d'exécution personnalisées.
Par exemple, lors de l'application d'une traduction de nom de schéma, les instructions suivantes échoueront,
car elles essaieront d'atteindre une table qui n'existe pas.

```python
query = sa.select(artist).where(artist.c.Name.like("p%"))
db.run(query, fetch="cursor", execution_options={"schema_translate_map": {None: "bar"}})
```
