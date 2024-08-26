---
translated: true
---

# rag-jaguardb

このテンプレートは、JaguarDBとOpenAIを使ってRAGを実行します。

## 環境設定

2つの環境変数をエクスポートする必要があります。1つはJaguar URIで、もう1つはOpenAI API KEYです。
JaguarDBがまだ設定されていない場合は、下部の「Jaguar のセットアップ」セクションの手順に従ってセットアップしてください。

```shell
export JAGUAR_API_KEY=...
export OPENAI_API_KEY=...
```

## 使用方法

このパッケージを使用するには、まずLangChain CLIがインストールされている必要があります:

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成し、これを唯一のパッケージとしてインストールするには、次のように実行できます:

```shell
langchain app new my-app --package rag-jaguardb
```

既存のプロジェクトに追加する場合は、次のように実行するだけです:

```shell
langchain app add rag-jagaurdb
```

そして、`server.py`ファイルに次のコードを追加します:

```python
from rag_jaguardb import chain as rag_jaguardb

add_routes(app, rag_jaguardb_chain, path="/rag-jaguardb")
```

(オプション) LangSmithを設定しましょう。
LangSmithは、LangChainアプリケーションのトレース、モニタリング、デバッグを支援します。
LangSmithに登録するには[こちら](https://smith.langchain.com/)から行えます。
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

これにより、FastAPIアプリが起動し、ローカルの[http://localhost:8000](http://localhost:8000)でサーバーが実行されます。

すべてのテンプレートは[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)で確認できます。
プレイグラウンドは[http://127.0.0.1:8000/rag-jaguardb/playground](http://127.0.0.1:8000/rag-jaguardb/playground)でアクセスできます。

コードからテンプレートにアクセスするには、次のようにします:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-jaguardb")
```

## JaguarDBのセットアップ

JaguarDBを利用するには、docker pullとdocker runコマンドを使ってすぐにJaguarDBをセットアップできます。

```shell
docker pull jaguardb/jaguardb
docker run -d -p 8888:8888 --name jaguardb jaguardb/jaguardb
```

JaguarDBクライアントターミナルを起動してJaguarDBサーバーと対話するには:

```shell
docker exec -it jaguardb /home/jaguar/jaguar/bin/jag

```

もう1つの方法は、LinuxのJaguarDB用のプリビルトバイナリパッケージをダウンロードし、単一ノードまたはノードのクラスターにデータベースをデプロイすることです。簡略化されたプロセスにより、JaguarDBの使用を素早く開始し、その強力な機能と機能を活用できます。[こちら](http://www.jaguardb.com/download.html)。
