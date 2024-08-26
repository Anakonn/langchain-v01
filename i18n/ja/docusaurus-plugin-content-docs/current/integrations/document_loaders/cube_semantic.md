---
translated: true
---

# キューブ セマンティック レイヤー

このノートブックでは、LLMに渡すためのデータモデルメタデータを取得するプロセスを示します。これにより、コンテキスト情報が強化されます。

### キューバについて

[キューブ](https://cube.dev/)は、データアプリを構築するためのセマンティックレイヤーです。データエンジニアやアプリケーション開発者がモダンなデータストアからデータにアクセスし、一貫した定義に整理し、すべてのアプリケーションに提供するのを支援します。

キューブのデータモデルは、LLMがデータを理解し、正しいクエリを生成するためのコンテキストとして使用されます。LLMは複雑な結合やメトリック計算を操作する必要がなく、ビジネスレベルの用語を使用するシンプルなインターフェイスを提供します。この簡略化により、LLMのエラーや幻覚を減らすことができます。

### 例

**入力引数 (必須)**

`Cube Semantic Loader`には2つの引数が必要です:

- `cube_api_url`: CubeのデプロイメントのREST APIのURL。詳細は[Cubeのドキュメント](https://cube.dev/docs/http-api/rest#configuration-base-path)を参照してください。

- `cube_api_token`: CubeのAPI秘密鍵に基づいて生成された認証トークン。JSONウェブトークン(JWT)の生成方法については、[Cubeのドキュメント](https://cube.dev/docs/security#generating-json-web-tokens-jwt)を参照してください。

**入力引数 (オプション)**

- `load_dimension_values`: 文字列ディメンションの値をすべて読み込むかどうか。

- `dimension_values_limit`: 読み込むディメンション値の最大数。

- `dimension_values_max_retries`: ディメンション値の読み込みを試行する最大回数。

- `dimension_values_retry_delay`: 再試行の間隔。

```python
import jwt
from langchain_community.document_loaders import CubeSemanticLoader

api_url = "https://api-example.gcp-us-central1.cubecloudapp.dev/cubejs-api/v1/meta"
cubejs_api_secret = "api-secret-here"
security_context = {}
# Read more about security context here: https://cube.dev/docs/security
api_token = jwt.encode(security_context, cubejs_api_secret, algorithm="HS256")

loader = CubeSemanticLoader(api_url, api_token)

documents = loader.load()
```

以下の属性を持つドキュメントのリストを返します:

- `page_content`
- `metadata`
  - `table_name`
  - `column_name`
  - `column_data_type`
  - `column_title`
  - `column_description`
  - `column_values`
  - `cube_data_obj_type`

```python
# Given string containing page content
page_content = "Users View City, None"

# Given dictionary containing metadata
metadata = {
    "table_name": "users_view",
    "column_name": "users_view.city",
    "column_data_type": "string",
    "column_title": "Users View City",
    "column_description": "None",
    "column_member_type": "dimension",
    "column_values": [
        "Austin",
        "Chicago",
        "Los Angeles",
        "Mountain View",
        "New York",
        "Palo Alto",
        "San Francisco",
        "Seattle",
    ],
    "cube_data_obj_type": "view",
}
```
