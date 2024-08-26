---
translated: true
---

# plate-chain

このテンプレートは、実験室のプレートからデータを解析することを可能にします。

生化学や分子生物学の文脈では、実験室のプレートは一般的に使用されるツールで、サンプルをグリッド状に保持するために使用されます。

これにより、得られたデータを標準化された(例えば、JSON)形式で処理することができます。

## 環境設定

OpenAIモデルにアクセスするには、`OPENAI_API_KEY`環境変数を設定してください。

## 使用方法

plate-chainを使用するには、LangChain CLIがインストールされている必要があります:

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成し、plate-chainを唯一のパッケージとしてインストールするには、以下のコマンドを実行します:

```shell
langchain app new my-app --package plate-chain
```

既存のプロジェクトに追加する場合は、単に以下を実行してください:

```shell
langchain app add plate-chain
```

次に、`server.py`ファイルに以下のコードを追加してください:

```python
from plate_chain import chain as plate_chain

add_routes(app, plate_chain, path="/plate-chain")
```

(オプション) LangSmithを設定して、LangChainアプリケーションのトレース、モニタリング、デバッグを行う場合は、以下のコードを使用してください:

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

このディレクトリにいる場合は、以下のコマンドでLangServeインスタンスを直接起動できます:

```shell
langchain serve
```

これにより、[http://localhost:8000](http://localhost:8000)でローカルサーバーが起動します。

すべてのテンプレートは[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)で表示できます。
[http://127.0.0.1:8000/plate-chain/playground](http://127.0.0.1:8000/plate-chain/playground)でPlaygroundにアクセスできます。

コードからテンプレートにアクセスするには、以下のようにします:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/plate-chain")
```
