---
translated: true
---

## sidebar_position: 1

# 에이전트

LangChain에는 체인보다 SQL 데이터베이스와 상호 작용하는 더 유연한 방법을 제공하는 SQL 에이전트가 있습니다. SQL 에이전트를 사용하는 주요 장점은 다음과 같습니다:

- 데이터베이스의 내용뿐만 아니라 스키마를 기반으로 질문에 답할 수 있습니다 (예: 특정 테이블 설명).
- 생성된 쿼리를 실행하고 추적 결과를 포착하여 올바르게 재생성함으로써 오류에서 복구할 수 있습니다.
- 사용자 질문에 답하기 위해 필요한 만큼 데이터베이스를 쿼리할 수 있습니다.
- 관련 테이블에서만 스키마를 가져와 토큰을 절약합니다.

에이전트를 초기화하려면 [create_sql_agent](https://api.python.langchain.com/en/latest/agent_toolkits/langchain_community.agent_toolkits.sql.base.create_sql_agent.html) 생성자를 사용합니다. 이 에이전트는 다음 도구가 포함된 `SQLDatabaseToolkit`을 사용합니다:

- 쿼리 생성 및 실행
- 쿼리 구문 검사
- 테이블 설명 검색
- 기타 여러 기능

## 설정

먼저 필요한 패키지를 설치하고 환경 변수를 설정합니다:

```python
%pip install --upgrade --quiet langchain langchain-community langchain-openai
```

이 가이드에서는 기본적으로 OpenAI 모델을 사용하지만, 원하는 모델 제공자로 변경할 수 있습니다.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()

# 아래 주석을 해제하면 LangSmith를 사용할 수 있습니다. 필수는 아닙니다.

# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()

# os.environ["LANGCHAIN_TRACING_V2"] = "true"

```

아래 예제에서는 Chinook 데이터베이스와 SQLite 연결을 사용합니다. [이 설치 단계](https://database.guide/2-sample-databases-sqlite/)를 따라 이 노트북과 동일한 디렉토리에 `Chinook.db`를 생성하세요:

- [이 파일](https://raw.githubusercontent.com/lerocha/chinook-database/master/ChinookDatabase/DataSources/Chinook_Sqlite.sql)을 `Chinook_Sqlite.sql`로 저장합니다.
- `sqlite3 Chinook.db`를 실행합니다.
- `.read Chinook_Sqlite.sql`을 실행합니다.
- `SELECT * FROM Artist LIMIT 10;`을 테스트합니다.

이제 `Chinhook.db`가 디렉토리에 있으며, SQLAlchemy 기반 `SQLDatabase` 클래스를 사용하여 이를 인터페이스할 수 있습니다:

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

## 에이전트

우리는 OpenAI의 함수 호출 API를 사용하여 에이전트의 도구 선택과 호출을 제어하는 OpenAI 채팅 모델과 `"openai-tools"` 에이전트를 사용할 것입니다.

보시다시피, 에이전트는 먼저 관련 테이블을 선택한 다음, 해당 테이블의 스키마와 몇 개의 샘플 행을 프롬프트에 추가합니다.

```python
from langchain_community.agent_toolkits import create_sql_agent
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
agent_executor = create_sql_agent(llm, db=db, agent_type="openai-tools", verbose=True)
```

```python
agent_executor.invoke(
    "국가별 총 판매량을 나열하세요. 어떤 국가의 고객이 가장 많이 소비했나요?"
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

    ```sql
    SELECT c.Country, SUM(i.Total) AS TotalSales
    FROM Invoice i
    JOIN Customer c ON i.CustomerId = c.CustomerId
    GROUP BY c.Country
    ORDER BY TotalSales DESC
    LIMIT 10;
    ```

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
agent_executor.invoke("Describe the playlisttrack table")
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

```

CREATE TABLE "PlaylistTrack" (
"PlaylistId" INTEGER NOT NULL,
"TrackId" INTEGER NOT NULL,
PRIMARY KEY ("PlaylistId", "TrackId"),
FOREIGN KEY("TrackId") REFERENCES "Track" ("TrackId"),
FOREIGN KEY("PlaylistId") REFERENCES "Playlist" ("PlaylistId")
)

```

The `PlaylistId` column is a foreign key referencing the `PlaylistId` column in the `Playlist` table. The `TrackId` column is a foreign key referencing the `TrackId` column in the `Track` table.

Here are three sample rows from the `PlaylistTrack` table:

```

PlaylistId TrackId
1 3402
1 3389
1 3390

```

Please let me know if there is anything else I can help with.[0m

[1m> Finished chain.[0m
```

```output
{'input': 'Describe the playlisttrack table',
 'output': 'The `PlaylistTrack` table has two columns: `PlaylistId` and `TrackId`. It is a junction table that represents the many-to-many relationship between playlists and tracks. \n\nHere is the schema of the `PlaylistTrack` table:\n\n```\nCREATE TABLE "PlaylistTrack" (\n\t"PlaylistId" INTEGER NOT NULL, \n\t"TrackId" INTEGER NOT NULL, \n\tPRIMARY KEY ("PlaylistId", "TrackId"), \n\tFOREIGN KEY("TrackId") REFERENCES "Track" ("TrackId"), \n\tFOREIGN KEY("PlaylistId") REFERENCES "Playlist" ("PlaylistId")\n)\n```\n\nThe `PlaylistId` column is a foreign key referencing the `PlaylistId` column in the `Playlist` table. The `TrackId` column is a foreign key referencing the `TrackId` column in the `Track` table.\n\nHere are three sample rows from the `PlaylistTrack` table:\n\n```\nPlaylistId   TrackId\n1            3402\n1            3389\n1            3390\n```\n\nPlease let me know if there is anything else I can help with.'}
```

## 동적 few-shot 프롬프트 사용하기

에이전트 성능을 최적화하기 위해, 도메인별 지식이 포함된 맞춤 프롬프트를 제공할 수 있습니다. 이번에는 사용자 입력에 따라 동적으로 few-shot 프롬프트를 생성하는 예제 선택기와 함께 few-shot 프롬프트를 만들어 보겠습니다. 이는 모델이 참고할 수 있는 관련 쿼리를 프롬프트에 삽입하여 더 나은 쿼리를 생성하는 데 도움이 됩니다.

먼저 사용자 입력 \<\> SQL 쿼리 예제가 필요합니다:

```python
examples = [
    {"input": "모든 아티스트 목록을 나열하세요.", "query": "SELECT * FROM Artist;"},
    {
        "input": "아티스트 'AC/DC'의 모든 앨범을 찾으세요.",
        "query": "SELECT * FROM Album WHERE ArtistId = (SELECT ArtistId FROM Artist WHERE Name = 'AC/DC');",
    },
    {
        "input": "'Rock' 장르의 모든 트랙을 나열하세요.",
        "query": "SELECT * FROM Track WHERE GenreId = (SELECT GenreId FROM Genre WHERE Name = 'Rock');",
    },
    {
        "input": "모든 트랙의 총 재생 시간을 찾으세요.",
        "query": "SELECT SUM(Milliseconds) FROM Track;",
    },
    {
        "input": "캐나다 출신의 모든 고객을 나열하세요.",
        "query": "SELECT * FROM Customer WHERE Country = 'Canada';",
    },
    {
        "input": "ID가 5인 앨범에 몇 개의 트랙이 있나요?",
        "query": "SELECT COUNT(*) FROM Track WHERE AlbumId = 5;",
    },
    {
        "input": "총 인보이스 수를 찾으세요.",
        "query": "SELECT COUNT(*) FROM Invoice;",
    },
    {
        "input": "5분 이상인 모든 트랙을 나열하세요.",
        "query": "SELECT * FROM Track WHERE Milliseconds > 300000;",
    },
    {
        "input": "총 구매 금액 기준 상위 5명의 고객은 누구인가요?",
        "query": "SELECT CustomerId, SUM(Total) AS TotalPurchase FROM Invoice GROUP BY CustomerId ORDER BY TotalPurchase DESC LIMIT 5;",
    },
    {
        "input": "2000년에 발매된 앨범은 무엇인가요?",
        "query": "SELECT * FROM Album WHERE strftime('%Y', ReleaseDate) = '2000';",
    },
    {
        "input": "직원 수가 몇 명인가요?",
        "query": 'SELECT COUNT(*) FROM "Employee"',
    },
]
```

이제 예제 선택기를 만들 수 있습니다. 이는 실제 사용자 입력을 받아 few-shot 프롬프트에 추가할 예제들을 선택합니다. SemanticSimilarityExampleSelector를 사용하여 임베딩 및 벡터 저장소를 구성하고 입력과 가장 유사한 예제들을 찾기 위해 의미론적 검색을 수행합니다:

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

이제 예제 선택기, 각 예제를 포맷팅하는 예제 프롬프트, 포맷팅된 예제 앞뒤에 넣을 문자열 접두사와 접미사를 사용하는 FewShotPromptTemplate을 만들 수 있습니다:

```python
from langchain_core.prompts import (
    ChatPromptTemplate,
    FewShotPromptTemplate,
    MessagesPlaceholder,
    PromptTemplate,
    SystemMessagePromptTemplate,
)

system_prefix = """당신은 SQL 데이터베이스와 상호 작용하도록 설계된 에이전트입니다.
입력 질문에 맞는 문법적으로 올바른 {dialect} 쿼리를 작성한 다음 쿼리 결과를 보고 답을 반환하세요.
사용자가 원하는 예제 수를 지정하지 않는 한, 항상 쿼리 결과를 최대 {top_k}개의 결과로 제한하세요.
가장 흥미로운 예제를 반환하기 위해 관련 열을 기준으로 결과를 정렬할 수 있습니다.
특정 테이블에서 모든 열을 쿼리하지 말고 질문에 맞는 관련 열만 요청하세요.
데이터베이스와 상호 작용할 수 있는 도구에 접근할 수 있습니다.
주어진 도구만 사용하세요. 최종 답변을 구성할 때는 도구에서 반환된 정보만 사용하세요.
쿼리를 실행하기 전에 반드시 쿼리를 두 번 확인해야 합니다. 쿼리 실행 중 오류가 발생하면 쿼리를 다시 작성하고 다시 시도하세요.

데이터베이스에 DML 문(INSERT, UPDATE, DELETE, DROP 등)을 절대 작성하지 마세요.

질문이 데이터베이스와 관련이 없어 보이면 "모르겠습니다"라는 답을 반환하세요.

다음은 사용자 입력과 해당 SQL 쿼리의 예입니다:"""

few_shot_prompt = FewShotPromptTemplate(
    example_selector=example_selector,
    example_prompt=PromptTemplate.from_template(
        "사용자 입력: {input}\nSQL 쿼리: {query}"
    ),
    input_variables=["input", "dialect", "top_k"],
    prefix=system_prefix,
    suffix="",
)
```

기본 에이전트는 OpenAI 기능 호출을 사용하는 [OpenAI 도구 에이전트](/docs/modules/agents/agent_types/openai_tools)이므로 전체 프롬프트는 인간 메시지 템플릿과 agent_scratchpad `MessagesPlaceholder`가 있는 채팅 프롬프트여야 합니다. few-shot 프롬프트는 시스템 메시지에 사용됩니다:

```python
full_prompt = ChatPromptTemplate.from_messages(
    [
        SystemMessagePromptTemplate(prompt=few_shot_prompt),
        ("human", "{input}"),
        MessagesPlaceholder("agent_scratchpad"),
    ]
)
```

```python
# 예제 포맷팅된 프롬프트

prompt_val = full_prompt.invoke(
    {
        "input": "예술가가 몇 명인가요",
        "top_k": 5,
        "dialect": "SQLite",
        "agent_scratchpad": [],
    }
)
print(prompt_val.to_string())
```

```output
System: 당신은 SQL 데이터베이스와 상호 작용하도록 설계된 에이전트입니다.
입력 질문에 맞는 문법적으로 올바른 SQLite 쿼리를 작성한 다음 쿼리 결과를 보고 답을 반환하세요.
사용자가 원하는 예제 수를 지정하지 않는 한, 항상 쿼리 결과를 최대 5개의 결과로 제한하세요.
가장 흥미로운 예제를 반환하기 위해 관련 열을 기준으로 결과를 정렬할 수 있습니다.
특정 테이블에서 모든 열을 쿼리하지 말고 질문에 맞는 관련 열만 요청하세요.
데이터베이스와 상호 작용할 수 있는 도구에 접근할 수 있습니다.
주어진 도구만 사용하세요. 최종 답변을 구성할 때는 도구에서 반환된 정보만 사용하세요.
쿼리를 실행하기 전에 반드시 쿼리를 두 번 확인해야 합니다. 쿼리 실행 중 오류가 발생하면 쿼리를 다시 작성하고 다시 시도하세요.

데이터베이스에 DML 문(INSERT, UPDATE, DELETE, DROP 등)을 절대 작성하지 마세요.

질문이 데이터베이스와 관련이 없어 보이면 "모르겠습니다"라는 답을 반환하세요.

다음은 사용자 입력과 해당 SQL 쿼리의 예입니다:

사용자 입력: 모든 아티스트 목록을 나열하세요.
SQL 쿼리: SELECT * FROM Artist;

사용자 입력: 직원 수가 몇 명인가요
SQL 쿼리: SELECT COUNT(*) FROM "Employee"

사용자 입력: ID가 5인 앨범에 몇 개의 트랙이 있나요?
SQL 쿼리: SELECT COUNT(*) FROM Track WHERE AlbumId = 5;

사용자 입력: 'Rock' 장르의 모든 트랙을 나열하세요.
SQL 쿼리: SELECT * FROM Track WHERE GenreId = (SELECT GenreId FROM Genre WHERE Name = 'Rock');

사용자 입력: 2000년에 발매된 앨범은 무엇인가요?
SQL 쿼리: SELECT * FROM Album WHERE strftime('%Y', ReleaseDate) = '2000';
Human: 예술가가 몇 명인가요
```

이제 맞춤 프롬프트를 사용하여 에이전트를 생성할 수 있습니다:

```python
agent = create_sql_agent(
    llm=llm,
    db=db,
    prompt=full_prompt,
    verbose=True,
    agent_type="openai-tools",
)
```

시험해 보겠습니다:

```python
agent.invoke({"input": "How many artists are there?"})
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `sql_db_query` with `{'query': 'SELECT COUNT(*) FROM Artist'}`


[0m[36;1m[1;3m[(275,)][0m[32;1m[1;3mThere are 275 artists in the database.[0m

[1m> Finished chain.[0m
```

```output
{'input': 'How many artists are there?',
 'output': 'There are 275 artists in the database.'}
```

## 고카디널리티 열 처리

주소, 곡명 또는 아티스트와 같은 고유 명사가 포함된 열을 필터링하려면, 데이터를 올바르게 필터링하기 위해 먼저 철자를 두 번 확인해야 합니다.

이를 위해 데이터베이스에 존재하는 모든 고유 명사로 벡터 저장소를 생성할 수 있습니다. 그런 다음 에이전트가 사용자의 질문에 고유 명사가 포함될 때마다 벡터 저장소를 쿼리하여 해당 단어의 올바른 철자를 찾을 수 있습니다. 이렇게 하면 에이전트가 사용자가 참조하는 엔티티를 이해한 다음 대상 쿼리를 작성할 수 있습니다.

먼저 원하는 각 엔티티에 대한 고유 값을 가져와야 하며, 이를 위해 결과를 요소 목록으로 파싱하는 함수를 정의합니다:

```python
import ast
import re


def query_as_list(db, query):
    res = db.run(query)
    res = [el for sub in ast.literal_eval(res) for el in sub if el]
    res = [re.sub(r"\b\d+\b", "", string).strip() for string in res]
    return list(set(res))


artists = query_as_list(db, "SELECT Name FROM Artist")
albums = query_as_list(db, "SELECT Title FROM Album")
albums[:5]
```

```output
['Os Cães Ladram Mas A Caravana Não Pára',
 'War',
 'Mais Do Mesmo',
 "Up An' Atom",
 'Riot Act']
```

이제 맞춤 **retriever 도구**와 최종 에이전트를 생성할 수 있습니다:

```python
from langchain.agents.agent_toolkits import create_retriever_tool

vector_db = FAISS.from_texts(artists + albums, OpenAIEmbeddings())
retriever = vector_db.as_retriever(search_kwargs={"k": 5})
description = """고유 명사 값을 조회하는 데 사용하세요. 입력은 고유 명사의 대략적인 철자이며, 출력은 유효한 고유 명사입니다. 검색과 가장 유사한 명사를 사용하세요."""
retriever_tool = create_retriever_tool(
    retriever,
    name="search_proper_nouns",
    description=description,
)
```

```python
system = """당신은 SQL 데이터베이스와 상호 작용하도록 설계된 에이전트입니다.
입력 질문에 맞는 문법적으로 올바른 {dialect} 쿼리를 작성한 다음 쿼리 결과를 보고 답을 반환하세요.
사용자가 원하는 예제 수를 지정하지 않는 한, 항상 쿼리 결과를 최대 {top_k}개의 결과로 제한하세요.
가장 흥미로운 예제를 반환하기 위해 관련 열을 기준으로 결과를 정렬할 수 있습니다.
특정 테이블에서 모든 열을 쿼리하지 말고 질문에 맞는 관련 열만 요청하세요.
데이터베이스와 상호 작용할 수 있는 도구에 접근할 수 있습니다.
주어진 도구만 사용하세요. 최종 답변을 구성할 때는 도구에서 반환된 정보만 사용하세요.
쿼리를 실행하기 전에 반드시 쿼리를 두 번 확인해야 합니다. 쿼리 실행 중 오류가 발생하면 쿼리를 다시 작성하고 다시 시도하세요.

데이터베이스에 DML 문(INSERT, UPDATE, DELETE, DROP 등)을 절대 작성하지 마세요.

고유 명사로 필터링해야 하는 경우, 항상 먼저 "search_proper_nouns" 도구를 사용하여 필터 값을 조회해야 합니다!

다음 테이블에 접근할 수 있습니다: {table_names}

질문이 데이터베이스와 관련이 없어 보이면 "모르겠습니다"라는 답을 반환하세요."""

prompt = ChatPromptTemplate.from_messages(
    [("system", system), ("human", "{input}"), MessagesPlaceholder("agent_scratchpad")]
)
agent = create_sql_agent(
    llm=llm,
    db=db,
    extra_tools=[retriever_tool],
    prompt=prompt,
    agent_type="openai-tools",
    verbose=True,
)
```

```python
agent.invoke({"input": "How many albums does alis in chain have?"})
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `search_proper_nouns` with `{'query': 'alis in chain'}`


[0m[36;1m[1;3mAlice In Chains

Aisha Duo

Xis

Da Lama Ao Caos

A-Sides[0m[32;1m[1;3m
Invoking: `sql_db_query` with `SELECT COUNT(*) FROM Album WHERE ArtistId = (SELECT ArtistId FROM Artist WHERE Name = 'Alice In Chains')`


[0m[36;1m[1;3m[(1,)][0m[32;1m[1;3mAlice In Chains has 1 album.[0m

[1m> Finished chain.[0m
```

```output
{'input': 'How many albums does alis in chain have?',
 'output': 'Alice In Chains has 1 album.'}
```

위에서 볼 수 있듯이 에이전트는 `search_proper_nouns` 도구를 사용하여 특정 아티스트에 대해 데이터베이스를 올바르게 쿼리하는 방법을 확인했습니다.

## 다음 단계

내부적으로 `create_sql_agent`는 더 일반적인 에이전트 생성자에 SQL 도구를 전달하고 있습니다. 내장된 일반 에이전트 유형 및 사용자 지정 에이전트 생성 방법에 대해 자세히 알아보려면 [에이전트 모듈](/docs/modules/agents/)로 이동하세요.

내장된 `AgentExecutor`는 간단한 에이전트 작업 -> 도구 호출 -> 에이전트 작업... 루프를 실행합니다. 더 복잡한 에이전트 런타임을 빌드하려면 [LangGraph 섹션](/docs/langgraph)으로 이동하세요.