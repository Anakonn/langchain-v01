---
translated: true
---

# Arcee

>[Arcee](https://www.arcee.ai/about/about-us) は、SLM（小型、専門化、セキュリティ、スケーラブルな言語モデル）の開発を支援します。

このノートブックでは、`ArceeRetriever`クラスを使用して、Arceeの`Domain Adapted Language Models`(`DALMs`)に関連するドキュメントを取得する方法を示します。

### セットアップ

`ArceeRetriever`を使用する前に、Arcee APIキーを`ARCEE_API_KEY`環境変数として設定する必要があります。APIキーを名前付きパラメーターとして渡すこともできます。

```python
from langchain_community.retrievers import ArceeRetriever

retriever = ArceeRetriever(
    model="DALM-PubMed",
    # arcee_api_key="ARCEE-API-KEY" # if not already set in the environment
)
```

### 追加の設定

`ArceeRetriever`のパラメーター、`arcee_api_url`、`arcee_app_url`、`model_kwargs`などを必要に応じて設定することもできます。
オブジェクト初期化時に`model_kwargs`を設定すると、その後の取得時にデフォルトのフィルターとサイズが使用されます。

```python
retriever = ArceeRetriever(
    model="DALM-PubMed",
    # arcee_api_key="ARCEE-API-KEY", # if not already set in the environment
    arcee_api_url="https://custom-api.arcee.ai",  # default is https://api.arcee.ai
    arcee_app_url="https://custom-app.arcee.ai",  # default is https://app.arcee.ai
    model_kwargs={
        "size": 5,
        "filters": [
            {
                "field_name": "document",
                "filter_type": "fuzzy_search",
                "value": "Einstein",
            }
        ],
    },
)
```

### ドキュメントの取得

アップロードされたコンテキストから関連するドキュメントを取得するには、クエリを提供します。以下は例です:

```python
query = "Can AI-driven music therapy contribute to the rehabilitation of patients with disorders of consciousness?"
documents = retriever.invoke(query)
```

### 追加のパラメーター

Arceeでは、`filters`を適用し、取得するドキュメントの`size`（件数）を設定できます。フィルターを使用すると、結果を絞り込むことができます。使用方法は以下の通りです:

```python
# Define filters
filters = [
    {"field_name": "document", "filter_type": "fuzzy_search", "value": "Music"},
    {"field_name": "year", "filter_type": "strict_search", "value": "1905"},
]

# Retrieve documents with filters and size params
documents = retriever.invoke(query, size=5, filters=filters)
```
