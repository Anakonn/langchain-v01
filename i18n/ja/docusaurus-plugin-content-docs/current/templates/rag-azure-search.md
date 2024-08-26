---
translated: true
---

# rag-azure-search

このテンプレートは、[Azure AI Search](https://learn.microsoft.com/azure/search/search-what-is-azure-search)をベクトルストアとして、Azure OpenAI chatおよびembeddingモデルを使用してドキュメントにRAGを実行します。

Azure AI SearchでのRAGの詳細については、[このノートブック](https://github.com/langchain-ai/langchain/blob/master/docs/docs/integrations/vectorstores/azuresearch.ipynb)を参照してください。

## 環境設定

***前提条件:*** 既存の[Azure AI Search](https://learn.microsoft.com/azure/search/search-what-is-azure-search)および[Azure OpenAI](https://learn.microsoft.com/azure/ai-services/openai/overview)リソース。

***環境変数:***

このテンプレートを実行するには、以下の環境変数を設定する必要があります:

***必須:***

- AZURE_SEARCH_ENDPOINT - Azure AI Searchサービスのエンドポイント。
- AZURE_SEARCH_KEY - Azure AI SearchサービスのAPIキー。
- AZURE_OPENAI_ENDPOINT - Azure OpenAIサービスのエンドポイント。
- AZURE_OPENAI_API_KEY - Azure OpenAIサービスのAPIキー。
- AZURE_EMBEDDINGS_DEPLOYMENT - embeddingsに使用するAzure OpenAIデプロイメントの名前。
- AZURE_CHAT_DEPLOYMENT - chatに使用するAzure OpenAIデプロイメントの名前。

***オプション:***

- AZURE_SEARCH_INDEX_NAME - 使用する既存のAzure AI Searchインデックスの名前。指定されない場合は、"rag-azure-search"という名前のインデックスが作成されます。
- OPENAI_API_VERSION - 使用するAzure OpenAI APIのバージョン。デフォルトは"2023-05-15"です。

## 使用方法

このパッケージを使用するには、LangChain CLIがインストールされている必要があります:

```shell
pip install -U langchain-cli
```

新しいLangChainプロジェクトを作成し、これを唯一のパッケージとしてインストールするには、以下のように実行できます:

```shell
langchain app new my-app --package rag-azure-search
```

既存のプロジェクトに追加する場合は、以下のように実行できます:

```shell
langchain app add rag-azure-search
```

そして、`server.py`ファイルに以下のコードを追加します:

```python
from rag_azure_search import chain as rag_azure_search_chain

add_routes(app, rag_azure_search_chain, path="/rag-azure-search")
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

このディレクトリ内にいる場合は、以下のようにLangServeインスタンスを直接起動できます:

```shell
langchain serve
```

これにより、FastAPIアプリが起動し、[http://localhost:8000](http://localhost:8000)でローカルサーバーが実行されます。

[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)でテンプレートをすべて確認できます。
[http://127.0.0.1:8000/rag-azure-search/playground](http://127.0.0.1:8000/rag-azure-search/playground)でplaygroundにアクセスできます。

コードから以下のようにテンプレートにアクセスできます:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-azure-search")
```
