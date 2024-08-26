---
translated: true
---

# sql-ollama

このテンプレートにより、ユーザーはSQL データベースを自然言語で操作できるようになります。

[Zephyr-7b](https://huggingface.co/HuggingFaceH4/zephyr-7b-alpha)を介して[Ollama](https://ollama.ai/library/zephyr)を使用して、Mac ラップトップ上でローカルにインファレンスを実行しています。

## 環境設定

このテンプレートを使用する前に、OllamaとSQL データベースを設定する必要があります。

1. [ここ](https://python.langchain.com/docs/integrations/chat/ollama)の手順に従ってOllamaをダウンロードします。

2. 興味のある LLM をダウンロードします:

    * このパッケージでは `zephyr` を使用しています: `ollama pull zephyr`
    * [ここ](https://ollama.ai/library)から多くの LLM を選択できます

3. このパッケージには2023年のNBAロスターの例データベースが含まれています。このDBを構築する手順は[ここ](https://github.com/facebookresearch/llama-recipes/blob/main/demo_apps/StructuredLlama.ipynb)にあります。

## 使用方法

このパッケージを使用するには、まずLangChain CLIをインストールする必要があります:

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成し、これを唯一のパッケージとしてインストールするには、次のように実行できます:

```shell
langchain app new my-app --package sql-ollama
```

既存のプロジェクトに追加する場合は、次のように実行できます:

```shell
langchain app add sql-ollama
```

そして、`server.py`ファイルに次のコードを追加します:

```python
from sql_ollama import chain as sql_ollama_chain

add_routes(app, sql_ollama_chain, path="/sql-ollama")
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

このディレクトリ内にいる場合は、次のようにLangServeインスタンスを直接起動できます:

```shell
langchain serve
```

これにより、FastAPIアプリが起動し、ローカルの[http://localhost:8000](http://localhost:8000)でサーバーが実行されます。

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)でテンプレートをすべて確認できます。
[http://127.0.0.1:8000/sql-ollama/playground](http://127.0.0.1:8000/sql-ollama/playground)でPlaygroundにアクセスできます。

コードから次のようにテンプレートにアクセスできます:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/sql-ollama")
```
