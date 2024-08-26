---
sidebar_position: 3
translated: true
---

# क्वेरी मान्यता

शायद किसी भी SQL श्रृंखला या एजेंट का सबसे त्रुटि-प्रवण हिस्सा मान्य और सुरक्षित SQL क्वेरी लिखना है। इस गाइड में हम अपनी क्वेरी को मान्य करने और अमान्य क्वेरी को संभालने के कुछ रणनीतियों पर चर्चा करेंगे।

## सेटअप

पहले, आवश्यक पैकेज प्राप्त करें और पर्यावरण चर सेट करें:

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

नीचे दिया गया उदाहरण SQLite कनेक्शन का उपयोग करेगा Chinook डेटाबेस के साथ। [ये स्थापना चरण](https://database.guide/2-sample-databases-sqlite/) का पालन करें ताकि इसी निर्देशिका में `Chinook.db` बना सकें:

* [यह फ़ाइल](https://raw.githubusercontent.com/lerocha/chinook-database/master/ChinookDatabase/DataSources/Chinook_Sqlite.sql) को `Chinook_Sqlite.sql` के रूप में सहेजें
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

## क्वेरी चेकर

शायद सबसे सरल रणनीति मॉडल से ही मूल क्वेरी में सामान्य त्रुटियों की जांच करवाना है। मान लीजिए हमारे पास निम्नलिखित SQL क्वेरी श्रृंखला है:

```python
from langchain.chains import create_sql_query_chain
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
chain = create_sql_query_chain(llm, db)
```

और हम इसके आउटपुट को मान्य करना चाहते हैं। हम ऐसा कर सकते हैं कि हम श्रृंखला को दूसरे प्रॉम्प्ट और मॉडल कॉल के साथ विस्तारित करें:

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

system = """Double check the user's {dialect} query for common mistakes, including:
- Using NOT IN with NULL values
- Using UNION when UNION ALL should have been used
- Using BETWEEN for exclusive ranges
- Data type mismatch in predicates
- Properly quoting identifiers
- Using the correct number of arguments for functions
- Casting to the correct data type
- Using the proper columns for joins

If there are any of the above mistakes, rewrite the query. If there are no mistakes, just reproduce the original query.

Output the final SQL query only."""
prompt = ChatPromptTemplate.from_messages(
    [("system", system), ("human", "{query}")]
).partial(dialect=db.dialect)
validation_chain = prompt | llm | StrOutputParser()

full_chain = {"query": chain} | validation_chain
```

```python
query = full_chain.invoke(
    {
        "question": "What's the average Invoice from an American customer whose Fax is missing since 2003 but before 2010"
    }
)
query
```

```output
"SELECT AVG(Invoice.Total) AS AverageInvoice\nFROM Invoice\nJOIN Customer ON Invoice.CustomerId = Customer.CustomerId\nWHERE Customer.Country = 'USA'\nAND Customer.Fax IS NULL\nAND Invoice.InvoiceDate >= '2003-01-01'\nAND Invoice.InvoiceDate < '2010-01-01'"
```

```python
db.run(query)
```

```output
'[(6.632999999999998,)]'
```

इस दृष्टिकोण का स्पष्ट नुकसान यह है कि हमें अपनी क्वेरी को जनरेट करने के लिए एक मॉडल कॉल के बजाय दो मॉडल कॉल करने की आवश्यकता है। इससे बचने के लिए हम एक ही मॉडल आह्वान में क्वेरी जनरेशन और क्वेरी जांच करने का प्रयास कर सकते हैं:

```python
system = """You are a {dialect} expert. Given an input question, creat a syntactically correct {dialect} query to run.
Unless the user specifies in the question a specific number of examples to obtain, query for at most {top_k} results using the LIMIT clause as per {dialect}. You can order the results to return the most informative data in the database.
Never query for all columns from a table. You must query only the columns that are needed to answer the question. Wrap each column name in double quotes (") to denote them as delimited identifiers.
Pay attention to use only the column names you can see in the tables below. Be careful to not query for columns that do not exist. Also, pay attention to which column is in which table.
Pay attention to use date('now') function to get the current date, if the question involves "today".

Only use the following tables:
{table_info}

Write an initial draft of the query. Then double check the {dialect} query for common mistakes, including:
- Using NOT IN with NULL values
- Using UNION when UNION ALL should have been used
- Using BETWEEN for exclusive ranges
- Data type mismatch in predicates
- Properly quoting identifiers
- Using the correct number of arguments for functions
- Casting to the correct data type
- Using the proper columns for joins

Use format:

First draft: <<FIRST_DRAFT_QUERY>>
Final answer: <<FINAL_ANSWER_QUERY>>
"""
prompt = ChatPromptTemplate.from_messages(
    [("system", system), ("human", "{input}")]
).partial(dialect=db.dialect)


def parse_final_answer(output: str) -> str:
    return output.split("Final answer: ")[1]


chain = create_sql_query_chain(llm, db, prompt=prompt) | parse_final_answer
prompt.pretty_print()
```

```output
================================[1m System Message [0m================================

You are a [33;1m[1;3m{dialect}[0m expert. Given an input question, creat a syntactically correct [33;1m[1;3m{dialect}[0m query to run.
Unless the user specifies in the question a specific number of examples to obtain, query for at most [33;1m[1;3m{top_k}[0m results using the LIMIT clause as per [33;1m[1;3m{dialect}[0m. You can order the results to return the most informative data in the database.
Never query for all columns from a table. You must query only the columns that are needed to answer the question. Wrap each column name in double quotes (") to denote them as delimited identifiers.
Pay attention to use only the column names you can see in the tables below. Be careful to not query for columns that do not exist. Also, pay attention to which column is in which table.
Pay attention to use date('now') function to get the current date, if the question involves "today".

Only use the following tables:
[33;1m[1;3m{table_info}[0m

Write an initial draft of the query. Then double check the [33;1m[1;3m{dialect}[0m query for common mistakes, including:
- Using NOT IN with NULL values
- Using UNION when UNION ALL should have been used
- Using BETWEEN for exclusive ranges
- Data type mismatch in predicates
- Properly quoting identifiers
- Using the correct number of arguments for functions
- Casting to the correct data type
- Using the proper columns for joins

Use format:

First draft: <<FIRST_DRAFT_QUERY>>
Final answer: <<FINAL_ANSWER_QUERY>>


================================[1m Human Message [0m=================================

[33;1m[1;3m{input}[0m
```

```python
query = chain.invoke(
    {
        "question": "What's the average Invoice from an American customer whose Fax is missing since 2003 but before 2010"
    }
)
query
```

```output
"\nSELECT AVG(i.Total) AS AverageInvoice\nFROM Invoice i\nJOIN Customer c ON i.CustomerId = c.CustomerId\nWHERE c.Country = 'USA' AND c.Fax IS NULL AND i.InvoiceDate >= date('2003-01-01') AND i.InvoiceDate < date('2010-01-01')"
```

```python
db.run(query)
```

```output
'[(6.632999999999998,)]'
```

## मानव-में-लूप

कुछ मामलों में हमारा डेटा इतना संवेदनशील है कि हम किसी मानव की मंजूरी के बिना कभी भी SQL क्वेरी को निष्पादित नहीं करना चाहते। [मानव-में-लूप: उपयोग मामले](/docs/use_cases/tool_use/human_in_the_loop) पृष्ठ पर जाकर सीखें कि किसी भी उपकरण, श्रृंखला या एजेंट में मानव-में-लूप कैसे जोड़ें।

## त्रुटि संभालना

किसी भी समय, मॉडल गलती कर सकता है और अमान्य SQL क्वेरी बना सकता है। या हमारे डेटाबेस में कोई समस्या उत्पन्न हो सकती है। या मॉडल API डाउन हो सकता है। हम अपनी श्रृंखलाओं और एजेंटों में कुछ त्रुटि संभालने का व्यवहार जोड़ना चाहेंगे ताकि इन स्थितियों में हम सुरक्षित तरीके से विफल हो सकें, और शायद स्वचालित रूप से पुनर्प्राप्त भी कर सकें। उपकरणों के साथ त्रुटि संभालने के बारे में जानने के लिए, [उपकरण उपयोग: त्रुटि संभालना](/docs/use_cases/tool_use/tool_error_handling) पृष्ठ पर जाएं।
