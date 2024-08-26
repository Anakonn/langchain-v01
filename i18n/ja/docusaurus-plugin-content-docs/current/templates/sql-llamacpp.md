---
translated: true
---

# sql-llamacpp

このテンプレートにより、ユーザーはナチュラルランゲージを使ってSQLデータベースと対話できるようになります。

[llama.cpp](https://github.com/ggerganov/llama.cpp)を介して[Mistral-7b](https://mistral.ai/news/announcing-mistral-7b/)を使用して、Macラップトップ上でローカルにインファレンスを実行しています。

## 環境設定

環境を設定するには、以下の手順を使用してください:

```shell
wget https://github.com/conda-forge/miniforge/releases/latest/download/Miniforge3-MacOSX-arm64.sh
bash Miniforge3-MacOSX-arm64.sh
conda create -n llama python=3.9.16
conda activate /Users/rlm/miniforge3/envs/llama
CMAKE_ARGS="-DLLAMA_METAL=on" FORCE_CMAKE=1 pip install -U llama-cpp-python --no-cache-dir
```

## 使用方法

このパッケージを使用するには、まずLangChain CLIがインストールされている必要があります:

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成し、これを唯一のパッケージとしてインストールするには、以下のように実行できます:

```shell
langchain app new my-app --package sql-llamacpp
```

既存のプロジェクトにこれを追加したい場合は、以下を実行するだけです:

```shell
langchain app add sql-llamacpp
```

そして、`server.py`ファイルに以下のコードを追加してください:

```python
from sql_llamacpp import chain as sql_llamacpp_chain

add_routes(app, sql_llamacpp_chain, path="/sql-llamacpp")
```

このパッケージは、[ここ](https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.1-GGUF)からMistral-7bモデルをダウンロードします。他のファイルを選択し、ダウンロードパスを指定することもできます([ここ](https://huggingface.co/TheBloke))を参照)。

このパッケージには2023年のNBAロスターの例用DBが含まれています。このDBの構築方法については[ここ](https://github.com/facebookresearch/llama-recipes/blob/main/demo_apps/StructuredLlama.ipynb)に説明があります。

(オプション) LangSmithを設定して、LangChainアプリケーションのトレース、モニタリング、デバッグを行うことができます。LangSmithに登録するには[ここ](https://smith.langchain.com/)から行えます。アクセスできない場合は、このセクションをスキップできます。

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

すべてのテンプレートは[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)で確認できます。
プレイグラウンドは[http://127.0.0.1:8000/sql-llamacpp/playground](http://127.0.0.1:8000/sql-llamacpp/playground)からアクセスできます。

コードからテンプレートにアクセスするには以下のようにします:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/sql-llamacpp")
```
