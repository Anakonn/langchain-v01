---
translated: true
---

# xml-agent

このパッケージは、XMLの構文を使ってどのアクションを取るかの決定を伝えるエージェントを作成します。Anthropicのクロード・モデルを使ってXMLの構文を書き、オプションでDuckDuckGoを使ってインターネットで情報を検索することができます。

## 環境設定

以下の2つの環境変数を設定する必要があります:

- `ANTHROPIC_API_KEY`: Anthropicを使うために必要です

## 使用方法

このパッケージを使うには、まずLangChainのCLIをインストールしておく必要があります:

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成し、このパッケージをインストールするには、以下のように行います:

```shell
langchain app new my-app --package xml-agent
```

既存のプロジェクトにこのパッケージを追加する場合は、以下のように実行します:

```shell
langchain app add xml-agent
```

そして、`server.py`ファイルに以下のコードを追加します:

```python
from xml_agent import agent_executor as xml_agent_chain

add_routes(app, xml_agent_chain, path="/xml-agent")
```

(オプション) LangSmithを設定しましょう。
LangSmithはLangChainアプリケーションのトレース、モニタリング、デバッグを支援してくれます。
[こちら](https://smith.langchain.com/)からLangSmithに登録できます。
アクセスできない場合は、このセクションをスキップできます。

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

このディレクトリ内にいる場合は、以下のコマンドでLangServeインスタンスを直接起動できます:

```shell
langchain serve
```

これにより、FastAPIアプリケーションが起動し、ローカルの[http://localhost:8000](http://localhost:8000)でサーバーが動作します。

すべてのテンプレートは[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)で確認できます。
[http://127.0.0.1:8000/xml-agent/playground](http://127.0.0.1:8000/xml-agent/playground)からPlaygroundにアクセスできます。

コードからテンプレートにアクセスするには以下のようにします:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/xml-agent")
```
