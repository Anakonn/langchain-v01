---
translated: true
---

# rag-ollama-multi-query

このテンプレートは、OllamaとOpenAIを使用したRAGを実行し、マルチクエリリトリーバーを使用しています。

マルチクエリリトリーバーは、クエリ変換の一例で、ユーザーの入力クエリに基づいて、さまざまな視点からの複数のクエリを生成します。

各クエリについて、関連するドキュメントのセットを取得し、回答合成のためにすべてのクエリにわたる一意の和集合を取ります。

より大きなLLMのAPIへの過剰な呼び出しを避けるため、クエリ生成の狭い課題には、プライベートなローカルLLMを使用しています。

Ollamaのクエリ拡張の例トレースについては、[ここ](https://smith.langchain.com/public/8017d04d-2045-4089-b47f-f2d66393a999/r)を参照してください。

ただし、より困難な回答合成の課題には、OpenAIを使用しています(完全なトレース例は[ここ](https://smith.langchain.com/public/ec75793b-645b-498d-b855-e8d85e1f6738/r))にあります)。

## 環境設定

環境を設定するには、Ollamaをダウンロードする必要があります。

[ここ](https://python.langchain.com/docs/integrations/chat/ollama)の手順に従ってください。

Ollamaで希望のLLMを選択できます。

このテンプレートでは`zephyr`を使用しており、`ollama pull zephyr`でアクセスできます。

他のオプションは[ここ](https://ollama.ai/library)にあります。

OpenAIモデルにアクセスするには、`OPENAI_API_KEY`環境変数を設定してください。

## 使用方法

このパッケージを使用するには、まずLangChain CLIをインストールする必要があります:

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成してこのパッケージをインストールするには、次のように実行します:

```shell
langchain app new my-app --package rag-ollama-multi-query
```

既存のプロジェクトにこのパッケージを追加するには、次のように実行します:

```shell
langchain app add rag-ollama-multi-query
```

そして、`server.py`ファイルに次のコードを追加します:

```python
from rag_ollama_multi_query import chain as rag_ollama_multi_query_chain

add_routes(app, rag_ollama_multi_query_chain, path="/rag-ollama-multi-query")
```

(オプション) 次に、LangSmithを設定しましょう。LangSmithは、LangChainアプリケーションのトレース、モニタリング、デバッグを支援します。[ここ](https://smith.langchain.com/)からLangSmithに登録できます。アクセスできない場合は、このセクションをスキップできます。

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

このディレクトリ内にいる場合は、次のように直接LangServeインスタンスを起動できます:

```shell
langchain serve
```

これにより、[http://localhost:8000](http://localhost:8000)でローカルにサーバーが起動します。

すべてのテンプレートは[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)で確認できます。
プレイグラウンドは[http://127.0.0.1:8000/rag-ollama-multi-query/playground](http://127.0.0.1:8000/rag-ollama-multi-query/playground)でアクセスできます。

コードからテンプレートにアクセスするには、次のように使用します:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-ollama-multi-query")
```
