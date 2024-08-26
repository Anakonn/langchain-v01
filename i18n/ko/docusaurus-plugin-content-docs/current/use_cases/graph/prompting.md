---
sidebar_position: 2
translated: true
---

# 프롬프트 전략

이 가이드에서는 그래프 데이터베이스 쿼리 생성을 개선하기 위한 프롬프트 전략에 대해 다룹니다. 주로 프롬프트에서 관련된 데이터베이스 관련 정보를 얻는 방법에 초점을 맞출 것입니다.

## 설정

먼저 필요한 패키지를 설치하고 환경 변수를 설정합니다:

```python
%pip install --upgrade --quiet langchain langchain-community langchain-openai neo4j
```

```output
Note: you may need to restart the kernel to use updated packages.
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

## 그래프 스키마 필터링

때로는 Cypher 문을 생성할 때 그래프 스키마의 특정 부분에 집중해야 할 수도 있습니다.
다음과 같은 그래프 스키마를 다룬다고 가정해봅시다:

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

_장르_ 노드를 LLM에 전달하는 스키마 표현에서 제외하고 싶다고 가정해봅시다.
`exclude` 매개변수를 사용하여 이를 달성할 수 있습니다.

```python
from langchain.chains import GraphCypherQAChain
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
chain = GraphCypherQAChain.from_llm(
    graph=graph, llm=llm, exclude_types=["Genre"], verbose=True
)
```

```python
print(chain.graph_schema)
```

```output
Node properties are the following:
Movie {imdbRating: FLOAT, id: STRING, released: DATE, title: STRING},Person {name: STRING}
Relationship properties are the following:

The relationships are the following:
(:Person)-[:DIRECTED]->(:Movie),(:Person)-[:ACTED_IN]->(:Movie)
```

## 몇 가지 예시

우리 데이터베이스에 대해 자연어 질문이 유효한 Cypher 쿼리로 변환되는 예시를 프롬프트에 포함하면, 특히 복잡한 쿼리의 경우 모델 성능이 종종 향상됩니다.

다음과 같은 예시가 있다고 가정해봅시다:

```python
examples = [
    {
        "question": "예술가는 몇 명인가요?",
        "query": "MATCH (a:Person)-[:ACTED_IN]->(:Movie) RETURN count(DISTINCT a)",
    },
    {
        "question": "Casino 영화에 어떤 배우들이 출연했나요?",
        "query": "MATCH (m:Movie {{title: 'Casino'}})<-[:ACTED_IN]-(a) RETURN a.name",
    },
    {
        "question": "Tom Hanks가 출연한 영화는 몇 편인가요?",
        "query": "MATCH (a:Person {{name: 'Tom Hanks'}})-[:ACTED_IN]->(m:Movie) RETURN count(m)",
    },
    {
        "question": "Schindler's List 영화의 모든 장르를 나열하세요.",
        "query": "MATCH (m:Movie {{title: 'Schindler\\'s List'}})-[:IN_GENRE]->(g:Genre) RETURN g.name",
    },
    {
        "question": "코미디와 액션 장르의 영화에 모두 출연한 배우들은 누구인가요?",
        "query": "MATCH (a:Person)-[:ACTED_IN]->(:Movie)-[:IN_GENRE]->(g1:Genre), (a)-[:ACTED_IN]->(:Movie)-[:IN_GENRE]->(g2:Genre) WHERE g1.name = 'Comedy' AND g2.name = 'Action' RETURN DISTINCT a.name",
    },
    {
        "question": "세 명 이상의 다른 'John'이라는 이름을 가진 배우와 함께 영화를 만든 감독들은 누구인가요?",
        "query": "MATCH (d:Person)-[:DIRECTED]->(m:Movie)<-[:ACTED_IN]-(a:Person) WHERE a.name STARTS WITH 'John' WITH d, COUNT(DISTINCT a) AS JohnsCount WHERE JohnsCount >= 3 RETURN d.name",
    },
    {
        "question": "감독이자 동시에 영화에서 역할을 맡은 영화를 식별하세요.",
        "query": "MATCH (p:Person)-[:DIRECTED]->(m:Movie), (p)-[:ACTED_IN]->(m) RETURN m.title, p.name",
    },
    {
        "question": "데이터베이스에서 가장 많은 영화에 출연한 배우는 누구인가요?",
        "query": "MATCH (a:Actor)-[:ACTED_IN]->(m:Movie) RETURN a.name, COUNT(m) AS movieCount ORDER BY movieCount DESC LIMIT 1",
    },
]
```

이 예시들을 포함하여 few-shot 프롬프트를 다음과 같이 만들 수 있습니다:

```python
from langchain_core.prompts import FewShotPromptTemplate, PromptTemplate

example_prompt = PromptTemplate.from_template(
    "User input: {question}\nCypher query: {query}"
)
prompt = FewShotPromptTemplate(
    examples=examples[:5],
    example_prompt=example_prompt,
    prefix="당신은 Neo4j 전문가입니다. 입력 질문을 받아 구문이 올바른 Cypher 쿼리를 생성하세요.\n\n여기 스키마 정보가 있습니다\n{schema}.\n\n아래는 질문과 해당 Cypher 쿼리 예시입니다.",
    suffix="User input: {question}\nCypher query: ",
    input_variables=["question", "schema"],
)
```

```python
print(prompt.format(question="예술가는 몇 명인가요?", schema="foo"))
```

```output
당신은 Neo4j 전문가입니다. 입력 질문을 받아 구문이 올바른 Cypher 쿼리를 생성하세요.

여기 스키마 정보가 있습니다
foo.

아래는 질문과 해당 Cypher 쿼리 예시입니다.

User input: 예술가는 몇 명인가요?
Cypher query: MATCH (a:Person)-[:ACTED_IN]->(:Movie) RETURN count(DISTINCT a)

User input: Casino 영화에 어떤 배우들이 출연했나요?
Cypher query: MATCH (m:Movie {title: 'Casino'})<-[:ACTED_IN]-(a) RETURN a.name

User input: Tom Hanks가 출연한 영화는 몇 편인가요?
Cypher query: MATCH (a:Person {name: 'Tom Hanks'})-[:ACTED_IN]->(m:Movie) RETURN count(m)

User input: Schindler's List 영화의 모든 장르를 나열하세요.
Cypher query: MATCH (m:Movie {title: 'Schindler\'s List'})-[:IN_GENRE]->(g:Genre) RETURN g.name

User input: 코미디와 액션 장르의 영화에 모두 출연한 배우들은 누구인가요?
Cypher query: MATCH (a:Person)-[:ACTED_IN]->(:Movie)-[:IN_GENRE]->(g1:Genre), (a)-[:ACTED_IN]->(:Movie)-[:IN_GENRE]->(g2:Genre) WHERE g1.name = 'Comedy' AND g2.name = 'Action' RETURN DISTINCT a.name

User input: 예술가는 몇 명인가요?
Cypher query:
```

## 동적 few-shot 예시

예시가 충분하다면, 모델의 컨텍스트 윈도우에 맞지 않거나 예시의 긴 꼬리가 모델을 혼란스럽게 할 수 있기 때문에 가장 관련 있는 예시만 프롬프트에 포함시키고 싶을 것입니다. 특히, 입력된 질문에 가장 관련 있는 예시를 포함시키고 싶을 것입니다.

ExampleSelector를 사용하여 이를 수행할 수 있습니다. 이 경우 [SemanticSimilarityExampleSelector](https://api.python.langchain.com/en/latest/example_selectors/langchain_core.example_selectors.semantic_similarity.SemanticSimilarityExampleSelector.html)를 사용할 것입니다. 이 선택기는 예시를 선택한 벡터 데이터베이스에 저장합니다. 실행 시 입력과 예시 간의 유사성 검색을 수행하고 가장 의미상 유사한 예시를 반환합니다:

```python
from langchain_community.vectorstores import Neo4jVector
from langchain_core.example_selectors import SemanticSimilarityExampleSelector
from langchain_openai import OpenAIEmbeddings

example_selector = SemanticSimilarityExampleSelector.from_examples(
    examples,
    OpenAIEmbeddings(),
    Neo4jVector,
    k=5,
    input_keys=["question"],
)
```

```python
example_selector.select_examples({"question": "예술가는 몇 명인가요?"})
```

```output
[{'query': 'MATCH (a:Person)-[:ACTED_IN]->(:Movie) RETURN count(DISTINCT a)',
  'question': '예술가는 몇 명인가요?'},
 {'query': "MATCH (a:Person {{name: 'Tom Hanks'}})-[:ACTED_IN]->(m:Movie) RETURN count(m)",
  'question': 'Tom Hanks가 출연한 영화는 몇 편인가요?'},
 {'query': "MATCH (a:Person)-[:ACTED_IN]->(:Movie)-[:IN_GENRE]->(g1:Genre), (a)-[:ACTED_IN]->(:Movie)-[:IN_GENRE]->(g2:Genre) WHERE g1.name = 'Comedy' AND g2.name = 'Action' RETURN DISTINCT a.name",
  'question': '코미디와 액션 장르의 영화에 모두 출연한 배우들은 누구인가요?'},
 {'query': "MATCH (d:Person)-[:DIRECTED]->(m:Movie)<-[:ACTED_IN]-(a:Person) WHERE a.name STARTS WITH 'John' WITH d, COUNT(DISTINCT a) AS JohnsCount WHERE JohnsCount >= 3 RETURN d.name",
  'question': "세 명 이상의 다른 'John'이라는 이름을 가진 배우와 함께 영화를 만든 감독들은 누구인가요?"},
 {'query': 'MATCH (a:Actor)-[:ACTED_IN]->(m:Movie) RETURN a.name, COUNT(m) AS movieCount ORDER BY movieCount DESC LIMIT 1',
  'question': '데이터베이스에서 가장 많은 영화에 출연한 배우는 누구인가요?'}]
```

ExampleSelector를 FewShotPromptTemplate에 직접 전달하여 사용할 수 있습니다:

```python
prompt = FewShotPromptTemplate(
    example_selector=example_selector,
    example_prompt=example_prompt,
    prefix="당신은 Neo4j 전문가입니다. 입력 질문을 받아 구문이 올바른 Cypher 쿼리를 생성하세요.\n\n여기 스키마 정보가 있습니다\n{schema}.\n\n아래는 질문과 해당 Cypher 쿼리 예시입니다.",
    suffix="User input: {question}\nCypher query: ",
    input_variables=["question", "schema"],
)
```

```python
print(prompt.format(question="예술가는 몇 명인가요?", schema="foo"))
```

```output
당신은 Neo4j 전문가입니다. 입력 질문을 받아 구문이 올바른 Cypher 쿼리를 생성하세요.

여기 스키마 정보가 있습니다
foo.

아래는 질문과 해당 Cypher 쿼리 예시입니다.

User input: 예술가는 몇 명인가요?
Cypher query: MATCH (a:Person)-[:ACTED_IN]->(:Movie) RETURN count(DISTINCT a)

User input: Tom Hanks가 출연한 영화는 몇 편인가요?
Cypher query: MATCH (a:Person {name: 'Tom Hanks'})-[:ACTED_IN]->(m:Movie) RETURN count(m)

User input: 코미디와 액션 장르의 영화에 모두 출연한 배우들은 누구인가요?
Cypher query: MATCH (a:Person)-[:ACTED_IN]->(:Movie)-[:IN_GENRE]->(g1:Genre), (a)-[:ACTED_IN]->(:Movie)-[:IN_GENRE]->(g2:Genre) WHERE g1.name = 'Comedy' AND g2.name = 'Action' RETURN DISTINCT a.name

User input: 세 명 이상의 다른 'John'이라는 이름을 가진 배우와 함께 영화를 만든 감독들은 누구인가요?
Cypher query: MATCH (d:Person)-[:DIRECTED]->(m:Movie)<-[:ACTED_IN]-(a:Person) WHERE a.name STARTS WITH 'John' WITH d, COUNT(DISTINCT a) AS JohnsCount WHERE JohnsCount >= 3 RETURN d.name

User input: 데이터베이스에서 가장 많은 영화에 출연한 배우는 누구인가요?
Cypher query: MATCH (a:Actor)-[:ACTED_IN]->(m:Movie) RETURN a.name, COUNT(m) AS movieCount ORDER BY movieCount DESC LIMIT 1

User input: 예술가는 몇 명인가요?
Cypher query:
```

```python
llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
chain = GraphCypherQAChain.from_llm(
    graph=graph, llm=llm, cypher_prompt=prompt, verbose=True
)
```

```python
chain.invoke("그래프에 배우가 몇 명 있나요?")
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (a:Person)-[:ACTED_IN]->(:Movie) RETURN count(DISTINCT a)[0m
Full Context:
[32;1m[1;3m[{'count(DISTINCT a)': 967}][0m

[1m> Finished chain.[0m
```

```output
{'query': '그래프에 배우가 몇 명 있나요?',
 'result': '그래프에 배우는 967명 있습니다.'}
```