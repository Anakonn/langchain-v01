---
sidebar_position: 2
translated: true
---

# Stratégies de requête

Dans ce guide, nous allons passer en revue les stratégies de requête pour améliorer la génération de requêtes SQL. Nous nous concentrerons principalement sur les méthodes permettant d'obtenir des informations spécifiques à la base de données dans votre requête.

## Configuration

Tout d'abord, obtenez les packages requis et définissez les variables d'environnement :

```python
%pip install --upgrade --quiet  langchain langchain-community langchain-experimental langchain-openai
```

Nous utilisons par défaut les modèles OpenAI dans ce guide, mais vous pouvez les remplacer par le fournisseur de modèle de votre choix.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()

# Uncomment the below to use LangSmith. Not required.
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
```

L'exemple ci-dessous utilisera une connexion SQLite avec la base de données Chinook. Suivez [ces étapes d'installation](https://database.guide/2-sample-databases-sqlite/) pour créer `Chinook.db` dans le même répertoire que ce notebook :

* Enregistrez [ce fichier](https://raw.githubusercontent.com/lerocha/chinook-database/master/ChinookDatabase/DataSources/Chinook_Sqlite.sql) sous le nom `Chinook_Sqlite.sql`
* Exécutez `sqlite3 Chinook.db`
* Exécutez `.read Chinook_Sqlite.sql`
* Testez `SELECT * FROM Artist LIMIT 10;`

Maintenant, `Chinhook.db` est dans notre répertoire et nous pouvons l'utiliser avec la classe `SQLDatabase` pilotée par SQLAlchemy :

```python
from langchain_community.utilities import SQLDatabase

db = SQLDatabase.from_uri("sqlite:///Chinook.db", sample_rows_in_table_info=3)
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

## Requête spécifique au dialecte

L'une des choses les plus simples que nous puissions faire est de rendre notre requête spécifique au dialecte SQL que nous utilisons. Lors de l'utilisation des fonctions intégrées [create_sql_query_chain](https://api.python.langchain.com/en/latest/chains/langchain.chains.sql_database.query.create_sql_query_chain.html) et [SQLDatabase](https://api.python.langchain.com/en/latest/utilities/langchain_community.utilities.sql_database.SQLDatabase.html), cela est géré pour vous pour l'un des dialectes suivants :

```python
from langchain.chains.sql_database.prompt import SQL_PROMPTS

list(SQL_PROMPTS)
```

```output
['crate',
 'duckdb',
 'googlesql',
 'mssql',
 'mysql',
 'mariadb',
 'oracle',
 'postgresql',
 'sqlite',
 'clickhouse',
 'prestodb']
```

Par exemple, avec notre base de données actuelle, nous pouvons voir que nous obtiendrons une requête spécifique à SQLite :

```python
from langchain.chains import create_sql_query_chain
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature="0")
chain = create_sql_query_chain(llm, db)
chain.get_prompts()[0].pretty_print()
```

```output
You are a SQLite expert. Given an input question, first create a syntactically correct SQLite query to run, then look at the results of the query and return the answer to the input question.
Unless the user specifies in the question a specific number of examples to obtain, query for at most 5 results using the LIMIT clause as per SQLite. You can order the results to return the most informative data in the database.
Never query for all columns from a table. You must query only the columns that are needed to answer the question. Wrap each column name in double quotes (") to denote them as delimited identifiers.
Pay attention to use only the column names you can see in the tables below. Be careful to not query for columns that do not exist. Also, pay attention to which column is in which table.
Pay attention to use date('now') function to get the current date, if the question involves "today".

Use the following format:

Question: Question here
SQLQuery: SQL Query to run
SQLResult: Result of the SQLQuery
Answer: Final answer here

Only use the following tables:
[33;1m[1;3m{table_info}[0m

Question: [33;1m[1;3m{input}[0m
```

## Définitions de table et lignes d'exemple

Dans pratiquement toute chaîne SQL, nous devrons fournir au modèle au moins une partie du schéma de la base de données. Sans cela, il ne pourra pas écrire de requêtes valides. Notre base de données dispose de quelques méthodes pratiques pour nous donner le contexte pertinent. Plus précisément, nous pouvons obtenir les noms des tables, leurs schémas et un échantillon de lignes de chaque table :

```python
context = db.get_context()
print(list(context))
print(context["table_info"])
```

```output
['table_info', 'table_names']

CREATE TABLE "Album" (
	"AlbumId" INTEGER NOT NULL,
	"Title" NVARCHAR(160) NOT NULL,
	"ArtistId" INTEGER NOT NULL,
	PRIMARY KEY ("AlbumId"),
	FOREIGN KEY("ArtistId") REFERENCES "Artist" ("ArtistId")
)

/*
3 rows from Album table:
AlbumId	Title	ArtistId
1	For Those About To Rock We Salute You	1
2	Balls to the Wall	2
3	Restless and Wild	2
*/


CREATE TABLE "Artist" (
	"ArtistId" INTEGER NOT NULL,
	"Name" NVARCHAR(120),
	PRIMARY KEY ("ArtistId")
)

/*
3 rows from Artist table:
ArtistId	Name
1	AC/DC
2	Accept
3	Aerosmith
*/


CREATE TABLE "Customer" (
	"CustomerId" INTEGER NOT NULL,
	"FirstName" NVARCHAR(40) NOT NULL,
	"LastName" NVARCHAR(20) NOT NULL,
	"Company" NVARCHAR(80),
	"Address" NVARCHAR(70),
	"City" NVARCHAR(40),
	"State" NVARCHAR(40),
	"Country" NVARCHAR(40),
	"PostalCode" NVARCHAR(10),
	"Phone" NVARCHAR(24),
	"Fax" NVARCHAR(24),
	"Email" NVARCHAR(60) NOT NULL,
	"SupportRepId" INTEGER,
	PRIMARY KEY ("CustomerId"),
	FOREIGN KEY("SupportRepId") REFERENCES "Employee" ("EmployeeId")
)

/*
3 rows from Customer table:
CustomerId	FirstName	LastName	Company	Address	City	State	Country	PostalCode	Phone	Fax	Email	SupportRepId
1	Luís	Gonçalves	Embraer - Empresa Brasileira de Aeronáutica S.A.	Av. Brigadeiro Faria Lima, 2170	São José dos Campos	SP	Brazil	12227-000	+55 (12) 3923-5555	+55 (12) 3923-5566	luisg@embraer.com.br	3
2	Leonie	Köhler	None	Theodor-Heuss-Straße 34	Stuttgart	None	Germany	70174	+49 0711 2842222	None	leonekohler@surfeu.de	5
3	François	Tremblay	None	1498 rue Bélanger	Montréal	QC	Canada	H2G 1A7	+1 (514) 721-4711	None	ftremblay@gmail.com	3
*/


CREATE TABLE "Employee" (
	"EmployeeId" INTEGER NOT NULL,
	"LastName" NVARCHAR(20) NOT NULL,
	"FirstName" NVARCHAR(20) NOT NULL,
	"Title" NVARCHAR(30),
	"ReportsTo" INTEGER,
	"BirthDate" DATETIME,
	"HireDate" DATETIME,
	"Address" NVARCHAR(70),
	"City" NVARCHAR(40),
	"State" NVARCHAR(40),
	"Country" NVARCHAR(40),
	"PostalCode" NVARCHAR(10),
	"Phone" NVARCHAR(24),
	"Fax" NVARCHAR(24),
	"Email" NVARCHAR(60),
	PRIMARY KEY ("EmployeeId"),
	FOREIGN KEY("ReportsTo") REFERENCES "Employee" ("EmployeeId")
)

/*
3 rows from Employee table:
EmployeeId	LastName	FirstName	Title	ReportsTo	BirthDate	HireDate	Address	City	State	Country	PostalCode	Phone	Fax	Email
1	Adams	Andrew	General Manager	None	1962-02-18 00:00:00	2002-08-14 00:00:00	11120 Jasper Ave NW	Edmonton	AB	Canada	T5K 2N1	+1 (780) 428-9482	+1 (780) 428-3457	andrew@chinookcorp.com
2	Edwards	Nancy	Sales Manager	1	1958-12-08 00:00:00	2002-05-01 00:00:00	825 8 Ave SW	Calgary	AB	Canada	T2P 2T3	+1 (403) 262-3443	+1 (403) 262-3322	nancy@chinookcorp.com
3	Peacock	Jane	Sales Support Agent	2	1973-08-29 00:00:00	2002-04-01 00:00:00	1111 6 Ave SW	Calgary	AB	Canada	T2P 5M5	+1 (403) 262-3443	+1 (403) 262-6712	jane@chinookcorp.com
*/


CREATE TABLE "Genre" (
	"GenreId" INTEGER NOT NULL,
	"Name" NVARCHAR(120),
	PRIMARY KEY ("GenreId")
)

/*
3 rows from Genre table:
GenreId	Name
1	Rock
2	Jazz
3	Metal
*/


CREATE TABLE "Invoice" (
	"InvoiceId" INTEGER NOT NULL,
	"CustomerId" INTEGER NOT NULL,
	"InvoiceDate" DATETIME NOT NULL,
	"BillingAddress" NVARCHAR(70),
	"BillingCity" NVARCHAR(40),
	"BillingState" NVARCHAR(40),
	"BillingCountry" NVARCHAR(40),
	"BillingPostalCode" NVARCHAR(10),
	"Total" NUMERIC(10, 2) NOT NULL,
	PRIMARY KEY ("InvoiceId"),
	FOREIGN KEY("CustomerId") REFERENCES "Customer" ("CustomerId")
)

/*
3 rows from Invoice table:
InvoiceId	CustomerId	InvoiceDate	BillingAddress	BillingCity	BillingState	BillingCountry	BillingPostalCode	Total
1	2	2009-01-01 00:00:00	Theodor-Heuss-Straße 34	Stuttgart	None	Germany	70174	1.98
2	4	2009-01-02 00:00:00	Ullevålsveien 14	Oslo	None	Norway	0171	3.96
3	8	2009-01-03 00:00:00	Grétrystraat 63	Brussels	None	Belgium	1000	5.94
*/


CREATE TABLE "InvoiceLine" (
	"InvoiceLineId" INTEGER NOT NULL,
	"InvoiceId" INTEGER NOT NULL,
	"TrackId" INTEGER NOT NULL,
	"UnitPrice" NUMERIC(10, 2) NOT NULL,
	"Quantity" INTEGER NOT NULL,
	PRIMARY KEY ("InvoiceLineId"),
	FOREIGN KEY("TrackId") REFERENCES "Track" ("TrackId"),
	FOREIGN KEY("InvoiceId") REFERENCES "Invoice" ("InvoiceId")
)

/*
3 rows from InvoiceLine table:
InvoiceLineId	InvoiceId	TrackId	UnitPrice	Quantity
1	1	2	0.99	1
2	1	4	0.99	1
3	2	6	0.99	1
*/


CREATE TABLE "MediaType" (
	"MediaTypeId" INTEGER NOT NULL,
	"Name" NVARCHAR(120),
	PRIMARY KEY ("MediaTypeId")
)

/*
3 rows from MediaType table:
MediaTypeId	Name
1	MPEG audio file
2	Protected AAC audio file
3	Protected MPEG-4 video file
*/


CREATE TABLE "Playlist" (
	"PlaylistId" INTEGER NOT NULL,
	"Name" NVARCHAR(120),
	PRIMARY KEY ("PlaylistId")
)

/*
3 rows from Playlist table:
PlaylistId	Name
1	Music
2	Movies
3	TV Shows
*/


CREATE TABLE "PlaylistTrack" (
	"PlaylistId" INTEGER NOT NULL,
	"TrackId" INTEGER NOT NULL,
	PRIMARY KEY ("PlaylistId", "TrackId"),
	FOREIGN KEY("TrackId") REFERENCES "Track" ("TrackId"),
	FOREIGN KEY("PlaylistId") REFERENCES "Playlist" ("PlaylistId")
)

/*
3 rows from PlaylistTrack table:
PlaylistId	TrackId
1	3402
1	3389
1	3390
*/


CREATE TABLE "Track" (
	"TrackId" INTEGER NOT NULL,
	"Name" NVARCHAR(200) NOT NULL,
	"AlbumId" INTEGER,
	"MediaTypeId" INTEGER NOT NULL,
	"GenreId" INTEGER,
	"Composer" NVARCHAR(220),
	"Milliseconds" INTEGER NOT NULL,
	"Bytes" INTEGER,
	"UnitPrice" NUMERIC(10, 2) NOT NULL,
	PRIMARY KEY ("TrackId"),
	FOREIGN KEY("MediaTypeId") REFERENCES "MediaType" ("MediaTypeId"),
	FOREIGN KEY("GenreId") REFERENCES "Genre" ("GenreId"),
	FOREIGN KEY("AlbumId") REFERENCES "Album" ("AlbumId")
)

/*
3 rows from Track table:
TrackId	Name	AlbumId	MediaTypeId	GenreId	Composer	Milliseconds	Bytes	UnitPrice
1	For Those About To Rock (We Salute You)	1	1	1	Angus Young, Malcolm Young, Brian Johnson	343719	11170334	0.99
2	Balls to the Wall	2	2	1	None	342562	5510424	0.99
3	Fast As a Shark	3	2	1	F. Baltes, S. Kaufman, U. Dirkscneider & W. Hoffman	230619	3990994	0.99
*/
```

Lorsque nous n'avons pas trop de tables, ou que celles-ci ne sont pas trop larges, nous pouvons simplement insérer l'intégralité de ces informations dans notre requête :

```python
prompt_with_context = chain.get_prompts()[0].partial(table_info=context["table_info"])
print(prompt_with_context.pretty_repr()[:1500])
```

```output
You are a SQLite expert. Given an input question, first create a syntactically correct SQLite query to run, then look at the results of the query and return the answer to the input question.
Unless the user specifies in the question a specific number of examples to obtain, query for at most 5 results using the LIMIT clause as per SQLite. You can order the results to return the most informative data in the database.
Never query for all columns from a table. You must query only the columns that are needed to answer the question. Wrap each column name in double quotes (") to denote them as delimited identifiers.
Pay attention to use only the column names you can see in the tables below. Be careful to not query for columns that do not exist. Also, pay attention to which column is in which table.
Pay attention to use date('now') function to get the current date, if the question involves "today".

Use the following format:

Question: Question here
SQLQuery: SQL Query to run
SQLResult: Result of the SQLQuery
Answer: Final answer here

Only use the following tables:

CREATE TABLE "Album" (
	"AlbumId" INTEGER NOT NULL,
	"Title" NVARCHAR(160) NOT NULL,
	"ArtistId" INTEGER NOT NULL,
	PRIMARY KEY ("AlbumId"),
	FOREIGN KEY("ArtistId") REFERENCES "Artist" ("ArtistId")
)

/*
3 rows from Album table:
AlbumId	Title	ArtistId
1	For Those About To Rock We Salute You	1
2	Balls to the Wall	2
3	Restless and Wild	2
*/


CREATE TABLE "Artist" (
	"ArtistId" INTEGER NOT NULL,
	"Name" NVARCHAR(120)
```

Lorsque nous avons des schémas de base de données trop volumineux pour tenir dans la fenêtre de contexte de notre modèle, nous devrons trouver des moyens d'insérer uniquement les définitions de table pertinentes dans la requête en fonction de l'entrée de l'utilisateur. Pour en savoir plus, consultez le guide [Nombreuses tables, tables larges, caractéristiques à haute cardinalité](/docs/use_cases/sql/large_db).

## Exemples few-shot

L'inclusion d'exemples de questions en langage naturel converties en requêtes SQL valides contre notre base de données dans la requête améliorera souvent les performances du modèle, en particulier pour les requêtes complexes.

Supposons que nous ayons les exemples suivants :

```python
examples = [
    {"input": "List all artists.", "query": "SELECT * FROM Artist;"},
    {
        "input": "Find all albums for the artist 'AC/DC'.",
        "query": "SELECT * FROM Album WHERE ArtistId = (SELECT ArtistId FROM Artist WHERE Name = 'AC/DC');",
    },
    {
        "input": "List all tracks in the 'Rock' genre.",
        "query": "SELECT * FROM Track WHERE GenreId = (SELECT GenreId FROM Genre WHERE Name = 'Rock');",
    },
    {
        "input": "Find the total duration of all tracks.",
        "query": "SELECT SUM(Milliseconds) FROM Track;",
    },
    {
        "input": "List all customers from Canada.",
        "query": "SELECT * FROM Customer WHERE Country = 'Canada';",
    },
    {
        "input": "How many tracks are there in the album with ID 5?",
        "query": "SELECT COUNT(*) FROM Track WHERE AlbumId = 5;",
    },
    {
        "input": "Find the total number of invoices.",
        "query": "SELECT COUNT(*) FROM Invoice;",
    },
    {
        "input": "List all tracks that are longer than 5 minutes.",
        "query": "SELECT * FROM Track WHERE Milliseconds > 300000;",
    },
    {
        "input": "Who are the top 5 customers by total purchase?",
        "query": "SELECT CustomerId, SUM(Total) AS TotalPurchase FROM Invoice GROUP BY CustomerId ORDER BY TotalPurchase DESC LIMIT 5;",
    },
    {
        "input": "Which albums are from the year 2000?",
        "query": "SELECT * FROM Album WHERE strftime('%Y', ReleaseDate) = '2000';",
    },
    {
        "input": "How many employees are there",
        "query": 'SELECT COUNT(*) FROM "Employee"',
    },
]
```

Nous pouvons créer une requête few-shot avec eux comme suit :

```python
from langchain_core.prompts import FewShotPromptTemplate, PromptTemplate

example_prompt = PromptTemplate.from_template("User input: {input}\nSQL query: {query}")
prompt = FewShotPromptTemplate(
    examples=examples[:5],
    example_prompt=example_prompt,
    prefix="You are a SQLite expert. Given an input question, create a syntactically correct SQLite query to run. Unless otherwise specificed, do not return more than {top_k} rows.\n\nHere is the relevant table info: {table_info}\n\nBelow are a number of examples of questions and their corresponding SQL queries.",
    suffix="User input: {input}\nSQL query: ",
    input_variables=["input", "top_k", "table_info"],
)
```

```python
print(prompt.format(input="How many artists are there?", top_k=3, table_info="foo"))
```

```output
You are a SQLite expert. Given an input question, create a syntactically correct SQLite query to run. Unless otherwise specificed, do not return more than 3 rows.

Here is the relevant table info: foo

Below are a number of examples of questions and their corresponding SQL queries.

User input: List all artists.
SQL query: SELECT * FROM Artist;

User input: Find all albums for the artist 'AC/DC'.
SQL query: SELECT * FROM Album WHERE ArtistId = (SELECT ArtistId FROM Artist WHERE Name = 'AC/DC');

User input: List all tracks in the 'Rock' genre.
SQL query: SELECT * FROM Track WHERE GenreId = (SELECT GenreId FROM Genre WHERE Name = 'Rock');

User input: Find the total duration of all tracks.
SQL query: SELECT SUM(Milliseconds) FROM Track;

User input: List all customers from Canada.
SQL query: SELECT * FROM Customer WHERE Country = 'Canada';

User input: How many artists are there?
SQL query:
```

## Exemples few-shot dynamiques

Si nous avons suffisamment d'exemples, nous voudrons peut-être n'inclure que les plus pertinents dans la requête, soit parce qu'ils ne tiennent pas dans la fenêtre de contexte du modèle, soit parce que la longue queue d'exemples distrait le modèle. Et plus précisément, étant donné une entrée quelconque, nous voulons inclure les exemples les plus pertinents pour cette entrée.

Nous pouvons faire cela en utilisant un ExampleSelector. Dans ce cas, nous utiliserons un [SemanticSimilarityExampleSelector](https://api.python.langchain.com/en/latest/example_selectors/langchain_core.example_selectors.semantic_similarity.SemanticSimilarityExampleSelector.html), qui stockera les exemples dans la base de données vectorielle de notre choix. Au moment de l'exécution, il effectuera une recherche de similarité entre l'entrée et nos exemples, et renverra les plus similaires sur le plan sémantique :

```python
from langchain_community.vectorstores import FAISS
from langchain_core.example_selectors import SemanticSimilarityExampleSelector
from langchain_openai import OpenAIEmbeddings

example_selector = SemanticSimilarityExampleSelector.from_examples(
    examples,
    OpenAIEmbeddings(),
    FAISS,
    k=5,
    input_keys=["input"],
)
```

```python
example_selector.select_examples({"input": "how many artists are there?"})
```

```output
[{'input': 'List all artists.', 'query': 'SELECT * FROM Artist;'},
 {'input': 'How many employees are there',
  'query': 'SELECT COUNT(*) FROM "Employee"'},
 {'input': 'How many tracks are there in the album with ID 5?',
  'query': 'SELECT COUNT(*) FROM Track WHERE AlbumId = 5;'},
 {'input': 'Which albums are from the year 2000?',
  'query': "SELECT * FROM Album WHERE strftime('%Y', ReleaseDate) = '2000';"},
 {'input': "List all tracks in the 'Rock' genre.",
  'query': "SELECT * FROM Track WHERE GenreId = (SELECT GenreId FROM Genre WHERE Name = 'Rock');"}]
```

Pour l'utiliser, nous pouvons passer directement l'ExampleSelector dans notre FewShotPromptTemplate :

```python
prompt = FewShotPromptTemplate(
    example_selector=example_selector,
    example_prompt=example_prompt,
    prefix="You are a SQLite expert. Given an input question, create a syntactically correct SQLite query to run. Unless otherwise specificed, do not return more than {top_k} rows.\n\nHere is the relevant table info: {table_info}\n\nBelow are a number of examples of questions and their corresponding SQL queries.",
    suffix="User input: {input}\nSQL query: ",
    input_variables=["input", "top_k", "table_info"],
)
```

```python
print(prompt.format(input="how many artists are there?", top_k=3, table_info="foo"))
```

```output
You are a SQLite expert. Given an input question, create a syntactically correct SQLite query to run. Unless otherwise specificed, do not return more than 3 rows.

Here is the relevant table info: foo

Below are a number of examples of questions and their corresponding SQL queries.

User input: List all artists.
SQL query: SELECT * FROM Artist;

User input: How many employees are there
SQL query: SELECT COUNT(*) FROM "Employee"

User input: How many tracks are there in the album with ID 5?
SQL query: SELECT COUNT(*) FROM Track WHERE AlbumId = 5;

User input: Which albums are from the year 2000?
SQL query: SELECT * FROM Album WHERE strftime('%Y', ReleaseDate) = '2000';

User input: List all tracks in the 'Rock' genre.
SQL query: SELECT * FROM Track WHERE GenreId = (SELECT GenreId FROM Genre WHERE Name = 'Rock');

User input: how many artists are there?
SQL query:
```

```python
chain = create_sql_query_chain(llm, db, prompt)
chain.invoke({"question": "how many artists are there?"})
```

```output
'SELECT COUNT(*) FROM Artist;'
```
