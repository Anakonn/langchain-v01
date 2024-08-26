---
sidebar_position: 4
translated: true
---

# Grandes bases de données

Afin d'écrire des requêtes valides sur une base de données, nous devons fournir au modèle les noms des tables, les schémas des tables et les valeurs des fonctionnalités pour qu'il puisse interroger. Lorsqu'il y a de nombreuses tables, colonnes et/ou colonnes à haute cardinalité, il devient impossible pour nous de décharger toutes les informations sur notre base de données dans chaque invite. Au lieu de cela, nous devons trouver des moyens d'insérer dynamiquement dans l'invite uniquement les informations les plus pertinentes. Examinons quelques techniques pour y parvenir.

## Configuration

Tout d'abord, obtenez les packages requis et définissez les variables d'environnement :

```python
%pip install --upgrade --quiet  langchain langchain-community langchain-openai
```

```output

[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m A new release of pip is available: [0m[31;49m23.2.1[0m[39;49m -> [0m[32;49m23.3.2[0m
[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m To update, run: [0m[32;49mpip install --upgrade pip[0m
Note: you may need to restart the kernel to use updated packages.
```

Nous utilisons par défaut les modèles OpenAI dans ce guide, mais vous pouvez les remplacer par le fournisseur de modèle de votre choix.

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

L'exemple ci-dessous utilisera une connexion SQLite avec la base de données Chinook. Suivez [ces étapes d'installation](https://database.guide/2-sample-databases-sqlite/) pour créer `Chinook.db` dans le même répertoire que ce notebook :

* Enregistrez [ce fichier](https://raw.githubusercontent.com/lerocha/chinook-database/master/ChinookDatabase/DataSources/Chinook_Sqlite.sql) sous le nom `Chinook_Sqlite.sql`
* Exécutez `sqlite3 Chinook.db`
* Exécutez `.read Chinook_Sqlite.sql`
* Testez `SELECT * FROM Artist LIMIT 10;`

Maintenant, `Chinhook.db` est dans notre répertoire et nous pouvons l'utiliser avec la classe [SQLDatabase](https://api.python.langchain.com/en/latest/utilities/langchain_community.utilities.sql_database.SQLDatabase.html) pilotée par SQLAlchemy :

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

## Nombreuses tables

L'un des principaux éléments d'information que nous devons inclure dans notre invite est les schémas des tables pertinentes. Lorsque nous avons de très nombreuses tables, nous ne pouvons pas inclure tous les schémas dans une seule invite. Ce que nous pouvons faire dans ces cas-là est d'abord d'extraire les noms des tables liées à l'entrée de l'utilisateur, puis d'inclure uniquement leurs schémas.

Un moyen facile et fiable de faire cela est d'utiliser les appels de fonction OpenAI et les modèles Pydantic. LangChain dispose d'une chaîne [create_extraction_chain_pydantic](https://api.python.langchain.com/en/latest/chains/langchain.chains.openai_tools.extraction.create_extraction_chain_pydantic.html) intégrée qui nous permet de faire exactement cela :

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

Cela fonctionne assez bien ! Sauf que, comme nous le verrons ci-dessous, nous avons en fait besoin de quelques autres tables également. Ce serait assez difficile pour le modèle de le savoir en se basant uniquement sur la question de l'utilisateur. Dans ce cas, nous pourrions penser à simplifier le travail de notre modèle en regroupant les tables ensemble. Nous allons simplement demander au modèle de choisir entre les catégories "Musique" et "Entreprise", et nous nous occuperons ensuite de sélectionner toutes les tables pertinentes :

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

Maintenant que nous avons une chaîne qui peut produire les tables pertinentes pour n'importe quelle requête, nous pouvons la combiner avec notre [create_sql_query_chain](https://api.python.langchain.com/en/latest/chains/langchain.chains.sql_database.query.create_sql_query_chain.html), qui peut accepter une liste de `table_names_to_use` pour déterminer quels schémas de table sont inclus dans l'invite :

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

Nous pourrions reformuler légèrement notre question pour supprimer la redondance dans la réponse

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

Vous pouvez voir la [trace LangSmith](https://smith.langchain.com/public/20b8ef90-1dac-4754-90f0-6bc11203c50a/r) pour cette exécution ici.

Nous avons vu comment inclure de manière dynamique un sous-ensemble de schémas de table dans une invite dans une chaîne. Une autre approche possible à ce problème est de laisser un agent décider lui-même quand rechercher des tables en lui donnant un outil pour le faire. Vous pouvez voir un exemple de cela dans le guide [SQL : Agents](/docs/use_cases/sql/agents).

## Colonnes à haute cardinalité

Afin de filtrer les colonnes contenant des noms propres tels que des adresses, des noms de chansons ou des artistes, nous devons d'abord vérifier l'orthographe afin de filtrer correctement les données.

Une stratégie naïve consiste à créer un magasin de vecteurs avec toutes les valeurs distinctes de noms propres qui existent dans la base de données. Nous pouvons ensuite interroger ce magasin de vecteurs à chaque entrée de l'utilisateur et injecter les noms propres les plus pertinents dans l'invite.

Nous avons d'abord besoin des valeurs uniques pour chaque entité que nous voulons, pour lesquelles nous définissons une fonction qui analyse le résultat en une liste d'éléments :

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

Maintenant, nous pouvons incorporer et stocker toutes nos valeurs dans une base de données de vecteurs :

```python
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings

vector_db = FAISS.from_texts(proper_nouns, OpenAIEmbeddings())
retriever = vector_db.as_retriever(search_kwargs={"k": 15})
```

Et rassembler une chaîne de construction de requête qui récupère d'abord les valeurs de la base de données et les insère dans l'invite :

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

Pour essayer notre chaîne, voyons ce qui se passe lorsque nous essayons de filtrer sur "elenis moriset", une faute d'orthographe d'Alanis Morissette, avec et sans récupération :

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

Nous pouvons voir qu'avec la récupération, nous sommes en mesure de corriger l'orthographe et d'obtenir un résultat valide.

Une autre approche possible à ce problème est de laisser un agent décider lui-même quand rechercher des noms propres. Vous pouvez voir un exemple de cela dans le guide [SQL : Agents](/docs/use_cases/sql/agents).
