---
translated: true
---

# Inicio rápido

En esta guía repasaremos las formas básicas de crear una cadena de preguntas y respuestas (Q&A) y un agente sobre una base de datos SQL. Estos sistemas nos permitirán hacer una pregunta sobre los datos de una base de datos SQL y obtener una respuesta en lenguaje natural. La principal diferencia entre los dos es que nuestro agente puede consultar la base de datos en un bucle tantas veces como necesite para responder a la pregunta.

## ⚠️ Nota de seguridad ⚠️

La construcción de sistemas de preguntas y respuestas (Q&A) sobre bases de datos SQL requiere la ejecución de consultas SQL generadas por modelos. Hay riesgos inherentes en hacer esto. Asegúrate de que los permisos de conexión a la base de datos siempre estén delimitados lo más estrechamente posible a las necesidades de tu cadena/agente. Esto mitigará, aunque no eliminará, los riesgos de construir un sistema impulsado por modelos. Para más información sobre las mejores prácticas de seguridad en general, [consulta aquí](/docs/security).

## Arquitectura

A un nivel alto, los pasos de cualquier cadena y agente SQL son:

1. **Convertir la pregunta en una consulta SQL**: El modelo convierte la entrada del usuario en una consulta SQL.
2. **Ejecutar la consulta SQL**: Ejecutar la consulta SQL.
3. **Responder a la pregunta**: El modelo responde a la entrada del usuario utilizando los resultados de la consulta.

![sql_usecase.png](../../../../../../static/img/sql_usecase.png)

## Configuración

Primero, obtén los paquetes necesarios y establece las variables de entorno:

```python
%pip install --upgrade --quiet  langchain langchain-community langchain-openai
```

Utilizaremos un modelo de OpenAI en esta guía.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()

# Uncomment the below to use LangSmith. Not required.
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
```

El siguiente ejemplo utilizará una conexión SQLite con la base de datos Chinook. Sigue [estos pasos de instalación](https://database.guide/2-sample-databases-sqlite/) para crear `Chinook.db` en el mismo directorio que este cuaderno:

* Guarda [este archivo](https://raw.githubusercontent.com/lerocha/chinook-database/master/ChinookDatabase/DataSources/Chinook_Sqlite.sql) como `Chinook_Sqlite.sql`
* Ejecuta `sqlite3 Chinook.db`
* Ejecuta `.read Chinook_Sqlite.sql`
* Prueba `SELECT * FROM Artist LIMIT 10;`

Ahora, `Chinhook.db` está en nuestro directorio y podemos interactuar con ella utilizando la clase `SQLDatabase` impulsada por SQLAlchemy:

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

¡Genial! Tenemos una base de datos SQL con la que podemos consultar. Ahora vamos a intentar conectarla a un LLM.

## Cadena

Vamos a crear una cadena simple que tome una pregunta, la convierta en una consulta SQL, ejecute la consulta y use el resultado para responder a la pregunta original.

### Convertir la pregunta en una consulta SQL

El primer paso en una cadena o agente SQL es tomar la entrada del usuario y convertirla en una consulta SQL. LangChain viene con una cadena integrada para esto: [create_sql_query_chain](https://api.python.langchain.com/en/latest/chains/langchain.chains.sql_database.query.create_sql_query_chain.html).

```python
from langchain.chains import create_sql_query_chain
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
chain = create_sql_query_chain(llm, db)
response = chain.invoke({"question": "How many employees are there"})
response
```

```output
'SELECT COUNT(*) FROM Employee'
```

Podemos ejecutar la consulta para asegurarnos de que es válida:

```python
db.run(response)
```

```output
'[(8,)]'
```

Podemos mirar el [rastro de LangSmith](https://smith.langchain.com/public/c8fa52ea-be46-4829-bde2-52894970b830/r) para obtener una mejor comprensión de lo que está haciendo esta cadena. También podemos inspeccionar la cadena directamente para ver sus indicaciones. Mirando la indicación (a continuación), podemos ver que es:

* Específica del dialecto. En este caso hace referencia explícitamente a SQLite.
* Tiene definiciones para todas las tablas disponibles.
* Tiene tres filas de ejemplo para cada tabla.

Esta técnica se inspira en trabajos como [este](https://arxiv.org/pdf/2204.00498.pdf), que sugieren mostrar filas de ejemplo y ser explícitos sobre las tablas para mejorar el rendimiento. También podemos inspeccionar la indicación completa de la siguiente manera:

```python
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

### Ejecutar la consulta SQL

Ahora que hemos generado una consulta SQL, querremos ejecutarla. **Esta es la parte más peligrosa de la creación de una cadena SQL.** Considera cuidadosamente si es aceptable ejecutar consultas automatizadas sobre tus datos. Minimiza los permisos de conexión a la base de datos tanto como sea posible. Considera añadir un paso de aprobación humana a tus cadenas antes de la ejecución de la consulta (ver a continuación).

Podemos utilizar el `QuerySQLDatabaseTool` para añadir fácilmente la ejecución de consultas a nuestra cadena:

```python
from langchain_community.tools.sql_database.tool import QuerySQLDataBaseTool

execute_query = QuerySQLDataBaseTool(db=db)
write_query = create_sql_query_chain(llm, db)
chain = write_query | execute_query
chain.invoke({"question": "How many employees are there"})
```

```output
'[(8,)]'
```

### Responder a la pregunta

Ahora que tenemos una forma de generar y ejecutar consultas automáticamente, solo necesitamos combinar la pregunta original y el resultado de la consulta SQL para generar una respuesta final. Podemos hacer esto pasando la pregunta y el resultado al LLM una vez más:

```python
from operator import itemgetter

from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough

answer_prompt = PromptTemplate.from_template(
    """Given the following user question, corresponding SQL query, and SQL result, answer the user question.

Question: {question}
SQL Query: {query}
SQL Result: {result}
Answer: """
)

answer = answer_prompt | llm | StrOutputParser()
chain = (
    RunnablePassthrough.assign(query=write_query).assign(
        result=itemgetter("query") | execute_query
    )
    | answer
)

chain.invoke({"question": "How many employees are there"})
```

```output
'There are 8 employees.'
```

### Próximos pasos

Para una generación de consultas más compleja, es posible que queramos crear indicaciones de pocos ejemplos o añadir pasos de comprobación de consultas. Para técnicas avanzadas como esta y más, consulta:

* [Estrategias de indicación](/docs/use_cases/sql/prompting): Técnicas avanzadas de ingeniería de indicaciones.
* [Comprobación de consultas](/docs/use_cases/sql/query_checking): Añadir validación de consultas y manejo de errores.
* [Bases de datos grandes](/docs/use_cases/sql/large_db): Técnicas para trabajar con bases de datos grandes.

## Agentes

LangChain tiene un Agente SQL que proporciona una forma más flexible de interactuar con bases de datos SQL. Las principales ventajas de utilizar el Agente SQL son:

- Puede responder a preguntas basadas tanto en el esquema de la base de datos como en su contenido (como describir una tabla específica).
- Puede recuperarse de errores ejecutando una consulta generada, capturando el seguimiento de la pila y volviéndola a generar correctamente.
- Puede responder a preguntas que requieren múltiples consultas dependientes.
- Ahorrará tokens al considerar solo el esquema de las tablas relevantes.

Para inicializar el agente, utilizamos la función `create_sql_agent`. Este agente contiene el `SQLDatabaseToolkit` que contiene herramientas para:

* Crear y ejecutar consultas
* Comprobar la sintaxis de las consultas
* Recuperar descripciones de tablas
* ... y más

### Inicializar el agente

```python
from langchain_community.agent_toolkits import create_sql_agent

agent_executor = create_sql_agent(llm, db=db, agent_type="openai-tools", verbose=True)
```

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

```python
agent_executor.invoke({"input": "Describe the playlisttrack table"})
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `sql_db_list_tables` with `{}`


[0m[38;5;200m[1;3mAlbum, Artist, Customer, Employee, Genre, Invoice, InvoiceLine, MediaType, Playlist, PlaylistTrack, Track[0m[32;1m[1;3m
Invoking: `sql_db_schema` with `PlaylistTrack`


[0m[33;1m[1;3m
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
*/[0m[32;1m[1;3mThe `PlaylistTrack` table has two columns: `PlaylistId` and `TrackId`. It is a junction table that represents the many-to-many relationship between playlists and tracks.

Here is the schema of the `PlaylistTrack` table:

\```

CREATE TABLE "PlaylistTrack" (
	"PlaylistId" INTEGER NOT NULL,
	"TrackId" INTEGER NOT NULL,
	PRIMARY KEY ("PlaylistId", "TrackId"),
	FOREIGN KEY("TrackId") REFERENCES "Track" ("TrackId"),
	FOREIGN KEY("PlaylistId") REFERENCES "Playlist" ("PlaylistId")
)

\```

The `PlaylistId` column is a foreign key referencing the `PlaylistId` column in the `Playlist` table. The `TrackId` column is a foreign key referencing the `TrackId` column in the `Track` table.

Here are three sample rows from the `PlaylistTrack` table:

\```

PlaylistId   TrackId
1            3402
1            3389
1            3390

\```

Please let me know if there is anything else I can help with.[0m

[1m> Finished chain.[0m
```

```output
{'input': 'Describe the playlisttrack table',
 'output': 'The `PlaylistTrack` table has two columns: `PlaylistId` and `TrackId`. It is a junction table that represents the many-to-many relationship between playlists and tracks. \n\nHere is the schema of the `PlaylistTrack` table:\n\n```\nCREATE TABLE "PlaylistTrack" (\n\t"PlaylistId" INTEGER NOT NULL, \n\t"TrackId" INTEGER NOT NULL, \n\tPRIMARY KEY ("PlaylistId", "TrackId"), \n\tFOREIGN KEY("TrackId") REFERENCES "Track" ("TrackId"), \n\tFOREIGN KEY("PlaylistId") REFERENCES "Playlist" ("PlaylistId")\n)\n```\n\nThe `PlaylistId` column is a foreign key referencing the `PlaylistId` column in the `Playlist` table. The `TrackId` column is a foreign key referencing the `TrackId` column in the `Track` table.\n\nHere are three sample rows from the `PlaylistTrack` table:\n\n```\nPlaylistId   TrackId\n1            3402\n1            3389\n1            3390\n```\n\nPlease let me know if there is anything else I can help with.'}
```

### Próximos pasos

Para más información sobre cómo usar y personalizar los agentes, dirígete a la página [Agentes](/docs/use_cases/sql/agents).
