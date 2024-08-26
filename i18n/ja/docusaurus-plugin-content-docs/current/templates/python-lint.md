---
translated: true
---

# python-lint

このエージェントは、`black`、`ruff`、`mypy`を使用して、適切な書式設定とlintingに焦点を当てた高品質なPythonコードの生成を専門としています。

これにより、これらのチェックを統合し、信頼性の高い一貫したコード出力を得ることができ、コーディングプロセスが効率化されます。

コードの実行は追加の依存関係や潜在的なセキュリティ上の脆弱性を引き起こす可能性があるため、このエージェントはコード生成タスクに対して安全で効率的なソリューションとなります。

直接Pythonコードを生成したり、計画および実行エージェントとネットワーク化して使用することができます。

## 環境設定

- `black`、`ruff`、`mypy`をインストールする: `pip install -U black ruff mypy`
- `OPENAI_API_KEY`環境変数を設定する。

## 使用方法

このパッケージを使用するには、まずLangChain CLIをインストールする必要があります:

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成し、これを唯一のパッケージとしてインストールするには、次のように実行できます:

```shell
langchain app new my-app --package python-lint
```

既存のプロジェクトに追加する場合は、次のように実行できます:

```shell
langchain app add python-lint
```

そして、`server.py`ファイルに次のコードを追加します:

```python
from python_lint import agent_executor as python_lint_agent

add_routes(app, python_lint_agent, path="/python-lint")
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

このディレクトリ内にいる場合は、次のようにして直接LangServeインスタンスを起動できます:

```shell
langchain serve
```

これにより、[http://localhost:8000](http://localhost:8000)でローカルサーバーが起動します。

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)でテンプレートをすべて確認できます。
[http://127.0.0.1:8000/python-lint/playground](http://127.0.0.1:8000/python-lint/playground)からPlaygroundにアクセスできます。

コードから次のようにテンプレートにアクセスできます:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/python-lint")
```
