---
translated: true
---

# rag-semi-structured

このテンプレートは、PDFのようなテキストとテーブルを含む半構造化データに対してRAGを実行します。

[このクックブック](https://github.com/langchain-ai/langchain/blob/master/cookbook/Semi_Structured_RAG.ipynb)を参考にしてください。

## 環境設定

OpenAIモデルにアクセスするには、`OPENAI_API_KEY`環境変数を設定する必要があります。

これは[Unstructured](https://unstructured-io.github.io/unstructured/)を使ってPDFを解析するため、いくつかのシステムレベルのパッケージのインストールが必要です。

Macの場合、以下のようにして必要なパッケージをインストールできます:

```shell
brew install tesseract poppler
```

## 使用方法

このパッケージを使用するには、まずLangChain CLIをインストールする必要があります:

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成し、これを唯一のパッケージとしてインストールするには、以下のように行います:

```shell
langchain app new my-app --package rag-semi-structured
```

既存のプロジェクトに追加する場合は、以下を実行するだけです:

```shell
langchain app add rag-semi-structured
```

そして、`server.py`ファイルに以下のコードを追加します:

```python
from rag_semi_structured import chain as rag_semi_structured_chain

add_routes(app, rag_semi_structured_chain, path="/rag-semi-structured")
```

(オプション) LangSmithを設定しましょう。
LangSmithは、LangChainアプリケーションのトレース、モニタリング、デバッグを支援します。
[ここ](https://smith.langchain.com/)からLangSmithに登録できます。
アクセスできない場合は、このセクションをスキップできます。

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

このディレクトリ内にいる場合は、以下のようにしてLangServeインスタンスを起動できます:

```shell
langchain serve
```

これにより、[http://localhost:8000](http://localhost:8000)でローカルサーバーが起動します。

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)でテンプレートをすべて確認できます。
[http://127.0.0.1:8000/rag-semi-structured/playground](http://127.0.0.1:8000/rag-semi-structured/playground)でPlaygroundにアクセスできます。

コードからテンプレートにアクセスするには、以下のようにします:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-semi-structured")
```

詳細については、Jupyter notebookの`rag_semi_structured`を参照してください。
