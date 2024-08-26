---
translated: true
---

# ArangoDB

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/arangodb/interactive_tutorials/blob/master/notebooks/Langchain.ipynb)

>[ArangoDB](https://github.com/arangodb/arangodb)는 연결된 데이터에서 더 빠르게 가치를 창출할 수 있는 확장 가능한 그래프 데이터베이스 시스템입니다. 네이티브 그래프, 통합 검색 엔진 및 단일 쿼리 언어를 통한 JSON 지원을 제공합니다. `ArangoDB`는 온프레미스 또는 클라우드에서 실행됩니다.

이 노트북은 [ArangoDB](https://github.com/arangodb/arangodb#readme) 데이터베이스에 대한 자연어 인터페이스를 제공하는 LLM(Large Language Model)의 사용 방법을 보여줍니다.

## 설정

[ArangoDB Docker 이미지](https://hub.docker.com/_/arangodb)를 통해 로컬 `ArangoDB` 인스턴스를 실행할 수 있습니다:

```bash
docker run -p 8529:8529 -e ARANGO_ROOT_PASSWORD= arangodb/arangodb
```

대안으로 [ArangoDB Cloud Connector 패키지](https://github.com/arangodb/adb-cloud-connector#readme)를 사용하여 임시 클라우드 인스턴스를 실행할 수 있습니다:

```python
%%capture
%pip install --upgrade --quiet  python-arango # The ArangoDB Python Driver
%pip install --upgrade --quiet  adb-cloud-connector # The ArangoDB Cloud Instance provisioner
%pip install --upgrade --quiet  langchain-openai
%pip install --upgrade --quiet  langchain
```

```python
# Instantiate ArangoDB Database
import json

from adb_cloud_connector import get_temp_credentials
from arango import ArangoClient

con = get_temp_credentials()

db = ArangoClient(hosts=con["url"]).db(
    con["dbName"], con["username"], con["password"], verify=True
)

print(json.dumps(con, indent=2))
```

```output
Log: requesting new credentials...
Succcess: new credentials acquired
{
  "dbName": "TUT3sp29s3pjf1io0h4cfdsq",
  "username": "TUTo6nkwgzkizej3kysgdyeo8",
  "password": "TUT9vx0qjqt42i9bq8uik4v9",
  "hostname": "tutorials.arangodb.cloud",
  "port": 8529,
  "url": "https://tutorials.arangodb.cloud:8529"
}
```

```python
# Instantiate the ArangoDB-LangChain Graph
from langchain_community.graphs import ArangoGraph

graph = ArangoGraph(db)
```

## 데이터베이스 채우기

[GameOfThrones](https://github.com/arangodb/example-datasets/tree/master/GameOfThrones) 데이터를 데이터베이스에 가져오기 위해 `Python Driver`를 사용할 것입니다.

```python
if db.has_graph("GameOfThrones"):
    db.delete_graph("GameOfThrones", drop_collections=True)

db.create_graph(
    "GameOfThrones",
    edge_definitions=[
        {
            "edge_collection": "ChildOf",
            "from_vertex_collections": ["Characters"],
            "to_vertex_collections": ["Characters"],
        },
    ],
)

documents = [
    {
        "_key": "NedStark",
        "name": "Ned",
        "surname": "Stark",
        "alive": True,
        "age": 41,
        "gender": "male",
    },
    {
        "_key": "CatelynStark",
        "name": "Catelyn",
        "surname": "Stark",
        "alive": False,
        "age": 40,
        "gender": "female",
    },
    {
        "_key": "AryaStark",
        "name": "Arya",
        "surname": "Stark",
        "alive": True,
        "age": 11,
        "gender": "female",
    },
    {
        "_key": "BranStark",
        "name": "Bran",
        "surname": "Stark",
        "alive": True,
        "age": 10,
        "gender": "male",
    },
]

edges = [
    {"_to": "Characters/NedStark", "_from": "Characters/AryaStark"},
    {"_to": "Characters/NedStark", "_from": "Characters/BranStark"},
    {"_to": "Characters/CatelynStark", "_from": "Characters/AryaStark"},
    {"_to": "Characters/CatelynStark", "_from": "Characters/BranStark"},
]

db.collection("Characters").import_bulk(documents)
db.collection("ChildOf").import_bulk(edges)
```

```output
{'error': False,
 'created': 4,
 'errors': 0,
 'empty': 0,
 'updated': 0,
 'ignored': 0,
 'details': []}
```

## ArangoDB 스키마 가져오기 및 설정

`ArangoDBGraph` 객체를 인스턴스화하면 초기 `ArangoDB 스키마`가 생성됩니다. 아래는 스키마의 getter 및 setter 메서드로, 스키마를 보거나 수정할 수 있습니다:

```python
# The schema should be empty here,
# since `graph` was initialized prior to ArangoDB Data ingestion (see above).

import json

print(json.dumps(graph.schema, indent=4))
```

```output
{
    "Graph Schema": [],
    "Collection Schema": []
}
```

```python
graph.set_schema()
```

```python
# We can now view the generated schema

import json

print(json.dumps(graph.schema, indent=4))
```

```output
{
    "Graph Schema": [
        {
            "graph_name": "GameOfThrones",
            "edge_definitions": [
                {
                    "edge_collection": "ChildOf",
                    "from_vertex_collections": [
                        "Characters"
                    ],
                    "to_vertex_collections": [
                        "Characters"
                    ]
                }
            ]
        }
    ],
    "Collection Schema": [
        {
            "collection_name": "ChildOf",
            "collection_type": "edge",
            "edge_properties": [
                {
                    "name": "_key",
                    "type": "str"
                },
                {
                    "name": "_id",
                    "type": "str"
                },
                {
                    "name": "_from",
                    "type": "str"
                },
                {
                    "name": "_to",
                    "type": "str"
                },
                {
                    "name": "_rev",
                    "type": "str"
                }
            ],
            "example_edge": {
                "_key": "266218884025",
                "_id": "ChildOf/266218884025",
                "_from": "Characters/AryaStark",
                "_to": "Characters/NedStark",
                "_rev": "_gVPKGSq---"
            }
        },
        {
            "collection_name": "Characters",
            "collection_type": "document",
            "document_properties": [
                {
                    "name": "_key",
                    "type": "str"
                },
                {
                    "name": "_id",
                    "type": "str"
                },
                {
                    "name": "_rev",
                    "type": "str"
                },
                {
                    "name": "name",
                    "type": "str"
                },
                {
                    "name": "surname",
                    "type": "str"
                },
                {
                    "name": "alive",
                    "type": "bool"
                },
                {
                    "name": "age",
                    "type": "int"
                },
                {
                    "name": "gender",
                    "type": "str"
                }
            ],
            "example_document": {
                "_key": "NedStark",
                "_id": "Characters/NedStark",
                "_rev": "_gVPKGPi---",
                "name": "Ned",
                "surname": "Stark",
                "alive": true,
                "age": 41,
                "gender": "male"
            }
        }
    ]
}
```

## ArangoDB 데이터베이스 쿼리

이제 `ArangoDB Graph` QA Chain을 사용하여 데이터에 대해 문의할 수 있습니다.

```python
import os

os.environ["OPENAI_API_KEY"] = "your-key-here"
```

```python
from langchain.chains import ArangoGraphQAChain
from langchain_openai import ChatOpenAI

chain = ArangoGraphQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True
)
```

```python
chain.run("Is Ned Stark alive?")
```

```output


[1m> Entering new ArangoGraphQAChain chain...[0m
AQL Query (1):[32;1m[1;3m
WITH Characters
FOR character IN Characters
FILTER character.name == "Ned" AND character.surname == "Stark"
RETURN character.alive
[0m
AQL Result:
[32;1m[1;3m[True][0m

[1m> Finished chain.[0m
```

```output
'Yes, Ned Stark is alive.'
```

```python
chain.run("How old is Arya Stark?")
```

```output


[1m> Entering new ArangoGraphQAChain chain...[0m
AQL Query (1):[32;1m[1;3m
WITH Characters
FOR character IN Characters
FILTER character.name == "Arya" && character.surname == "Stark"
RETURN character.age
[0m
AQL Result:
[32;1m[1;3m[11][0m

[1m> Finished chain.[0m
```

```output
'Arya Stark is 11 years old.'
```

```python
chain.run("Are Arya Stark and Ned Stark related?")
```

```output


[1m> Entering new ArangoGraphQAChain chain...[0m
AQL Query (1):[32;1m[1;3m
WITH Characters, ChildOf
FOR v, e, p IN 1..1 OUTBOUND 'Characters/AryaStark' ChildOf
    FILTER p.vertices[-1]._key == 'NedStark'
    RETURN p
[0m
AQL Result:
[32;1m[1;3m[{'vertices': [{'_key': 'AryaStark', '_id': 'Characters/AryaStark', '_rev': '_gVPKGPi--B', 'name': 'Arya', 'surname': 'Stark', 'alive': True, 'age': 11, 'gender': 'female'}, {'_key': 'NedStark', '_id': 'Characters/NedStark', '_rev': '_gVPKGPi---', 'name': 'Ned', 'surname': 'Stark', 'alive': True, 'age': 41, 'gender': 'male'}], 'edges': [{'_key': '266218884025', '_id': 'ChildOf/266218884025', '_from': 'Characters/AryaStark', '_to': 'Characters/NedStark', '_rev': '_gVPKGSq---'}], 'weights': [0, 1]}][0m

[1m> Finished chain.[0m
```

```output
'Yes, Arya Stark and Ned Stark are related. According to the information retrieved from the database, there is a relationship between them. Arya Stark is the child of Ned Stark.'
```

```python
chain.run("Does Arya Stark have a dead parent?")
```

```output


[1m> Entering new ArangoGraphQAChain chain...[0m
AQL Query (1):[32;1m[1;3m
WITH Characters, ChildOf
FOR v, e IN 1..1 OUTBOUND 'Characters/AryaStark' ChildOf
FILTER v.alive == false
RETURN e
[0m
AQL Result:
[32;1m[1;3m[{'_key': '266218884027', '_id': 'ChildOf/266218884027', '_from': 'Characters/AryaStark', '_to': 'Characters/CatelynStark', '_rev': '_gVPKGSu---'}][0m

[1m> Finished chain.[0m
```

```output
'Yes, Arya Stark has a dead parent. The parent is Catelyn Stark.'
```

## Chain 수정자

`ArangoDBGraphQAChain` 클래스 변수 값을 변경하여 체인 결과의 동작을 수정할 수 있습니다.

```python
# Specify the maximum number of AQL Query Results to return
chain.top_k = 10

# Specify whether or not to return the AQL Query in the output dictionary
chain.return_aql_query = True

# Specify whether or not to return the AQL JSON Result in the output dictionary
chain.return_aql_result = True

# Specify the maximum amount of AQL Generation attempts that should be made
chain.max_aql_generation_attempts = 5

# Specify a set of AQL Query Examples, which are passed to
# the AQL Generation Prompt Template to promote few-shot-learning.
# Defaults to an empty string.
chain.aql_examples = """
# Is Ned Stark alive?
RETURN DOCUMENT('Characters/NedStark').alive

# Is Arya Stark the child of Ned Stark?
FOR e IN ChildOf
    FILTER e._from == "Characters/AryaStark" AND e._to == "Characters/NedStark"
    RETURN e
"""
```

```python
chain.run("Is Ned Stark alive?")

# chain("Is Ned Stark alive?") # Returns a dictionary with the AQL Query & AQL Result
```

```output


[1m> Entering new ArangoGraphQAChain chain...[0m
AQL Query (1):[32;1m[1;3m
RETURN DOCUMENT('Characters/NedStark').alive
[0m
AQL Result:
[32;1m[1;3m[True][0m

[1m> Finished chain.[0m
```

```output
'Yes, according to the information in the database, Ned Stark is alive.'
```

```python
chain.run("Is Bran Stark the child of Ned Stark?")
```

```output


[1m> Entering new ArangoGraphQAChain chain...[0m
AQL Query (1):[32;1m[1;3m
FOR e IN ChildOf
    FILTER e._from == "Characters/BranStark" AND e._to == "Characters/NedStark"
    RETURN e
[0m
AQL Result:
[32;1m[1;3m[{'_key': '266218884026', '_id': 'ChildOf/266218884026', '_from': 'Characters/BranStark', '_to': 'Characters/NedStark', '_rev': '_gVPKGSq--_'}][0m

[1m> Finished chain.[0m
```

```output
'Yes, according to the information in the ArangoDB database, Bran Stark is indeed the child of Ned Stark.'
```
