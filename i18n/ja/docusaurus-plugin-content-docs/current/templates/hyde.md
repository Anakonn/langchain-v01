---
translated: true
---

# hyde

このテンプレートはHyDEとRAGを使用しています。

HydeはHypothetical Document Embeddings (HyDE)と呼ばれる検索方法です。これは、受信クエリに対して仮想的なドキュメントを生成することで、検索を強化する方法です。

その後、その埋め込みが使用され、仮想的なドキュメントに似た実際のドキュメントを検索します。

基本的な概念は、仮想的なドキュメントがクエリよりも埋め込み空間で近い可能性があるということです。

詳細については、[こちらの論文](https://arxiv.org/abs/2212.10496)をご覧ください。

## 環境設定

OpenAIモデルにアクセスするには、`OPENAI_API_KEY`環境変数を設定する必要があります。

## 使用方法

このパッケージを使用するには、まずLangChain CLIをインストールする必要があります:

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成し、これを唯一のパッケージとしてインストールするには、次のように実行できます:

```shell
langchain app new my-app --package hyde
```

既存のプロジェクトに追加する場合は、次のように実行できます:

```shell
langchain app add hyde
```

そして、`server.py`ファイルに次のコードを追加します:

```python
from hyde.chain import chain as hyde_chain

add_routes(app, hyde_chain, path="/hyde")
```

(オプション) LangSmithを設定しましょう。
LangSmithは、LangChainアプリケーションのトレース、モニタリング、デバッグを支援します。
[こちら](https://smith.langchain.com/)からLangSmithに登録できます。
アクセスできない場合は、このセクションをスキップできます。

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

このディレクトリ内にいる場合は、次のようにLangServeインスタンスを直接起動できます:

```shell
langchain serve
```

これにより、FastAPIアプリが起動し、ローカルの[http://localhost:8000](http://localhost:8000)でサーバーが実行されます。

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)でテンプレートをすべて確認できます。
[http://127.0.0.1:8000/hyde/playground](http://127.0.0.1:8000/hyde/playground)でPlaygroundにアクセスできます。

コードからテンプレートにアクセスするには、次のようにします:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/hyde")
```
