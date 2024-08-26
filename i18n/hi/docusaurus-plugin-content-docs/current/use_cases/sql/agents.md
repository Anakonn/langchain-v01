---
sidebar_position: 1
translated: true
---

# एजेंट

LangChain में एक SQL एजेंट है जो SQL डेटाबेस के साथ अधिक लचीली तरीके से बातचीत करने का एक बेहतर तरीका प्रदान करता है। SQL एजेंट का उपयोग करने के मुख्य लाभ हैं:

- यह डेटाबेस के स्कीमा के साथ-साथ डेटाबेस के सामग्री (जैसे किसी विशिष्ट तालिका का वर्णन) पर आधारित प्रश्नों का उत्तर दे सकता है।
- यह त्रुटियों से बचने के लिए एक उत्पन्न क्वेरी को चलाकर, ट्रेसबैक को पकड़कर और इसे सही ढंग से पुनः उत्पन्न कर सकता है।
- यह उपयोगकर्ता के प्रश्न का उत्तर देने के लिए डेटाबेस को जितनी बार आवश्यक हो, उतनी बार क्वेरी कर सकता है।
- यह केवल प्रासंगिक तालिकाओं का स्कीमा पुनः प्राप्त करके टोकन को बचाएगा।

एजेंट को प्रारंभ करने के लिए हम [create_sql_agent](https://api.python.langchain.com/en/latest/agent_toolkits/langchain_community.agent_toolkits.sql.base.create_sql_agent.html) निर्माता का उपयोग करेंगे। यह एजेंट `SQLDatabaseToolkit` का उपयोग करता है, जिसमें निम्नलिखित उपकरण शामिल हैं:

* क्वेरी बनाना और निष्पादित करना
* क्वेरी वाक्य-रचना की जांच करना
* तालिका विवरण प्राप्त करना
* ... और अधिक

## सेटअप

पहले, आवश्यक पैकेज प्राप्त करें और वातावरण चर सेट करें:

```python
%pip install --upgrade --quiet  langchain langchain-community langchain-openai
```

हम इस गाइड में OpenAI मॉडल का डिफ़ॉल्ट उपयोग करते हैं, लेकिन आप अपनी पसंद के मॉडल प्रदाता को बदल सकते हैं।

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()

# Uncomment the below to use LangSmith. Not required.
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
```

नीचे दिया गया उदाहरण SQLite कनेक्शन का उपयोग करेगा और Chinook डेटाबेस का उपयोग करेगा। [ये स्थापना चरण](https://database.guide/2-sample-databases-sqlite/) का पालन करें ताकि `Chinook.db` इसी निर्देशिका में बन जाए:

* [यह फ़ाइल](https://raw.githubusercontent.com/lerocha/chinook-database/master/ChinookDatabase/DataSources/Chinook_Sqlite.sql) `Chinook_Sqlite.sql` के रूप में सहेजें
* `sqlite3 Chinook.db` चलाएं
* `.read Chinook_Sqlite.sql` चलाएं
* `SELECT * FROM Artist LIMIT 10;` का परीक्षण करें

अब, `Chinhook.db` हमारी निर्देशिका में है और हम SQLAlchemy-driven `SQLDatabase` क्लास का उपयोग करके इसके साथ इंटरफ़ेस कर सकते हैं:

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

## एजेंट

हम एक OpenAI चैट मॉडल और एक `"openai-tools"` एजेंट का उपयोग करेंगे, जो एजेंट के उपकरण चयन और आह्वान को संचालित करने के लिए OpenAI के फ़ंक्शन-कॉलिंग API का उपयोग करेगा।

जैसा कि हम देख सकते हैं, एजेंट पहले प्रासंगिक तालिकाओं का चयन करेगा और फिर उन तालिकाओं के लिए स्कीमा और कुछ नमूना पंक्तियां प्रॉम्प्ट में जोड़ेगा।

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

```python
agent_executor.invoke("Describe the playlisttrack table")
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

## एक गतिशील फ्यू-शॉट प्रॉम्प्ट का उपयोग करना

एजेंट प्रदर्शन को अनुकूलित करने के लिए, हम डोमेन-विशिष्ट ज्ञान के साथ एक कस्टम प्रॉम्प्ट प्रदान कर सकते हैं। इस मामले में, हम एक उदाहरण चयनकर्ता के साथ एक फ्यू शॉट प्रॉम्प्ट बनाएंगे, जो उपयोगकर्ता इनपुट पर आधारित गतिशील रूप से प्रॉम्प्ट बनाएगा। यह मॉडल को बेहतर क्वेरी बनाने में मदद करेगा क्योंकि यह प्रॉम्प्ट में प्रासंगिक क्वेरी डालेगा जिनका मॉडल संदर्भ के रूप में उपयोग कर सकता है।

पहले हमें कुछ उपयोगकर्ता इनपुट \<\> SQL क्वेरी उदाहरण चाहिए:

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

अब हम एक उदाहरण चयनकर्ता बना सकते हैं। यह वास्तविक उपयोगकर्ता इनपुट लेगा और हमारे फ्यू-शॉट प्रॉम्प्ट में जोड़ने के लिए कुछ उदाहरण चुनेगा। हम एक SemanticSimilarityExampleSelector का उपयोग करेंगे, जो हमारे कॉन्फ़िगर किए गए एम्बेडिंग और वेक्टर स्टोर का उपयोग करके एक语义खोज करेगा ताकि हमारे इनपुट के सबसे समान उदाहरण मिल सकें:

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

अब हम अपना FewShotPromptTemplate बना सकते हैं, जो हमारे उदाहरण चयनकर्ता, प्रत्येक उदाहरण के स्वरूपण के लिए एक उदाहरण प्रॉम्प्ट, और हमारे स्वरूपित उदाहरणों से पहले और बाद में रखने के लिए एक स्ट्रिंग प्रीफ़िक्स और सफ़िक्स लेता है:

```python
from langchain_core.prompts import (
    ChatPromptTemplate,
    FewShotPromptTemplate,
    MessagesPlaceholder,
    PromptTemplate,
    SystemMessagePromptTemplate,
)

system_prefix = """You are an agent designed to interact with a SQL database.
Given an input question, create a syntactically correct {dialect} query to run, then look at the results of the query and return the answer.
Unless the user specifies a specific number of examples they wish to obtain, always limit your query to at most {top_k} results.
You can order the results by a relevant column to return the most interesting examples in the database.
Never query for all the columns from a specific table, only ask for the relevant columns given the question.
You have access to tools for interacting with the database.
Only use the given tools. Only use the information returned by the tools to construct your final answer.
You MUST double check your query before executing it. If you get an error while executing a query, rewrite the query and try again.

DO NOT make any DML statements (INSERT, UPDATE, DELETE, DROP etc.) to the database.

If the question does not seem related to the database, just return "I don't know" as the answer.

Here are some examples of user inputs and their corresponding SQL queries:"""

few_shot_prompt = FewShotPromptTemplate(
    example_selector=example_selector,
    example_prompt=PromptTemplate.from_template(
        "User input: {input}\nSQL query: {query}"
    ),
    input_variables=["input", "dialect", "top_k"],
    prefix=system_prefix,
    suffix="",
)
```

चूंकि हमारा मूल एजेंट एक [OpenAI उपकरण एजेंट](/docs/modules/agents/agent_types/openai_tools) है, जो OpenAI फ़ंक्शन कॉलिंग का उपयोग करता है, हमारा पूरा प्रॉम्प्ट एक चैट प्रॉम्प्ट होना चाहिए जिसमें एक मानव संदेश टेम्प्लेट और एक agent_scratchpad `MessagesPlaceholder` हो। फ्यू-शॉट प्रॉम्प्ट हमारे सिस्टम संदेश के लिए उपयोग किया जाएगा:

```python
full_prompt = ChatPromptTemplate.from_messages(
    [
        SystemMessagePromptTemplate(prompt=few_shot_prompt),
        ("human", "{input}"),
        MessagesPlaceholder("agent_scratchpad"),
    ]
)
```

```python
# Example formatted prompt
prompt_val = full_prompt.invoke(
    {
        "input": "How many arists are there",
        "top_k": 5,
        "dialect": "SQLite",
        "agent_scratchpad": [],
    }
)
print(prompt_val.to_string())
```

```output
System: You are an agent designed to interact with a SQL database.
Given an input question, create a syntactically correct SQLite query to run, then look at the results of the query and return the answer.
Unless the user specifies a specific number of examples they wish to obtain, always limit your query to at most 5 results.
You can order the results by a relevant column to return the most interesting examples in the database.
Never query for all the columns from a specific table, only ask for the relevant columns given the question.
You have access to tools for interacting with the database.
Only use the given tools. Only use the information returned by the tools to construct your final answer.
You MUST double check your query before executing it. If you get an error while executing a query, rewrite the query and try again.

DO NOT make any DML statements (INSERT, UPDATE, DELETE, DROP etc.) to the database.

If the question does not seem related to the database, just return "I don't know" as the answer.

Here are some examples of user inputs and their corresponding SQL queries:

User input: List all artists.
SQL query: SELECT * FROM Artist;

User input: How many employees are there
SQL query: SELECT COUNT(*) FROM "Employee"

User input: How many tracks are there in the album with ID 5?
SQL query: SELECT COUNT(*) FROM Track WHERE AlbumId = 5;

User input: List all tracks in the 'Rock' genre.
SQL query: SELECT * FROM Track WHERE GenreId = (SELECT GenreId FROM Genre WHERE Name = 'Rock');

User input: Which albums are from the year 2000?
SQL query: SELECT * FROM Album WHERE strftime('%Y', ReleaseDate) = '2000';
Human: How many arists are there
```

और अब हम अपने कस्टम प्रॉम्प्ट के साथ अपना एजेंट बना सकते हैं:

```python
agent = create_sql_agent(
    llm=llm,
    db=db,
    prompt=full_prompt,
    verbose=True,
    agent_type="openai-tools",
)
```

चलो इसे आज़माते हैं:

```python
agent.invoke({"input": "How many artists are there?"})
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `sql_db_query` with `{'query': 'SELECT COUNT(*) FROM Artist'}`


[0m[36;1m[1;3m[(275,)][0m[32;1m[1;3mThere are 275 artists in the database.[0m

[1m> Finished chain.[0m
```

```output
{'input': 'How many artists are there?',
 'output': 'There are 275 artists in the database.'}
```

## उच्च कार्डिनालिटी कॉलमों से निपटना

पते, गीत नाम या कलाकार जैसे उचित नामों वाले कॉलमों को फ़िल्टर करने के लिए, हमें पहले स्पेलिंग की जांच करनी होगी ताकि डेटा को सही ढंग से फ़िल्टर किया जा सके।

हम एक वेक्टर स्टोर बना सकते हैं जिसमें डेटाबेस में मौजूद सभी अद्वितीय उचित नाम हों। फिर हम प्रत्येक बार जब उपयोगकर्ता अपने प्रश्न में किसी उचित नाम का उपयोग करता है, तो एजेंट को उस वेक्टर स्टोर को क्वेरी करने के लिए कह सकते हैं ताकि वह उस शब्द के सही वर्तनी का पता लगा सके। इस तरह, एजेंट यह सुनिश्चित कर सकता है कि वह उपयोगकर्ता किस इकाई की बात कर रहा है, इससे पहले कि वह लक्षित क्वेरी बनाए।

पहले हमें प्रत्येक इकाई के लिए अद्वितीय मान चाहिए, जिसके लिए हम परिणाम को तत्वों की एक सूची में पार्स करने वाला एक फ़ंक्शन परिभाषित करते हैं:

```python
import ast
import re


def query_as_list(db, query):
    res = db.run(query)
    res = [el for sub in ast.literal_eval(res) for el in sub if el]
    res = [re.sub(r"\b\d+\b", "", string).strip() for string in res]
    return list(set(res))


artists = query_as_list(db, "SELECT Name FROM Artist")
albums = query_as_list(db, "SELECT Title FROM Album")
albums[:5]
```

```output
['Os Cães Ladram Mas A Caravana Não Pára',
 'War',
 'Mais Do Mesmo',
 "Up An' Atom",
 'Riot Act']
```

अब हम कस्टम **पुनर्प्राप्ति उपकरण** और अंतिम एजेंट बनाने के साथ आगे बढ़ सकते हैं:

```python
from langchain.agents.agent_toolkits import create_retriever_tool

vector_db = FAISS.from_texts(artists + albums, OpenAIEmbeddings())
retriever = vector_db.as_retriever(search_kwargs={"k": 5})
description = """Use to look up values to filter on. Input is an approximate spelling of the proper noun, output is \
valid proper nouns. Use the noun most similar to the search."""
retriever_tool = create_retriever_tool(
    retriever,
    name="search_proper_nouns",
    description=description,
)
```

```python
system = """You are an agent designed to interact with a SQL database.
Given an input question, create a syntactically correct {dialect} query to run, then look at the results of the query and return the answer.
Unless the user specifies a specific number of examples they wish to obtain, always limit your query to at most {top_k} results.
You can order the results by a relevant column to return the most interesting examples in the database.
Never query for all the columns from a specific table, only ask for the relevant columns given the question.
You have access to tools for interacting with the database.
Only use the given tools. Only use the information returned by the tools to construct your final answer.
You MUST double check your query before executing it. If you get an error while executing a query, rewrite the query and try again.

DO NOT make any DML statements (INSERT, UPDATE, DELETE, DROP etc.) to the database.

If you need to filter on a proper noun, you must ALWAYS first look up the filter value using the "search_proper_nouns" tool!

You have access to the following tables: {table_names}

If the question does not seem related to the database, just return "I don't know" as the answer."""

prompt = ChatPromptTemplate.from_messages(
    [("system", system), ("human", "{input}"), MessagesPlaceholder("agent_scratchpad")]
)
agent = create_sql_agent(
    llm=llm,
    db=db,
    extra_tools=[retriever_tool],
    prompt=prompt,
    agent_type="openai-tools",
    verbose=True,
)
```

```python
agent.invoke({"input": "How many albums does alis in chain have?"})
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `search_proper_nouns` with `{'query': 'alis in chain'}`


[0m[36;1m[1;3mAlice In Chains

Aisha Duo

Xis

Da Lama Ao Caos

A-Sides[0m[32;1m[1;3m
Invoking: `sql_db_query` with `SELECT COUNT(*) FROM Album WHERE ArtistId = (SELECT ArtistId FROM Artist WHERE Name = 'Alice In Chains')`


[0m[36;1m[1;3m[(1,)][0m[32;1m[1;3mAlice In Chains has 1 album.[0m

[1m> Finished chain.[0m
```

```output
{'input': 'How many albums does alis in chain have?',
 'output': 'Alice In Chains has 1 album.'}
```

जैसा कि हम देख सकते हैं, एजेंट ने `search_proper_nouns` उपकरण का उपयोग किया ताकि यह सुनिश्चित हो सके कि वह इस विशिष्ट कलाकार के लिए डेटाबेस को कैसे क्वेरी करे।

## अगले कदम

`create_sql_agent` के तहत, यह केवल अधिक सामान्य एजेंट निर्माताओं को SQL उपकरण पास कर रहा है। अधिक जानकारी के लिए, [एजेंट मॉड्यूल](/docs/modules/agents/) पर जाएं।

बिल्ट-इन `AgentExecutor` एक सरल एजेंट कार्रवाई -> उपकरण कॉल -> एजेंट कार्रवाई... लूप चलाता है। अधिक जटिल एजेंट रनटाइम बनाने के लिए, [LangGraph खंड](/docs/langgraph) पर जाएं।
