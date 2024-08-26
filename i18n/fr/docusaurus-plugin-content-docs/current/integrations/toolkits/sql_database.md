---
translated: true
---

# Base de données SQL

Ce cahier de notes présente un agent conçu pour interagir avec des bases de données `SQL`.

Il est conçu pour répondre à des questions plus générales sur une base de données, ainsi que pour se remettre des erreurs.

Notez que, comme cet agent est en développement actif, toutes les réponses peuvent ne pas être correctes.

De plus, il n'est pas garanti que l'agent n'effectuera pas d'instructions DML sur votre base de données selon certaines questions.

Soyez prudent lorsque vous l'exécutez sur des données sensibles !

Cela utilise la base de données d'exemple `Chinook`.

Pour la configurer, suivez [ces instructions](https://database.guide/2-sample-databases-sqlite/) et placez le fichier .db dans un dossier de cahiers de notes à la racine de ce référentiel.

```python
%pip install --upgrade --quiet  langchain langchain-community langchain-experimental
```

```output
[33mWARNING: There was an error checking the latest version of pip.[0m[33m
[0mNote: you may need to restart the kernel to use updated packages.
```

## Initialiser notre base de données

```python
from langchain_community.utilities.sql_database import SQLDatabase

db = SQLDatabase.from_uri("sqlite:///Chinook.db")
```

## Démarrage rapide

Suivant les [documents d'utilisation SQL](/docs/use_cases/sql/agents), nous pouvons utiliser l'assistant `create_sql_agent`.

```python
from langchain_community.agent_toolkits import create_sql_agent
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
agent_executor = create_sql_agent(llm, db=db, agent_type="openai-tools", verbose=True)
```

```python
agent_executor.invoke(
    "List the total sales per country. Which country's customers spent the most?"
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `sql_db_list_tables` with `{}`


[0m[38;5;200m[1;3mAlbum, Artist, Customer, Employee, Genre, Invoice, InvoiceLine, MediaType, Playlist, PlaylistTrack, Track[0m[32;1m[1;3m
Invoking: `sql_db_schema` with `Invoice,Customer`


[0m[33;1m[1;3m
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
*/[0m[32;1m[1;3m
Invoking: `sql_db_query` with `SELECT c.Country, SUM(i.Total) AS TotalSales FROM Invoice i JOIN Customer c ON i.CustomerId = c.CustomerId GROUP BY c.Country ORDER BY TotalSales DESC LIMIT 10;`
responded: To list the total sales per country, I can query the "Invoice" and "Customer" tables. I will join these tables on the "CustomerId" column and group the results by the "BillingCountry" column. Then, I will calculate the sum of the "Total" column to get the total sales per country. Finally, I will order the results in descending order of the total sales.

Here is the SQL query:

\```sql
SELECT c.Country, SUM(i.Total) AS TotalSales
FROM Invoice i
JOIN Customer c ON i.CustomerId = c.CustomerId
GROUP BY c.Country
ORDER BY TotalSales DESC
LIMIT 10;
\```

Now, I will execute this query to get the total sales per country.

[0m[36;1m[1;3m[('USA', 523.0600000000003), ('Canada', 303.9599999999999), ('France', 195.09999999999994), ('Brazil', 190.09999999999997), ('Germany', 156.48), ('United Kingdom', 112.85999999999999), ('Czech Republic', 90.24000000000001), ('Portugal', 77.23999999999998), ('India', 75.25999999999999), ('Chile', 46.62)][0m[32;1m[1;3mThe total sales per country are as follows:

1. USA: $523.06
2. Canada: $303.96
3. France: $195.10
4. Brazil: $190.10
5. Germany: $156.48
6. United Kingdom: $112.86
7. Czech Republic: $90.24
8. Portugal: $77.24
9. India: $75.26
10. Chile: $46.62

To answer the second question, the country whose customers spent the most is the USA, with a total sales of $523.06.[0m

[1m> Finished chain.[0m

```

```output
{'input': "List the total sales per country. Which country's customers spent the most?",
 'output': 'The total sales per country are as follows:\n\n1. USA: $523.06\n2. Canada: $303.96\n3. France: $195.10\n4. Brazil: $190.10\n5. Germany: $156.48\n6. United Kingdom: $112.86\n7. Czech Republic: $90.24\n8. Portugal: $77.24\n9. India: $75.26\n10. Chile: $46.62\n\nTo answer the second question, the country whose customers spent the most is the USA, with a total sales of $523.06.'}
```

## Boîte à outils

Nous pouvons voir ce qui se passe sous le capot avec l'assistant `create_sql_agent` ci-dessus.

Nous pouvons également souligner comment la boîte à outils est utilisée avec l'agent spécifiquement.

```python
from langchain_community.agent_toolkits import SQLDatabaseToolkit
from langchain_openai import ChatOpenAI

toolkit = SQLDatabaseToolkit(db=db, llm=ChatOpenAI(temperature=0))
context = toolkit.get_context()
tools = toolkit.get_tools()
```

### Utiliser SQLDatabaseToolkit dans un agent

```python
from langchain_community.agent_toolkits.sql.prompt import SQL_FUNCTIONS_SUFFIX
from langchain_core.messages import AIMessage, SystemMessage
from langchain_core.prompts.chat import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    MessagesPlaceholder,
)

messages = [
    HumanMessagePromptTemplate.from_template("{input}"),
    AIMessage(content=SQL_FUNCTIONS_SUFFIX),
    MessagesPlaceholder(variable_name="agent_scratchpad"),
]

prompt = ChatPromptTemplate.from_messages(messages)
prompt = prompt.partial(**context)
```

```python
from langchain.agents import create_openai_tools_agent
from langchain.agents.agent import AgentExecutor

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)

agent = create_openai_tools_agent(llm, tools, prompt)

agent_executor = AgentExecutor(
    agent=agent,
    tools=toolkit.get_tools(),
    verbose=True,
)
```

## Avertissement ⚠️

La chaîne de requêtes peut générer des requêtes d'insertion/mise à jour/suppression. Lorsque ce n'est pas attendu, utilisez une invite personnalisée ou créez un utilisateur SQL sans autorisation d'écriture.

L'utilisateur final pourrait surcharger votre base de données SQL en posant une simple question comme "exécuter la plus grosse requête possible". La requête générée pourrait ressembler à :

```sql
SELECT * FROM "public"."users"
    JOIN "public"."user_permissions" ON "public"."users".id = "public"."user_permissions".user_id
    JOIN "public"."projects" ON "public"."users".id = "public"."projects".user_id
    JOIN "public"."events" ON "public"."projects".id = "public"."events".project_id;
```

Pour une base de données SQL transactionnelle, si l'une des tables ci-dessus contient des millions de lignes, la requête pourrait causer des problèmes aux autres applications utilisant la même base de données.

La plupart des bases de données orientées datawarehouse prennent en charge les quotas au niveau de l'utilisateur, pour limiter l'utilisation des ressources.

## Exemple : décrire une table

```python
agent_executor.invoke({"input": "Describe the schema of the playlist table"})
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `sql_db_list_tables` with ``


[0m[38;5;200m[1;3mAlbum, Artist, Customer, Employee, Genre, Invoice, InvoiceLine, MediaType, Playlist, PlaylistTrack, Track[0m[32;1m[1;3m
Invoking: `sql_db_schema` with `Playlist`


[0m[33;1m[1;3m
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
*/[0m[32;1m[1;3mThe schema of the "Playlist" table is as follows:

- PlaylistId: INTEGER (Primary Key)
- Name: NVARCHAR(120)

Here are three sample rows from the "Playlist" table:

| PlaylistId | Name      |
|------------|-----------|
| 1          | Music     |
| 2          | Movies    |
| 3          | TV Shows  |[0m

[1m> Finished chain.[0m
```

```output
{'input': 'Describe the schema of the playlist table',
 'output': 'The schema of the "Playlist" table is as follows:\n\n- PlaylistId: INTEGER (Primary Key)\n- Name: NVARCHAR(120)\n\nHere are three sample rows from the "Playlist" table:\n\n| PlaylistId | Name      |\n|------------|-----------|\n| 1          | Music     |\n| 2          | Movies    |\n| 3          | TV Shows  |'}
```

## Exemple : décrire une table, se remettre d'une erreur

Dans cet exemple, l'agent essaie de rechercher une table, `playlists`, qui n'existe pas, mais trouve le meilleur résultat suivant

```python
agent_executor.invoke({"input": "Describe the playlists table"})
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `sql_db_list_tables` with ``


[0m[38;5;200m[1;3mAlbum, Artist, Customer, Employee, Genre, Invoice, InvoiceLine, MediaType, Playlist, PlaylistTrack, Track[0m[32;1m[1;3m
Invoking: `sql_db_schema` with `Playlist`


[0m[33;1m[1;3m
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
*/[0m[32;1m[1;3mThe "Playlists" table has the following schema:

- PlaylistId: INTEGER (Primary Key)
- Name: NVARCHAR(120)

Here are three sample rows from the "Playlists" table:

| PlaylistId | Name      |
|------------|-----------|
| 1          | Music     |
| 2          | Movies    |
| 3          | TV Shows  |[0m

[1m> Finished chain.[0m
```

```output
{'input': 'Describe the playlists table',
 'output': 'The "Playlists" table has the following schema:\n\n- PlaylistId: INTEGER (Primary Key)\n- Name: NVARCHAR(120)\n\nHere are three sample rows from the "Playlists" table:\n\n| PlaylistId | Name      |\n|------------|-----------|\n| 1          | Music     |\n| 2          | Movies    |\n| 3          | TV Shows  |'}
```

## Exemple : exécuter des requêtes

```python
agent_executor.invoke(
    {
        "input": "List the total sales per country. Which country's customers spent the most?"
    }
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `sql_db_list_tables` with ``


[0m[38;5;200m[1;3mAlbum, Artist, Customer, Employee, Genre, Invoice, InvoiceLine, MediaType, Playlist, PlaylistTrack, Track[0m[32;1m[1;3m
Invoking: `sql_db_schema` with `Invoice, Customer`


[0m[33;1m[1;3m
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
*/[0m[32;1m[1;3m
Invoking: `sql_db_query` with `SELECT c.Country, SUM(i.Total) AS TotalSales FROM Customer c JOIN Invoice i ON c.CustomerId = i.CustomerId GROUP BY c.Country ORDER BY TotalSales DESC LIMIT 1;`
responded: Based on the schema of the `Customer` and `Invoice` tables, we can join these two tables on the `CustomerId` column to get the total sales per customer. Then, we can group the results by the `Country` column to get the total sales per country. Finally, we can sort the results in descending order of total sales and select the country with the highest total sales.

Here is the SQL query to achieve this:

\```sql
SELECT c.Country, SUM(i.Total) AS TotalSales
FROM Customer c
JOIN Invoice i ON c.CustomerId = i.CustomerId
GROUP BY c.Country
ORDER BY TotalSales DESC
LIMIT 1;
\```

Let me execute this query to find out which country's customers spent the most.

[0m[36;1m[1;3m[('USA', 523.0600000000003)][0m[32;1m[1;3mThe country whose customers spent the most is the USA, with a total sales amount of $523.06.[0m

[1m> Finished chain.[0m

```

```output
{'input': "List the total sales per country. Which country's customers spent the most?",
 'output': 'The country whose customers spent the most is the USA, with a total sales amount of $523.06.'}
```

## Se remettre d'une erreur

Dans cet exemple, l'agent est capable de se remettre d'une erreur après avoir initialement essayé d'accéder à un attribut (`Track.ArtistId`) qui n'existe pas.

```python
agent_executor.invoke({"input": "Who are the top 3 best selling artists?"})
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `sql_db_list_tables` with ``


[0m[38;5;200m[1;3mAlbum, Artist, Customer, Employee, Genre, Invoice, InvoiceLine, MediaType, Playlist, PlaylistTrack, Track[0m[32;1m[1;3m
Invoking: `sql_db_schema` with `InvoiceLine`


[0m[33;1m[1;3m
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
*/[0m[32;1m[1;3m
Invoking: `sql_db_schema` with `Artist`


[0m[33;1m[1;3m
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
*/[0m[32;1m[1;3m
Invoking: `sql_db_query` with `SELECT Artist.Name, SUM(InvoiceLine.Quantity) AS TotalQuantity FROM Artist JOIN Album ON Artist.ArtistId = Album.ArtistId JOIN Track ON Album.AlbumId = Track.AlbumId JOIN InvoiceLine ON Track.TrackId = InvoiceLine.TrackId GROUP BY Artist.Name ORDER BY TotalQuantity DESC LIMIT 3`


[0m[36;1m[1;3m[('Iron Maiden', 140), ('U2', 107), ('Metallica', 91)][0m[32;1m[1;3mThe top 3 best selling artists are:

1. Iron Maiden - 140 total quantity sold
2. U2 - 107 total quantity sold
3. Metallica - 91 total quantity sold[0m

[1m> Finished chain.[0m
```

```output
{'input': 'Who are the top 3 best selling artists?',
 'output': 'The top 3 best selling artists are:\n\n1. Iron Maiden - 140 total quantity sold\n2. U2 - 107 total quantity sold\n3. Metallica - 91 total quantity sold'}
```
