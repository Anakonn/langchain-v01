---
translated: true
---

# rag-redis-multi-modal-multi-vector

マルチモーダルLLMは、画像に関する質問応答を行うビジュアルアシスタントを可能にします。

このテンプレートは、グラフや図などのビジュアルを含むことが多いスライドデッキのビジュアルアシスタントを作成します。

各スライドの画像要約を作成するためにGPT-4Vを使用し、その要約を埋め込み、Redisに保存します。

質問が与えられると、関連するスライドが取得され、GPT-4Vに渡されて回答が生成されます。

## 入力

スライドデッキをPDF形式で`/docs`ディレクトリに提供します。

デフォルトでは、このテンプレートにはNVIDIAの最近の収益に関するスライドデッキが含まれています。

質問の例としては以下のようなものがあります:

```text
1/ how much can H100 TensorRT improve LLama2 inference performance?
2/ what is the % change in GPU accelerated applications from 2020 to 2023?
```

スライドデッキのインデックスを作成するには、以下を実行します:

```shell
poetry install
poetry shell
python ingest.py
```

## ストレージ

テンプレートがスライドのインデックスを作成するために使用するプロセスは次のとおりです（[ブログ](https://blog.langchain.dev/multi-modal-rag-template/))参照）:

* スライドを画像のコレクションとして抽出
* 各画像を要約するためにGPT-4Vを使用
* 画像の要約を元の画像へのリンクとともにテキスト埋め込みを使用して埋め込み
* 画像要約とユーザー入力の質問の類似性に基づいて関連する画像を取得
* それらの画像をGPT-4Vに渡して回答を生成

### Redis

このテンプレートは[Redis](https://redis.com)を使用して[MultiVectorRetriever](https://python.langchain.com/docs/modules/data_connection/retrievers/multi_vector)をサポートします:
- Redisを[VectorStore](https://python.langchain.com/docs/integrations/vectorstores/redis)として使用（画像要約埋め込みの保存とインデックス）
- Redisを[ByteStore](https://python.langchain.com/docs/integrations/stores/redis)として使用（画像の保存）

[クラウド](https://redis.com/try-free)（無料）または[Docker](https://redis.io/docs/install/install-stack/docker/)を使用してローカルにRedisインスタンスをデプロイしてください。

これにより、URLとして使用できるアクセス可能なRedisエンドポイントが得られます。ローカルでデプロイする場合は、単に`redis://localhost:6379`を使用します。

## LLM

アプリは、テキスト入力と画像要約（テキスト）の類似性に基づいて画像を取得し、それらの画像をGPT-4Vに渡して回答を生成します。

## 環境設定

OpenAI GPT-4Vにアクセスするために`OPENAI_API_KEY`環境変数を設定します。

Redisデータベースにアクセスするために`REDIS_URL`環境変数を設定します。

## 使用方法

このパッケージを使用するには、まずLangChain CLIをインストールする必要があります:

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成し、これを唯一のパッケージとしてインストールするには、以下を実行します:

```shell
langchain app new my-app --package rag-redis-multi-modal-multi-vector
```

既存のプロジェクトに追加する場合は、以下を実行するだけです:

```shell
langchain app add rag-redis-multi-modal-multi-vector
```

そして次のコードを`server.py`ファイルに追加します:

```python
from rag_redis_multi_modal_multi_vector import chain as rag_redis_multi_modal_chain_mv

add_routes(app, rag_redis_multi_modal_chain_mv, path="/rag-redis-multi-modal-multi-vector")
```

（オプション）次にLangSmithを設定しましょう。
LangSmithは、LangChainアプリケーションのトレース、監視、デバッグを支援します。
LangSmithには[こちら](https://smith.langchain.com/)からサインアップできます。
アクセスできない場合は、このセクションをスキップできます

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

このディレクトリ内にいる場合、以下を実行してLangServeインスタンスを直接起動できます:

```shell
langchain serve
```

これにより、FastAPIアプリがローカルで[http://localhost:8000](http://localhost:8000)で実行されます。

すべてのテンプレートは[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)で確認できます。
プレイグラウンドには[http://127.0.0.1:8000/rag-redis-multi-modal-multi-vector/playground](http://127.0.0.1:8000/rag-redis-multi-modal-multi-vector/playground)でアクセスできます。

コードからテンプレートにアクセスするには以下を実行します:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-redis-multi-modal-multi-vector")
```
