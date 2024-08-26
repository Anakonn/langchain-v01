---
translated: true
---

# 抽出-Anthropic関数

このテンプレートでは、[Anthropic関数呼び出し](https://python.langchain.com/docs/integrations/chat/anthropic_functions)を可能にします。

これは、抽出やタグ付けなどさまざまなタスクに使用できます。

関数出力スキーマは `chain.py` で設定できます。

## 環境設定

Anthropicモデルにアクセスするには、`ANTHROPIC_API_KEY`環境変数を設定する必要があります。

## 使用方法

このパッケージを使用するには、まずLangChain CLIをインストールする必要があります:

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成し、これを唯一のパッケージとしてインストールするには、以下のように実行できます:

```shell
langchain app new my-app --package extraction-anthropic-functions
```

既存のプロジェクトに追加する場合は、以下のように実行できます:

```shell
langchain app add extraction-anthropic-functions
```

そして、`server.py`ファイルに以下のコードを追加します:

```python
from extraction_anthropic_functions import chain as extraction_anthropic_functions_chain

add_routes(app, extraction_anthropic_functions_chain, path="/extraction-anthropic-functions")
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
[http://127.0.0.1:8000/extraction-anthropic-functions/playground](http://127.0.0.1:8000/extraction-anthropic-functions/playground)でPlaygroundにアクセスできます。

コードから以下のようにテンプレートにアクセスできます:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/extraction-anthropic-functions")
```

デフォルトでは、このパッケージは `chain.py` で指定した情報から論文のタイトルと著者を抽出します。このテンプレートでは、デフォルトで `Claude2` を使用します。

---
