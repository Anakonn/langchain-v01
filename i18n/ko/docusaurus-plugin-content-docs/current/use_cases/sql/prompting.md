---
sidebar_position: 2
translated: true
---

# 프롬프트 전략

이 가이드에서는 SQL 쿼리 생성을 개선하기 위한 프롬프트 전략에 대해 설명합니다. 주로 데이터베이스 관련 정보를 프롬프트에 포함시키는 방법에 중점을 둡니다.

## 설정

먼저 필요한 패키지를 설치하고 환경 변수를 설정합니다:

```python
%pip install --upgrade --quiet langchain langchain-community langchain-experimental langchain-openai
```

이 가이드에서는 기본적으로 OpenAI 모델을 사용하지만, 원하는 모델 공급자로 교체할 수 있습니다.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()

# LangSmith를 사용하려면 아래 주석을 해제하세요. 필수는 아닙니다.

# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()

# os.environ["LANGCHAIN_TRACING_V2"] = "true"

```

다음 예제에서는 SQLite 연결과 Chinook 데이터베이스를 사용합니다. [이 설치 단계](https://database.guide/2-sample-databases-sqlite/)를 따라 `Chinook.db`를 이 노트북과 동일한 디렉토리에 생성하세요:

- [이 파일](https://raw.githubusercontent.com/lerocha/chinook-database/master/ChinookDatabase/DataSources/Chinook_Sqlite.sql)을 `Chinook_Sqlite.sql`로 저장합니다.
- `sqlite3 Chinook.db`를 실행합니다.
- `.read Chinook_Sqlite.sql`을 실행합니다.
- `SELECT * FROM Artist LIMIT 10;`을 테스트합니다.

이제 `Chinhook.db`가 디렉토리에 있으며, SQLAlchemy 기반 `SQLDatabase` 클래스를 사용하여 인터페이스할 수 있습니다:

```python
from langchain_community.utilities import SQLDatabase

db = SQLDatabase.from_uri("sqlite:///Chinook.db", sample_rows_in_table_info=3)
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

## 방언별 프롬프트

가장 간단한 방법 중 하나는 사용하는 SQL 방언에 맞게 프롬프트를 구체화하는 것입니다. 내장된 [create_sql_query_chain](https://api.python.langchain.com/en/latest/chains/langchain.chains.sql_database.query.create_sql_query_chain.html) 및 [SQLDatabase](https://api.python.langchain.com/en/latest/utilities/langchain_community.utilities.sql_database.SQLDatabase.html)를 사용할 때, 다음 방언 중 하나에 대해 자동으로 처리됩니다:

```python
from langchain.chains.sql_database.prompt import SQL_PROMPTS

list(SQL_PROMPTS)
```

```output
['crate',
 'duckdb',
 'googlesql',
 'mssql',
 'mysql',
 'mariadb',
 'oracle',
 'postgresql',
 'sqlite',
 'clickhouse',
 'prestodb']
```

예를 들어, 현재 데이터베이스를 사용하여 SQLite에 특화된 프롬프트를 얻을 수 있습니다:

```python
from langchain.chains import create_sql_query_chain
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature="0")
chain = create_sql_query_chain(llm, db)
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

## 테이블 정의 및 예제 행

기본적으로 모든 SQL 체인에서 데이터베이스 스키마의 일부를 모델에 제공해야 합니다. 이를 제공하지 않으면 유효한 쿼리를 작성할 수 없습니다. 우리의 데이터베이스는 관련 컨텍스트를 제공하기 위한 몇 가지 편리한 메서드를 제공합니다. 구체적으로, 테이블 이름, 스키마 및 각 테이블의 샘플 행을 얻을 수 있습니다:

```python
context = db.get_context()
print(list(context))
print(context["table_info"])
```

```output
['table_info', 'table_names']

CREATE TABLE "Album" (
	"AlbumId" INTEGER NOT NULL,
	"Title" NVARCHAR(160) NOT NULL,
	"ArtistId" INTEGER NOT NULL,
	PRIMARY KEY ("AlbumId"),
	FOREIGN KEY("ArtistId") REFERENCES "Artist" ("ArtistId")
)

/*
3 rows from Album table:
AlbumId	Title	ArtistId
1	For Those About To Rock We Salute You	1
2	Balls to the Wall	2
3	Restless and Wild	2
*/


CREATE TABLE "Artist" (
	"ArtistId" INTEGER NOT NULL,
	"Name" NVARCHAR(120),
	PRIMARY KEY ("ArtistId")
)

/*
3 rows from Artist table:
ArtistId	Name
1	AC/DC
2	Accept
3	Aerosmith
*/


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


CREATE TABLE "Employee" (
	"EmployeeId" INTEGER NOT NULL,
	"LastName" NVARCHAR(20) NOT NULL,
	"FirstName" NVARCHAR(20) NOT NULL,
	"Title" NVARCHAR(30),
	"ReportsTo" INTEGER,
	"BirthDate" DATETIME,
	"HireDate" DATETIME,
	"Address" NVARCHAR(70),
	"City" NVARCHAR(40),
	"State" NVARCHAR(40),
	"Country" NVARCHAR(40),
	"PostalCode" NVARCHAR(10),
	"Phone" NVARCHAR(24),
	"Fax" NVARCHAR(24),
	"Email" NVARCHAR(60),
	PRIMARY KEY ("EmployeeId"),
	FOREIGN KEY("ReportsTo") REFERENCES "Employee" ("EmployeeId")
)

/*
3 rows from Employee table:
EmployeeId	LastName	FirstName	Title	ReportsTo	BirthDate	HireDate	Address	City	State	Country	PostalCode	Phone	Fax	Email
1	Adams	Andrew	General Manager	None	1962-02-18 00:00:00	2002-08-14 00:00:00	11120 Jasper Ave NW	Edmonton	AB	Canada	T5K 2N1	+1 (780) 428-9482	+1 (780) 428-3457	andrew@chinookcorp.com
2	Edwards	Nancy	Sales Manager	1	1958-12-08 00:00:00	2002-05-01 00:00:00	825 8 Ave SW	Calgary	AB	Canada	T2P 2T3	+1 (403) 262-3443	+1 (403) 262-3322	nancy@chinookcorp.com
3	Peacock	Jane	Sales Support Agent	2	1973-08-29 00:00:00	2002-04-01 00:00:00	1111 6 Ave SW	Calgary	AB	Canada	T2P 5M5	+1 (403) 262-3443	+1 (403) 262-6712	jane@chinookcorp.com
*/


CREATE TABLE "Genre" (
	"GenreId" INTEGER NOT NULL,
	"Name" NVARCHAR(120),
	PRIMARY KEY ("GenreId")
)

/*
3 rows from Genre table:
GenreId	Name
1	Rock
2	Jazz
3	Metal
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
*/


CREATE TABLE "InvoiceLine" (
	"InvoiceLineId" INTEGER NOT NULL,
	"InvoiceId" INTEGER NOT NULL,
	"TrackId" INTEGER NOT NULL,
	"UnitPrice" NUMERIC(10, 2) NOT NULL,
	"Quantity" INTEGER NOT NULL,
	PRIMARY KEY ("InvoiceLineId"),
	FOREIGN KEY("TrackId") REFERENCES "Track" ("TrackId"),
	FOREIGN KEY("InvoiceId") REFERENCES "Invoice" ("InvoiceId")
)

/*
3 rows from InvoiceLine table:
InvoiceLineId	InvoiceId	TrackId	UnitPrice	Quantity
1	1	2	0.99	1
2	1	4	0.99	1
3	2	6	0.99	1
*/


CREATE TABLE "MediaType" (
	"MediaTypeId" INTEGER NOT NULL,
	"Name" NVARCHAR(120),
	PRIMARY KEY ("MediaTypeId")
)

/*
3 rows from MediaType table:
MediaTypeId	Name
1	MPEG audio file
2	Protected AAC audio file
3	Protected MPEG-4 video file
*/


CREATE TABLE "Playlist" (
	"PlaylistId" INTEGER NOT NULL,
	"Name" NVARCHAR(120),
	PRIMARY KEY ("PlaylistId")
)

/*
3 rows from Playlist table:
PlaylistId	Name
1	Music
2	Movies
3	TV Shows
*/


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
*/


CREATE TABLE "Track" (
	"TrackId" INTEGER NOT NULL,
	"Name" NVARCHAR(200) NOT NULL,
	"AlbumId" INTEGER,
	"MediaTypeId" INTEGER NOT NULL,
	"GenreId" INTEGER,
	"Composer" NVARCHAR(220),
	"Milliseconds" INTEGER NOT NULL,
	"Bytes" INTEGER,
	"UnitPrice" NUMERIC(10, 2) NOT NULL,
	PRIMARY KEY ("TrackId"),
	FOREIGN KEY("MediaTypeId") REFERENCES "MediaType" ("MediaTypeId"),
	FOREIGN KEY("GenreId") REFERENCES "Genre" ("GenreId"),
	FOREIGN KEY("AlbumId") REFERENCES "Album" ("AlbumId")
)

/*
3 rows from Track table:
TrackId	Name	AlbumId	MediaTypeId	GenreId	Composer	Milliseconds	Bytes	UnitPrice
1	For Those About To Rock (We Salute You)	1	1	1	Angus Young, Malcolm Young, Brian Johnson	343719	11170334	0.99
2	Balls to the Wall	2	2	1	None	342562	5510424	0.99
3	Fast As a Shark	3	2	1	F. Baltes, S. Kaufman, U. Dirkscneider & W. Hoffman	230619	3990994	0.99
*/
```

테이블이 너무 많거나 넓지 않은 경우 프롬프트에 이 정보 전체를 삽입할 수 있습니다.:

```python
prompt_with_context = chain.get_prompts()[0].partial(table_info=context["table_info"])
print(prompt_with_context.pretty_repr()[:1500])
```

```output
당신은 SQLite 전문가입니다. 입력 질문이 주어지면 먼저 실행할 구문적으로 올바른 SQLite 쿼리를 만든 다음 쿼리 결과를 보고 입력 질문에 대한 답을 반환합니다.
사용자가 질문에서 얻을 수 있는 특정 수의 예제를 지정하지 않는 한 SQLite에 따라 LIMIT 절을 사용하여 최대 5개의 결과를 쿼리합니다. 데이터베이스에서 가장 유용한 데이터를 반환하도록 결과를 정렬할 수 있습니다.
테이블의 모든 열을 쿼리하지 마세요. 질문에 대답하는 데 필요한 열만 쿼리해야 합니다. 각 열 이름을 큰따옴표(")로 묶어 구분 식별자로 표시합니다.
아래 표에 표시된 열 이름만 사용하도록 주의하세요. 존재하지 않는 열을 쿼리하지 않도록 주의하세요. 또한 어떤 테이블에 어떤 열이 있는지 주의하세요.
질문에 "오늘"이 포함된 경우 현재 날짜를 얻으려면 date('now') 함수를 사용하세요.

다음 형식을 사용하십시오.:

Question: Question here
SQLQuery: SQL Query to run
SQLResult: Result of the SQLQuery
Answer: Final answer here

Only use the following tables:

CREATE TABLE "Album" (
	"AlbumId" INTEGER NOT NULL,
	"Title" NVARCHAR(160) NOT NULL,
	"ArtistId" INTEGER NOT NULL,
	PRIMARY KEY ("AlbumId"),
	FOREIGN KEY("ArtistId") REFERENCES "Artist" ("ArtistId")
)

/*
3 rows from Album table:
AlbumId	Title	ArtistId
1	For Those About To Rock We Salute You	1
2	Balls to the Wall	2
3	Restless and Wild	2
*/


CREATE TABLE "Artist" (
	"ArtistId" INTEGER NOT NULL,
	"Name" NVARCHAR(120)
```

우리가 모델의 컨텍스트 윈도우에 맞지 않게 너무 큰 데이터베이스 스키마를 가지고 있을 때는, 사용자 입력에 따라 프롬프트에 관련된 테이블 정의만 삽입하는 방법을 찾아야 합니다. 자세한 내용은 [여러 테이블, 넓은 테이블, 높은 카디널리티 기능](/docs/use_cases/sql/large_db) 가이드를 참조하세요.

## 몇 가지 예시

프롬프트에 자연어 질문을 데이터베이스에 대한 유효한 SQL 쿼리로 변환하는 예를 포함하면, 특히 복잡한 쿼리의 경우 모델 성능이 향상될 수 있습니다.

다음과 같은 예시가 있다고 가정해봅시다:

```python
examples = [
    {"input": "모든 아티스트를 나열하세요.", "query": "SELECT * FROM Artist;"},
    {
        "input": "아티스트 'AC/DC'의 모든 앨범을 찾으세요.",
        "query": "SELECT * FROM Album WHERE ArtistId = (SELECT ArtistId FROM Artist WHERE Name = 'AC/DC');",
    },
    {
        "input": "'Rock' 장르의 모든 트랙을 나열하세요.",
        "query": "SELECT * FROM Track WHERE GenreId = (SELECT GenreId FROM Genre WHERE Name = 'Rock');",
    },
    {
        "input": "모든 트랙의 총 지속 시간을 찾으세요.",
        "query": "SELECT SUM(Milliseconds) FROM Track;",
    },
    {
        "input": "캐나다의 모든 고객을 나열하세요.",
        "query": "SELECT * FROM Customer WHERE Country = 'Canada';",
    },
    {
        "input": "ID가 5인 앨범에는 몇 개의 트랙이 있나요?",
        "query": "SELECT COUNT(*) FROM Track WHERE AlbumId = 5;",
    },
    {
        "input": "총 인보이스 수는 몇 개입니까?",
        "query": "SELECT COUNT(*) FROM Invoice;",
    },
    {
        "input": "5분 이상 긴 모든 트랙을 나열하세요.",
        "query": "SELECT * FROM Track WHERE Milliseconds > 300000;",
    },
    {
        "input": "총 구매액이 가장 많은 상위 5명의 고객은 누구입니까?",
        "query": "SELECT CustomerId, SUM(Total) AS TotalPurchase FROM Invoice GROUP BY CustomerId ORDER BY TotalPurchase DESC LIMIT 5;",
    },
    {
        "input": "어떤 앨범이 2000년에 출시되었나요?",
        "query": "SELECT * FROM Album WHERE strftime('%Y', ReleaseDate) = '2000';",
    },
    {
        "input": "직원이 몇 명입니까?",
        "query": 'SELECT COUNT(*) FROM "Employee"',
    },
]
```

이 예시들을 사용하여 다음과 같이 몇 가지 예시 프롬프트를 만들 수 있습니다:

```python
from langchain_core.prompts import FewShotPromptTemplate, PromptTemplate

example_prompt = PromptTemplate.from_template("사용자 입력: {input}\nSQL 쿼리: {query}")
prompt = FewShotPromptTemplate(
    examples=examples[:5],
    example_prompt=example_prompt,
    prefix="당신은 SQLite 전문가입니다. 입력된 질문에 맞는 구문적으로 올바른 SQLite 쿼리를 작성하세요. 별도로 지정되지 않은 경우, {top_k}개의 행 이상 반환하지 마세요.\n\n여기에 관련된 테이블 정보가 있습니다: {table_info}\n\n아래는 질문과 해당 SQL 쿼리의 몇 가지 예입니다.",
    suffix="사용자 입력: {input}\nSQL 쿼리: ",
    input_variables=["input", "top_k", "table_info"],
)
```

```python
print(prompt.format(input="아티스트가 몇 명인가요?", top_k=3, table_info="foo"))
```

```output
당신은 SQLite 전문가입니다. 입력된 질문에 맞는 구문적으로 올바른 SQLite 쿼리를 작성하세요. 별도로 지정되지 않은 경우, 3개의 행 이상 반환하지 마세요.

여기에 관련된 테이블 정보가 있습니다: foo

아래는 질문과 해당 SQL 쿼리의 몇 가지 예입니다.

사용자 입력: 모든 아티스트를 나열하세요.
SQL 쿼리: SELECT * FROM Artist;

사용자 입력: 아티스트 'AC/DC'의 모든 앨범을 찾으세요.
SQL 쿼리: SELECT * FROM Album WHERE ArtistId = (SELECT ArtistId FROM Artist WHERE Name = 'AC/DC');

사용자 입력: 'Rock' 장르의 모든 트랙을 나열하세요.
SQL 쿼리: SELECT * FROM Track WHERE GenreId = (SELECT GenreId FROM Genre WHERE Name = 'Rock');

사용자 입력: 모든 트랙의 총 지속 시간을 찾으세요.
SQL 쿼리: SELECT SUM(Milliseconds) FROM Track;

사용자 입력: 캐나다의 모든 고객을 나열하세요.
SQL 쿼리: SELECT * FROM Customer WHERE Country = 'Canada';

사용자 입력: 아티스트가 몇 명인가요?
SQL 쿼리:
```

## 동적 몇 가지 예시

충분한 예시가 있다면, 모델의 컨텍스트 윈도우에 맞지 않거나 긴 예시 목록이 모델을 혼란스럽게 하는 경우, 프롬프트에 가장 관련성이 높은 예시만 포함하고 싶을 수 있습니다. 특히 주어진 입력에 대해 가장 관련성 높은 예시를 포함하고 싶습니다.

이를 위해 ExampleSelector를 사용할 수 있습니다. 여기서는 [SemanticSimilarityExampleSelector](https://api.python.langchain.com/en/latest/example_selectors/langchain_core.example_selectors.semantic_similarity.SemanticSimilarityExampleSelector.html)를 사용하여 선택한 벡터 데이터베이스에 예시를 저장하고, 런타임에 입력과 예시 간 유사도 검색을 수행하여 가장 의미상 유사한 예시를 반환합니다:

```python
from langchain_community.vectorstores import FAISS
from langchain_core.example_selectors import SemanticSimilarityExampleSelector
from langchain_openai import OpenAIEmbeddings

example_selector = SemanticSimilarityExampleSelector.from_examples(
    examples,
    OpenAIEmbeddings(),
    FAISS,
    k=5,
    input_keys=["input"],
)
```

```python
example_selector.select_examples({"input": "아티스트가 몇 명인가요?"})
```

```output
[{'input': '모든 아티스트를 나열하세요.', 'query': 'SELECT * FROM Artist;'},
 {'input': '직원이 몇 명입니까', 'query': 'SELECT COUNT(*) FROM "Employee"'},
 {'input': 'ID가 5인 앨범에는 몇 개의 트랙이 있나요?', 'query': 'SELECT COUNT(*) FROM Track WHERE AlbumId = 5;'},
 {'input': '어떤 앨범이 2000년에 출시되었나요?', 'query': "SELECT * FROM Album WHERE strftime('%Y', ReleaseDate) = '2000';"},
 {'input': "'Rock' 장르의 모든 트랙을 나열하세요.", 'query': "SELECT * FROM Track WHERE GenreId = (SELECT GenreId FROM Genre WHERE Name = 'Rock');"}]
```

이를 사용하려면 ExampleSelector를 FewShotPromptTemplate에 직접 전달할 수 있습니다:

```python
prompt = FewShotPromptTemplate(
    example_selector=example_selector,
    example_prompt=example_prompt,
    prefix="당신은 SQLite 전문가입니다. 입력된 질문에 맞는 구문적으로 올바른 SQLite 쿼리를 작성하세요. 별도로 지정되지 않은 경우, {top_k}개의 행 이상 반환하지 마세요.\n\n여기에 관련된 테이블 정보가 있습니다: {table_info}\n\n아래는 질문과 해당 SQL 쿼리의 몇 가지 예입니다.",
    suffix="사용자 입력: {input}\nSQL 쿼리: ",
    input_variables=["input", "top_k", "table_info"],
)
```

```python
print(prompt.format(input="아티스트가 몇 명인가요?", top_k=3, table_info="foo"))
```

```output
당신은 SQLite 전문가입니다. 입력된 질문에 맞는 구문적으로 올바른 SQLite 쿼리를 작성하세요. 별도로 지정되지 않은 경우, 3개의 행 이상 반환하지 마세요.

여기에 관련된 테이블 정보가 있습니다: foo

아래는 질문과 해당 SQL 쿼리의 몇 가지 예입니다.

사용자 입력: 모든 아티스트를 나열하세요.
SQL 쿼리: SELECT * FROM Artist;

사용자 입력: 직원이 몇 명입니까
SQL 쿼리: SELECT COUNT(*) FROM "Employee"

사용자 입력: ID가 5인 앨범에는 몇 개의 트랙이 있나요?
SQL 쿼리: SELECT COUNT(*) FROM Track WHERE AlbumId = 5;

사용자 입력: 어떤 앨범이 2000년에 출시되었나요?
SQL 쿼리: SELECT * FROM Album WHERE strftime('%Y', ReleaseDate) = '2000';

사용자 입력: 'Rock' 장르의 모든 트랙을 나열하세요.
SQL 쿼리: SELECT * FROM Track WHERE GenreId = (SELECT GenreId FROM Genre WHERE Name = 'Rock');

사용자 입력: 아티스트가 몇 명인가요?
SQL 쿼리:
```

```python
chain = create_sql_query_chain(llm, db, prompt)
chain.invoke({"question": "아티스트가 몇 명인가요?"})
```

```output
'SELECT COUNT(*) FROM Artist;'
```