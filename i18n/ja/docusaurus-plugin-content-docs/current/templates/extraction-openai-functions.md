---
translated: true
---

# 抽出-OpenAI関数

このテンプレートでは、構造化された出力を非構造化入力テキストから抽出するために[OpenAI関数呼び出し](https://python.langchain.com/docs/modules/chains/how_to/openai_functions)を使用しています。

抽出出力スキーマは `chain.py` で設定できます。

## 環境設定

OpenAIモデルにアクセスするには、`OPENAI_API_KEY`環境変数を設定する必要があります。

## 使用方法

このパッケージを使用するには、まずLangChain CLIをインストールする必要があります:

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成し、これを唯一のパッケージとしてインストールするには、次のように実行できます:

```shell
langchain app new my-app --package extraction-openai-functions
```

既存のプロジェクトに追加する場合は、次のように実行するだけです:

```shell
langchain app add extraction-openai-functions
```

そして、`server.py`ファイルに次のコードを追加します:

```python
from extraction_openai_functions import chain as extraction_openai_functions_chain

add_routes(app, extraction_openai_functions_chain, path="/extraction-openai-functions")
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

このディレクトリ内にいる場合は、次のように直接LangServeインスタンスを起動できます:

```shell
langchain serve
```

これにより、FastAPIアプリが起動し、ローカルの[http://localhost:8000](http://localhost:8000)でサーバーが実行されます。

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)でテンプレートをすべて確認できます。
[http://127.0.0.1:8000/extraction-openai-functions/playground](http://127.0.0.1:8000/extraction-openai-functions/playground)でPlaygroundにアクセスできます。

コードから次のようにテンプレートにアクセスできます:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/extraction-openai-functions")
```

デフォルトでは、このパッケージは `chain.py` ファイルで指定されているように、論文のタイトルと著者を抽出するように設定されています。

LLMはデフォルトでOpenAI関数によって活用されます。
