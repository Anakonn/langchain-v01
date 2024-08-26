---
translated: true
---

# llama2-functions

このテンプレートは、[LLaMA2モデルを使用してJSONの出力スキーマを指定することで、構造化されていないデータから構造化データを抽出します](https://github.com/ggerganov/llama.cpp/blob/master/grammars/README.md)。

抽出スキーマは `chain.py` で設定できます。

## 環境設定

これは[ReplicateでホストされているLLaMA2-13bモデル](https://replicate.com/andreasjansson/llama-2-13b-chat-gguf/versions)を使用します。

`REPLICATE_API_TOKEN`が環境に設定されていることを確認してください。

## 使用方法

このパッケージを使用するには、まずLangChainCLIがインストールされている必要があります:

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成し、これを唯一のパッケージとしてインストールするには、次のように実行できます:

```shell
langchain app new my-app --package llama2-functions
```

既存のプロジェクトに追加する場合は、次のように実行するだけです:

```shell
langchain app add llama2-functions
```

そして、`server.py`ファイルに次のコードを追加します:

```python
from llama2_functions import chain as llama2_functions_chain

add_routes(app, llama2_functions_chain, path="/llama2-functions")
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

これにより、FastAPIアプリケーションが起動し、[http://localhost:8000](http://localhost:8000)でローカルサーバーが実行されます。

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)でテンプレートをすべて確認できます。
[http://127.0.0.1:8000/llama2-functions/playground](http://127.0.0.1:8000/llama2-functions/playground)でPlaygroundにアクセスできます。

コードから次のようにテンプレートにアクセスできます:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/llama2-functions")
```
