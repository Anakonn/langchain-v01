---
translated: true
---

# DuckDB

>[DuckDB](https://duckdb.org/)は、プロセス内のSQL OLAPデータベース管理システムです。

1行1文書でDuckDBクエリをロードします。

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

## コンテンツとメタデータの列を指定する

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

## メタデータにソースを追加する

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
