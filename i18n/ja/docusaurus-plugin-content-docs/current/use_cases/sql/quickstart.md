---
sidebar_position: 0
translated: true
---

# クイックスタート

このガイドでは、SQL データベース上でQ&Aチェーンとエージェントを作成する基本的な方法について説明します。これらのシステムにより、SQL データベースのデータについて質問をし、自然言語で回答を得ることができます。2つの主な違いは、エージェントがデータベースに複数回クエリを実行して質問に答えられることです。

## ⚠️ セキュリティに関する注意 ⚠️

SQL データベースのQ&Aシステムを構築するには、モデル生成のSQLクエリを実行する必要があります。これには固有のリスクがあります。チェーン/エージェントのニーズに合わせて、データベース接続権限を可能な限り狭く設定することを確認してください。これにより、モデルドリブンシステムのリスクを軽減することができます。一般的なセキュリティのベストプラクティスについては、[こちら](/docs/security)を参照してください。

## アーキテクチャ

SQL チェーンとエージェントの基本的な流れは以下の通りです:

1. **質問をSQLクエリに変換**: モデルがユーザーの入力をSQLクエリに変換します。
2. **SQLクエリの実行**: SQLクエリを実行します。
3. **質問に答える**: クエリ結果を使ってユーザーの質問に回答します。

![sql_usecase.png](../../../../../../static/img/sql_usecase.png)

## セットアップ

まず、必要なパッケージをインストールし、環境変数を設定します:

```python
%pip install --upgrade --quiet  langchain langchain-community langchain-openai
```

このガイドではOpenAIモデルを使用します。

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()

# Uncomment the below to use LangSmith. Not required.
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
```

以下の例では、SQLiteコネクションとChinookデータベースを使用します。[これらのインストール手順](https://database.guide/2-sample-databases-sqlite/)に従って、このノートブックと同じディレクトリに`Chinook.db`を作成してください:

* [このファイル](https://raw.githubusercontent.com/lerocha/chinook-database/master/ChinookDatabase/DataSources/Chinook_Sqlite.sql)を`Chinook_Sqlite.sql`として保存
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

よし! クエリできるSQLデータベースが用意できました。それではLLMと連携させてみましょう。

## チェーン

ユーザーの質問をSQLクエリに変換し、クエリを実行して、その結果を使って元の質問に答えるシンプルなチェーンを作成しましょう。

### 質問をSQLクエリに変換

SQL チェーンやエージェントの最初のステップは、ユーザーの入力をSQLクエリに変換することです。LangChainには、この処理を行う組み込みのチェーンがあります: [create_sql_query_chain](https://api.python.langchain.com/en/latest/chains/langchain.chains.sql_database.query.create_sql_query_chain.html)。

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

クエリを実行して、有効であることを確認しましょう:

```python
db.run(response)
```

```output
'[(8,)]'
```

[LangSmith trace](https://smith.langchain.com/public/c8fa52ea-be46-4829-bde2-52894970b830/r)を見ると、このチェーンの動作をより詳しく理解できます。また、チェーン自体のプロンプトを確認することもできます。プロンプトを見ると(以下)、

* データベース方言に依存している。この場合はSQLiteを明示的に参照しています。
* 利用可能なすべてのテーブルの定義が含まれている。
* 各テーブルの3つの例が示されている。

このテクニックは、[この論文](https://arxiv.org/pdf/2204.00498.pdf)などに着想を得たものです。テーブルの例を示し、テーブルについて明示的に述べることで、パフォーマンスが向上するとされています。プロンプト全体も確認できます:

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

### SQLクエリの実行

SQLクエリを生成できたので、次はそれを実行します。**これがSQL チェーンを作成する上で最も危険な部分です。** データに対して自動的にクエリを実行することが許容されるかどうか、慎重に検討してください。可能な限りデータベース接続権限を最小限に抑えてください。チェーンにクエリ実行の前に人間による承認ステップを追加することも検討してください(以下参照)。

`QuerySQLDatabaseTool`を使えば、クエリ実行を簡単に追加できます:

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

### 質問に答える

クエリを自動的に生成・実行できるようになったので、元の質問とSQL クエリ結果を組み合わせて最終的な回答を生成するだけです。元の質問とクエリ結果をLLMに渡すことで実現できます:

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

### 次のステップ

より複雑なクエリ生成のためには、few-shotプロンプトの作成やクエリチェックのステップを追加するなどの方法があります。このような高度な手法については、以下のドキュメントを参照してください:

* [プロンプティング戦略](/docs/use_cases/sql/prompting): 高度なプロンプト設計テクニック
* [クエリチェック](/docs/use_cases/sql/query_checking): クエリの検証とエラー処理の追加
* [大規模データベース](/docs/use_cases/sql/large_db): 大規模データベースへの対応方法

## エージェント

LangChainにはSQL Agentがあり、SQL データベースとの対話をより柔軟に行うことができます。SQL Agentを使う主な利点は以下の通りです:

- データベースのスキーマだけでなく、データの内容に基づいても質問に答えられる(特定のテーブルの説明など)。
- 生成したクエリでエラーが発生した場合、トレースバックを捕捉して正しく再生成できる。
- 複数の依存クエリが必要な質問にも答えられる。
- 関連するテーブルのスキーマのみを考慮することで、トークン数を節約できる。

エージェントを初期化するには、`create_sql_agent`関数を使います。このエージェントには`SQLDatabaseToolkit`が含まれており、以下のようなツールが使えます:

* クエリの作成と実行
* クエリ構文のチェック
* テーブルの説明の取得
* その他

### エージェントの初期化

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

### 次のステップ

エージェントの使用とカスタマイズの詳細については、[Agents](/docs/use_cases/sql/agents)ページをご覧ください。
