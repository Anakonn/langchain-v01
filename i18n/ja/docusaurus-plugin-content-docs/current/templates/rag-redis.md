---
translated: true
---

# rag-redis

このテンプレートは、Redis (ベクトルデータベース) と OpenAI (LLM) を使用して RAG を実行し、Nike の財務 10k ファイリング文書に適用します。

これは、PDFの一部とユーザーの質問をエンベディングするために、`all-MiniLM-L6-v2`のsentence transformerに依存しています。

## 環境設定

[OpenAI](https://platform.openai.com)モデルにアクセスするには、`OPENAI_API_KEY`環境変数を設定してください:

```bash
export OPENAI_API_KEY= <YOUR OPENAI API KEY>
```

以下の[Redis](https://redis.com/try-free)環境変数を設定してください:

```bash
export REDIS_HOST = <YOUR REDIS HOST>
export REDIS_PORT = <YOUR REDIS PORT>
export REDIS_USER = <YOUR REDIS USER NAME>
export REDIS_PASSWORD = <YOUR REDIS PASSWORD>
```

## サポートされる設定

このアプリケーションを構成するために、さまざまな環境変数を使用しています

| 環境変数 | 説明 | デフォルト値 |
|----------------------|-----------------------------------|---------------|
| `DEBUG`            | Langchainのデバッグログを有効/無効にする | True         |
| `REDIS_HOST`           | Redisサーバーのホスト名 | "localhost"   |
| `REDIS_PORT`           | Redisサーバーのポート | 6379          |
| `REDIS_USER`           | Redisサーバーのユーザー | "" |
| `REDIS_PASSWORD`       | Redisサーバーのパスワード | "" |
| `REDIS_URL`            | Redisに接続するための完全なURL | `None`, ユーザー、パスワード、ホスト、ポートから構築されます |
| `INDEX_NAME`           | ベクトルインデックスの名前 | "rag-redis"   |

## 使用方法

このパッケージを使用するには、まずPythonの仮想環境にLangChain CLIとPydanticをインストールする必要があります:

```shell
pip install -U langchain-cli pydantic==1.10.13
```

新しいLangChainプロジェクトを作成し、これを唯一のパッケージとしてインストールするには、次のように実行できます:

```shell
langchain app new my-app --package rag-redis
```

既存のプロジェクトに追加する場合は、次のように実行するだけです:

```shell
langchain app add rag-redis
```

そして、`app/server.py`ファイルに次のコードスニペットを追加してください:

```python
from rag_redis.chain import chain as rag_redis_chain

add_routes(app, rag_redis_chain, path="/rag-redis")
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

このディレクトリ内にいる場合は、次のようにして直接LangServeインスタンスを起動できます:

```shell
langchain serve
```

これにより、FastAPIアプリが起動し、[http://localhost:8000](http://localhost:8000)でローカルサーバーが実行されます。

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)でテンプレートをすべて確認できます。
[http://127.0.0.1:8000/rag-redis/playground](http://127.0.0.1:8000/rag-redis/playground)でplaygroundにアクセスできます。

コードから次のようにテンプレートにアクセスできます:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-redis")
```
