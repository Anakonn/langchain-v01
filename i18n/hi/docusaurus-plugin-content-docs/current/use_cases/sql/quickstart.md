---
sidebar_position: 0
translated: true
---

यह गाइड में हम SQL डेटाबेस पर एक प्रश्न और उत्तर श्रृंखला और एजेंट बनाने के मूलभूत तरीकों पर चर्चा करेंगे। ये प्रणाली हमें SQL डेटाबेस में डेटा के बारे में प्रश्न पूछने और प्राकृतिक भाषा में उत्तर प्राप्त करने में सक्षम बनाएंगी। दोनों के बीच मुख्य अंतर यह है कि हमारा एजेंट प्रश्न का उत्तर देने के लिए जितनी बार जरूरत हो, उतनी बार डेटाबेस में क्वेरी कर सकता है।

## ⚠️ सुरक्षा नोट ⚠️

SQL डेटाबेस पर प्रश्न और उत्तर प्रणाली बनाने के लिए मॉडल-जनित SQL क्वेरी निष्पादित करने की आवश्यकता होती है। ऐसा करने में कुछ जोखिम हैं। सुनिश्चित करें कि आपके डेटाबेस कनेक्शन अनुमतियां हमेशा आपके श्रृंखला/एजेंट की जरूरतों के लिए संकीर्ण हों। इससे जोखिम कम हो जाएगा, लेकिन पूरी तरह से समाप्त नहीं होगा। सामान्य सुरक्षा सर्वोत्तम प्रथाओं के बारे में अधिक जानकारी के लिए, [यहां देखें](/docs/security)।

## वास्तुकला

किसी भी SQL श्रृंखला और एजेंट के उच्च स्तर पर, चरण इस प्रकार हैं:

1. **प्रश्न को SQL क्वेरी में बदलना**: मॉडल उपयोगकर्ता इनपुट को SQL क्वेरी में बदलता है।
2. **SQL क्वेरी निष्पादित करना**: SQL क्वेरी को निष्पादित करें।
3. **प्रश्न का उत्तर देना**: मॉडल क्वेरी परिणामों का उपयोग करके उपयोगकर्ता इनपुट का उत्तर देता है।

![sql_usecase.png](../../../../../../static/img/sql_usecase.png)

## सेटअप

पहले, आवश्यक पैकेज प्राप्त करें और वातावरण चर सेट करें:

```python
%pip install --upgrade --quiet  langchain langchain-community langchain-openai
```

हम इस गाइड में OpenAI मॉडल का उपयोग करेंगे।

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()

# Uncomment the below to use LangSmith. Not required.
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
```

नीचे दिया गया उदाहरण SQLite कनेक्शन का उपयोग करेगा Chinook डेटाबेस के साथ। [ये स्थापना चरण](https://database.guide/2-sample-databases-sqlite/) का पालन करें `Chinook.db` को इसी निर्देशिका में बनाने के लिए:

* [यह फ़ाइल](https://raw.githubusercontent.com/lerocha/chinook-database/master/ChinookDatabase/DataSources/Chinook_Sqlite.sql) को `Chinook_Sqlite.sql` के रूप में सहेजें
* `sqlite3 Chinook.db` चलाएं
* `.read Chinook_Sqlite.sql` चलाएं
* `SELECT * FROM Artist LIMIT 10;` परीक्षण करें

अब, `Chinhook.db` हमारी निर्देशिका में है और हम इसे SQLAlchemy-driven `SQLDatabase` वर्ग का उपयोग करके इंटरफ़ेस कर सकते हैं:

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

बढ़िया! हमारे पास एक SQL डेटाबेस है जिसके साथ हम क्वेरी कर सकते हैं। अब इसे एक LLM से जोड़ने का प्रयास करते हैं।

## श्रृंखला

एक सरल श्रृंखला बनाते हैं जो एक प्रश्न लेता है, इसे SQL क्वेरी में बदलता है, क्वेरी को निष्पादित करता है, और मूल प्रश्न का उत्तर देने के लिए परिणाम का उपयोग करता है।

### प्रश्न को SQL क्वेरी में बदलना

किसी SQL श्रृंखला या एजेंट में पहला कदम उपयोगकर्ता इनपुट को लेना और इसे SQL क्वेरी में बदलना है। LangChain में इसके लिए एक बिल्ट-इन श्रृंखला है: [create_sql_query_chain](https://api.python.langchain.com/en/latest/chains/langchain.chains.sql_database.query.create_sql_query_chain.html)।

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

हम क्वेरी को निष्पादित कर सकते हैं ताकि यह मान्य है:

```python
db.run(response)
```

```output
'[(8,)]'
```

हम [LangSmith ट्रेस](https://smith.langchain.com/public/c8fa52ea-be46-4829-bde2-52894970b830/r) को देखकर इस श्रृंखला के बारे में बेहतर समझ प्राप्त कर सकते हैं। हम श्रृंखला को सीधे भी देख सकते हैं उसके प्रोम्प्ट के लिए। प्रोम्प्ट को देखकर (नीचे), हम देख सकते हैं कि यह:

* डायलेक्ट-विशिष्ट है। इस मामले में यह SQLite का उल्लेख करता है।
* सभी उपलब्ध तालिकाओं के लिए परिभाषाएं हैं।
* प्रत्येक तालिका के लिए तीन उदाहरण पंक्तियां हैं।

यह तकनीक पेपर जैसे [इस](https://arxiv.org/pdf/2204.00498.pdf) से प्रेरित है, जो सुझाव देती है कि उदाहरण पंक्तियों को दिखाना और तालिकाओं के बारे में स्पष्ट होना प्रदर्शन में सुधार करता है। हम पूरे प्रोम्प्ट को भी इस प्रकार देख सकते हैं:

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

### SQL क्वेरी निष्पादित करना

अब जब हमने एक SQL क्वेरी जनरेट कर ली है, तो हम इसे निष्पादित करना चाहेंगे। **यह SQL श्रृंखला बनाने का सबसे खतरनाक हिस्सा है।** यह ध्यान में रखें कि क्या आपके डेटा पर स्वचालित क्वेरी चलाना ठीक है। डेटाबेस कनेक्शन अनुमतियों को जितना संभव हो उतना संकीर्ण करें। अपनी श्रृंखलाओं में क्वेरी निष्पादन से पहले मानव अनुमोदन चरण जोड़ने पर विचार करें (नीचे देखें)।

हम `QuerySQLDatabaseTool` का उपयोग करके क्वेरी निष्पादन को आसानी से अपनी श्रृंखला में जोड़ सकते हैं:

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

### प्रश्न का उत्तर देना

अब जब हमारे पास क्वेरी जनरेट और निष्पादित करने का एक तरीका है, तो हमें बस मूल प्रश्न और SQL क्वेरी परिणाम को एक अंतिम उत्तर जनरेट करने के लिए एक बार फिर LLM को पास करना है:

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

### अगले कदम

अधिक जटिल क्वेरी-जनरेशन के लिए, हम शायद कुछ उदाहरण प्रोम्प्ट बना सकते हैं या क्वेरी-जांच चरण जोड़ सकते हैं। इस तरह के उन्नत तकनीकों और अधिक के लिए देखें:

* [प्रोम्प्टिंग रणनीतियां](/docs/use_cases/sql/prompting): उन्नत प्रोम्प्ट इंजीनियरिंग तकनीकें।
* [क्वेरी जांच](/docs/use_cases/sql/query_checking): क्वेरी मान्यता और त्रुटि संभालने को जोड़ें।
* [बड़े डेटाबेस](/docs/use_cases/sql/large_db): बड़े डेटाबेस के साथ काम करने के लिए तकनीकें।

## एजेंट

LangChain में एक SQL एजेंट है जो SQL डेटाबेस के साथ अधिक लचीली तरीके से काम करने का एक तरीका प्रदान करता है। SQL एजेंट का उपयोग करने के मुख्य लाभ हैं:

- यह डेटाबेस के स्कीमा के साथ-साथ डेटाबेस के सामग्री (जैसे कि किसी विशिष्ट तालिका का वर्णन) पर आधारित प्रश्नों का उत्तर दे सकता है।
- यह त्रुटियों से उबरने के लिए एक जनरेट की गई क्वेरी को चलाकर, ट्रेसबैक को पकड़कर और इसे सही ढंग से पुनः जनरेट करके प्रश्नों का उत्तर दे सकता है।
- यह कई निर्भर क्वेरियों की आवश्यकता वाले प्रश्नों का उत्तर दे सकता है।
- यह टोकन को बचाएगा क्योंकि यह केवल प्रासंगिक तालिकाओं के स्कीमा पर विचार करेगा।

एजेंट को प्रारंभ करने के लिए, हम `create_sql_agent` फ़ंक्शन का उपयोग करते हैं। यह एजेंट `SQLDatabaseToolkit` को शामिल करता है जो निम्नलिखित उपकरण शामिल करता है:

* क्वेरी बनाना और निष्पादित करना
* क्वेरी वाक्यविन्यास की जांच करना
* तालिका विवरण प्राप्त करना
* ... और अधिक

### एजेंट को प्रारंभ करना

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

### अगले कदम

अभिकर्ताओं का उपयोग और अनुकूलन करने के बारे में अधिक जानने के लिए [Agents](/docs/use_cases/sql/agents) पृष्ठ पर जाएं।
