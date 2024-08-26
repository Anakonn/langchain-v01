---
translated: true
---

# DuckDB

>[DuckDB](https://duckdb.org/) एक इन-प्रोसेस SQL OLAP डेटाबेस प्रबंधन प्रणाली है।

एक दस्तावेज़ प्रति पंक्ति के साथ `DuckDB` क्वेरी लोड करें।

```python
%pip install --upgrade --quiet  duckdb
```

```python
from langchain_community.document_loaders import DuckDBLoader
```

```python
%%file example.csv
Team,Payroll
Nationals,81.34
Reds,82.20
```

```output
Writing example.csv
```

```python
loader = DuckDBLoader("SELECT * FROM read_csv_auto('example.csv')")

data = loader.load()
```

```python
print(data)
```

```output
[Document(page_content='Team: Nationals\nPayroll: 81.34', metadata={}), Document(page_content='Team: Reds\nPayroll: 82.2', metadata={})]
```

## कॉलम निर्दिष्ट करें कि कंटेंट बनाम मेटाडेटा है

```python
loader = DuckDBLoader(
    "SELECT * FROM read_csv_auto('example.csv')",
    page_content_columns=["Team"],
    metadata_columns=["Payroll"],
)

data = loader.load()
```

```python
print(data)
```

```output
[Document(page_content='Team: Nationals', metadata={'Payroll': 81.34}), Document(page_content='Team: Reds', metadata={'Payroll': 82.2})]
```

## मेटाडेटा में स्रोत जोड़ना

```python
loader = DuckDBLoader(
    "SELECT Team, Payroll, Team As source FROM read_csv_auto('example.csv')",
    metadata_columns=["source"],
)

data = loader.load()
```

```python
print(data)
```

```output
[Document(page_content='Team: Nationals\nPayroll: 81.34\nsource: Nationals', metadata={'source': 'Nationals'}), Document(page_content='Team: Reds\nPayroll: 82.2\nsource: Reds', metadata={'source': 'Reds'})]
```
