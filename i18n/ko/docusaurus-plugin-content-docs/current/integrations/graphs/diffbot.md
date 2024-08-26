---
translated: true
---

# Diffbot

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/use_cases/graph/diffbot_graphtransformer.ipynb)

>Diffbot은 웹 데이터를 통합하고 조사하기 쉽게 만드는 제품군입니다.
>
>Diffbot 지식 그래프는 공개 웹의 자동 업데이트 그래프 데이터베이스입니다.

## 사용 사례

텍스트 데이터에는 다양한 분석, 추천 엔진 또는 지식 관리 애플리케이션에 사용되는 풍부한 관계와 통찰력이 포함되어 있습니다.

Diffbot의 NLP API를 사용하면 구조화되지 않은 텍스트 데이터에서 엔티티, 관계 및 의미적 의미를 추출할 수 있습니다.

Diffbot의 NLP API와 Neo4j 그래프 데이터베이스를 결합하면 텍스트에서 추출된 정보를 기반으로 강력하고 동적인 그래프 구조를 만들 수 있습니다. 이러한 그래프 구조는 완전히 쿼리 가능하며 다양한 애플리케이션에 통합될 수 있습니다.

이 조합을 통해 다음과 같은 사용 사례를 만들 수 있습니다:

* 텍스트 문서, 웹사이트 또는 소셜 미디어 피드에서 지식 그래프 구축
* 데이터의 의미론적 관계를 기반으로 추천 생성
* 엔티티 간 관계를 이해하는 고급 검색 기능 구축
* 데이터의 숨겨진 관계를 탐색할 수 있는 분석 대시보드 구축

## 개요

LangChain은 그래프 데이터베이스와 상호 작용하기 위한 도구를 제공합니다:

1. 그래프 변환기와 저장소 통합을 사용하여 텍스트에서 지식 그래프 구축
2. 쿼리 생성 및 실행 체인을 사용하여 그래프 데이터베이스 쿼리
3. 강력하고 유연한 쿼리를 위해 에이전트를 사용하여 그래프 데이터베이스와 상호 작용

## 설정

먼저 필요한 패키지를 가져오고 환경 변수를 설정합니다:

```python
%pip install --upgrade --quiet  langchain langchain-experimental langchain-openai neo4j wikipedia
```

### Diffbot NLP 서비스

Diffbot의 NLP 서비스는 구조화되지 않은 텍스트 데이터에서 엔티티, 관계 및 의미론적 컨텍스트를 추출하는 도구입니다.
이 추출된 정보는 지식 그래프를 구축하는 데 사용될 수 있습니다.
이 서비스를 사용하려면 [Diffbot](https://www.diffbot.com/products/natural-language/)에서 API 키를 얻어야 합니다.

```python
from langchain_experimental.graph_transformers.diffbot import DiffbotGraphTransformer

diffbot_api_key = "DIFFBOT_API_KEY"
diffbot_nlp = DiffbotGraphTransformer(diffbot_api_key=diffbot_api_key)
```

이 코드는 "Warren Buffett"에 대한 Wikipedia 기사를 가져온 다음 `DiffbotGraphTransformer`를 사용하여 엔티티와 관계를 추출합니다.
`DiffbotGraphTransformer`는 구조화된 데이터 `GraphDocument`를 출력하며, 이를 사용하여 그래프 데이터베이스를 채울 수 있습니다.
Diffbot의 [API 요청당 문자 제한](https://docs.diffbot.com/reference/introduction-to-natural-language-api)으로 인해 텍스트 청크화가 피해졌습니다.

```python
from langchain_community.document_loaders import WikipediaLoader

query = "Warren Buffett"
raw_documents = WikipediaLoader(query=query).load()
graph_documents = diffbot_nlp.convert_to_graph_documents(raw_documents)
```

## 데이터를 지식 그래프에 로드하기

실행 중인 Neo4j 인스턴스가 필요합니다. 옵션 중 하나는 [Neo4j Aura 클라우드 서비스](https://neo4j.com/cloud/platform/aura-graph-database/)에서 무료 Neo4j 데이터베이스 인스턴스를 만드는 것입니다. 또한 [Neo4j Desktop 애플리케이션](https://neo4j.com/download/)을 사용하거나 Docker 컨테이너를 실행하여 로컬에서 데이터베이스를 실행할 수 있습니다. 다음 스크립트를 실행하여 로컬 Docker 컨테이너를 실행할 수 있습니다:

```bash
docker run \
    --name neo4j \
    -p 7474:7474 -p 7687:7687 \
    -d \
    -e NEO4J_AUTH=neo4j/pleaseletmein \
    -e NEO4J_PLUGINS=\[\"apoc\"\]  \
    neo4j:latest
```

Docker 컨테이너를 사용하는 경우 데이터베이스가 시작되는 데 몇 초 정도 걸립니다.

```python
from langchain_community.graphs import Neo4jGraph

url = "bolt://localhost:7687"
username = "neo4j"
password = "pleaseletmein"

graph = Neo4jGraph(url=url, username=username, password=password)
```

`GraphDocuments`는 `add_graph_documents` 메서드를 사용하여 지식 그래프에 로드할 수 있습니다.

```python
graph.add_graph_documents(graph_documents)
```

## 그래프 스키마 정보 새로 고침

데이터베이스 스키마가 변경되면 Cypher 문을 생성하는 데 필요한 스키마 정보를 새로 고칠 수 있습니다.

```python
graph.refresh_schema()
```

## 그래프 쿼리

이제 그래프 Cypher QA 체인을 사용하여 그래프에 질문할 수 있습니다. Cypher 쿼리를 구성하려면 **gpt-4**를 사용하는 것이 좋습니다.

```python
from langchain.chains import GraphCypherQAChain
from langchain_openai import ChatOpenAI

chain = GraphCypherQAChain.from_llm(
    cypher_llm=ChatOpenAI(temperature=0, model_name="gpt-4"),
    qa_llm=ChatOpenAI(temperature=0, model_name="gpt-3.5-turbo"),
    graph=graph,
    verbose=True,
)
```

```python
chain.run("Which university did Warren Buffett attend?")
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (p:Person {name: "Warren Buffett"})-[:EDUCATED_AT]->(o:Organization)
RETURN o.name[0m
Full Context:
[32;1m[1;3m[{'o.name': 'New York Institute of Finance'}, {'o.name': 'Alice Deal Junior High School'}, {'o.name': 'Woodrow Wilson High School'}, {'o.name': 'University of Nebraska'}][0m

[1m> Finished chain.[0m
```

```output
'Warren Buffett attended the University of Nebraska.'
```

```python
chain.run("Who is or was working at Berkshire Hathaway?")
```

```output


[1m> Entering new GraphCypherQAChain chain...[0m
Generated Cypher:
[32;1m[1;3mMATCH (p:Person)-[r:EMPLOYEE_OR_MEMBER_OF]->(o:Organization) WHERE o.name = 'Berkshire Hathaway' RETURN p.name[0m
Full Context:
[32;1m[1;3m[{'p.name': 'Charlie Munger'}, {'p.name': 'Oliver Chace'}, {'p.name': 'Howard Buffett'}, {'p.name': 'Howard'}, {'p.name': 'Susan Buffett'}, {'p.name': 'Warren Buffett'}][0m

[1m> Finished chain.[0m
```

```output
'Charlie Munger, Oliver Chace, Howard Buffett, Susan Buffett, and Warren Buffett are or were working at Berkshire Hathaway.'
```
