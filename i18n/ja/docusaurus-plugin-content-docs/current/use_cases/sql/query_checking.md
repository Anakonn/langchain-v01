---
sidebar_position: 3
translated: true
---

# クエリの検証

SQLチェーンやエージェントの中で、おそらく最も間違いが起きやすい部分は、有効で安全なSQLクエリを書くことです。このガイドでは、クエリの検証と無効なクエリの処理について説明します。

## セットアップ

まず、必要なパッケージをインストールし、環境変数を設定します:

```python
%pip install --upgrade --quiet  langchain langchain-community langchain-openai
```

このガイドではデフォルトでOpenAIモデルを使用しますが、お好みのモデルプロバイダーに変更することができます。

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()

# Uncomment the below to use LangSmith. Not required.
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
```

以下の例では、SQLiteの接続とChinookデータベースを使用します。[これらのインストール手順](https://database.guide/2-sample-databases-sqlite/)に従って、このノートブックと同じディレクトリに`Chinook.db`を作成してください:

* `Chinook_Sqlite.sql`というファイル名で[このファイル](https://raw.githubusercontent.com/lerocha/chinook-database/master/ChinookDatabase/DataSources/Chinook_Sqlite.sql)を保存
* `sqlite3 Chinook.db`を実行
* `.read Chinook_Sqlite.sql`を実行
* `SELECT * FROM Artist LIMIT 10;`をテストする

これで`Chinhook.db`がディレクトリにあり、SQLAlchemyドライバーの`SQLDatabase`クラスを使ってインターフェースできるようになりました:

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

## クエリチェッカー

おそらく最も単純な戦略は、モデル自体にオリジナルのクエリを確認させ、一般的な間違いがないかを確認することです。次のようなSQLクエリチェーンがあるとします:

```python
from langchain.chains import create_sql_query_chain
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
chain = create_sql_query_chain(llm, db)
```

これらの出力を検証したい場合は、2つ目のプロンプトとモデルコールを追加することで実現できます:

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

この手法の明らかな欠点は、クエリを生成するために2つのモデルコールが必要になることです。これを回避するために、クエリの生成とチェックを1つのモデル呼び出しで行うことができます:

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

## ヒューマンインザループ

データが十分に機密性の高い場合は、人間が承認しない限りSQLクエリを絶対に実行したくないことがあります。[ツールの使用: ヒューマンインザループ](/docs/use_cases/tool_use/human_in_the_loop)ページを参照して、任意のツール、チェーン、エージェントにヒューマンインザループを追加する方法を学んでください。

## エラー処理

ある時点で、モデルが間違いを犯してSQLクエリを不正に作成したり、データベースに問題が発生したり、モデルAPIがダウンしたりする可能性があります。このような状況でも、優雅に失敗し、必要に応じて自動的に回復できるようにするために、チェーンやエージェントにエラー処理の動作を追加する必要があります。ツールのエラー処理については、[ツールの使用: エラー処理](/docs/use_cases/tool_use/tool_error_handling)ページを参照してください。
