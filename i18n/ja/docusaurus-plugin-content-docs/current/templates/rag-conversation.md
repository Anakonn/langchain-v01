---
translated: true
---

# rag-conversation

このテンプレートは[会話型](https://python.langchain.com/docs/expression_language/cookbook/retrieval#conversational-retrieval-chain)の[検索](https://python.langchain.com/docs/use_cases/question_answering/)に使用されます。これは最も人気のあるLLMのユースケースの1つです。

会話履歴と検索されたドキュメントをLLMに渡して合成します。

## 環境設定

このテンプレートはPineconeをベクトルストアとして使用し、`PINECONE_API_KEY`、`PINECONE_ENVIRONMENT`、`PINECONE_INDEX`を設定する必要があります。

OpenAIモデルにアクセスするには、`OPENAI_API_KEY`環境変数を設定する必要があります。

## 使用方法

このパッケージを使用するには、まずLangChain CLIをインストールする必要があります:

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成し、これを唯一のパッケージとしてインストールするには、次のように実行できます:

```shell
langchain app new my-app --package rag-conversation
```

既存のプロジェクトに追加する場合は、次のように実行できます:

```shell
langchain app add rag-conversation
```

そして、`server.py`ファイルに次のコードを追加します:

```python
from rag_conversation import chain as rag_conversation_chain

add_routes(app, rag_conversation_chain, path="/rag-conversation")
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
[http://127.0.0.1:8000/rag-conversation/playground](http://127.0.0.1:8000/rag-conversation/playground)でPlaygroundにアクセスできます。

コードから次のようにテンプレートにアクセスできます:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-conversation")
```
