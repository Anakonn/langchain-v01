---
translated: true
---

Databricks
==========

[Databricks](https://www.databricks.com/) Lakehouse Platform は、1つのプラットフォーム上でデータ、分析、AIを統合しています。

Databricksは様々な方法でLangChainエコシステムを活用しています:

1. SQLDatabase ChainのためのDatabricksコネクタ: SQLDatabase.from_databricks()を使うと、LangChainを通してDatabricksのデータを簡単に照会できます
2. Databricks MLflowはLangChainと統合: LangChainアプリケーションのトラッキングとサービング提供が簡単になります
3. LLMプロバイダーとしてのDatabricks: 微調整したLLMをDatabricksのサービングエンドポイントやクラスタードライバープロキシアプリで展開し、langchain.llms.Databricksを使って照会できます
4. Databricks Dolly: Databricksがオープンソース化したDollyは商用利用が可能で、Hugging Face Hubからアクセスできます

Databricks connector for the SQLDatabase Chain
----------------------------------------------
SQLDatabaseラッパーを使って、[Databricks runtimes](https://docs.databricks.com/runtime/index.html)と[Databricks SQL](https://www.databricks.com/product/databricks-sql)に接続できます。

Databricks MLflow integrates with LangChain
-------------------------------------------

MLflowは、実験、再現性、デプロイメント、中央モデルレジストリなどのMLライフサイクルを管理するオープンソースプラットフォームです。[MLflow Callback Handler](/docs/integrations/providers/mlflow_tracking)のノートブックで、MLflowとLangChainの統合について詳しく説明しています。

Databricksは、エンタープライズセキュリティ機能、高可用性、実験管理、ノートブック履歴キャプチャなどのDatabricksワークスペース機能と統合された、完全に管理されたホスト型のMLflowを提供しています。Databricks上のMLflowは、機械学習モデルトレーニングの実行とプロジェクトの実行を管理するための統合エクスペリエンスを提供します。詳細は[MLflowガイド](https://docs.databricks.com/mlflow/index.html)を参照してください。

Databricks MLflowにより、Databricksでのランチェーンアプリケーションの開発がより便利になります。MLflowトラッキングでは、トラッキングURIを設定する必要がありません。MLflowモデルサービングでは、LangChainチェーンをMLflowのlangchain flavorで保存し、Databricksで数クリックでチェーンを登録およびサービングできます。資格情報はMLflowモデルサービングによって安全に管理されます。

Databricks External Models
--------------------------

[Databricks External Models](https://docs.databricks.com/generative-ai/external-models/index.html)は、OpenAIやAnthropicなどの大規模言語モデル(LLM)プロバイダーを組織内で使いやすくするためのサービスです。特定のLLM関連のリクエストを処理する統一エンドポイントを提供し、これらのサービスとの対話を簡素化します。次の例では、OpenAI's GPT-4モデルを提供するエンドポイントを作成し、それからチャット応答を生成しています:

```python
<!--IMPORTS:[{"imported": "ChatDatabricks", "source": "langchain_community.chat_models", "docs": "https://api.python.langchain.com/en/latest/chat_models/langchain_community.chat_models.databricks.ChatDatabricks.html", "title": "-> content='Hello! How can I assist you today?'"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://api.python.langchain.com/en/latest/messages/langchain_core.messages.human.HumanMessage.html", "title": "-> content='Hello! How can I assist you today?'"}]-->
from langchain_community.chat_models import ChatDatabricks
from langchain_core.messages import HumanMessage
from mlflow.deployments import get_deploy_client


client = get_deploy_client("databricks")
name = f"chat"
client.create_endpoint(
    name=name,
    config={
        "served_entities": [
            {
                "name": "test",
                "external_model": {
                    "name": "gpt-4",
                    "provider": "openai",
                    "task": "llm/v1/chat",
                    "openai_config": {
                        "openai_api_key": "{{secrets/<scope>/<key>}}",
                    },
                },
            }
        ],
    },
)
chat = ChatDatabricks(endpoint=name, temperature=0.1)
print(chat([HumanMessage(content="hello")]))
# -> content='Hello! How can I assist you today?'
```

Databricks Foundation Model APIs
--------------------------------

[Databricks Foundation Model APIs](https://docs.databricks.com/machine-learning/foundation-models/index.html)を使うと、専用のサービングエンドポイントから最先端のオープンソースモデルにアクセスして照会できます。Foundation Model APIsにより、開発者は自分でモデルのデプロイを管理することなく、高品質の生成型AIモデルを活用したアプリケーションを迅速に構築できます。次の例では、`databricks-bge-large-en`エンドポイントを使ってテキストからエンベディングを生成しています:

```python
<!--IMPORTS:[{"imported": "DatabricksEmbeddings", "source": "langchain_community.embeddings", "docs": "https://api.python.langchain.com/en/latest/embeddings/langchain_community.embeddings.databricks.DatabricksEmbeddings.html", "title": "-> content='Hello! How can I assist you today?'"}]-->
from langchain_community.embeddings import DatabricksEmbeddings


embeddings = DatabricksEmbeddings(endpoint="databricks-bge-large-en")
print(embeddings.embed_query("hello")[:3])
# -> [0.051055908203125, 0.007221221923828125, 0.003879547119140625, ...]
```

Databricks as an LLM provider
-----------------------------

[Wrap Databricks endpoints as LLMs](/docs/integrations/llms/databricks#wrapping-a-serving-endpoint-custom-model)のノートブックでは、MLflowで登録したカスタムモデルをDatabricksエンドポイントとしてサービングする方法を示しています。
サービングエンドポイントとクラスタードライバープロキシアプリの2種類のエンドポイントがサポートされています。サービングエンドポイントは本番環境と開発環境の両方に推奨され、クラスタードライバープロキシアプリは対話型の開発に推奨されます。

Databricks Vector Search
------------------------

Databricks Vector Searchは、ベクトルデータベースにベクトル表現とメタデータを格納できるサーバーレスの類似検索エンジンです。Vector Searchを使うと、Unity Catalogで管理されるDeltaテーブルから自動更新ベクトル検索インデックスを作成し、シンプルなAPIを使ってもっとも類似したベクトルを返すことができます。[Databricks Vector Search](/docs/integrations/vectorstores/databricks_vector_search)のノートブックで、LangChainでの使用方法を確認できます。
