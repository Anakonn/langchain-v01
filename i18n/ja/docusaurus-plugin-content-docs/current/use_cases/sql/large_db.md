---
sidebar_position: 4
translated: true
---

# 大規模データベース

データベースに対して有効なクエリを書くためには、モデルにテーブル名、テーブルスキーマ、および機能値を提供する必要があります。テーブルが多数あり、列が多数あり、および/または高基数の列がある場合、データベースの完全な情報をプロンプトに毎回ダンプすることは不可能になります。代わりに、最も関連性の高い情報のみをプロンプトに動的に挿入する方法を見つける必要があります。これを行う手法をいくつか見ていきましょう。

## セットアップ

まず、必要なパッケージをインストールし、環境変数を設定します:

```python
%pip install --upgrade --quiet  langchain langchain-community langchain-openai
```

```output

[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m A new release of pip is available: [0m[31;49m23.2.1[0m[39;49m -> [0m[32;49m23.3.2[0m
[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m To update, run: [0m[32;49mpip install --upgrade pip[0m
Note: you may need to restart the kernel to use updated packages.
```

このガイドではデフォルトで OpenAI モデルを使用しますが、お好みのモデルプロバイダーに変更することができます。

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

以下の例では、Chinook データベースを使用した SQLite 接続を使用します。[これらのインストール手順](https://database.guide/2-sample-databases-sqlite/)に従って、このノートブックと同じディレクトリに `Chinook.db` を作成してください:

* [このファイル](https://raw.githubusercontent.com/lerocha/chinook-database/master/ChinookDatabase/DataSources/Chinook_Sqlite.sql)を `Chinook_Sqlite.sql` として保存
* `sqlite3 Chinook.db` を実行
* `.read Chinook_Sqlite.sql` を実行
* `SELECT * FROM Artist LIMIT 10;` をテスト

これで `Chinhook.db` がディレクトリにあり、SQLAlchemy ドライバーの [SQLDatabase](https://api.python.langchain.com/en/latest/utilities/langchain_community.utilities.sql_database.SQLDatabase.html) クラスを使ってインターフェイスできます:

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

## 多数のテーブル

プロンプトに含める必要のある主要な情報の1つは、関連するテーブルのスキーマです。テーブルが非常に多数ある場合、1つのプロンプトにすべてのスキーマを収めることはできません。そのような場合は、ユーザー入力に関連するテーブル名を最初に抽出し、それらのスキーマのみを含めることができます。

これを行う簡単で確実な方法の1つは、OpenAI の関数呼び出しと Pydantic モデルを使うことです。LangChain には、まさにこれを行うための組み込みの [create_extraction_chain_pydantic](https://api.python.langchain.com/en/latest/chains/langchain.chains.openai_tools.extraction.create_extraction_chain_pydantic.html) チェーンがあります。

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

これはかなりうまくいきます! ただし、後述のように、実際にはいくつかの他のテーブルも必要です。これをユーザーの質問に基づいてモデルが知るのは非常に難しいでしょう。この場合、モデルの仕事を簡略化するために、テーブルをカテゴリにグループ化することを考えることができます。「Music」と「Business」のカテゴリから選択するように要求し、その後で関連するすべてのテーブルを選択するようにします:

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

関連するテーブルを出力できるチェーンが用意できたので、[create_sql_query_chain](https://api.python.langchain.com/en/latest/chains/langchain.chains.sql_database.query.create_sql_query_chain.html) と組み合わせることができます。これは `table_names_to_use` を受け入れて、プロンプトに含めるテーブルスキーマを決定できます:

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

回答の冗長性を削減するために、質問をわずかに言い換えることができます。

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

このランの [LangSmith trace](https://smith.langchain.com/public/20b8ef90-1dac-4754-90f0-6bc11203c50a/r) は次のとおりです。

プロンプト内でテーブルスキーマのサブセットを動的に含める方法を見てきました。この問題に対するもう1つの可能なアプローチは、Agentにテーブルを検索するツールを与え、自分で判断させることです。これについては、[SQL: Agents](/docs/use_cases/sql/agents) ガイドに例があります。

## 高基数の列

住所、曲名、アーティストなどの固有名詞を含む列をフィルタリングするには、データを正しくフィルタリングするために、まずスペルを二重チェックする必要があります。

1つの単純な戦略は、データベースに存在するすべての固有名詞のベクトルストアを作成することです。そして、ユーザー入力ごとにそのベクトルストアを照会し、最も関連性の高い固有名詞をプロンプトに挿入することができます。

まず、各エンティティの一意の値を取得する関数を定義する必要があります:

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

次に、すべての値をベクトルデータベースにエンベディングして保存できます:

```python
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings

vector_db = FAISS.from_texts(proper_nouns, OpenAIEmbeddings())
retriever = vector_db.as_retriever(search_kwargs={"k": 15})
```

そして、最初にデータベースから値を取得してプロンプトに挿入するクエリ構築チェーンを組み立てることができます:

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

チェーンをテストするために、"elenis moriset"というスペルミスを含む Alanis Morissette のフィルタリングを、取得なしと取得ありで試してみましょう:

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

取得ありの場合、スペルを修正して有効な結果が得られることがわかります。

この問題に対するもう1つの可能なアプローチは、Agentに固有名詞を検索するタイミングを自分で判断させることです。これについては、[SQL: Agents](/docs/use_cases/sql/agents) ガイドに例があります。
