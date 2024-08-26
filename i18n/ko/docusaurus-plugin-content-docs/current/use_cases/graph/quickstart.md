---
sidebar_position: 0
translated: true
---

# 퀵스타트

이 가이드에서는 그래프 데이터베이스에서 Q&A 체인을 생성하는 기본 방법을 다룹니다. 이러한 시스템을 통해 그래프 데이터베이스의 데이터에 대해 질문하고 자연어로 된 답변을 받을 수 있습니다.

## ⚠️ 보안 주의 사항 ⚠️

그래프 데이터베이스의 Q&A 시스템을 구축하려면 모델이 생성한 그래프 쿼리를 실행해야 합니다. 이를 수행하는 데는 본질적인 위험이 따릅니다. 데이터베이스 연결 권한을 체인/에이전트의 필요에 맞게 최대한 좁게 설정하는 것이 중요합니다. 이는 모델 기반 시스템을 구축할 때의 위험을 완화하지만 완전히 제거하지는 않습니다. 일반적인 보안 모범 사례에 대한 자세한 내용은 [여기](https://docs/security)를 참조하세요.

## 아키텍처

대부분의 그래프 체인의 고수준 단계는 다음과 같습니다:

1. **질문을 그래프 데이터베이스 쿼리로 변환**: 모델이 사용자 입력을 그래프 데이터베이스 쿼리(예: Cypher)로 변환합니다.
2. **그래프 데이터베이스 쿼리 실행**: 그래프 데이터베이스 쿼리를 실행합니다.
3. **질문에 답변**: 모델이 쿼리 결과를 사용하여 사용자 입력에 응답합니다.

![sql_usecase.png](../../../../../../static/img/graph_usecase.png)

## 설정

먼저 필요한 패키지를 설치하고 환경 변수를 설정합니다.
이 예제에서는 Neo4j 그래프 데이터베이스를 사용할 것입니다.

```python
%pip install --upgrade --quiet langchain langchain-community langchain-openai neo4j
```

이 가이드에서는 기본적으로 OpenAI 모델을 사용합니다.

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

다음으로 Neo4j 자격 증명을 정의해야 합니다.
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

# 영화 정보 가져오기

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

## 그래프 스키마

LLM이 Cypher 문을 생성할 수 있으려면 그래프 스키마에 대한 정보가 필요합니다. 그래프 객체를 인스턴스화할 때 그래프 스키마 정보를 가져옵니다. 나중에 그래프에 변경 사항이 생기면 `refresh_schema` 메서드를 실행하여 스키마 정보를 새로 고칠 수 있습니다.

```python
graph.refresh_schema()
print(graph.schema)
```

```output
Node properties are the following:
Movie {imdbRating: FLOAT, id: STRING, released: DATE, title: STRING},Person {name: STRING},Genre {name: STRING}
Relationship properties are the following:

The relationships are the following:
(:Movie)-[:IN_GENRE]->(:Genre),(:Person)-[:DIRECTED]->(:Movie),(:Person)-[:ACTED_IN]->(:Movie)
```

좋습니다! 이제 쿼리할 수 있는 그래프 데이터베이스가 생겼습니다. 이제 이를 LLM과 연결해 봅시다.

## 체인

질문을 받아 Cypher 쿼리로 변환하고 쿼리를 실행한 후 결과를 사용하여 원래 질문에 답변하는 간단한 체인을 사용해 보겠습니다.

![graph_chain.webp](../../../../../../static/img/graph_chain.webp)

LangChain에는 Neo4j와 함께 작동하도록 설계된 이 워크플로우를 위한 내장 체인이 있습니다: [GraphCypherQAChain](/docs/integrations/graphs/neo4j_cypher)

```python
from langchain.chains import GraphCypherQAChain
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
chain = GraphCypherQAChain.from_llm(graph=graph, llm=llm, verbose=True)
response = chain.invoke({"query": "Casino의 출연진은 누구였나요?"})
response
```

```output

[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (:Movie {title: "Casino"})<-[:ACTED_IN]-(actor:Person)
RETURN actor.name[0m
Full Context:
[32;1m[1;3m[{'actor.name': 'Joe Pesci'}, {'actor.name': 'Robert De Niro'}, {'actor.name': 'Sharon Stone'}, {'actor.name': 'James Woods'}][0m

[1m> Finished chain.[0m
```

```output
{'query': 'Casino의 출연진은 누구였나요?',
 'result': 'Casino의 출연진에는 Joe Pesci, Robert De Niro, Sharon Stone, James Woods가 포함되었습니다.'}
```

# 관계 방향 유효성 검사

LLM은 생성된 Cypher 문에서 관계 방향에 어려움을 겪을 수 있습니다. 그래프 스키마는 사전 정의되어 있으므로 `validate_cypher` 매개변수를 사용하여 생성된 Cypher 문에서 관계 방향을 검증하고 선택적으로 수정할 수 있습니다.

```python
chain = GraphCypherQAChain.from_llm(
    graph=graph, llm=llm, verbose=True, validate_cypher=True
)
response = chain.invoke({"query": "Casino의 출연진은 누구였나요?"})
response
```

```output

[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (:Movie {title: "Casino"})<-[:ACTED_IN]-(actor:Person)
RETURN actor.name[0m
Full Context:
[32;1m[1;3m[{'actor.name': 'Joe Pesci'}, {'actor.name': 'Robert De Niro'}, {'actor.name': 'Sharon Stone'}, {'actor.name': 'James Woods'}][0m

[1m> Finished chain.[0m
```

```output
{'query': 'Casino의 출연진은 누구였나요?',
 'result': 'Casino의 출연진에는 Joe Pesci, Robert De Niro, Sharon Stone, James Woods가 포함되었습니다.'}
```

### 다음 단계

더 복잡한 쿼리 생성을 위해 few-shot 프롬프트를 생성하거나 쿼리 검사 단계를 추가할 수 있습니다. 이러한 고급 기술과 더 많은 내용을 알아보려면 다음을 참조하십시오:

- [프롬프트 전략](/docs/use_cases/graph/prompting): 고급 프롬프트 엔지니어링 기술.
- [값 매핑](/docs/use_cases/graph/mapping): 질문에서 데이터베이스로 값을 매핑하는 기술.
- [시맨틱 레이어](/docs/use_cases/graph/semantic): 시맨틱 레이어 구현 기술.
- [그래프 구성](/docs/use_cases/graph/constructing): 지식 그래프 구성 기술.