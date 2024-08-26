---
translated: true
---

# 멤그래프

>[Memgraph](https://github.com/memgraph/memgraph)는 `Neo4j`와 호환되는 오픈 소스 그래프 데이터베이스입니다.
>이 데이터베이스는 `Cypher` 그래프 쿼리 언어를 사용합니다.
>
>[Cypher](https://en.wikipedia.org/wiki/Cypher_(query_language))는 속성 그래프에서 표현력 있고 효율적인 데이터 쿼리를 허용하는 선언형 그래프 쿼리 언어입니다.

이 노트북은 LLM을 사용하여 [Memgraph](https://github.com/memgraph/memgraph) 데이터베이스에 자연어 인터페이스를 제공하는 방법을 보여줍니다.

## 설정

이 튜토리얼을 완료하려면 [Docker](https://www.docker.com/get-started/)와 [Python 3.x](https://www.python.org/)가 설치되어 있어야 합니다.

실행 중인 Memgraph 인스턴스가 있는지 확인하세요. Memgraph Platform(Memgraph 데이터베이스 + MAGE 라이브러리 + Memgraph Lab)을 처음 실행하려면 다음을 수행하세요:

Linux/MacOS에서:

```bash
curl https://install.memgraph.com | sh
```

Windows에서:

```bash
iwr https://windows.memgraph.com | iex
```

두 명령 모두 Docker Compose 파일을 시스템에 다운로드하고, `memgraph-mage`와 `memgraph-lab` Docker 서비스를 두 개의 별도 컨테이너에서 빌드하고 시작합니다.

설치 프로세스에 대한 자세한 내용은 [Memgraph 문서](https://memgraph.com/docs/getting-started/install-memgraph)를 참조하세요.

이제 `Memgraph`를 사용해 볼 수 있습니다!

필요한 모든 패키지를 설치하고 가져오는 것으로 시작합니다. [pip](https://pip.pypa.io/en/stable/installation/)라는 패키지 관리자를 사용하고 `--user` 플래그를 사용하여 적절한 권한을 보장합니다. Python 3.4 이상을 설치한 경우 pip가 기본적으로 포함됩니다. 다음 명령을 사용하여 필요한 모든 패키지를 설치할 수 있습니다:

```python
pip install langchain langchain-openai neo4j gqlalchemy --user
```

제공된 코드 블록을 이 노트북에서 실행하거나 별도의 Python 파일을 사용하여 Memgraph와 LangChain을 실험할 수 있습니다.

```python
import os

from gqlalchemy import Memgraph
from langchain.chains import GraphCypherQAChain
from langchain_community.graphs import MemgraphGraph
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
```

Memgraph 데이터베이스와 Python 스크립트 간의 연결을 설정하기 위해 [GQLAlchemy](https://github.com/memgraph/gqlalchemy) Python 라이브러리를 사용하고 있습니다. Neo4j 드라이버를 사용하여 실행 중인 Memgraph 인스턴스에 연결할 수도 있습니다. GQLAlchemy를 사용하여 쿼리를 실행하려면 다음과 같이 Memgraph 인스턴스를 설정할 수 있습니다:

```python
memgraph = Memgraph(host="127.0.0.1", port=7687)
```

## 데이터베이스 채우기

Cypher 쿼리 언어를 사용하여 새로운 빈 데이터베이스를 쉽게 채울 수 있습니다. 아직 모든 내용을 이해하지 못하더라도 걱정하지 마세요. Cypher에 대해서는 [여기](https://memgraph.com/docs/cypher-manual/)에서 자세히 알아볼 수 있습니다. 다음 스크립트를 실행하면 데이터베이스에 실행되는 시드 쿼리가 실행되어 게임 퍼블리셔, 사용 가능한 플랫폼, 장르 등의 세부 정보가 포함된 비디오 게임에 대한 데이터를 제공합니다. 이 데이터는 우리의 작업 기반이 될 것입니다.

```python
# Creating and executing the seeding query
query = """
    MERGE (g:Game {name: "Baldur's Gate 3"})
    WITH g, ["PlayStation 5", "Mac OS", "Windows", "Xbox Series X/S"] AS platforms,
            ["Adventure", "Role-Playing Game", "Strategy"] AS genres
    FOREACH (platform IN platforms |
        MERGE (p:Platform {name: platform})
        MERGE (g)-[:AVAILABLE_ON]->(p)
    )
    FOREACH (genre IN genres |
        MERGE (gn:Genre {name: genre})
        MERGE (g)-[:HAS_GENRE]->(gn)
    )
    MERGE (p:Publisher {name: "Larian Studios"})
    MERGE (g)-[:PUBLISHED_BY]->(p);
"""

memgraph.execute(query)
```

## 그래프 스키마 새로고침

다음 스크립트를 실행하여 Memgraph-LangChain 그래프를 인스턴스화할 수 있습니다. 이 인터페이스를 통해 LangChain을 사용하여 데이터베이스를 쿼리할 수 있으며, LLM을 통해 필요한 Cypher 쿼리를 자동으로 생성할 수 있습니다.

```python
graph = MemgraphGraph(url="bolt://localhost:7687", username="", password="")
```

필요한 경우 다음과 같이 수동으로 그래프 스키마를 새로고칠 수 있습니다.

```python
graph.refresh_schema()
```

데이터를 익숙해지고 업데이트된 그래프 스키마를 확인하려면 다음 문을 사용하여 출력할 수 있습니다.

```python
print(graph.schema)
```

```output
Node properties are the following:
Node name: 'Game', Node properties: [{'property': 'name', 'type': 'str'}]
Node name: 'Platform', Node properties: [{'property': 'name', 'type': 'str'}]
Node name: 'Genre', Node properties: [{'property': 'name', 'type': 'str'}]
Node name: 'Publisher', Node properties: [{'property': 'name', 'type': 'str'}]

Relationship properties are the following:

The relationships are the following:
['(:Game)-[:AVAILABLE_ON]->(:Platform)']
['(:Game)-[:HAS_GENRE]->(:Genre)']
['(:Game)-[:PUBLISHED_BY]->(:Publisher)']
```

## 데이터베이스 쿼리

OpenAI API와 상호 작용하려면 Python [os](https://docs.python.org/3/library/os.html) 패키지를 사용하여 API 키를 환경 변수로 구성해야 합니다. 이렇게 하면 요청에 대한 적절한 권한 부여가 보장됩니다. API 키 얻는 방법에 대한 자세한 내용은 [여기](https://help.openai.com/en/articles/4936850-where-do-i-find-my-secret-api-key)에서 확인할 수 있습니다.

```python
os.environ["OPENAI_API_KEY"] = "your-key-here"
```

질문 답변 프로세스에 사용될 그래프 체인을 다음 스크립트를 사용하여 생성해야 합니다. 기본적으로 GPT-3.5-turbo를 사용하지만 [GPT-4](https://help.openai.com/en/articles/7102672-how-can-i-access-gpt-4)와 같은 다른 모델을 실험해볼 수도 있습니다. OpenAI 채팅을 사용하고 이전에 구성한 키를 사용합니다. 온도를 0으로 설정하여 예측 가능하고 일관된 답변을 얻습니다. 또한 Memgraph-LangChain 그래프를 사용하고 기본값인 False인 verbose 매개변수를 True로 설정하여 쿼리 생성에 대한 더 자세한 메시지를 받습니다.

```python
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True, model_name="gpt-3.5-turbo"
)
```

이제 질문을 시작할 수 있습니다!

```python
response = chain.run("Which platforms is Baldur's Gate 3 available on?")
print(response)
```

```output
> Entering new GraphCypherQAChain chain...
Generated Cypher:
MATCH (g:Game {name: 'Baldur\'s Gate 3'})-[:AVAILABLE_ON]->(p:Platform)
RETURN p.name
Full Context:
[{'p.name': 'PlayStation 5'}, {'p.name': 'Mac OS'}, {'p.name': 'Windows'}, {'p.name': 'Xbox Series X/S'}]

> Finished chain.
Baldur's Gate 3 is available on PlayStation 5, Mac OS, Windows, and Xbox Series X/S.
```

```python
response = chain.run("Is Baldur's Gate 3 available on Windows?")
print(response)
```

```output
> Entering new GraphCypherQAChain chain...
Generated Cypher:
MATCH (:Game {name: 'Baldur\'s Gate 3'})-[:AVAILABLE_ON]->(:Platform {name: 'Windows'})
RETURN true
Full Context:
[{'true': True}]

> Finished chain.
Yes, Baldur's Gate 3 is available on Windows.
```

## 체인 수정자

체인의 동작을 수정하고 더 많은 컨텍스트 또는 추가 정보를 얻으려면 체인 매개변수를 수정할 수 있습니다.

#### 직접 쿼리 결과 반환

`return_direct` 수정자는 실행된 Cypher 쿼리의 직접 결과를 반환할지 아니면 처리된 자연어 응답을 반환할지 지정합니다.

```python
# Return the result of querying the graph directly
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True, return_direct=True
)
```

```python
response = chain.run("Which studio published Baldur's Gate 3?")
print(response)
```

```output
> Entering new GraphCypherQAChain chain...
Generated Cypher:
MATCH (:Game {name: 'Baldur\'s Gate 3'})-[:PUBLISHED_BY]->(p:Publisher)
RETURN p.name

> Finished chain.
[{'p.name': 'Larian Studios'}]
```

#### 쿼리 중간 단계 반환

`return_intermediate_steps` 체인 수정자는 초기 쿼리 결과 외에도 쿼리의 중간 단계를 포함하여 반환된 응답을 향상시킵니다.

```python
# Return all the intermediate steps of query execution
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True, return_intermediate_steps=True
)
```

```python
response = chain("Is Baldur's Gate 3 an Adventure game?")
print(f"Intermediate steps: {response['intermediate_steps']}")
print(f"Final response: {response['result']}")
```

```output
> Entering new GraphCypherQAChain chain...
Generated Cypher:
MATCH (g:Game {name: 'Baldur\'s Gate 3'})-[:HAS_GENRE]->(genre:Genre {name: 'Adventure'})
RETURN g, genre
Full Context:
[{'g': {'name': "Baldur's Gate 3"}, 'genre': {'name': 'Adventure'}}]

> Finished chain.
Intermediate steps: [{'query': "MATCH (g:Game {name: 'Baldur\\'s Gate 3'})-[:HAS_GENRE]->(genre:Genre {name: 'Adventure'})\nRETURN g, genre"}, {'context': [{'g': {'name': "Baldur's Gate 3"}, 'genre': {'name': 'Adventure'}}]}]
Final response: Yes, Baldur's Gate 3 is an Adventure game.
```

#### 쿼리 결과 수 제한

`top_k` 수식어는 쿼리 결과의 최대 개수를 제한하고 싶을 때 사용할 수 있습니다.

```python
# Limit the maximum number of results returned by query
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True, top_k=2
)
```

```python
response = chain.run("What genres are associated with Baldur's Gate 3?")
print(response)
```

```output
> Entering new GraphCypherQAChain chain...
Generated Cypher:
MATCH (:Game {name: 'Baldur\'s Gate 3'})-[:HAS_GENRE]->(g:Genre)
RETURN g.name
Full Context:
[{'g.name': 'Adventure'}, {'g.name': 'Role-Playing Game'}]

> Finished chain.
Baldur's Gate 3 is associated with the genres Adventure and Role-Playing Game.
```

# 고급 쿼리

솔루션의 복잡성이 증가함에 따라, 주의 깊게 처리해야 하는 다양한 사용 사례를 만날 수 있습니다. 사용자 흐름에 문제가 없도록 애플리케이션의 확장성을 보장하는 것이 필수적입니다.

체인을 다시 한 번 인스턴스화하고 사용자가 잠재적으로 물어볼 수 있는 질문을 해보겠습니다.

```python
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True, model_name="gpt-3.5-turbo"
)
```

```python
response = chain.run("Is Baldur's Gate 3 available on PS5?")
print(response)
```

```output
> Entering new GraphCypherQAChain chain...
Generated Cypher:
MATCH (g:Game {name: 'Baldur\'s Gate 3'})-[:AVAILABLE_ON]->(p:Platform {name: 'PS5'})
RETURN g.name, p.name
Full Context:
[]

> Finished chain.
I'm sorry, but I don't have the information to answer your question.
```

생성된 Cypher 쿼리는 괜찮아 보이지만, 응답을 받지 못했습니다. 이는 LLM을 사용할 때 겪을 수 있는 일반적인 문제를 보여줍니다 - 사용자가 쿼리를 표현하는 방식과 데이터가 저장되는 방식 간의 불일치입니다. 이 경우, 사용자의 인식과 실제 데이터 저장 간의 차이로 인해 불일치가 발생할 수 있습니다. 프롬프트 개선, 즉 모델의 프롬프트를 조정하여 이러한 차이를 더 잘 파악할 수 있도록 하는 것이 효과적인 해결책입니다. 프롬프트 개선을 통해 모델은 정확하고 관련성 있는 쿼리를 생성하는 능력이 향상되어, 원하는 데이터를 성공적으로 검색할 수 있습니다.

### 프롬프트 개선

이를 해결하기 위해 QA 체인의 초기 Cypher 프롬프트를 조정할 수 있습니다. 이를 위해 LLM에 사용자가 특정 플랫폼(예: PS5)을 어떻게 참조할 수 있는지에 대한 지침을 추가합니다. LangChain의 [PromptTemplate](/docs/modules/model_io/prompts/)을 사용하여 수정된 초기 프롬프트를 만들고, 이를 개선된 Memgraph-LangChain 인스턴스의 인수로 제공합니다.

```python
CYPHER_GENERATION_TEMPLATE = """
Task:Generate Cypher statement to query a graph database.
Instructions:
Use only the provided relationship types and properties in the schema.
Do not use any other relationship types or properties that are not provided.
Schema:
{schema}
Note: Do not include any explanations or apologies in your responses.
Do not respond to any questions that might ask anything else than for you to construct a Cypher statement.
Do not include any text except the generated Cypher statement.
If the user asks about PS5, Play Station 5 or PS 5, that is the platform called PlayStation 5.

The question is:
{question}
"""

CYPHER_GENERATION_PROMPT = PromptTemplate(
    input_variables=["schema", "question"], template=CYPHER_GENERATION_TEMPLATE
)
```

```python
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0),
    cypher_prompt=CYPHER_GENERATION_PROMPT,
    graph=graph,
    verbose=True,
    model_name="gpt-3.5-turbo",
)
```

```python
response = chain.run("Is Baldur's Gate 3 available on PS5?")
print(response)
```

```output
> Entering new GraphCypherQAChain chain...
Generated Cypher:
MATCH (g:Game {name: 'Baldur\'s Gate 3'})-[:AVAILABLE_ON]->(p:Platform {name: 'PlayStation 5'})
RETURN g.name, p.name
Full Context:
[{'g.name': "Baldur's Gate 3", 'p.name': 'PlayStation 5'}]

> Finished chain.
Yes, Baldur's Gate 3 is available on PlayStation 5.
```

이제 플랫폼 명명에 대한 지침이 포함된 수정된 초기 Cypher 프롬프트를 사용하여, 사용자 쿼리와 더 잘 일치하는 정확하고 관련성 있는 결과를 얻을 수 있습니다.

이러한 접근 방식을 통해 QA 체인을 계속 개선할 수 있습니다. 추가적인 프롬프트 개선 데이터를 체인에 쉽게 통합하여 전반적인 사용자 경험을 향상시킬 수 있습니다.
