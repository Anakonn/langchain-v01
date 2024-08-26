---
translated: true
---

# rag-chroma-multi-modal-multi-vector

マルチモーダルLLMにより、画像についての質問応答を行うビジュアルアシスタントが可能になります。

このテンプレートは、グラフや図などのビジュアルを含むことが多いスライドデッキのためのビジュアルアシスタントを作成します。

各スライドの画像概要を作成するためにGPT-4Vを使用し、それを埋め込み、Chromaに保存します。

質問が与えられると、関連するスライドが取得され、GPT-4Vに渡されて回答が生成されます。

## 入力

スライドデッキをPDF形式で`/docs`ディレクトリに提供します。

デフォルトでは、このテンプレートにはDataDogという公的テクノロジー企業のQ3収益に関するスライドデッキが含まれています。

尋ねることができる質問の例は以下の通りです：

```text
How many customers does Datadog have?
What is Datadog platform % Y/Y growth in FY20, FY21, and FY22?
```

スライドデッキのインデックスを作成するには、以下を実行します：

```shell
poetry install
python ingest.py
```

## ストレージ

テンプレートがスライドのインデックスを作成するプロセスは以下の通りです（[blog](https://blog.langchain.dev/multi-modal-rag-template/))を参照）：

* スライドを画像のコレクションとして抽出
* GPT-4Vを使用して各画像を要約
* テキスト埋め込みを使用して画像要約を埋め込み、元の画像へのリンクを含める
* 画像要約とユーザー入力の質問の類似性に基づいて関連する画像を取得
* それらの画像をGPT-4Vに渡して回答を生成

デフォルトでは、画像を保存するために[LocalFileStore](https://python.langchain.com/docs/integrations/stores/file_system)を使用し、要約を保存するためにChromaを使用します。

本番環境では、Redisなどのリモートオプションを使用することが望ましい場合があります。

`chain.py`と`ingest.py`の`local_file_store`フラグを設定して、2つのオプションを切り替えることができます。

Redisの場合、テンプレートは[UpstashRedisByteStore](https://python.langchain.com/docs/integrations/stores/upstash_redis)を使用します。

画像を保存するためにUpstashを使用します。これはREST APIを持つRedisを提供します。

[こちら](https://upstash.com/)にログインしてデータベースを作成してください。

これにより、以下のREST APIが提供されます：

* `UPSTASH_URL`
* `UPSTASH_TOKEN`

`UPSTASH_URL`と`UPSTASH_TOKEN`を環境変数として設定し、データベースにアクセスします。

画像要約を保存およびインデックス化するためにChromaを使用し、これはテンプレートディレクトリ内にローカルで作成されます。

## LLM

アプリはテキスト入力と画像要約の類似性に基づいて画像を取得し、GPT-4Vに渡します。

## 環境設定

`OPENAI_API_KEY`環境変数を設定してOpenAI GPT-4Vにアクセスします。

`UpstashRedisByteStore`を使用する場合は、`UPSTASH_URL`と`UPSTASH_TOKEN`を環境変数として設定してデータベースにアクセスします。

## 使用方法

このパッケージを使用するには、まずLangChain CLIをインストールしてください：

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成し、これを唯一のパッケージとしてインストールするには、以下を実行できます：

```shell
langchain app new my-app --package rag-chroma-multi-modal-multi-vector
```

既存のプロジェクトに追加したい場合は、以下を実行するだけです：

```shell
langchain app add rag-chroma-multi-modal-multi-vector
```

そして、以下のコードを`server.py`ファイルに追加します：

```python
from rag_chroma_multi_modal_multi_vector import chain as rag_chroma_multi_modal_chain_mv

add_routes(app, rag_chroma_multi_modal_chain_mv, path="/rag-chroma-multi-modal-multi-vector")
```

（オプション）次にLangSmithを構成しましょう。
LangSmithは、LangChainアプリケーションをトレース、監視、およびデバッグするのに役立ちます。
[こちら](https://smith.langchain.com/)でLangSmithにサインアップできます。
アクセスできない場合は、このセクションをスキップできます。

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

このディレクトリ内にいる場合は、直接LangServeインスタンスを立ち上げることができます：

```shell
langchain serve
```

これにより、ローカルでサーバーが実行されているFastAPIアプリが起動します
[http://localhost:8000](http://localhost:8000)

すべてのテンプレートを[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)で確認できます
プレイグラウンドには[http://127.0.0.1:8000/rag-chroma-multi-modal-multi-vector/playground](http://127.0.0.1:8000/rag-chroma-multi-modal-multi-vector/playground)でアクセスできます

コードからテンプレートにアクセスするには：

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-chroma-multi-modal-multi-vector")
```
