---
translated: true
---

# Neo4j

>[Neo4j](https://neo4j.com/docs/getting-started/)는 `Neo4j, Inc`에서 개발한 그래프 데이터베이스 관리 시스템입니다.

>Neo4j가 저장하는 데이터 요소는 노드, 이들을 연결하는 엣지, 그리고 노드와 엣지의 속성입니다. 개발자들은 Neo4j를 ACID 준수 트랜잭션 데이터베이스이자 네이티브 그래프 저장소 및 처리 기능을 가진 것으로 설명합니다. Neo4j는 GNU General Public License 변형으로 라이선스된 비오픈소스 "커뮤니티 에디션"과 온라인 백업 및 고가용성 확장 기능이 포함된 폐쇄 소스 상용 라이선스로 제공됩니다.

>이 노트북은 `Cypher` 쿼리 언어로 그래프 데이터베이스를 쿼리할 수 있는 자연어 인터페이스를 제공하는 LLM의 사용 방법을 보여줍니다.

>[Cypher](https://en.wikipedia.org/wiki/Cypher_(query_language))는 속성 그래프에서 표현력 있고 효율적인 데이터 쿼리를 가능하게 하는 선언형 그래프 쿼리 언어입니다.

## 설정

실행 중인 `Neo4j` 인스턴스가 필요합니다. 옵션 중 하나는 [Neo4j Aura 클라우드 서비스](https://neo4j.com/cloud/platform/aura-graph-database/)에서 무료 Neo4j 데이터베이스 인스턴스를 만드는 것입니다. 또한 [Neo4j Desktop 애플리케이션](https://neo4j.com/download/)을 사용하거나 Docker 컨테이너를 실행하여 데이터베이스를 로컬에서 실행할 수 있습니다.
다음 스크립트를 실행하여 로컬 Docker 컨테이너를 실행할 수 있습니다:

```bash
docker run \
    --name neo4j \
    -p 7474:7474 -p 7687:7687 \
    -d \
    -e NEO4J_AUTH=neo4j/password \
    -e NEO4J_PLUGINS=\[\"apoc\"\]  \
    neo4j:latest
```

Docker 컨테이너를 사용하는 경우 데이터베이스가 시작되는 데 몇 초 정도 걸립니다.

```python
from langchain.chains import GraphCypherQAChain
from langchain_community.graphs import Neo4jGraph
from langchain_openai import ChatOpenAI
```

```python
graph = Neo4jGraph(url="bolt://localhost:7687", username="neo4j", password="password")
```

## 데이터베이스 시드 설정

데이터베이스가 비어 있다고 가정하면 Cypher 쿼리 언어를 사용하여 데이터베이스를 채울 수 있습니다. 다음 Cypher 문은 멱등성이 있어 한 번 또는 여러 번 실행해도 데이터베이스 정보가 동일합니다.

```python
graph.query(
    """
MERGE (m:Movie {name:"Top Gun", runtime: 120})
WITH m
UNWIND ["Tom Cruise", "Val Kilmer", "Anthony Edwards", "Meg Ryan"] AS actor
MERGE (a:Actor {name:actor})
MERGE (a)-[:ACTED_IN]->(m)
"""
)
```

```output
[]
```

## 그래프 스키마 정보 새로 고침

데이터베이스 스키마가 변경되면 Cypher 문을 생성하는 데 필요한 스키마 정보를 새로 고칠 수 있습니다.

```python
graph.refresh_schema()
```

```python
print(graph.schema)
```

```output
Node properties:
Movie {runtime: INTEGER, name: STRING}
Actor {name: STRING}
Relationship properties:

The relationships:
(:Actor)-[:ACTED_IN]->(:Movie)
```

## 향상된 스키마 정보

향상된 스키마 버전을 선택하면 시스템이 데이터베이스 내의 예제 값을 자동으로 스캔하고 일부 분포 지표를 계산할 수 있습니다. 예를 들어 노드 속성에 10개 미만의 고유 값이 있는 경우 모든 가능한 값을 스키마에 반환합니다. 그렇지 않으면 노드 및 관계 속성당 하나의 예제 값만 반환합니다.

```python
enhanced_graph = Neo4jGraph(
    url="bolt://localhost:7687",
    username="neo4j",
    password="password",
    enhanced_schema=True,
)
print(enhanced_graph.schema)
```

```output
Node properties:
- **Movie**
  - `runtime: INTEGER` Min: 120, Max: 120
  - `name: STRING` Available options: ['Top Gun']
- **Actor**
  - `name: STRING` Available options: ['Tom Cruise', 'Val Kilmer', 'Anthony Edwards', 'Meg Ryan']
Relationship properties:

The relationships:
(:Actor)-[:ACTED_IN]->(:Movie)
```

## 그래프 쿼리

이제 그래프 Cypher QA 체인을 사용하여 그래프에 질문할 수 있습니다.

```python
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True
)
```

```python
chain.invoke({"query": "Who played in Top Gun?"})
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (a:Actor)-[:ACTED_IN]->(m:Movie)
WHERE m.name = 'Top Gun'
RETURN a.name[0m
Full Context:
[32;1m[1;3m[{'a.name': 'Anthony Edwards'}, {'a.name': 'Meg Ryan'}, {'a.name': 'Val Kilmer'}, {'a.name': 'Tom Cruise'}][0m

[1m> Finished chain.[0m
```

```output
{'query': 'Who played in Top Gun?',
 'result': 'Anthony Edwards, Meg Ryan, Val Kilmer, Tom Cruise played in Top Gun.'}
```

## 결과 수 제한

`top_k` 매개변수를 사용하여 Cypher QA 체인의 결과 수를 제한할 수 있습니다.
기본값은 10입니다.

```python
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True, top_k=2
)
```

```python
chain.invoke({"query": "Who played in Top Gun?"})
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (a:Actor)-[:ACTED_IN]->(m:Movie)
WHERE m.name = 'Top Gun'
RETURN a.name[0m
Full Context:
[32;1m[1;3m[{'a.name': 'Anthony Edwards'}, {'a.name': 'Meg Ryan'}][0m

[1m> Finished chain.[0m
```

```output
{'query': 'Who played in Top Gun?',
 'result': 'Anthony Edwards, Meg Ryan played in Top Gun.'}
```

## 중간 결과 반환

`return_intermediate_steps` 매개변수를 사용하여 Cypher QA 체인의 중간 단계를 반환할 수 있습니다.

```python
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True, return_intermediate_steps=True
)
```

```python
result = chain.invoke({"query": "Who played in Top Gun?"})
print(f"Intermediate steps: {result['intermediate_steps']}")
print(f"Final answer: {result['result']}")
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (a:Actor)-[:ACTED_IN]->(m:Movie)
WHERE m.name = 'Top Gun'
RETURN a.name[0m
Full Context:
[32;1m[1;3m[{'a.name': 'Anthony Edwards'}, {'a.name': 'Meg Ryan'}, {'a.name': 'Val Kilmer'}, {'a.name': 'Tom Cruise'}][0m

[1m> Finished chain.[0m
Intermediate steps: [{'query': "MATCH (a:Actor)-[:ACTED_IN]->(m:Movie)\nWHERE m.name = 'Top Gun'\nRETURN a.name"}, {'context': [{'a.name': 'Anthony Edwards'}, {'a.name': 'Meg Ryan'}, {'a.name': 'Val Kilmer'}, {'a.name': 'Tom Cruise'}]}]
Final answer: Anthony Edwards, Meg Ryan, Val Kilmer, Tom Cruise played in Top Gun.
```

## 직접 결과 반환

`return_direct` 매개변수를 사용하여 Cypher QA 체인의 직접 결과를 반환할 수 있습니다.

```python
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True, return_direct=True
)
```

```python
chain.invoke({"query": "Who played in Top Gun?"})
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (a:Actor)-[:ACTED_IN]->(m:Movie)
WHERE m.name = 'Top Gun'
RETURN a.name[0m

[1m> Finished chain.[0m
```

```output
{'query': 'Who played in Top Gun?',
 'result': [{'a.name': 'Anthony Edwards'},
  {'a.name': 'Meg Ryan'},
  {'a.name': 'Val Kilmer'},
  {'a.name': 'Tom Cruise'}]}
```

## Cypher 생성 프롬프트에 예제 추가

특정 질문에 대해 생성하려는 Cypher 문을 정의할 수 있습니다.

```python
from langchain_core.prompts.prompt import PromptTemplate

CYPHER_GENERATION_TEMPLATE = """Task:Generate Cypher statement to query a graph database.
Instructions:
Use only the provided relationship types and properties in the schema.
Do not use any other relationship types or properties that are not provided.
Schema:
{schema}
Note: Do not include any explanations or apologies in your responses.
Do not respond to any questions that might ask anything else than for you to construct a Cypher statement.
Do not include any text except the generated Cypher statement.
Examples: Here are a few examples of generated Cypher statements for particular questions:
# How many people played in Top Gun?
MATCH (m:Movie {{title:"Top Gun"}})<-[:ACTED_IN]-()
RETURN count(*) AS numberOfActors

The question is:
{question}"""

CYPHER_GENERATION_PROMPT = PromptTemplate(
    input_variables=["schema", "question"], template=CYPHER_GENERATION_TEMPLATE
)

chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0),
    graph=graph,
    verbose=True,
    cypher_prompt=CYPHER_GENERATION_PROMPT,
)
```

```python
chain.invoke({"query": "How many people played in Top Gun?"})
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (:Movie {name:"Top Gun"})<-[:ACTED_IN]-()
RETURN count(*) AS numberOfActors[0m
Full Context:
[32;1m[1;3m[{'numberOfActors': 4}][0m

[1m> Finished chain.[0m
```

```output
{'query': 'How many people played in Top Gun?',
 'result': 'There were 4 actors who played in Top Gun.'}
```

## Cypher와 답변 생성을 위한 별도의 LLM 사용

`cypher_llm` 및 `qa_llm` 매개변수를 사용하여 다른 LLM을 정의할 수 있습니다.

```python
chain = GraphCypherQAChain.from_llm(
    graph=graph,
    cypher_llm=ChatOpenAI(temperature=0, model="gpt-3.5-turbo"),
    qa_llm=ChatOpenAI(temperature=0, model="gpt-3.5-turbo-16k"),
    verbose=True,
)
```

```python
chain.invoke({"query": "Who played in Top Gun?"})
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (a:Actor)-[:ACTED_IN]->(m:Movie)
WHERE m.name = 'Top Gun'
RETURN a.name[0m
Full Context:
[32;1m[1;3m[{'a.name': 'Anthony Edwards'}, {'a.name': 'Meg Ryan'}, {'a.name': 'Val Kilmer'}, {'a.name': 'Tom Cruise'}][0m

[1m> Finished chain.[0m
```

```output
{'query': 'Who played in Top Gun?',
 'result': 'Anthony Edwards, Meg Ryan, Val Kilmer, and Tom Cruise played in Top Gun.'}
```

## 지정된 노드 및 관계 유형 무시

`include_types` 또는 `exclude_types`를 사용하여 Cypher 문 생성 시 그래프 스키마의 일부를 무시할 수 있습니다.

```python
chain = GraphCypherQAChain.from_llm(
    graph=graph,
    cypher_llm=ChatOpenAI(temperature=0, model="gpt-3.5-turbo"),
    qa_llm=ChatOpenAI(temperature=0, model="gpt-3.5-turbo-16k"),
    verbose=True,
    exclude_types=["Movie"],
)
```

```python
# Inspect graph schema
print(chain.graph_schema)
```

```output
Node properties are the following:
Actor {name: STRING}
Relationship properties are the following:

The relationships are the following:
```

## 생성된 Cypher 문 검증

`validate_cypher` 매개변수를 사용하여 생성된 Cypher 문을 검증하고 관계 방향을 수정할 수 있습니다.

```python
chain = GraphCypherQAChain.from_llm(
    llm=ChatOpenAI(temperature=0, model="gpt-3.5-turbo"),
    graph=graph,
    verbose=True,
    validate_cypher=True,
)
```

```python
chain.invoke({"query": "Who played in Top Gun?"})
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (a:Actor)-[:ACTED_IN]->(m:Movie)
WHERE m.name = 'Top Gun'
RETURN a.name[0m
Full Context:
[32;1m[1;3m[{'a.name': 'Anthony Edwards'}, {'a.name': 'Meg Ryan'}, {'a.name': 'Val Kilmer'}, {'a.name': 'Tom Cruise'}][0m

[1m> Finished chain.[0m
```

```output
{'query': 'Who played in Top Gun?',
 'result': 'Anthony Edwards, Meg Ryan, Val Kilmer, Tom Cruise played in Top Gun.'}
```
