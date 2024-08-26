---
translated: true
---

# SQL डेटाबेस

यह नोटबुक एक एजेंट को दर्शाती है जिसे `SQL` डेटाबेस के साथ इंटरैक्ट करने के लिए डिज़ाइन किया गया है।

यह एक डेटाबेस के बारे में सामान्य प्रश्नों का उत्तर देने के साथ-साथ त्रुटियों से उबरने के लिए डिज़ाइन किया गया है।

ध्यान दें कि, जैसा कि यह एजेंट सक्रिय विकास में है, सभी उत्तर सही नहीं हो सकते हैं।

इसके अतिरिक्त, यह गारंटी नहीं है कि एजेंट आपके डेटाबेस पर कुछ प्रश्नों के अनुसार DML स्टेटमेंट्स नहीं चलाएगा।

संवेदनशील डेटा पर इसे चलाते समय सावधान रहें!|

यह `Chinook` डेटाबेस का उदाहरण उपयोग करता है।

इसे सेटअप करने के लिए [इन निर्देशों](https://database.guide/2-sample-databases-sqlite/) का पालन करें और .db फ़ाइल को इस रेपो की रूट में नोटबुक्स फ़ोल्डर में रखें।

```python
%pip install --upgrade --quiet  langchain langchain-community langchain-experimental
```

```output
[33mWARNING: There was an error checking the latest version of pip.[0m[33m
[0mNote: you may need to restart the kernel to use updated packages.
```

## हमारे डेटाबेस को प्रारंभ करें

```python
from langchain_community.utilities.sql_database import SQLDatabase

db = SQLDatabase.from_uri("sqlite:///Chinook.db")
```

## त्वरित प्रारंभ

[SQL उपयोग केस डॉक्स](/docs/use_cases/sql/agents) का पालन करते हुए, हम `create_sql_agent` हेल्पर का उपयोग कर सकते हैं।

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

## टूलकिट

हम उपरोक्त `create_sql_agent` हेल्पर के साथ हुड के तहत क्या चलता है, देख सकते हैं।

हम यह भी हाइलाइट कर सकते हैं कि एजेंट के साथ विशेष रूप से टूलकिट का उपयोग कैसे किया जाता है।

```python
from langchain_community.agent_toolkits import SQLDatabaseToolkit
from langchain_openai import ChatOpenAI

toolkit = SQLDatabaseToolkit(db=db, llm=ChatOpenAI(temperature=0))
context = toolkit.get_context()
tools = toolkit.get_tools()
```

### एक एजेंट के भीतर SQLDatabaseToolkit का उपयोग करें

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

## अस्वीकरण ⚠️

प्रश्न श्रृंखला insert/update/delete क्वेरीज़ उत्पन्न कर सकती है। जब यह अपेक्षित न हो, तो एक कस्टम प्रॉम्प्ट का उपयोग करें या बिना लिखने की अनुमति के SQL उपयोगकर्ताओं को बनाएं।

अंतिम उपयोगकर्ता एक सरल प्रश्न जैसे "सबसे बड़ी क्वेरी चलाएं" पूछकर आपके SQL डेटाबेस को ओवरलोड कर सकता है। उत्पन्न क्वेरी ऐसा दिख सकता है:

```sql
SELECT * FROM "public"."users"
    JOIN "public"."user_permissions" ON "public"."users".id = "public"."user_permissions".user_id
    JOIN "public"."projects" ON "public"."users".id = "public"."projects".user_id
    JOIN "public"."events" ON "public"."projects".id = "public"."events".project_id;
```

एक ट्रांजेक्शनल SQL डेटाबेस के लिए, यदि ऊपर दी गई तालिकाओं में से किसी में लाखों पंक्तियाँ हैं, तो क्वेरी अन्य अनुप्रयोगों के लिए परेशानी पैदा कर सकती है जो उसी डेटाबेस का उपयोग कर रहे हैं।

अधिकांश डेटा वेयरहाउस उन्मुख डेटाबेस संसाधन उपयोग को सीमित करने के लिए उपयोगकर्ता-स्तरीय कोटा का समर्थन करते हैं।

## उदाहरण: एक तालिका का वर्णन

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

## उदाहरण: एक तालिका का वर्णन करना, एक त्रुटि से उबरना

इस उदाहरण में, एजेंट एक तालिका, `playlists`, जो मौजूद नहीं है, खोजने का प्रयास करता है, लेकिन अगला सबसे अच्छा परिणाम पाता है।

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

## उदाहरण: क्वेरी चलाना

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

## एक त्रुटि से उबरना

इस उदाहरण में, एजेंट एक त्रुटि से उबरने में सक्षम है, प्रारंभ में एक एट्रिब्यूट (`Track.ArtistId`) तक पहुँचने का प्रयास करने के बाद जो मौजूद नहीं है।

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
