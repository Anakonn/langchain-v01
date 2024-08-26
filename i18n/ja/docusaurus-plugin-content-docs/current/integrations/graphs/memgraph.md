---
translated: true
---

# Memgraph

>[Memgraph](https://github.com/memgraph/memgraph) は、`Neo4j` と互換性のあるオープンソースのグラフデータベースです。
>データベースは `Cypher` グラフクエリ言語を使用しています。
>
>[Cypher](https://en.wikipedia.org/wiki/Cypher_(query_language)) は、プロパティグラフにおいて表現力豊かで効率的なデータクエリを可能にする宣言型グラフクエリ言語です。

このノートブックでは、LLMを使用して [Memgraph](https://github.com/memgraph/memgraph) データベースに対する自然言語インターフェースを提供する方法を示します。

## セットアップ

このチュートリアルを完了するには、[Docker](https://www.docker.com/get-started/) と [Python 3.x](https://www.python.org/) がインストールされている必要があります。

Memgraphのインスタンスが実行中であることを確認してください。初めてMemgraph Platform（Memgraphデータベース + MAGEライブラリ + Memgraph Lab）を迅速に実行するには、次の操作を行います。

Linux/MacOSの場合:

```bash
curl https://install.memgraph.com | sh
```

Windowsの場合:

```bash
iwr https://windows.memgraph.com | iex
```

両方のコマンドはスクリプトを実行し、Docker Composeファイルをシステムにダウンロードし、`memgraph-mage` および `memgraph-lab` Dockerサービスを2つの別々のコンテナでビルドおよび開始します。

インストールプロセスの詳細については、[Memgraphドキュメント](https://memgraph.com/docs/getting-started/install-memgraph)を参照してください。

これで `Memgraph` を使い始めることができます！

必要なパッケージをすべてインストールしてインポートすることから始めます。パッケージマネージャー [pip](https://pip.pypa.io/en/stable/installation/) と `--user` フラグを使用して適切な権限を確保します。Python 3.4以降のバージョンをインストールしている場合、pipはデフォルトで含まれています。次のコマンドを使用して、必要なすべてのパッケージをインストールできます。

```python
pip install langchain langchain-openai neo4j gqlalchemy --user
```

提供されたコードブロックをこのノートブックで実行するか、別のPythonファイルを使用してMemgraphとLangChainを試すことができます。

```python
import os

from gqlalchemy import Memgraph
from langchain.chains import GraphCypherQAChain
from langchain_community.graphs import MemgraphGraph
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
```

Pythonライブラリ [GQLAlchemy](https://github.com/memgraph/gqlalchemy) を使用して、MemgraphデータベースとPythonスクリプト間の接続を確立します。Memgraphと互換性があるため、Neo4jドライバーを使用して実行中のMemgraphインスタンスに接続することもできます。GQLAlchemyを使用してクエリを実行するために、次のようにMemgraphインスタンスを設定できます。

```python
memgraph = Memgraph(host="127.0.0.1", port=7687)
```

## データベースのポピュレーション

Cypherクエリ言語を使用して、新しい空のデータベースを簡単に埋めることができます。各行を完全に理解していなくても心配しないでください。Cypherは [こちら](https://memgraph.com/docs/cypher-manual/) のドキュメントから学ぶことができます。次のスクリプトを実行すると、データベースに対してシーディングクエリが実行され、発行者、利用可能なプラットフォーム、ジャンルなどのビデオゲームに関するデータが取得されます。このデータは、私たちの作業の基盤となります。

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

## グラフスキーマの更新

次のスクリプトを使用してMemgraph-LangChainグラフをインスタンス化する準備が整いました。このインターフェースを使用して、LangChainを使用してデータベースにクエリを実行し、LLMを通じてCypherクエリを生成するために必要なグラフスキーマを自動的に作成できます。

```python
graph = MemgraphGraph(url="bolt://localhost:7687", username="", password="")
```

必要に応じて、次のようにしてグラフスキーマを手動で更新できます。

```python
graph.refresh_schema()
```

データに慣れ親しみ、更新されたグラフスキーマを確認するために、次のステートメントを使用してそれを印刷できます。

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

## データベースのクエリ

OpenAI APIと対話するには、Pythonの [os](https://docs.python.org/3/library/os.html) パッケージを使用してAPIキーを環境変数として設定する必要があります。これにより、リクエストの適切な認証が保証されます。APIキーの取得方法については [こちら](https://help.openai.com/en/articles/4936850-where-do-i-find-my-secret-api-key) を参照してください。

```python
os.environ["OPENAI_API_KEY"] = "your-key-here"
```

以下のスクリプトを使用してグラフチェーンを作成し、グラフデータに基づいて質問応答プロセスで使用します。デフォルトではGPT-3.5-turboを使用しますが、[GPT-4](https://help.openai.com/en/articles/7102672-how-can-i-access-gpt-4)などの他のモデルを試して、著しく改善されたCypherクエリと結果を得ることも検討できます。設定したキーを使用してOpenAIチャットを利用します。温度をゼロに設定し、予測可能で一貫した回答を確保します。さらに、Memgraph-LangChainグラフを使用し、クエリ生成に関するより詳細なメッセージを受け取るためにverboseパラメータをTrueに設定します（デフォルトはFalseです）。

```python
chain = GraphCypherQAChain.from_llm(
    ChatOpenAI(temperature=0), graph=graph, verbose=True, model_name="gpt-3.5-turbo"
)
```

これで質問を始めることができます！

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

## チェーンの修正

チェーンの動作を変更して、より多くのコンテキストや追加情報を取得するには、チェーンのパラメータを変更できます。

#### 直接クエリ結果を返す

`return_direct` 修飾子は、実行されたCypherクエリの直接結果を返すか、処理された自然言語応答を返すかを指定します。

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

#### クエリの中間ステップを返す

`return_intermediate_steps` チェーン修飾子は、クエリの初期結果に加えてクエリの中間ステップを含めることで、返される応答を強化します。

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

#### クエリ結果の数を制限する

`top_k` 修飾子は、クエリ結果の最大数を制限したい場合に使用できます。

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

# 高度なクエリ

ソリューションの複雑さが増すにつれて、慎重な取り扱いが必要なさまざまなユースケースに直面する可能性があります。アプリケーションのスケーラビリティを確保することは、スムーズなユーザーフローを維持するために重要です。

チェーンを再度インスタンス化し、ユーザーが尋ねるかもしれない質問を試してみましょう。

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

生成されたCypherクエリは問題なさそうですが、応答には情報が含まれていませんでした。これは、ユーザーがクエリを表現する方法とデータが保存されている方法との間の不一致という、LLMを使用する際の一般的な課題を示しています。この場合、ユーザーの認識と実際のデータストレージの違いがミスマッチを引き起こす可能性があります。プロンプトの精緻化は、モデルのプロンプトを調整してこれらの違いをよりよく把握するプロセスであり、この問題に対処する効率的なソリューションです。プロンプトの精緻化を通じて、モデルは正確かつ関連性の高いクエリを生成する能力を高め、目的のデータの取得に成功します。

### プロンプトの精緻化

これに対処するために、QAチェーンの初期Cypherプロンプトを調整することができます。これは、ユーザーが特定のプラットフォーム（例：PS5）を参照する方法に関する指示をLLMに追加することを含みます。これをLangChainの [PromptTemplate](/docs/modules/model_io/prompts/) を使用して修正された初期プロンプトを作成し、精緻化されたMemgraph-LangChainインスタンスに引数として提供します。

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

プラットフォームの命名に関する指示を含む修正された初期Cypherプロンプトを使用して、ユーザーのクエリにより密接に一致する正確で関連性の高い結果を得ることができます。

このアプローチにより、QAチェーンのさらなる改善が可能です。チェーンに追加のプロンプト精緻化データを統合することで、アプリの全体的なユーザーエクスペリエンスを向上させることができます。
