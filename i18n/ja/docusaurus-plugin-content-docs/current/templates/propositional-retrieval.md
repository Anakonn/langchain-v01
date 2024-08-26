---
translated: true
---

# 命題検索

このテンプレートは、Chen et al. の[Dense X Retrieval: What Retrieval Granularity Should We Use?](https://arxiv.org/abs/2312.06648)で提案された多重ベクトル索引戦略を示しています。プロンプトは、[ハブ上で試すことができます](https://smith.langchain.com/hub/wfh/proposal-indexing)。LLMに脈絡のない「命題」を生成させ、それをベクトル化することで、検索精度を高めることができます。完全な定義は `proposal_chain.py` にあります。

## ストレージ

このデモでは、RecursiveUrlLoader を使ってシンプルな学術論文をインデックス化し、検索情報をローカルに保存しています(chromaとローカルファイルシステムに保存されたbytestore)。ストレージ層は `storage.py` で変更できます。

## 環境設定

`OPENAI_API_KEY` 環境変数を設定して、`gpt-3.5` とOpenAI Embeddingsクラスにアクセスします。

## インデックス作成

以下を実行してインデックスを作成します:

```python
poetry install
poetry run python propositional_retrieval/ingest.py
```

## 使用方法

このパッケージを使用するには、まずLangChain CLIをインストールする必要があります:

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成し、これを唯一のパッケージとしてインストールするには、以下のように実行できます:

```shell
langchain app new my-app --package propositional-retrieval
```

既存のプロジェクトに追加する場合は、以下を実行します:

```shell
langchain app add propositional-retrieval
```

そして、`server.py` ファイルに以下のコードを追加します:

```python
from propositional_retrieval import chain

add_routes(app, chain, path="/propositional-retrieval")
```

(オプション) LangSmithを設定しましょう。
LangSmithは、LangChainアプリケーションのトレース、モニタリング、デバッグを支援します。
[ここ](https://smith.langchain.com/)からサインアップできます。
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

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)でテンプレート一覧を確認できます。
[http://127.0.0.1:8000/propositional-retrieval/playground](http://127.0.0.1:8000/propositional-retrieval/playground)でPlaygroundにアクセスできます。

コードから以下のようにテンプレートにアクセスできます:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/propositional-retrieval")
```
