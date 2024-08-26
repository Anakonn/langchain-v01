---
sidebar_position: 0
translated: true
---

# 빠른 시작

이 가이드에서는 SQL 데이터베이스에서 Q&A 체인과 에이전트를 만드는 기본 방법에 대해 설명합니다. 이러한 시스템을 통해 SQL 데이터베이스의 데이터에 대한 질문을 하고 자연어로 답변을 받을 수 있습니다. 두 시스템의 주요 차이점은 에이전트는 질문에 답하기 위해 필요할 만큼 여러 번 데이터베이스를 조회할 수 있다는 점입니다.

## ⚠️ 보안 주의 ⚠️

SQL 데이터베이스의 Q&A 시스템을 구축하려면 모델이 생성한 SQL 쿼리를 실행해야 합니다. 이를 수행하는 데는 본질적인 위험이 따릅니다. 데이터베이스 연결 권한을 체인/에이전트의 필요에 따라 최대한 좁게 설정하여 이러한 위험을 완화하세요. 일반적인 보안 모범 사례에 대한 자세한 내용은 [여기](https://docs.security)를 참조하세요.

## 아키텍처

고수준에서 SQL 체인 및 에이전트의 단계는 다음과 같습니다:

1. **질문을 SQL 쿼리로 변환**: 모델이 사용자 입력을 SQL 쿼리로 변환합니다.
2. **SQL 쿼리 실행**: SQL 쿼리를 실행합니다.
3. **질문에 답변**: 모델이 쿼리 결과를 사용하여 사용자 입력에 응답합니다.

![sql_usecase.png](../../../../../../static/img/sql_usecase.png)

## 설정

먼저, 필요한 패키지를 설치하고 환경 변수를 설정합니다:

```python
%pip install --upgrade --quiet langchain langchain-community langchain-openai
```

이 가이드에서는 OpenAI 모델을 사용할 것입니다.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()

# 아래 주석을 해제하여 LangSmith를 사용하세요. 필수는 아닙니다.

# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()

# os.environ["LANGCHAIN_TRACING_V2"] = "true"

```

아래 예제는 Chinook 데이터베이스가 있는 SQLite 연결을 사용합니다. [이 설치 단계](https://database.guide/2-sample-databases-sqlite/)를 따라 `Chinook.db`를 이 노트북과 동일한 디렉토리에 만듭니다:

- [이 파일](https://raw.githubusercontent.com/lerocha/chinook-database/master/ChinookDatabase/DataSources/Chinook_Sqlite.sql)을 `Chinook_Sqlite.sql`로 저장합니다.
- `sqlite3 Chinook.db`를 실행합니다.
- `.read Chinook_Sqlite.sql`를 실행합니다.
- `SELECT * FROM Artist LIMIT 10;`로 테스트합니다.

이제 `Chinhook.db`가 디렉토리에 있고 SQLAlchemy 기반의 `SQLDatabase` 클래스를 사용하여 인터페이스 할 수 있습니다:

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

좋아요! 이제 쿼리를 실행할 수 있는 SQL 데이터베이스가 준비되었습니다. 이제 LLM에 연결해 보겠습니다.

## 체인

질문을 받아 SQL 쿼리로 변환하고, 쿼리를 실행하며, 결과를 사용하여 원래 질문에 답하는 간단한 체인을 만들어 보겠습니다.

### 질문을 SQL 쿼리로 변환

SQL 체인 또는 에이전트의 첫 번째 단계는 사용자 입력을 받아 SQL 쿼리로 변환하는 것입니다. LangChain에는 이를 위한 내장 체인이 있습니다: [create_sql_query_chain](https://api.python.langchain.com/en/latest/chains/langchain.chains.sql_database.query.create_sql_query_chain.html).

```python
from langchain.chains import create_sql_query_chain
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
chain = create_sql_query_chain(llm, db)
response = chain.invoke({"question": "직원이 몇 명인가요?"})
response
```

```output
'SELECT COUNT(*) FROM Employee'
```

쿼리가 유효한지 확인하기 위해 실행할 수 있습니다:

```python
db.run(response)
```

```output
'[(8,)]'
```

[LangSmith 추적](https://smith.langchain.com/public/c8fa52ea-be46-4829-bde2-52894970b830/r)을 통해 이 체인이 무엇을 하는지 더 잘 이해할 수 있습니다. 체인의 프롬프트를 직접 검사할 수도 있습니다. 프롬프트를 살펴보면 다음과 같습니다:

- 방언별로 구체적입니다. 이 경우 SQLite를 명시적으로 참조합니다.
- 사용 가능한 모든 테이블에 대한 정의가 포함되어 있습니다.
- 각 테이블에 대해 세 개의 예제 행이 포함되어 있습니다.

이 기술은 [이 논문](https://arxiv.org/pdf/2204.00498.pdf)과 같은 논문에서 영감을 받았으며, 예제 행을 보여주고 테이블에 대해 명시적으로 설명하는 것이 성능을 향상시킨다고 제안합니다. 전체 프롬프트를 다음과 같이 검사할 수도 있습니다:

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

### SQL 쿼리 실행

이제 SQL 쿼리를 생성했으므로 실행하고 싶습니다. **이것이 SQL 체인을 만드는 가장 위험한 부분입니다.** 데이터에 대해 자동으로 쿼리를 실행해도 괜찮은지 신중하게 고려하세요. 데이터베이스 연결 권한을 가능한 한 최소화하세요. 쿼리 실행 전에 체인에 인간 승인 단계를 추가하는 것을 고려하세요(아래 참조).

`QuerySQLDatabaseTool`을 사용하여 체인에 쿼리 실행을 쉽게 추가할 수 있습니다:

```python
from langchain_community.tools.sql_database.tool import QuerySQLDataBaseTool

execute_query = QuerySQLDataBaseTool(db=db)
write_query = create_sql_query_chain(llm, db)
chain = write_query | execute_query
chain.invoke({"question": "직원이 몇 명인가요?"})
```

```output
'[(8,)]'
```

### 질문에 답변

이제 자동으로 쿼리를 생성하고 실행할 수 있는 방법이 생겼으므로 원래 질문과 SQL 쿼리 결과를 결합하여 최종 답변을 생성하기만 하면 됩니다. 이를 위해 질문과 결과를 한 번 더 LLM에 전달할 수 있습니다:

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

chain.invoke({"question": "직원이 몇 명인가요?"})
```

```output
'There are 8 employees.'
```

### 다음 단계

더 복잡한 쿼리 생성을 위해서는 몇 가지 예시 프롬프트를 만들거나 쿼리 검사 단계를 추가하고 싶을 수 있습니다. 이러한 고급 기술과 더 많은 내용을 확인하려면 다음을 확인하세요:

- [프롬프트 전략](/docs/use_cases/sql/prompting): 고급 프롬프트 엔지니어링 기술.
- [쿼리 검사](/docs/use_cases/sql/query_checking): 쿼리 검증 및 오류 처리 추가.
- [대규모 데이터베이스](/docs/use_cases/sql/large_db): 대규모 데이터베이스 작업 기술.

## 에이전트

LangChain에는 SQL 에이전트가 있어 SQL 데이터베이스와 보다 유연하게 상호 작용할 수 있습니다. SQL 에이전트를 사용하는 주요 이점은 다음과 같습니다:

- 데이터베이스의 스키마와 내용에 기반한 질문에 답할 수 있습니다(예: 특정 테이블 설명).
- 생성된 쿼리를 실행하고 오류를 잡아내어 올바르게 다시 생성함으로써 오류에서 복구할 수 있습니다.
- 여러 종속 쿼리가 필요한 질문에 답할 수 있습니다.
- 관련 테이블의 스키마만 고려하여 토큰을 절약합니다.

에이전트를 초기화하려면 `create_sql_agent` 함수를 사용합니다. 이 에이전트에는 다음 도구를 포함하는 `SQLDatabaseToolkit`이 포함되어 있습니다:

- 쿼리 생성 및 실행
- 쿼리 구문 검사
- 테이블 설명 검색
- 기타 등등

### 에이전트 초기화

```python
from langchain_community.agent_toolkits import create_sql_agent

agent_executor = create_sql_agent(llm, db=db, agent_type="openai-tools", verbose=True)
```

```python
agent_executor.invoke(
    {
        "input": "각 국가의 총 판매액을 나열하세요. 어느 나라의 고객이 가장 많은 돈을 썼나요?"
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

sql
SELECT c.Country, SUM(i.Total) AS TotalSales
FROM Invoice i
JOIN Customer c ON i.CustomerId = c.CustomerId
GROUP BY c.Country
ORDER BY TotalSales DESC
LIMIT 10;


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
{'input': "각 국가의 총 판매액을 나열하세요. 어느 나라의 고객이 가장 많은 돈을 썼나요?",
 'output': '각 국가의 총 판매액은 다음과 같습니다:\n\n1. 미국: $523.06\n2. 캐나다: $303.96\n3. 프랑스: $195.10\n4. 브라질: $190.10\n5. 독일: $156.48\n6. 영국: $112.86\n7. 체코: $90.24\n8. 포르투갈: $77.24\n9. 인도: $75.26\n10. 칠레: $46.62\n\n두 번째 질문에 답변하자면, 고객이 가장 많은 돈을 쓴 나라는 미국으로, 총 판매액은 $523.06입니다.'}
```

```python
agent_executor.invoke({"input": "playlisttrack 테이블을 설명하세요"})
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
*/[0m[32;1m[1;3m`PlaylistTrack` 테이블에는 `PlaylistId`와 `TrackId` 두 개의 열이 있습니다. 이 테이블은 플레이리스트와 트랙 간의 다대다 관계를 나타내는 연결 테이블입니다.

다음은 `PlaylistTrack` 테이블의 스키마입니다:

CREATE TABLE "PlaylistTrack" (
"PlaylistId" INTEGER NOT NULL,
"TrackId" INTEGER NOT NULL,
PRIMARY KEY ("PlaylistId", "TrackId"),
FOREIGN KEY("TrackId") REFERENCES "Track" ("TrackId"),
FOREIGN KEY("PlaylistId") REFERENCES "Playlist" ("PlaylistId")
)

```

`PlaylistId` 열은 `Playlist` 테이블의 `PlaylistId` 열을 참조하는 외래 키입니다. `TrackId` 열은 `Track` 테이블의 `TrackId` 열을 참조하는 외래 키입니다.

다음은 `PlaylistTrack` 테이블의 세 개의 샘플 행입니다:

```

PlaylistId   TrackId
1            3402
1            3389
1            3390


다른 도움이 필요하면 말씀해 주세요.[0m

[1m> Finished chain.[0m
```

```output
{'input': 'playlisttrack 테이블을 설명하세요',
 'output': '`PlaylistTrack` 테이블에는 `PlaylistId`와 `TrackId` 두 개의 열이 있습니다. 이 테이블은 플레이리스트와 트랙 간의 다대다 관계를 나타내는 연결 테이블입니다. \n\n다음은 `PlaylistTrack` 테이블의 스키마입니다:\n\n```\nCREATE TABLE "PlaylistTrack" (\n\t"PlaylistId" INTEGER NOT NULL, \n\t"TrackId" INTEGER NOT NULL, \n\tPRIMARY KEY ("PlaylistId", "TrackId"), \n\tFOREIGN KEY("TrackId") REFERENCES "Track" ("TrackId"), \n\tFOREIGN KEY("PlaylistId") REFERENCES "Playlist" ("PlaylistId")\n)\n```\n\n`PlaylistId` 열은 `Playlist` 테이블의 `PlaylistId` 열을 참조하는 외래 키입니다. `TrackId` 열은 `Track` 테이블의 `TrackId` 열을 참조하는 외래 키입니다.\n\n다음은 `PlaylistTrack` 테이블의 세 개의 샘플 행입니다:\n\n```\nPlaylistId   TrackId\n1            3402\n1            3389\n1            3390\n```\n\n다른 도움이 필요하면 말씀해 주세요.'}
```

### 다음 단계

에이전트 사용 및 사용자 정의에 대한 자세한 내용은 [에이전트](/docs/use_cases/sql/agents) 페이지를 참조하세요.