---
translated: true
---

# rag-mongo

このテンプレートは、MongoDB と OpenAI を使用して RAG を実行します。

## 環境設定

2つの環境変数をエクスポートする必要があります。1つは MongoDB URI、もう1つは OpenAI API キーです。
MongoDB URI がない場合は、下の `MongoDB のセットアップ` セクションの説明に従って設定してください。

```shell
export MONGO_URI=...
export OPENAI_API_KEY=...
```

## 使用方法

このパッケージを使用するには、まず LangChain CLI をインストールする必要があります:

```shell
pip install -U langchain-cli
```

新しい LangChain プロジェクトを作成し、これを唯一のパッケージとしてインストールするには、次のように実行できます:

```shell
langchain app new my-app --package rag-mongo
```

既存のプロジェクトに追加する場合は、次のように実行するだけです:

```shell
langchain app add rag-mongo
```

そして、`server.py` ファイルに次のコードを追加します:

```python
from rag_mongo import chain as rag_mongo_chain

add_routes(app, rag_mongo_chain, path="/rag-mongo")
```

取り込みパイプラインを設定する場合は、`server.py` ファイルに次のコードを追加できます:

```python
from rag_mongo import ingest as rag_mongo_ingest

add_routes(app, rag_mongo_ingest, path="/rag-mongo-ingest")
```

(オプション) LangSmith を設定しましょう。
LangSmith は、LangChain アプリケーションのトレース、モニタリング、デバッグを支援します。
[こちら](https://smith.langchain.com/)から LangSmith に登録できます。
アクセスできない場合は、このセクションをスキップできます。

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

まだ MongoDB 検索インデックスを持っていない場合は、先に `MongoDB のセットアップ` セクションを参照してください。

既に MongoDB 検索インデックスがある場合は、`rag_mongo/chain.py` の接続詳細を編集してください。

このディレクトリ内にいる場合は、次のようにして LangServe インスタンスを直接起動できます:

```shell
langchain serve
```

これにより、[http://localhost:8000](http://localhost:8000) でローカルサーバーが起動します。

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) でテンプレートをすべて確認できます。
[http://127.0.0.1:8000/rag-mongo/playground](http://127.0.0.1:8000/rag-mongo/playground) でプレイグラウンドにアクセスできます。

コードから次のようにテンプレートにアクセスできます:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-mongo")
```

詳細については、[このノートブック](https://colab.research.google.com/drive/1cr2HBAHyBmwKUerJq2if0JaNhy-hIq7I#scrollTo=TZp7_CBfxTOB)を参照してください。

## MongoDB のセットアップ

MongoDB アカウントを設定し、データを取り込む必要がある場合は、この手順に従ってください。
まず、標準の MongoDB Atlas セットアップ手順 [こちら](https://www.mongodb.com/docs/atlas/getting-started/) に従います。

1. アカウントを作成する (まだ行っていない場合)
2. 新しいプロジェクトを作成する (まだ行っていない場合)
3. MongoDB URI を見つける。

これは、デプロイメントの概要ページに移動し、データベースに接続することで行えます。

使用可能なドライバーを確認すると、URI が表示されます。

ローカルで環境変数として設定しましょう:

```shell
export MONGO_URI=...
```

4. OpenAI の環境変数も設定しましょう (LLM として使用します)。

```shell
export OPENAI_API_KEY=...
```

5. データを取り込みましょう! このディレクトリに移動し、`ingest.py` のコードを実行することで行えます:

```shell
python ingest.py
```

データは好きなものに変更できます。

6. データに対するベクトルインデックスを設定する必要があります。

まず、データベースがあるクラスターに接続します。

コレクションの一覧に移動します。

取り込んだコレクションを見つけ、そのコレクションの検索インデックスを確認します。

おそらく空になっているので、新しいインデックスを作成する必要があります:

JSON エディターを使用して作成します。

次の JSON をペーストします:

```text
 {
   "mappings": {
     "dynamic": true,
     "fields": {
       "embedding": {
         "dimensions": 1536,
         "similarity": "cosine",
         "type": "knnVector"
       }
     }
   }
 }
```

「次へ」をクリックし、「検索インデックスの作成」をクリックします。少し時間がかかりますが、データに対するインデックスが作成されます。
