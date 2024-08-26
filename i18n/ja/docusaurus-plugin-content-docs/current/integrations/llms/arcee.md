---
translated: true
---

# Arcee

このノートブックでは、Arceeのドメイン適応言語モデル(DALM)を使用してテキストを生成する方法を示します。

### セットアップ

Arceeを使用する前に、Arcee APIキーを `ARCEE_API_KEY` 環境変数として設定する必要があります。APIキーを名前付きパラメーターとして渡すこともできます。

```python
from langchain_community.llms import Arcee

# Create an instance of the Arcee class
arcee = Arcee(
    model="DALM-PubMed",
    # arcee_api_key="ARCEE-API-KEY" # if not already set in the environment
)
```

### 追加の設定

`arcee_api_url`、`arcee_app_url`、`model_kwargs` などのArceeのパラメーターを必要に応じて設定することもできます。
オブジェクト初期化時に `model_kwargs` を設定すると、その後の generate response への呼び出しでデフォルトとして使用されます。

```python
arcee = Arcee(
    model="DALM-Patent",
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

### テキストの生成

プロンプトを提供することで、Arceeからテキストを生成できます。以下は例です:

```python
# Generate text
prompt = "Can AI-driven music therapy contribute to the rehabilitation of patients with disorders of consciousness?"
response = arcee(prompt)
```

### 追加のパラメーター

Arceeでは、`filters` を適用したり、取得するドキュメントの `size` (件数)を設定したりして、テキスト生成を支援することができます。フィルターを使用すると、結果を絞り込むことができます。これらのパラメーターの使用方法は以下の通りです:

```python
# Define filters
filters = [
    {"field_name": "document", "filter_type": "fuzzy_search", "value": "Einstein"},
    {"field_name": "year", "filter_type": "strict_search", "value": "1905"},
]

# Generate text with filters and size params
response = arcee(prompt, size=5, filters=filters)
```
