---
translated: true
---

# neo4j-semantic-layer

このテンプレートは、OpenAI関数呼び出しを使用してセマンティックレイヤーを通じてNeo4jグラフデータベースと対話できるエージェントを実装するように設計されています。
セマンティックレイヤーは、ユーザーの意図に基づいてグラフデータベースと対話するための堅牢なツールのスイートを備えています。
セマンティックレイヤーテンプレートの詳細については、[対応するブログ投稿](https://medium.com/towards-data-science/enhancing-interaction-between-language-models-and-graph-databases-via-a-semantic-layer-0a78ad3eba49)をご覧ください。

## ツール

エージェントは、Neo4jグラフデータベースと効果的に対話するために、いくつかのツールを利用しています:

1. **情報ツール**:
   - 最新で最も関連性の高い情報を確保するために、映画や個人に関するデータを取得します。
2. **推奨ツール**:
   - ユーザーの好みと入力に基づいて、映画の推奨を提供します。
3. **メモリツール**:
   - ユーザーの好みに関する情報をナレッジグラフに保存し、複数のやり取りにわたって個人化された体験を可能にします。

## 環境設定

以下の環境変数を定義する必要があります。

```shell
OPENAI_API_KEY=<YOUR_OPENAI_API_KEY>
NEO4J_URI=<YOUR_NEO4J_URI>
NEO4J_USERNAME=<YOUR_NEO4J_USERNAME>
NEO4J_PASSWORD=<YOUR_NEO4J_PASSWORD>
```

## データの入力

例の映画データセットでデータベースを入力したい場合は、`python ingest.py`を実行できます。
このスクリプトは、映画とユーザーによる評価に関する情報をインポートします。
さらに、スクリプトは、ユーザーの入力をデータベースにマッピングするために使用される2つの[フルテキストインデックス](https://neo4j.com/docs/cypher-manual/current/indexes-for-full-text-search/)を作成します。

## 使用方法

このパッケージを使用するには、まずLangChain CLIをインストールする必要があります:

```shell
pip install -U "langchain-cli[serve]"
```

新しいLangChainプロジェクトを作成し、これを唯一のパッケージとしてインストールするには、次のように実行できます:

```shell
langchain app new my-app --package neo4j-semantic-layer
```

既存のプロジェクトに追加する場合は、次のように実行するだけです:

```shell
langchain app add neo4j-semantic-layer
```

そして、`server.py`ファイルに次のコードを追加します:

```python
from neo4j_semantic_layer import agent_executor as neo4j_semantic_agent

add_routes(app, neo4j_semantic_agent, path="/neo4j-semantic-layer")
```

(オプション) LangSmithを設定しましょう。
LangSmithは、LangChainアプリケーションのトレース、モニタリング、デバッグを支援します。
[ここ](https://smith.langchain.com/)でLangSmithに登録できます。
アクセスできない場合は、このセクションをスキップできます。

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

このディレクトリ内にいる場合は、次のようにして直接LangServeインスタンスを起動できます:

```shell
langchain serve
```

これにより、FastAPIアプリが起動し、[http://localhost:8000](http://localhost:8000)でローカルサーバーが実行されます。

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)でテンプレートをすべて確認できます。
[http://127.0.0.1:8000/neo4j-semantic-layer/playground](http://127.0.0.1:8000/neo4j-semantic-layer/playground)でPlaygroundにアクセスできます。

コードから次のようにテンプレートにアクセスできます:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/neo4j-semantic-layer")
```
