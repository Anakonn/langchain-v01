---
translated: true
---

# neo4j-semantic-ollama

このテンプレートは、Mixtralを使用したJSON ベースのエージェントを通じて、Neo4jのようなグラフデータベースとのやり取りを可能にするエージェントを実装するように設計されています。
セマンティック層により、エージェントはユーザーの意図に基づいてグラフデータベースと対話できる強力なツールセットを備えています。
セマンティック層テンプレートの詳細については、[対応するブログ記事](https://medium.com/towards-data-science/enhancing-interaction-between-language-models-and-graph-databases-via-a-semantic-layer-0a78ad3eba49)と、特に[Mixtralエージェントを使用したOllama](https://blog.langchain.dev/json-based-agents-with-ollama-and-langchain/)について説明しています。

## ツール

このエージェントは、Neo4jグラフデータベースと効果的に対話するために、いくつかのツールを利用しています:

1. **情報ツール**:
   - 映画や個人に関するデータを取得し、エージェントが最新かつ関連性の高い情報にアクセスできるようにします。
2. **推奨ツール**:
   - ユーザーの好みと入力に基づいて、映画の推奨を提供します。
3. **メモリツール**:
   - ユーザーの好みに関する情報をナレッジグラフに保存し、複数のやり取りを通じて個人化された体験を可能にします。
4. **小話ツール**:
   - エージェントが小話に対応できるようにします。

## 環境設定

このテンプレートを使用する前に、Ollamaとneo4jデータベースを設定する必要があります。

1. [ここ](https://python.langchain.com/docs/integrations/chat/ollama)の手順に従ってOllamaをダウンロードします。

2. 興味のあるLLMをダウンロードします:

    * このパッケージは `mixtral` を使用します: `ollama pull mixtral`
    * [ここ](https://ollama.ai/library)から多くのLLMから選択できます

以下の環境変数を定義する必要があります。

```shell
OLLAMA_BASE_URL=<YOUR_OLLAMA_URL>
NEO4J_URI=<YOUR_NEO4J_URI>
NEO4J_USERNAME=<YOUR_NEO4J_USERNAME>
NEO4J_PASSWORD=<YOUR_NEO4J_PASSWORD>
```

## データの入力

サンプルの映画データセットでデータベースを入力したい場合は、`python ingest.py`を実行できます。
このスクリプトは、映画とユーザーによる評価に関する情報をインポートします。
さらに、スクリプトは、ユーザーの入力をデータベースにマッピングするために使用される2つの[フルテキストインデックス](https://neo4j.com/docs/cypher-manual/current/indexes-for-full-text-search/)を作成します。

## 使用方法

このパッケージを使用するには、まずLangChain CLIがインストールされている必要があります:

```shell
pip install -U "langchain-cli[serve]"
```

新しいLangChainプロジェクトを作成し、これを唯一のパッケージとしてインストールするには、次のように実行できます:

```shell
langchain app new my-app --package neo4j-semantic-ollama
```

既存のプロジェクトに追加する場合は、次のように実行できます:

```shell
langchain app add neo4j-semantic-ollama
```

そして、`server.py`ファイルに次のコードを追加します:

```python
from neo4j_semantic_layer import agent_executor as neo4j_semantic_agent

add_routes(app, neo4j_semantic_agent, path="/neo4j-semantic-ollama")
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

すべてのテンプレートは[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)で確認できます。
プレイグラウンドは[http://127.0.0.1:8000/neo4j-semantic-ollama/playground](http://127.0.0.1:8000/neo4j-semantic-ollama/playground)でアクセスできます。

コードから次のようにテンプレートにアクセスできます:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/neo4j-semantic-ollama")
```
