---
translated: true
---

# NebulaGraph

>[NebulaGraph](https://www.nebula-graph.io/)은 수백만 개의 노드와 관계를 가진 대규모 그래프 데이터베이스를 위해 설계된 오픈 소스, 분산형, 확장 가능한 고속 그래프 데이터베이스입니다. `nGQL` 그래프 쿼리 언어를 사용합니다.
>
>[nGQL](https://docs.nebula-graph.io/3.0.0/3.ngql-guide/1.nGQL-overview/1.overview/)은 `NebulaGraph`를 위한 선언형 그래프 쿼리 언어입니다. 표현력 있고 효율적인 그래프 패턴을 허용합니다. `nGQL`은 개발자와 운영 전문가 모두를 위해 설계되었으며 SQL과 유사한 쿼리 언어입니다.

이 노트북은 LLM을 사용하여 `NebulaGraph` 데이터베이스에 대한 자연어 인터페이스를 제공하는 방법을 보여줍니다.

## 설정

다음 스크립트를 실행하여 Docker 컨테이너에서 `NebulaGraph` 클러스터를 시작할 수 있습니다:

```bash
curl -fsSL nebula-up.siwei.io/install.sh | bash
```

다른 옵션은 다음과 같습니다:
- [Docker Desktop Extension](https://www.docker.com/blog/distributed-cloud-native-graph-database-nebulagraph-docker-extension/)으로 설치. [여기](https://docs.nebula-graph.io/3.5.0/2.quick-start/1.quick-start-workflow/)를 참조하세요.
- NebulaGraph Cloud Service. [여기](https://www.nebula-graph.io/cloud)를 참조하세요.
- 패키지, 소스 코드 또는 Kubernetes를 통해 배포. [여기](https://docs.nebula-graph.io/)를 참조하세요.

클러스터가 실행되면 데이터베이스에 대한 `SPACE`와 `SCHEMA`를 생성할 수 있습니다.

```python
%pip install --upgrade --quiet  ipython-ngql
%load_ext ngql

# connect ngql jupyter extension to nebulagraph
%ngql --address 127.0.0.1 --port 9669 --user root --password nebula
# create a new space
%ngql CREATE SPACE IF NOT EXISTS langchain(partition_num=1, replica_factor=1, vid_type=fixed_string(128));
```

```python
# Wait for a few seconds for the space to be created.
%ngql USE langchain;
```

전체 데이터셋에 대한 스키마 생성은 [여기](https://www.siwei.io/en/nebulagraph-etl-dbt/)를 참조하세요.

```python
%%ngql
CREATE TAG IF NOT EXISTS movie(name string);
CREATE TAG IF NOT EXISTS person(name string, birthdate string);
CREATE EDGE IF NOT EXISTS acted_in();
CREATE TAG INDEX IF NOT EXISTS person_index ON person(name(128));
CREATE TAG INDEX IF NOT EXISTS movie_index ON movie(name(128));
```

스키마 생성이 완료되면 데이터를 삽입할 수 있습니다.

```python
%%ngql
INSERT VERTEX person(name, birthdate) VALUES "Al Pacino":("Al Pacino", "1940-04-25");
INSERT VERTEX movie(name) VALUES "The Godfather II":("The Godfather II");
INSERT VERTEX movie(name) VALUES "The Godfather Coda: The Death of Michael Corleone":("The Godfather Coda: The Death of Michael Corleone");
INSERT EDGE acted_in() VALUES "Al Pacino"->"The Godfather II":();
INSERT EDGE acted_in() VALUES "Al Pacino"->"The Godfather Coda: The Death of Michael Corleone":();
```

```python
from langchain.chains import NebulaGraphQAChain
from langchain_community.graphs import NebulaGraph
from langchain_openai import ChatOpenAI
```

```python
graph = NebulaGraph(
    space="langchain",
    username="root",
    password="nebula",
    address="127.0.0.1",
    port=9669,
    session_pool_size=30,
)
```

## 그래프 스키마 정보 새로 고침

데이터베이스 스키마가 변경되면 nGQL 문을 생성하는 데 필요한 스키마 정보를 새로 고칠 수 있습니다.

```python
# graph.refresh_schema()
```

```python
print(graph.get_schema)
```

```output
Node properties: [{'tag': 'movie', 'properties': [('name', 'string')]}, {'tag': 'person', 'properties': [('name', 'string'), ('birthdate', 'string')]}]
Edge properties: [{'edge': 'acted_in', 'properties': []}]
Relationships: ['(:person)-[:acted_in]->(:movie)']
```

## 그래프 쿼리

이제 그래프 Cypher QA 체인을 사용하여 그래프에 질문할 수 있습니다.

```python
chain = NebulaGraphQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True
)
```

```python
chain.run("Who played in The Godfather II?")
```

```output


[1m> Entering new NebulaGraphQAChain chain...[0m
Generated nGQL:
[32;1m[1;3mMATCH (p:`person`)-[:acted_in]->(m:`movie`) WHERE m.`movie`.`name` == 'The Godfather II'
RETURN p.`person`.`name`[0m
Full Context:
[32;1m[1;3m{'p.person.name': ['Al Pacino']}[0m

[1m> Finished chain.[0m
```

```output
'Al Pacino played in The Godfather II.'
```
