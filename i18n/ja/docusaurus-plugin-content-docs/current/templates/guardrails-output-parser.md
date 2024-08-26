---
translated: true
---

# guardrails-output-parser

このテンプレートでは[guardrails-ai](https://github.com/guardrails-ai/guardrails)を使ってLLM出力を検証しています。

`GuardrailsOutputParser`は`chain.py`で設定されています。

デフォルトの例では、不適切な言葉を防ぐようになっています。

## 環境設定

OpenAIモデルにアクセスするには、`OPENAI_API_KEY`環境変数を設定する必要があります。

## 使用方法

このパッケージを使用するには、まずLangChain CLIをインストールする必要があります:

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成し、これを唯一のパッケージとしてインストールするには、以下のように行います:

```shell
langchain app new my-app --package guardrails-output-parser
```

既存のプロジェクトに追加する場合は、以下のように実行するだけです:

```shell
langchain app add guardrails-output-parser
```

そして、`server.py`ファイルに以下のコードを追加します:

```python
from guardrails_output_parser.chain import chain as guardrails_output_parser_chain

add_routes(app, guardrails_output_parser_chain, path="/guardrails-output-parser")
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

このディレクトリ内にいる場合は、以下のようにして直接LangServeインスタンスを起動できます:

```shell
langchain serve
```

これにより、FastAPIアプリが起動し、[http://localhost:8000](http://localhost:8000)でローカルサーバーが実行されます。

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)でテンプレートをすべて確認できます。
[http://127.0.0.1:8000/guardrails-output-parser/playground](http://127.0.0.1:8000/guardrails-output-parser/playground)からPlaygroundにアクセスできます。

コードから以下のようにテンプレートにアクセスできます:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/guardrails-output-parser")
```

Guardrailsが不適切な言葉を見つからない場合は、そのままの出力が返されます。Guardrailsが不適切な言葉を見つけた場合は、空の文字列が返されます。
