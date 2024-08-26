---
sidebar_position: 3
translated: true
---

# 쿼리 검증

SQL 체인이나 에이전트에서 가장 오류가 발생하기 쉬운 부분은 유효하고 안전한 SQL 쿼리를 작성하는 것입니다. 이 가이드에서는 쿼리를 검증하고 잘못된 쿼리를 처리하는 몇 가지 전략에 대해 다룹니다.

## 설정

먼저, 필요한 패키지를 설치하고 환경 변수를 설정합니다:

```python
%pip install --upgrade --quiet langchain langchain-community langchain-openai
```

이 가이드에서는 기본적으로 OpenAI 모델을 사용하지만, 원하는 모델 제공자로 교체할 수 있습니다.

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

## 쿼리 검사기

가장 간단한 전략은 모델 자체에 원래 쿼리의 일반적인 오류를 검사하도록 요청하는 것입니다. 다음과 같은 SQL 쿼리 체인이 있다고 가정해봅시다:

```python
from langchain.chains import create_sql_query_chain
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
chain = create_sql_query_chain(llm, db)
```

그리고 우리는 그 출력을 검증하고 싶습니다. 두 번째 프롬프트와 모델 호출을 통해 체인을 확장하여 이를 수행할 수 있습니다:

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

system = """사용자의 {dialect} 쿼리에 대해 다음과 같은 일반적인 실수를 다시 확인하세요:
- NULL 값과 함께 NOT IN 사용
- UNION ALL을 사용해야 할 때 UNION 사용
- 배타적 범위에 BETWEEN 사용
- 술어에서 데이터 유형 불일치
- 식별자를 올바르게 인용
- 함수에 대한 올바른 인수 수 사용
- 올바른 데이터 유형으로 캐스팅
- 조인을 위한 적절한 열 사용

위의 실수가 있으면 쿼리를 수정하세요. 실수가 없으면 원래 쿼리를 그대로 출력하세요.

최종 SQL 쿼리만 출력하세요."""
prompt = ChatPromptTemplate.from_messages(
    [("system", system), ("human", "{query}")]
).partial(dialect=db.dialect)
validation_chain = prompt | llm | StrOutputParser()

full_chain = {"query": chain} | validation_chain
```

```python
query = full_chain.invoke(
    {
        "question": "2003년부터 2010년까지 팩스가 없는 미국 고객의 평균 인보이스는 얼마인가요?"
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

이 접근 방식의 명백한 단점은 쿼리를 생성하기 위해 두 번의 모델 호출이 필요하다는 것입니다. 이를 해결하기 위해 쿼리 생성과 쿼리 검사를 한 번의 모델 호출로 수행할 수 있습니다:

```python
system = """당신은 {dialect} 전문가입니다. 주어진 입력 질문에 대해 구문적으로 올바른 {dialect} 쿼리를 작성하세요.
사용자가 특정 예제 수를 얻도록 질문하지 않는 한, {dialect}에 따라 LIMIT 절을 사용하여 최대 {top_k}개의 결과를 쿼리하세요. 데이터베이스에서 가장 유익한 데이터를 반환하도록 결과를 정렬할 수 있습니다.
테이블에서 모든 열을 쿼리하지 마세요. 질문에 답하는 데 필요한 열만 쿼리해야 합니다. 각 열 이름을 구분된 식별자로 표시하기 위해 큰따옴표(")로 묶으세요.
아래 테이블에서 볼 수 있는 열만 사용하세요. 존재하지 않는 열을 쿼리하지 않도록 주의하세요. 또한, 각 열이 어느 테이블에 있는지 주의하세요.
질문에 "오늘"이 포함된 경우 현재 날짜를 얻으려면 date('now') 함수를 사용하세요.

다음 테이블만 사용하세요:
{table_info}

쿼리의 초안을 작성하세요. 그런 다음 일반적인 실수를 다시 확인하세요:
- NULL 값과 함께 NOT IN 사용
- UNION ALL을 사용해야 할 때 UNION 사용
- 배타적 범위에 BETWEEN 사용
- 술어에서 데이터 유형 불일치
- 식별자를 올바르게 인용
- 함수에 대한 올바른 인수 수 사용
- 올바른 데이터 유형으로 캐스팅
- 조인을 위한 적절한 열 사용

다음 형식을 사용하세요:

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
        "question": "2003년부터 2010년까지 팩스가 없는 미국 고객의 평균 인보이스는 얼마인가요?"
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

## Human-in-the-loop

어떤 경우에는 데이터가 너무 민감하여 사람이 승인하지 않고는 SQL 쿼리를 실행하지 않기를 원할 수 있습니다. 도구, 체인 또는 에이전트에 Human-in-the-loop를 추가하는 방법을 알아보려면 [도구 사용: Human-in-the-loop](/docs/use_cases/tool_use/human_in_the_loop) 페이지를 참조하세요.

## 오류 처리

어느 시점에서는 모델이 실수를 저지르고 유효하지 않은 SQL 쿼리를 작성할 것입니다. 또는 데이터베이스에 문제가 발생할 수 있습니다. 또는 모델 API가 다운될 수 있습니다. 이러한 상황에서 체인과 에이전트가 우아하게 실패하고, 아마도 자동으로 복구할 수 있도록 오류 처리 동작을 추가하고 싶을 것입니다. 도구 사용에서 오류 처리에 대해 알아보려면 [도구 사용: 오류 처리](/docs/use_cases/tool_use/tool_error_handling) 페이지를 참조하세요.