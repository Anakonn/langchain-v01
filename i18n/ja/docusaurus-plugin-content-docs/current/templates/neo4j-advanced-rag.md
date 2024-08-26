---
translated: true
---

# neo4j-advanced-rag

このテンプレートを使うと、高度な検索戦略を実装することで、正確な埋め込みとコンテキストの保持のバランスを取ることができます。

## 戦略

1. **典型的なRAG**:
   - 索引されたデータそのものが検索されるという従来の方法。
2. **親検索器**:
   - 文書全体ではなく、より小さな塊(親文書と子文書)に分割してデータを索引。
   - 特定の概念をよりよく表現するために子文書を索引し、コンテキストの保持のために親文書を検索する。
3. **仮説的な質問**:
     - 文書を処理して、それらが答える可能性のある質問を特定する。
     - これらの質問を索引することで特定の概念の表現を改善し、親文書を検索してコンテキストを保持する。
4. **要約**:
     - 文書全体ではなく、文書の要約を作成して索引する。
     - RAGアプリケーションでは、同様に親文書を検索する。

## 環境設定

以下の環境変数を定義する必要があります。

```shell
OPENAI_API_KEY=<YOUR_OPENAI_API_KEY>
NEO4J_URI=<YOUR_NEO4J_URI>
NEO4J_USERNAME=<YOUR_NEO4J_USERNAME>
NEO4J_PASSWORD=<YOUR_NEO4J_PASSWORD>
```

## データの入力

サンプルデータを入力したい場合は、`python ingest.py`を実行できます。
このスクリプトは、`dune.txt`ファイルからテキストの一部を処理し、Neo4jグラフデータベースに格納します。
まず、テキストを大きな塊("親")に分割し、さらに小さな塊("子")に細分化します。親と子の塊は少しオーバーラップしており、コンテキストを維持します。
これらの塊をデータベースに格納した後、子ノードの埋め込みをOpenAIの埋め込みを使って計算し、グラフに格納します。
各親ノードについて、仮説的な質問と要約を生成し、埋め込んでデータベースに追加します。
さらに、これらの埋め込みを効率的に検索するためのベクトルインデックスを各検索戦略について作成します。

*LLMを使って仮説的な質問と要約を生成するため、取り込みには1、2分かかる可能性があります。*

## 使用方法

このパッケージを使用するには、まずLangChain CLIをインストールする必要があります:

```shell
pip install -U "langchain-cli[serve]"
```

新しいLangChainプロジェクトを作成し、このパッケージのみをインストールするには、以下のように実行できます:

```shell
langchain app new my-app --package neo4j-advanced-rag
```

既存のプロジェクトに追加する場合は、以下を実行します:

```shell
langchain app add neo4j-advanced-rag
```

そして、`server.py`ファイルに以下のコードを追加します:

```python
from neo4j_advanced_rag import chain as neo4j_advanced_chain

add_routes(app, neo4j_advanced_chain, path="/neo4j-advanced-rag")
```

(オプション) LangSmithを設定しましょう。
LangSmithは、LangChainアプリケーションのトレース、モニタリング、デバッグを支援します。
[ここ](https://smith.langchain.com/)からLangSmithに登録できます。
アクセスできない場合は、このセクションをスキップできます。

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

このディレクトリ内にいる場合は、以下のようにLangServeインスタンスを直接起動できます:

```shell
langchain serve
```

これにより、[http://localhost:8000](http://localhost:8000)でローカルサーバーが起動します。

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)でテンプレートをすべて確認できます。
[http://127.0.0.1:8000/neo4j-advanced-rag/playground](http://127.0.0.1:8000/neo4j-advanced-rag/playground)でPlaygroundにアクセスできます。

コードからテンプレートにアクセスするには、以下のようにします:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/neo4j-advanced-rag")
```
