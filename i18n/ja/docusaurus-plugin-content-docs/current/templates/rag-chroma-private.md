---
translated: true
---

# rag-chroma-private

このテンプレートは外部APIに依存せずにRAGを実行します。

Ollama LLM、GPT4Allのエンベディング、Chromaのベクトルストアを使用しています。

ベクトルストアは`chain.py`で作成され、デフォルトでは[人気のエージェントに関するブログ記事](https://lilianweng.github.io/posts/2023-06-23-agent/)をインデックス化してQ&Aに使用します。

## 環境設定

環境を設定するには、Ollamaをダウンロードする必要があります。

[ここ](https://python.langchain.com/docs/integrations/chat/ollama)の手順に従ってください。

Ollamaで希望のLLMを選択できます。

このテンプレートでは`llama2:7b-chat`を使用しており、`ollama pull llama2:7b-chat`でアクセスできます。

他のオプションは[こちら](https://ollama.ai/library)にあります。

このパッケージは[GPT4All](https://python.langchain.com/docs/integrations/text_embedding/gpt4all)のエンベディングも使用します。

## 使用方法

このパッケージを使用するには、まずLangChain CLIをインストールする必要があります:

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成し、このパッケージのみをインストールするには、以下のように実行できます:

```shell
langchain app new my-app --package rag-chroma-private
```

既存のプロジェクトに追加する場合は、以下のように実行します:

```shell
langchain app add rag-chroma-private
```

そして、`server.py`ファイルに以下のコードを追加します:

```python
from rag_chroma_private import chain as rag_chroma_private_chain

add_routes(app, rag_chroma_private_chain, path="/rag-chroma-private")
```

(オプション) LangSmithを設定しましょう。LangSmithはLangChainアプリケーションのトレース、モニタリング、デバッグを支援します。[ここ](https://smith.langchain.com/)からサインアップできます。アクセスできない場合は、このセクションをスキップできます。

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

このディレクトリ内にいる場合は、以下のようにLangServeインスタンスを直接起動できます:

```shell
langchain serve
```

これにより、FastAPIアプリが起動し、[http://localhost:8000](http://localhost:8000)でローカルサーバーが実行されます。

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)でテンプレートをすべて確認できます。
[http://127.0.0.1:8000/rag-chroma-private/playground](http://127.0.0.1:8000/rag-chroma-private/playground)でPlaygroundにアクセスできます。

コードから以下のようにテンプレートにアクセスできます:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-chroma-private")
```

このパッケージは`chain.py`でベクトルデータベースにドキュメントを作成し、追加します。デフォルトでは人気のエージェントに関するブログ記事をロードしますが、多数のドキュメントローダーから選択できます[こちら](https://python.langchain.com/docs/integrations/document_loaders)。
