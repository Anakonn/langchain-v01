---
sidebar_position: 4
translated: true
---

# 대규모 데이터베이스

데이터베이스에 대해 유효한 쿼리를 작성하려면 모델에게 쿼리할 테이블 이름, 테이블 스키마 및 피처 값을 제공해야 합니다. 테이블, 열 및/또는 고카디널리티 열이 많을 때, 데이터베이스에 대한 전체 정보를 매번 프롬프트에 덤프하는 것은 불가능합니다. 대신, 프롬프트에 가장 관련성이 높은 정보만 동적으로 삽입하는 방법을 찾아야 합니다. 이러한 방법을 몇 가지 살펴보겠습니다.

## 설정

먼저 필요한 패키지를 설치하고 환경 변수를 설정합니다:

```python
%pip install --upgrade --quiet langchain langchain-community langchain-openai
```

```output

[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m A new release of pip is available: [0m[31;49m23.2.1[0m[39;49m -> [0m[32;49m23.3.2[0m
[1m[[0m[34;49mnotice[0m[1;39;49m][0m[39;49m To update, run: [0m[32;49mpip install --upgrade pip[0m
Note: you may need to restart the kernel to use updated packages.
```

이 가이드에서는 OpenAI 모델을 기본으로 사용하지만, 원하는 모델 공급자로 교체할 수 있습니다.

```python
import getpass
import os

# os.environ["OPENAI_API_KEY"] = getpass.getpass()

# LangSmith를 사용하려면 아래 주석을 해제하세요. 필수는 아닙니다.

os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
# os.environ["LANGCHAIN_TRACING_V2"] = "true"

```

```output
 ········
```

다음 예제에서는 SQLite 연결과 Chinook 데이터베이스를 사용합니다. [이 설치 단계](https://database.guide/2-sample-databases-sqlite/)를 따라 `Chinook.db`를 이 노트북과 동일한 디렉토리에 생성하세요:

- [이 파일](https://raw.githubusercontent.com/lerocha/chinook-database/master/ChinookDatabase/DataSources/Chinook_Sqlite.sql)을 `Chinook_Sqlite.sql`로 저장합니다.
- `sqlite3 Chinook.db`를 실행합니다.
- `.read Chinook_Sqlite.sql`을 실행합니다.
- `SELECT * FROM Artist LIMIT 10;`을 테스트합니다.

이제 `Chinhook.db`가 디렉토리에 있으며, SQLAlchemy 기반 [SQLDatabase](https://api.python.langchain.com/en/latest/utilities/langchain_community.utilities.sql_database.SQLDatabase.html) 클래스를 사용하여 인터페이스할 수 있습니다:

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

## 많은 테이블

프롬프트에 포함해야 할 주요 정보 중 하나는 관련 테이블의 스키마입니다. 테이블이 매우 많을 때, 모든 스키마를 한 번에 프롬프트에 담을 수 없습니다. 이런 경우 사용자 입력과 관련된 테이블 이름을 먼저 추출한 다음, 해당 테이블의 스키마만 포함시킬 수 있습니다.

이 작업을 수행하는 쉬운 방법 중 하나는 OpenAI 함수 호출과 Pydantic 모델을 사용하는 것입니다. LangChain에는 이를 수행할 수 있는 [create_extraction_chain_pydantic](https://api.python.langchain.com/en/latest/chains/langchain.chains.openai_tools.extraction.create_extraction_chain_pydantic.html) 체인이 내장되어 있습니다:

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

이 방식은 꽤 잘 작동합니다! 하지만 아래에서 볼 수 있듯이 실제로는 몇 가지 다른 테이블도 필요합니다. 이는 사용자 질문만으로 모델이 알기에는 다소 어려운 문제입니다. 이 경우, 모델의 작업을 간소화하기 위해 테이블을 그룹으로 묶는 것을 고려할 수 있습니다. 모델에게 "Music"과 "Business" 카테고리 중 하나를 선택하도록 한 다음, 관련된 모든 테이블을 선택하도록 처리합니다:

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

이제 모든 쿼리에 대해 관련 테이블을 출력할 수 있는 체인을 갖췄으므로, `table_names_to_use` 목록을 받아 프롬프트에 포함할 테이블 스키마를 결정할 수 있는 [create_sql_query_chain](https://api.python.langchain.com/en/latest/chains/langchain.chains.sql_database.query.create_sql_query_chain.html)과 결합할 수 있습니다:

```python
from operator import itemgetter

from langchain.chains import create_sql_query_chain
from langchain_core.runnables import RunnablePassthrough

query_chain = create_sql_query_chain(llm, db)
# "question" 키를 현재 table_chain이 예상하는 "input" 키로 변환합니다.

table_chain = {"input": itemgetter("question")} | table_chain
# table_chain을 사용하여 table_names_to_use 설정.

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

질문의 중복성을 제거하기 위해 질문을 약간 수정할 수 있습니다:

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

이 실행의 [LangSmith 추적](https://smith.langchain.com/public/20b8ef90-1dac-4754-90f0-6bc11203c50a/r)을 여기서 볼 수 있습니다.

체인 내에서 프롬프트에 테이블 스키마의 서브셋을 동적으로 포함시키는 방법을 살펴보았습니다. 이 문제에 대한 또 다른 접근 방식은 에이전트가 자체적으로 테이블을 조회할 때 이를 수행할 수 있는 도구를 제공하는 것입니다. 이에 대한 예제는 [SQL: 에이전트](/docs/use_cases/sql/agents) 가이드에서 볼 수 있습니다.

## 고카디널리티 열

주소, 곡명 또는 아티스트와 같은 고유 명사가 포함된 열을 필터링하려면 데이터를 올바르게 필터링하기 위해 먼저 철자를 두 번 확인해야 합니다.

하나의 단순한 전략은 데이터베이스에 존재하는 모든 고유 명사로 벡터 저장소를 생성하는 것입니다. 그런 다음 사용자 입력마다 해당 벡터 저장소를 쿼리하여 가장 관련성이 높은 고유 명사를 프롬프트에 삽입할 수 있습니다.

먼저 원하는 각 엔티티에 대한 고유 값을 가져와야 하며, 이를 위해 결과를 요소 목록으로 파싱하는 함수를 정의합니다:

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

이제 모든 값을 벡터 데이터베이스에 임베딩하고 저장할 수 있습니다:

```python
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings

vector_db = FAISS.from_texts(proper_nouns, OpenAIEmbeddings())
retriever = vector_db.as_retriever(search_kwargs={"k": 15})
```

먼저 데이터베이스에서 값을 검색하여 프롬프트에 삽입하는 쿼리 생성 체인을 구성합니다:

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

잘못된 철자 "elenis moriset"로 Alanis Morissette 노래의 장르를 필터링할 때, 검색 없이와 검색 후 결과를 비교해 보겠습니다:

```python
# 검색 없이

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
# 검색 후

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

검색을 통해 철자를 수정하고 유효한 결과를 얻을 수 있음을 확인할 수 있습니다.

이 문제에 대한 또 다른 접근 방식은 에이전트가 자체적으로 고유 명사를 조회할 때를 결정하게 하는 것입니다. 이에 대한 예제는 [SQL: 에이전트](/docs/use_cases/sql/agents) 가이드에서 볼 수 있습니다.