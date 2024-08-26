---
translated: true
---

# rag-timescale-conversation

このテンプレートは[会話型](https://python.langchain.com/docs/expression_language/cookbook/retrieval#conversational-retrieval-chain)の[検索](https://python.langchain.com/docs/use_cases/question_answering/)に使用されます。これは最も人気のあるLLMのユースケースの1つです。

会話履歴と検索されたドキュメントをLLMに渡して合成します。

## 環境設定

このテンプレートはTimescale Vectorをベクトルストアとして使用し、`TIMESCALES_SERVICE_URL`が必要です。アカウントをお持ちでない場合は、[こちら](https://console.cloud.timescale.com/signup?utm_campaign=vectorlaunch&utm_source=langchain&utm_medium=referral)から90日間の無料トライアルにサインアップできます。

サンプルデータセットを読み込むには、`LOAD_SAMPLE_DATA=1`を設定します。独自のデータセットを読み込む場合は、以下のセクションを参照してください。

OpenAIモデルにアクセスするには、`OPENAI_API_KEY`環境変数を設定する必要があります。

## 使用方法

このパッケージを使用するには、まずLangChain CLIをインストールする必要があります:

```shell
pip install -U "langchain-cli[serve]"
```

新しいLangChainプロジェクトを作成し、これを唯一のパッケージとしてインストールするには、次のように実行できます:

```shell
langchain app new my-app --package rag-timescale-conversation
```

既存のプロジェクトに追加する場合は、次のように実行できます:

```shell
langchain app add rag-timescale-conversation
```

そして、`server.py`ファイルに次のコードを追加します:

```python
from rag_timescale_conversation import chain as rag_timescale_conversation_chain

add_routes(app, rag_timescale_conversation_chain, path="/rag-timescale_conversation")
```

(オプション) LangSmithを設定しましょう。
LangSmithは、LangChainアプリケーションのトレース、モニタリング、デバッグを支援します。
[こちら](https://smith.langchain.com/)からサインアップできます。
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
[http://127.0.0.1:8000/rag-timescale-conversation/playground](http://127.0.0.1:8000/rag-timescale-conversation/playground)でPlaygroundにアクセスできます。

コードから次のようにテンプレートにアクセスできます:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-timescale-conversation")
```

`rag_conversation.ipynb`ノートブックに使用例があります。

## 独自のデータセットの読み込み

独自のデータセットを読み込むには、`load_dataset`関数を作成する必要があります。`load_ts_git_dataset`関数の例は、`load_sample_dataset.py`ファイルに定義されています。これを単独の関数として実行したり(例えばbashスクリプトで)、chain.pyに追加したりできます(ただし、一度だけ実行する必要があります)。
