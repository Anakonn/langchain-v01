---
translated: true
---

# Neo4j

>[Neo4j](https://neo4j.com/docs/getting-started/)は、`Neo4j, Inc`によって開発されたグラフデータベース管理システムです。

>`Neo4j`が保存するデータ要素は、ノード、それらを接続するエッジ、およびノードとエッジの属性です。開発者によると、`Neo4j`はACID準拠のトランザクションデータベースで、ネイティブのグラフストレージと処理を備えています。`Neo4j`は、GNU General Public Licenseの改変版でライセンスされた非オープンソースの「コミュニティエディション」で提供されており、オンラインバックアップと高可用性拡張機能は閉鎖ソースの商用ライセンスの下でライセンスされています。Neoは、これらの拡張機能を閉鎖ソースの商用条件でも`Neo4j`にライセンスしています。

>このノートブックでは、LLMを使ってグラフデータベースに自然言語インターフェイスを提供し、`Cypher`クエリ言語でクエリできるようにする方法を示します。

>[Cypher](https://en.wikipedia.org/wiki/Cypher_(query_language))は、プロパティグラフでデータを効率的かつ表現力豊かにクエリできる宣言型のグラフクエリ言語です。

## セットアップ

`Neo4j`インスタンスを実行する必要があります。1つのオプションは、[Neo4jのAuraクラウドサービスで無料のNeo4jデータベースインスタンスを作成](https://neo4j.com/cloud/platform/aura-graph-database/)することです。また、[Neo4j Desktopアプリケーション](https://neo4j.com/download/)を使ってローカルでデータベースを実行したり、Dockerコンテナを実行したりすることもできます。
次のスクリプトを実行してローカルのDockerコンテナを実行できます:

```bash
docker run \
    --name neo4j \
    -p 7474:7474 -p 7687:7687 \
    -d \
    -e NEO4J_AUTH=neo4j/password \
    -e NEO4J_PLUGINS=\[\"apoc\"\]  \
    neo4j:latest
```

Dockerコンテナを使用している場合は、データベースの起動に数秒かかるので待つ必要があります。

```python
from langchain.chains import GraphCypherQAChain
from langchain_community.graphs import Neo4jGraph
from langchain_openai import ChatOpenAI
```

```python
graph = Neo4jGraph(url="bolt://localhost:7687", username="neo4j", password="password")
```

## データベースの初期化

データベースが空の場合、Cypherクエリ言語を使ってデータを入力できます。次のCypherステートメントは冪等性があり、1回または複数回実行しても同じデータベース情報になります。

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

## グラフスキーマ情報の更新

データベースのスキーマが変更された場合は、Cypherステートメントを生成するために必要なスキーマ情報を更新できます。

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

## 拡張されたスキーマ情報

拡張されたスキーマバージョンを選択すると、システムがデータベース内の例値をスキャンし、いくつかの分布メトリックを計算できるようになります。たとえば、ノードプロパティに10種類未満の値しかない場合は、すべての可能な値をスキーマに返します。それ以外の場合は、ノードおよび関係プロパティごとに1つの例値のみを返します。

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

## グラフのクエリ

グラフCypherQAチェーンを使って、グラフに質問することができます。

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

## 結果の数を制限する

`top_k`パラメーターを使ってCypherQAチェーンからの結果の数を制限できます。
デフォルトは10です。

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

## 中間結果を返す

`return_intermediate_steps`パラメーターを使ってCypherQAチェーンから中間ステップを返すことができます。

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

## 直接結果を返す

`return_direct`パラメーターを使ってCypherQAチェーンから直接結果を返すことができます。

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

## Cypherの生成プロンプトに例を追加する

特定の質問に対してLLMが生成するCypherステートメントを定義できます。

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

## CypherとAnswer生成に別のLLMを使う

`cypher_llm`と`qa_llm`パラメーターを使って、異なるLLMを定義できます。

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

## 指定したノードおよび関係タイプを無視する

`include_types`または`exclude_types`を使って、Cypherステートメントの生成時にグラフスキーマの一部を無視できます。

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

## 生成されたCypherステートメントを検証する

`validate_cypher`パラメーターを使って、生成されたCypherステートメントの関係の方向を検証および修正できます。

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
