---
translated: true
---

# DuckDB

>[DuckDB](https://duckdb.org/)는 in-process SQL OLAP 데이터베이스 관리 시스템입니다.

행당 하나의 문서로 `DuckDB` 쿼리를 로드합니다.

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

## 컨텐츠와 메타데이터 열 지정하기

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

## 메타데이터에 소스 추가하기

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
