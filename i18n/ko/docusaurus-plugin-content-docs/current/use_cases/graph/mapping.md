---
sidebar_position: 1
translated: true
---

# 값들을 데이터베이스에 매핑하기

이 가이드에서는 사용자 입력에서 데이터베이스로 값들을 매핑하여 그래프 데이터베이스 쿼리 생성을 개선하는 전략을 다룹니다.
내장된 그래프 체인을 사용할 때, LLM은 그래프 스키마를 알고 있지만 데이터베이스에 저장된 속성 값에 대한 정보는 없습니다.
따라서 값들을 정확하게 매핑하기 위해 그래프 데이터베이스 QA 시스템에 새로운 단계를 도입할 수 있습니다.

## 설정

먼저 필요한 패키지를 설치하고 환경 변수를 설정합니다:

```python
%pip install --upgrade --quiet langchain langchain-community langchain-openai neo4j
```

이 가이드에서는 기본적으로 OpenAI 모델을 사용하지만, 원하는 모델 공급자로 교체할 수 있습니다.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()

# 아래 주석을 해제하여 LangSmith를 사용하십시오. 필수는 아닙니다.

# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()

# os.environ["LANGCHAIN_TRACING_V2"] = "true"

```

```output
········
```

다음으로, Neo4j 자격 증명을 정의해야 합니다.
Neo4j 데이터베이스를 설정하려면 [이 설치 단계](https://neo4j.com/docs/operations-manual/current/installation/)를 따르십시오.

```python
os.environ["NEO4J_URI"] = "bolt://localhost:7687"
os.environ["NEO4J_USERNAME"] = "neo4j"
os.environ["NEO4J_PASSWORD"] = "password"
```

아래 예제는 Neo4j 데이터베이스와 연결을 설정하고 영화와 배우에 대한 예제 데이터를 채워줍니다.

```python
from langchain_community.graphs import Neo4jGraph

graph = Neo4jGraph()

# 영화 정보를 가져오기

movies_query = """
LOAD CSV WITH HEADERS FROM
'https://raw.githubusercontent.com/tomasonjo/blog-datasets/main/movies/movies_small.csv'
AS row
MERGE (m:Movie {id:row.movieId})
SET m.released = date(row.released),
    m.title = row.title,
    m.imdbRating = toFloat(row.imdbRating)
FOREACH (director in split(row.director, '|') |
    MERGE (p:Person {name:trim(director)})
    MERGE (p)-[:DIRECTED]->(m))
FOREACH (actor in split(row.actors, '|') |
    MERGE (p:Person {name:trim(actor)})
    MERGE (p)-[:ACTED_IN]->(m))
FOREACH (genre in split(row.genres, '|') |
    MERGE (g:Genre {name:trim(genre)})
    MERGE (m)-[:IN_GENRE]->(g))
"""

graph.query(movies_query)
```

```output
[]
```

## 사용자 입력에서 엔터티 감지하기

그래프 데이터베이스에 매핑하려는 엔터티/값의 유형을 추출해야 합니다. 이 예제에서는 영화 그래프를 다루므로 영화와 사람을 데이터베이스에 매핑할 수 있습니다.

```python
from typing import List, Optional

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)

class Entities(BaseModel):
    """엔터티에 대한 식별 정보"""

    names: List[str] = Field(
        ...,
        description="텍스트에 나오는 모든 사람 또는 영화 이름",
    )

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "텍스트에서 사람과 영화를 추출하고 있습니다.",
        ),
        (
            "human",
            "다음 입력에서 정보를 추출하려면 주어진 형식을 사용하십시오: {question}",
        ),
    ]
)

entity_chain = prompt | llm.with_structured_output(Entities)
```

엔터티 추출 체인을 테스트할 수 있습니다.

```python
entities = entity_chain.invoke({"question": "Casino 영화에 누가 출연했나요?"})
entities
```

```output
Entities(names=['Casino'])
```

간단한 `CONTAINS` 절을 사용하여 엔터티를 데이터베이스에 매핑할 것입니다. 실제로는 약간의 철자 오류를 허용하기 위해 퍼지 검색 또는 전체 텍스트 인덱스를 사용하는 것이 좋습니다.

```python
match_query = """MATCH (p:Person|Movie)
WHERE p.name CONTAINS $value OR p.title CONTAINS $value
RETURN coalesce(p.name, p.title) AS result, labels(p)[0] AS type
LIMIT 1
"""

def map_to_database(entities: Entities) -> Optional[str]:
    result = ""
    for entity in entities.names:
        response = graph.query(match_query, {"value": entity})
        try:
            result += f"{entity}이(가) 데이터베이스의 {response[0]['type']} {response[0]['result']}에 매핑됩니다.\n"
        except IndexError:
            pass
    return result

map_to_database(entities)
```

```output
'Casino이(가) 데이터베이스의 Movie Casino에 매핑됩니다.\n'
```

## 맞춤 Cypher 생성 체인

엔터티 매핑 정보와 스키마, 사용자 질문을 결합하여 Cypher 문을 구성하는 맞춤 Cypher 프롬프트를 정의해야 합니다.
이를 위해 LangChain 표현 언어를 사용할 것입니다.

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

# 자연어 입력을 기반으로 Cypher 문 생성

cypher_template = """다음 Neo4j 그래프 스키마를 기반으로 사용자의 질문에 답할 Cypher 쿼리를 작성하세요:
{schema}
질문에서 엔터티는 다음 데이터베이스 값에 매핑됩니다:
{entities_list}
질문: {question}
Cypher 쿼리:"""

cypher_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "입력 질문을 받아 Cypher 쿼리로 변환합니다. 서론 없이 작성하세요.",
        ),
        ("human", cypher_template),
    ]
)

cypher_response = (
    RunnablePassthrough.assign(names=entity_chain)
    | RunnablePassthrough.assign(
        entities_list=lambda x: map_to_database(x["names"]),
        schema=lambda _: graph.get_schema,
    )
    | cypher_prompt
    | llm.bind(stop=["\nCypherResult:"])
    | StrOutputParser()
)
```

```python
cypher = cypher_response.invoke({"question": "Casino 영화에 누가 출연했나요?"})
cypher
```

```output
'MATCH (:Movie {title: "Casino"})<-[:ACTED_IN]-(actor)\nRETURN actor.name'
```

## 데이터베이스 결과 기반 응답 생성

이제 Cypher 문을 생성하는 체인을 가지고 있으므로, Cypher 문을 데이터베이스에서 실행하고 데이터베이스 결과를 LLM에 전달하여 최종 응답을 생성해야 합니다.
다시 한 번 LCEL을 사용할 것입니다.

```python
from langchain.chains.graph_qa.cypher_utils import CypherQueryCorrector, Schema

# 관계 방향에 대한 Cypher 검증 도구

corrector_schema = [
    Schema(el["start"], el["type"], el["end"])
    for el in graph.structured_schema.get("relationships")
]
cypher_validation = CypherQueryCorrector(corrector_schema)

# 데이터베이스 결과를 기반으로 자연어 응답 생성

response_template = """질문, Cypher 쿼리, Cypher 응답을 기반으로 자연어 응답을 작성하세요:
질문: {question}
Cypher 쿼리: {query}
Cypher 응답: {response}"""

response_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "입력 질문과 Cypher 응답을 받아 자연어 답변으로 변환합니다. 서론 없이 작성하세요.",
        ),
        ("human", response_template),
    ]
)

chain = (
    RunnablePassthrough.assign(query=cypher_response)
    | RunnablePassthrough.assign(
        response=lambda x: graph.query(cypher_validation(x["query"])),
    )
    | response_prompt
    | llm
    | StrOutputParser()
)
```

```python
chain.invoke({"question": "Casino 영화에 누가 출연했나요?"})
```

```output
'Robert De Niro, James Woods, Joe Pesci, 그리고 Sharon Stone이 "Casino" 영화에 출연했습니다.'
```