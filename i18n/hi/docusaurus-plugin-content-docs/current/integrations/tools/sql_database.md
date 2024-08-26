---
translated: true
---

# SQL डेटाबेस

:::note
`SQLDatabase` एडाप्टर उपयोगिता एक डेटाबेस कनेक्शन का रैपर है।

SQL डेटाबेस से बात करने के लिए, यह [SQLAlchemy] कोर API का उपयोग करता है।
:::

यह नोटबुक दिखाता है कि SQLite डेटाबेस तक पहुंचने के लिए उपयोगिता कैसे उपयोग करें।
यह [Chinook डेटाबेस] का उदाहरण उपयोग करता है, और इन सुविधाओं को प्रदर्शित करता है:

- SQL का उपयोग करके क्वेरी करें
- SQLAlchemy चयनयोग्य का उपयोग करके क्वेरी करें
- `cursor`, `all` और `one` फ़ेच मोड
- क्वेरी पैरामीटर बाइंड करें

[Chinook डेटाबेस]: https://github.com/lerocha/chinook-database
[SQLAlchemy]: https://www.sqlalchemy.org/

आप `Tool` या `@tool` डिकोरेटर का उपयोग कर इस उपयोगिता से एक उपकरण बना सकते हैं।

::: {.callout-caution}
यदि SQLDatbase उपयोगिता से एक उपकरण बना रहे हैं और इसे किसी एलएलएम या एंड यूजर के लिए एक्सपोज़ कर रहे हैं, तो अच्छी सुरक्षा प्रथाओं का पालन करना याद रखें।

सुरक्षा जानकारी देखें: https://python.langchain.com/docs/security
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

## डेटाबेस का प्रारंभ करना

```python
from pprint import pprint

import sqlalchemy as sa
from langchain_community.utilities import SQLDatabase

db = SQLDatabase.from_uri("sqlite:///Chinook.db")
```

## कर्सर के रूप में क्वेरी करें

फ़ेच मोड `cursor` परिणाम को SQLAlchemy के `CursorResult` इंस्टेंस के रूप में वापस करता है।

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

## स्ट्रिंग पेलोड के रूप में क्वेरी करें

फ़ेच मोड `all` और `one` परिणाम को स्ट्रिंग प्रारूप में वापस करते हैं।

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

## पैरामीटर के साथ क्वेरी करें

क्वेरी पैरामीटर को बाइंड करने के लिए, वैकल्पिक `parameters` तर्क का उपयोग करें।

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

## SQLAlchemy चयनयोग्य के साथ क्वेरी करें

सादे-पाठ SQL वक्तव्यों के अलावा, एडाप्टर SQLAlchemy चयनयोग्य को भी स्वीकार करता है।

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

## कार्यान्वयन विकल्पों के साथ क्वेरी करें

वक्तव्य आह्वान में कस्टम कार्यान्वयन विकल्प जोड़ना संभव है।
उदाहरण के लिए, स्कीमा नाम अनुवाद लागू करते समय, बाद के वक्तव्य विफल हो जाएंगे, क्योंकि वे एक मौजूद नहीं होने वाले तालिका को प्रभावित करने की कोशिश करते हैं।

```python
query = sa.select(artist).where(artist.c.Name.like("p%"))
db.run(query, fetch="cursor", execution_options={"schema_translate_map": {None: "bar"}})
```
