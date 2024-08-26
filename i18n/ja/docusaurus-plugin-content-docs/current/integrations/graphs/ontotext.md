---
translated: true
---

# Ontotext GraphDB

>[Ontotext GraphDB](https://graphdb.ontotext.com/)は、[RDF](https://www.w3.org/RDF/)と[SPARQL](https://www.w3.org/TR/sparql11-query/)に準拠したグラフデータベースおよび知識発見ツールです。

>このノートブックでは、LLMを使用して自然言語クエリ(NLQ to SPARQL、`text2sparql`とも呼ばれる)を提供する方法を示します。

## GraphDB LLMの機能

`GraphDB`は、[ここ](https://github.com/w3c/sparql-dev/issues/193)に記載されているいくつかのLLM統合機能をサポートしています。

[gpt-queries](https://graphdb.ontotext.com/documentation/10.5/gpt-queries.html)

* 知識グラフ(KG)のデータを使用してLLMにテキスト、リスト、またはテーブルを要求するための魔法の述語
* クエリの説明
* 結果の説明、要約、言い換え、翻訳

[retrieval-graphdb-connector](https://graphdb.ontotext.com/documentation/10.5/retrieval-graphdb-connector.html)

* ベクトルデータベースにKGエンティティをインデックス化
* 任意のテキストエンベディングアルゴリズムとベクトルデータベースをサポート
* GraphDBが Elastic、Solr、Luceneに使用する強力なコネクタ(インデックス化)言語を使用
* RDFデータの変更を自動的にKGエンティティインデックスに同期
* ネストされたオブジェクトをサポート(GraphDB version 10.5のUIではサポートされていません)
* KGエンティティをテキストのように直列化(例: Winesデータセットの場合)

```text
Franvino:
- is a RedWine.
- made from grape Merlo.
- made from grape Cabernet Franc.
- has sugar dry.
- has year 2012.
```

[talk-to-graph](https://graphdb.ontotext.com/documentation/10.5/talk-to-graph.html)

* 定義されたKGエンティティインデックスを使用した簡単なチャットボット

このチュートリアルでは、GraphDBのLLM統合は使用せず、NLQからのSPARQLの生成を使用します。[ここ](https://github.com/Ontotext-AD/langchain-graphdb-qa-chain-demo/blob/main/starwars-data.trig)で確認できる`Star Wars API`(`SWAPI`)オントロジーとデータセットを使用します。

## 設定

稼働中のGraphDBインスタンスが必要です。このチュートリアルでは、[GraphDBのDockerイメージ](https://hub.docker.com/r/ontotext/graphdb)を使ってローカルでデータベースを実行する方法を示します。Dockerコンポーズのセットアップが提供され、Star WarsデータセットがGraphDBにロードされます。必要なすべてのファイルを含む[langchain-graphdb-qa-chain-demoのGitHubリポジトリ](https://github.com/Ontotext-AD/langchain-graphdb-qa-chain-demo)からダウンロードできます。

* [Docker](https://docs.docker.com/get-docker/)をインストールします。このチュートリアルは、[Docker Compose](https://docs.docker.com/compose/)を同梱するDocker version `24.0.7`を使用して作成されています。以前のDockerバージョンの場合は、Docker Composeを別途インストールする必要があります。
* [langchain-graphdb-qa-chain-demoのGitHubリポジトリ](https://github.com/Ontotext-AD/langchain-graphdb-qa-chain-demo)をローカルフォルダにクローンします。
* 同じフォルダから以下のスクリプトを実行してGraphDBを起動します。

```bash
docker build --tag graphdb .
docker compose up -d graphdb
```

データベースが`http://localhost:7200/`で起動するまで数秒待つ必要があります。Star Warsデータセット`starwars-data.trig`は自動的に`langchain`リポジトリにロードされます。ローカルのSPARQLエンドポイント`http://localhost:7200/repositories/langchain`を使用してクエリを実行できます。また、お気に入りのWebブラウザから`http://localhost:7200/sparql`のGraphDBワークベンチを開いて、対話的にクエリを行うこともできます。
* 作業環境を設定

`conda`を使用する場合は、新しいcondaenv(例: `conda create -n graph_ontotext_graphdb_qa python=3.9.18`)を作成して有効化します。

以下のライブラリをインストールします。

```bash
pip install jupyter==1.0.0
pip install openai==1.6.1
pip install rdflib==7.0.0
pip install langchain-openai==0.0.2
pip install langchain>=0.1.5
```

Jupyterを実行します。

```bash
jupyter notebook
```

## Ontology の指定

LLMが SPARQL を生成できるようにするには、知識グラフのスキーマ (Ontology) を知る必要があります。これは、`OntotextGraphDBGraph` クラスの以下のいずれかのパラメータを使って提供できます:

* `query_ontology`: SPARQL エンドポイントで実行される `CONSTRUCT` クエリで、KGスキーマステートメントを返します。オントロジーを独自の名前付きグラフに保存することをお勧めします。これにより、関連するステートメントのみを取得しやすくなります (以下の例のように)。`DESCRIBE` クエリはサポートされていません。なぜなら `DESCRIBE` は Symmetric Concise Bounded Description (SCBD) を返し、つまり着信クラスリンクも返すためです。100万のインスタンスを持つ大規模なグラフの場合、これは効率的ではありません。 https://github.com/eclipse-rdf4j/rdf4j/issues/4857 を確認してください。
* `local_file`: ローカルの RDF オントロジーファイル。サポートされる RDF フォーマットは `Turtle`、`RDF/XML`、`JSON-LD`、`N-Triples`、`Notation-3`、`Trig`、`Trix`、`N-Quads` です。

どちらの場合も、オントロジーダンプには以下が含まれている必要があります:

* クラス、プロパティ、クラスへのプロパティ付加 (rdfs:domain、schema:domainIncludes、OWL の制限を使用)、タクソノミー (重要な個人) に関する十分な情報。
* 冗長で関連性の低い定義や例は含まない。SPARQL の構築に役立たないものは含めない。

```python
from langchain_community.graphs import OntotextGraphDBGraph

# feeding the schema using a user construct query

graph = OntotextGraphDBGraph(
    query_endpoint="http://localhost:7200/repositories/langchain",
    query_ontology="CONSTRUCT {?s ?p ?o} FROM <https://swapi.co/ontology/> WHERE {?s ?p ?o}",
)
```

```python
# feeding the schema using a local RDF file

graph = OntotextGraphDBGraph(
    query_endpoint="http://localhost:7200/repositories/langchain",
    local_file="/path/to/langchain_graphdb_tutorial/starwars-ontology.nt",  # change the path here
)
```

いずれの場合も、オントロジー (スキーマ) は適切な接頭辞を使った `Turtle` 形式で LLM に提供されます。これが最も簡潔で LLM が覚えやすいためです。

Star Wars のオントロジーは少し特殊で、クラスに関する多くの具体的なトリプルが含まれています。例えば、`:Aleena` 種は `<planet/38>` に生息し、`:Reptile` のサブクラスであり、特定の特徴 (平均身長、平均寿命、皮膚の色) を持ち、特定の個人 (キャラクター) がそのクラスの代表者であるなどです。

```output
@prefix : <https://swapi.co/vocabulary/> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

:Aleena a owl:Class, :Species ;
    rdfs:label "Aleena" ;
    rdfs:isDefinedBy <https://swapi.co/ontology/> ;
    rdfs:subClassOf :Reptile, :Sentient ;
    :averageHeight 80.0 ;
    :averageLifespan "79" ;
    :character <https://swapi.co/resource/aleena/47> ;
    :film <https://swapi.co/resource/film/4> ;
    :language "Aleena" ;
    :planet <https://swapi.co/resource/planet/38> ;
    :skinColor "blue", "gray" .

    ...

```

このチュートリアルを簡単に保つために、セキュリティのかかっていない GraphDB を使用します。GraphDB がセキュリティで保護されている場合は、`OntotextGraphDBGraph` の初期化前に `GRAPHDB_USERNAME` と `GRAPHDB_PASSWORD` の環境変数を設定する必要があります。

```python
os.environ["GRAPHDB_USERNAME"] = "graphdb-user"
os.environ["GRAPHDB_PASSWORD"] = "graphdb-password"

graph = OntotextGraphDBGraph(
    query_endpoint=...,
    query_ontology=...
)
```

## StarWars データセットに対する質問応答

`OntotextGraphDBQAChain` を使って質問をすることができます。

```python
import os

from langchain.chains import OntotextGraphDBQAChain
from langchain_openai import ChatOpenAI

# We'll be using an OpenAI model which requires an OpenAI API Key.
# However, other models are available as well:
# https://python.langchain.com/docs/integrations/chat/

# Set the environment variable `OPENAI_API_KEY` to your OpenAI API key
os.environ["OPENAI_API_KEY"] = "sk-***"

# Any available OpenAI model can be used here.
# We use 'gpt-4-1106-preview' because of the bigger context window.
# The 'gpt-4-1106-preview' model_name will deprecate in the future and will change to 'gpt-4-turbo' or similar,
# so be sure to consult with the OpenAI API https://platform.openai.com/docs/models for the correct naming.

chain = OntotextGraphDBQAChain.from_llm(
    ChatOpenAI(temperature=0, model_name="gpt-4-1106-preview"),
    graph=graph,
    verbose=True,
)
```

簡単な質問をしてみましょう。

```python
chain.invoke({chain.input_key: "What is the climate on Tatooine?"})[chain.output_key]
```

```output


[1m> Entering new OntotextGraphDBQAChain chain...[0m
Generated SPARQL:
[32;1m[1;3mPREFIX : <https://swapi.co/vocabulary/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?climate
WHERE {
  ?planet rdfs:label "Tatooine" ;
          :climate ?climate .
}[0m

[1m> Finished chain.[0m
```

```output
'The climate on Tatooine is arid.'
```

少し複雑な質問も。

```python
chain.invoke({chain.input_key: "What is the climate on Luke Skywalker's home planet?"})[
    chain.output_key
]
```

```output


[1m> Entering new OntotextGraphDBQAChain chain...[0m
Generated SPARQL:
[32;1m[1;3mPREFIX : <https://swapi.co/vocabulary/>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?climate
WHERE {
  ?character rdfs:label "Luke Skywalker" .
  ?character :homeworld ?planet .
  ?planet :climate ?climate .
}[0m

[1m> Finished chain.[0m
```

```output
"The climate on Luke Skywalker's home planet is arid."
```

さらに複雑な質問も可能です。

```python
chain.invoke(
    {
        chain.input_key: "What is the average box office revenue for all the Star Wars movies?"
    }
)[chain.output_key]
```

```output


[1m> Entering new OntotextGraphDBQAChain chain...[0m
Generated SPARQL:
[32;1m[1;3mPREFIX : <https://swapi.co/vocabulary/>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

SELECT (AVG(?boxOffice) AS ?averageBoxOffice)
WHERE {
  ?film a :Film .
  ?film :boxOffice ?boxOfficeValue .
  BIND(xsd:decimal(?boxOfficeValue) AS ?boxOffice)
}
[0m

[1m> Finished chain.[0m
```

```output
'The average box office revenue for all the Star Wars movies is approximately 754.1 million dollars.'
```

## チェーンの修飾子

Ontotext GraphDB QA チェーンでは、プロンプトの洗練により、QA チェーンの改善と、アプリケーションのユーザーエクスペリエンスの向上が可能です。

### "SPARQL 生成" プロンプト

このプロンプトは、ユーザーの質問とKGスキーマに基づいて SPARQL クエリを生成するために使用されます。

- `sparql_generation_prompt`

    デフォルト値:
  ````python
    GRAPHDB_SPARQL_GENERATION_TEMPLATE = """
    グラフデータベースをクエリするための SPARQL SELECT クエリを書いてください。
    トリプルバッククォートで囲まれた Turtle 形式のオントロジースキーマは以下の通りです:
    ```
    {schema}
    ```
    スキーマ内のクラスとプロパティのみを使ってSPARQLクエリを構築してください。
    スキーマに明示的に提供されていないクラスやプロパティは使用しないでください。
    必要な接頭辞をすべて含めてください。
    回答にはいかなる説明や謝罪も含めないでください。
    クエリをバッククォートで囲まないでください。
    生成されたSPARQLクエリ以外のテキストは含めないでください。
    トリプルバッククォートで囲まれた質問は以下の通りです:
    ```
    {prompt}
    ```
    """
    GRAPHDB_SPARQL_GENERATION_PROMPT = PromptTemplate(
        input_variables=["schema", "prompt"],
        template=GRAPHDB_SPARQL_GENERATION_TEMPLATE,
    )
  ````

### "SPARQL 修正" プロンプト

LLMが文法エラーや接頭辞の欠落などを含むSPARQLクエリを生成する場合があります。チェーンはこれを修正するために、一定回数LLMにプロンプトを与えて修正を求めます。

- `sparql_fix_prompt`

    デフォルト値:
  ````python
    GRAPHDB_SPARQL_FIX_TEMPLATE = """
    以下のSPARQLクエリはトリプルバッククォートで囲まれています
    ```
    {generated_sparql}
    ```
    これは有効ではありません。
    エラーメッセージはトリプルバッククォートで囲まれています
    ```
    {error_message}
    ```
    正しいバージョンのSPARQLクエリを教えてください。
    クエリのロジックは変更しないでください。
    回答にはいかなる説明や謝罪も含めないでください。
    クエリをバッククォートで囲まないでください。
    生成されたSPARQLクエリ以外のテキストは含めないでください。
    トリプルバッククォートで囲まれたTurtle形式のオントロジースキーマは以下の通りです:
    ```
    {schema}
    ```
    """

    GRAPHDB_SPARQL_FIX_PROMPT = PromptTemplate(
        input_variables=["error_message", "generated_sparql", "schema"],
        template=GRAPHDB_SPARQL_FIX_TEMPLATE,
    )
  ````

- `max_fix_retries`

    デフォルト値: `5`

### "回答"プロンプト

プロンプトは、データベースから返された結果と初期のユーザー質問に基づいて質問に回答するために使用されます。デフォルトでは、LLMは返された結果からの情報のみを使用するように指示されます。結果セットが空の場合、LLMは質問に答えられないことを通知する必要があります。

- `qa_prompt`

  デフォルト値:
  ````python
    GRAPHDB_QA_TEMPLATE = """Task: SPARQLクエリの結果から自然言語の回答を生成する。
    あなたは、よく書かれた人間にわかりやすい回答を作成するアシスタントです。
    情報部分には提供された情報が含まれており、それを使用して回答を構築することができます。
    提供された情報は信頼できるものであり、それを疑ったり、内部知識を使って修正しようとしてはいけません。
    回答は、情報がAIアシスタントから来ているように聞こえるようにしますが、追加の情報は含めないでください。
    質問に答えるために内部知識を使わず、情報がない場合は分からないと言ってください。
    情報:
    {context}

    質問: {prompt}
    役立つ回答:"""
    GRAPHDB_QA_PROMPT = PromptTemplate(
        input_variables=["context", "prompt"], template=GRAPHDB_QA_TEMPLATE
    )
  ````

GraphDBでQAを試し終えたら、Docker composeファイルのあるディレクトリから
``
docker compose down -v --remove-orphans
``
を実行してDockerの環境をシャットダウンできます。
