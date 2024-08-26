---
translated: true
---

# 쿠즈

>[Kùzu](https://kuzudb.com)는 진행 중인 속성 그래프 데이터베이스 관리 시스템입니다.
>
>이 노트북은 [Kùzu](https://kuzudb.com) 데이터베이스와 `Cypher` 그래프 쿼리 언어를 사용하여 자연어 인터페이스를 제공하는 방법을 보여줍니다.
>
>[Cypher](https://en.wikipedia.org/wiki/Cypher_(query_language))는 속성 그래프에서 표현력 있고 효율적인 데이터 쿼리를 허용하는 선언적 그래프 쿼리 언어입니다.

## 설정

파이썬 패키지 설치:

```bash
pip install kuzu
```

로컬 머신에 데이터베이스를 생성하고 연결합니다:

```python
import kuzu

db = kuzu.Database("test_db")
conn = kuzu.Connection(db)
```

먼저 간단한 영화 데이터베이스의 스키마를 생성합니다:

```python
conn.execute("CREATE NODE TABLE Movie (name STRING, PRIMARY KEY(name))")
conn.execute(
    "CREATE NODE TABLE Person (name STRING, birthDate STRING, PRIMARY KEY(name))"
)
conn.execute("CREATE REL TABLE ActedIn (FROM Person TO Movie)")
```

```output
<kuzu.query_result.QueryResult at 0x1066ff410>
```

그런 다음 데이터를 삽입할 수 있습니다.

```python
conn.execute("CREATE (:Person {name: 'Al Pacino', birthDate: '1940-04-25'})")
conn.execute("CREATE (:Person {name: 'Robert De Niro', birthDate: '1943-08-17'})")
conn.execute("CREATE (:Movie {name: 'The Godfather'})")
conn.execute("CREATE (:Movie {name: 'The Godfather: Part II'})")
conn.execute(
    "CREATE (:Movie {name: 'The Godfather Coda: The Death of Michael Corleone'})"
)
conn.execute(
    "MATCH (p:Person), (m:Movie) WHERE p.name = 'Al Pacino' AND m.name = 'The Godfather' CREATE (p)-[:ActedIn]->(m)"
)
conn.execute(
    "MATCH (p:Person), (m:Movie) WHERE p.name = 'Al Pacino' AND m.name = 'The Godfather: Part II' CREATE (p)-[:ActedIn]->(m)"
)
conn.execute(
    "MATCH (p:Person), (m:Movie) WHERE p.name = 'Al Pacino' AND m.name = 'The Godfather Coda: The Death of Michael Corleone' CREATE (p)-[:ActedIn]->(m)"
)
conn.execute(
    "MATCH (p:Person), (m:Movie) WHERE p.name = 'Robert De Niro' AND m.name = 'The Godfather: Part II' CREATE (p)-[:ActedIn]->(m)"
)
```

```output
<kuzu.query_result.QueryResult at 0x107016210>
```

## `KuzuQAChain` 생성

이제 `KuzuGraph`와 `KuzuQAChain`을 생성할 수 있습니다. `KuzuGraph`를 생성하려면 데이터베이스 객체를 `KuzuGraph` 생성자에 전달하기만 하면 됩니다.

```python
from langchain.chains import KuzuQAChain
from langchain_community.graphs import KuzuGraph
from langchain_openai import ChatOpenAI
```

```python
graph = KuzuGraph(db)
```

```python
chain = KuzuQAChain.from_llm(ChatOpenAI(temperature=0), graph=graph, verbose=True)
```

## 그래프 스키마 정보 새로 고침

데이터베이스 스키마가 변경되면 Cypher 문을 생성하는 데 필요한 스키마 정보를 새로 고칠 수 있습니다.

```python
# graph.refresh_schema()
```

```python
print(graph.get_schema)
```

```output
Node properties: [{'properties': [('name', 'STRING')], 'label': 'Movie'}, {'properties': [('name', 'STRING'), ('birthDate', 'STRING')], 'label': 'Person'}]
Relationships properties: [{'properties': [], 'label': 'ActedIn'}]
Relationships: ['(:Person)-[:ActedIn]->(:Movie)']
```

## 그래프 쿼리

이제 `KuzuQAChain`을 사용하여 그래프에 질문할 수 있습니다.

```python
chain.run("Who played in The Godfather: Part II?")
```

```output


[1m> Entering new  chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (p:Person)-[:ActedIn]->(m:Movie {name: 'The Godfather: Part II'}) RETURN p.name[0m
Full Context:
[32;1m[1;3m[{'p.name': 'Al Pacino'}, {'p.name': 'Robert De Niro'}][0m

[1m> Finished chain.[0m
```

```output
'Al Pacino and Robert De Niro both played in The Godfather: Part II.'
```

```python
chain.run("Robert De Niro played in which movies?")
```

```output


[1m> Entering new  chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (p:Person {name: 'Robert De Niro'})-[:ActedIn]->(m:Movie)
RETURN m.name[0m
Full Context:
[32;1m[1;3m[{'m.name': 'The Godfather: Part II'}][0m

[1m> Finished chain.[0m
```

```output
'Robert De Niro played in The Godfather: Part II.'
```

```python
chain.run("Robert De Niro is born in which year?")
```

```output


[1m> Entering new  chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (p:Person {name: 'Robert De Niro'})-[:ActedIn]->(m:Movie)
RETURN p.birthDate[0m
Full Context:
[32;1m[1;3m[{'p.birthDate': '1943-08-17'}][0m

[1m> Finished chain.[0m
```

```output
'Robert De Niro was born on August 17, 1943.'
```

```python
chain.run("Who is the oldest actor who played in The Godfather: Part II?")
```

```output


[1m> Entering new  chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (p:Person)-[:ActedIn]->(m:Movie{name:'The Godfather: Part II'})
WITH p, m, p.birthDate AS birthDate
ORDER BY birthDate ASC
LIMIT 1
RETURN p.name[0m
Full Context:
[32;1m[1;3m[{'p.name': 'Al Pacino'}][0m

[1m> Finished chain.[0m
```

```output
'The oldest actor who played in The Godfather: Part II is Al Pacino.'
```
