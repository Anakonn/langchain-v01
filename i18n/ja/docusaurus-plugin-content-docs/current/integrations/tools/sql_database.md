---
translated: true
---

# SQLデータベース

:::note
`SQLDatabase`アダプターユーティリティは、データベース接続のラッパーです。

SQLデータベースとの対話には、[SQLAlchemy]コアAPIを使用しています。
:::

このノートブックでは、SQLiteデータベースにアクセスするためのユーティリティの使用方法を示します。
[Chinook Database]の例を使用し、以下の機能を示します:

- SQLを使用したクエリ
- SQLAlchemy可能なクエリ
- `cursor`、`all`、`one`のフェッチモード
- クエリパラメーターのバインド

[Chinook Database]: https://github.com/lerocha/chinook-database
[SQLAlchemy]: https://www.sqlalchemy.org/

`Tool`または`@tool`デコレーターを使用して、このユーティリティからツールを作成できます。

::: {.callout-caution}
SQLDatbaseユーティリティからツールを作成し、LLMと組み合わせたり、エンドユーザーに公開する場合は、
適切なセキュリティ慣行に従ってください。

セキュリティ情報: https://python.langchain.com/docs/security
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

## データベースの初期化

```python
from pprint import pprint

import sqlalchemy as sa
from langchain_community.utilities import SQLDatabase

db = SQLDatabase.from_uri("sqlite:///Chinook.db")
```

## カーソルとしてクエリ

フェッチモード`cursor`は、結果をSQLAlchemyの`CursorResult`インスタンスとして返します。

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

## 文字列ペイロードとしてクエリ

フェッチモード`all`と`one`は、結果を文字列形式で返します。

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

## パラメーターを使ってクエリ

クエリパラメーターをバインドするには、オプションの`parameters`引数を使用します。

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

## SQLAlchemy可能なクエリ

プレーンテキストのSQL文以外にも、アダプターはSQLAlchemy可能なものを受け入れます。

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

## 実行オプションを使ってクエリ

ステートメントの呼び出しにカスタムの実行オプションを追加することができます。
例えば、スキーマ名の変換を適用すると、後続のステートメントが失敗する可能性があります。
これは、存在しないテーブルにアクセスしようとするためです。

```python
query = sa.select(artist).where(artist.c.Name.like("p%"))
db.run(query, fetch="cursor", execution_options={"schema_translate_map": {None: "bar"}})
```
