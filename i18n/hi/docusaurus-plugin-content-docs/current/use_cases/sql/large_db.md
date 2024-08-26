---
sidebar_position: 4
translated: true
---

# बड़े डेटाबेस

किसी डेटाबेस के खिलाफ वैध क्वेरी लिखने के लिए, हमें मॉडल को टेबल नाम, टेबल स्कीमा और फ़ीचर मान प्रदान करने की आवश्यकता होती है ताकि वह उन पर क्वेरी कर सके। जब कई टेबल, कॉलम और/या उच्च-कार्डिनैलिटी कॉलम होते हैं, तो हमारे डेटाबेस के बारे में पूरी जानकारी हर प्रॉम्प्ट में डालना असंभव हो जाता है। बदले में, हमें केवल सबसे प्रासंगिक जानकारी को प्रॉम्प्ट में डायनेमिकली डालने के तरीके खोजने होंगे। चलिए इस पर कुछ तकनीकों पर नज़र डालते हैं।

## सेटअप

पहले, आवश्यक पैकेज प्राप्त करें और वातावरण चर सेट करें:

```python
%pip install --upgrade --quiet  langchain langchain-community langchain-openai
```

```output

[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m A new release of pip is available: [0m[31;49m23.2.1[0m[39;49m -> [0m[32;49m23.3.2[0m
[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m To update, run: [0m[32;49mpip install --upgrade pip[0m
Note: you may need to restart the kernel to use updated packages.
```

हम इस गाइड में OpenAI मॉडल का डिफ़ॉल्ट उपयोग करते हैं, लेकिन आप अपनी पसंद के मॉडल प्रदाता को बदल सकते हैं।

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

नीचे का उदाहरण SQLite कनेक्शन का उपयोग करेगा Chinook डेटाबेस के साथ। [ये स्थापना चरण](https://database.guide/2-sample-databases-sqlite/) का पालन करें ताकि इसी निर्देशिका में `Chinook.db` बना सकें:

* [यह फ़ाइल](https://raw.githubusercontent.com/lerocha/chinook-database/master/ChinookDatabase/DataSources/Chinook_Sqlite.sql) को `Chinook_Sqlite.sql` के रूप में सहेजें
* `sqlite3 Chinook.db` चलाएं
* `.read Chinook_Sqlite.sql` चलाएं
* `SELECT * FROM Artist LIMIT 10;` का परीक्षण करें

अब, `Chinhook.db` हमारी निर्देशिका में है और हम SQLAlchemy-driven [SQLDatabase](https://api.python.langchain.com/en/latest/utilities/langchain_community.utilities.sql_database.SQLDatabase.html) क्लास का उपयोग करके इससे इंटरफ़ेस कर सकते हैं:

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

## कई टेबल

हमारे प्रॉम्प्ट में शामिल करने की मुख्य जानकारी में से एक टेबल स्कीमा है। जब हमारे पास बहुत सारे टेबल होते हैं, तो हम एक ही प्रॉम्प्ट में सभी स्कीमा को फिट नहीं कर सकते। ऐसे मामलों में हम जो कर सकते हैं वह यह है कि पहले उपयोगकर्ता इनपुट से संबंधित टेबल नाम निकालें, और फिर केवल उनकी स्कीमा शामिल करें।

ऐसा करने का एक आसान और विश्वसनीय तरीका OpenAI फ़ंक्शन-कॉलिंग और Pydantic मॉडल का उपयोग करना है। LangChain में एक बिल्ट-इन [create_extraction_chain_pydantic](https://api.python.langchain.com/en/latest/chains/langchain.chains.openai_tools.extraction.create_extraction_chain_pydantic.html) श्रृंखला है जो हमें ठीक यही करने देती है:

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

यह काफी अच्छा काम करता है! लेकिन, जैसा कि हम नीचे देखेंगे, हमें कुछ और टेबल भी चाहिए। यह मॉडल के लिए उपयोगकर्ता के प्रश्न के आधार पर जानना काफी मुश्किल होगा। इस मामले में, हम मॉडल के काम को सरल करने के लिए टेबल को समूहों में रखने का विचार कर सकते हैं। हम मॉडल से "संगीत" और "व्यवसाय" श्रेणियों में से चुनने के लिए कहेंगे, और फिर वहां से सभी प्रासंगिक टेबल का चयन करेंगे:

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

अब जब हमारे पास किसी भी क्वेरी के लिए प्रासंगिक टेबल निकालने वाली एक श्रृंखला है, तो हम इसे [create_sql_query_chain](https://api.python.langchain.com/en/latest/chains/langchain.chains.sql_database.query.create_sql_query_chain.html) के साथ संयुक्त कर सकते हैं, जो `table_names_to_use` की एक सूची स्वीकार कर सकता है ताकि प्रॉम्प्ट में शामिल किए जाने वाले टेबल स्कीमा निर्धारित हो सकें:

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

हम अपने प्रश्न को थोड़ा फिर से शब्दों में कह सकते हैं ताकि उत्तर में अनावश्यक दोहराव हो

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

हम यहां [LangSmith trace](https://smith.langchain.com/public/20b8ef90-1dac-4754-90f0-6bc11203c50a/r) देख सकते हैं।

हमने देखा है कि किस तरह से एक श्रृंखला में प्रॉम्प्ट में टेबल स्कीमा का एक उपसमूह शामिल किया जा सकता है। इस समस्या को हल करने का एक और संभावित アプローチ यह है कि हम एक एजेंट को खुद तब टेबल देखने का फैसला करने दें जब उसे ऐसा करने की आवश्यकता हो। आप [SQL: एजेंट](/docs/use_cases/sql/agents) गाइड में इसका एक उदाहरण देख सकते हैं।

## उच्च-कार्डिनैलिटी कॉलम

ठीक से फ़िल्टर करने के लिए, हमें पहले पता लगाना होगा कि पते, गीत नाम या कलाकार जैसे उचित नामों वाले कॉलम में सही वर्तनी है।

एक नाइव रणनीति यह है कि हम डेटाबेस में मौजूद सभी अद्वितीय उचित नामों के साथ एक वेक्टर स्टोर बनाएं। फिर हम प्रत्येक उपयोगकर्ता इनपुट से उस वेक्टर स्टोर को क्वेरी कर सकते हैं और प्रासंगिक उचित नाम को प्रॉम्प्ट में डाल सकते हैं।

पहले हमें प्रत्येक इकाई के लिए अद्वितीय मान की आवश्यकता है, जिसके लिए हम परिणाम को तत्वों की एक सूची में पार्स करने वाला एक फ़ंक्शन परिभाषित करते हैं:

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

अब हम अपने सभी मूल्यों को एक वेक्टर डेटाबेस में एम्बेड और संग्रहीत कर सकते हैं:

```python
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings

vector_db = FAISS.from_texts(proper_nouns, OpenAIEmbeddings())
retriever = vector_db.as_retriever(search_kwargs={"k": 15})
```

और एक क्वेरी निर्माण श्रृंखला बना सकते हैं जो पहले डेटाबेस से मूल्य प्राप्त करती है और उन्हें प्रॉम्प्ट में डालती है:

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

हमारी श्रृंखला को आज़माने के लिए, आइए देखते हैं कि "elenis moriset", जो Alanis Morissette का एक गलत लेखन है, के बिना और साथ में पुनः प्राप्ति के साथ क्या होता है:

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

हम देख सकते हैं कि पुनः प्राप्ति के साथ हम वर्तनी को सही कर सकते हैं और एक वैध परिणाम प्राप्त कर सकते हैं।

इस समस्या को हल करने का एक और संभावित तरीका यह है कि हम एक एजेंट को खुद तब उचित नाम देखने का फैसला करने दें जब उसे ऐसा करने की आवश्यकता हो। आप [SQL: एजेंट](/docs/use_cases/sql/agents) गाइड में इसका एक उदाहरण देख सकते हैं।
