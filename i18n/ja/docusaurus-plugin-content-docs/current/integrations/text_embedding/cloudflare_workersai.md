---
translated: true
---

# Cloudflare Workers AI

>[Cloudflare, Inc. (Wikipedia)](https://en.wikipedia.org/wiki/Cloudflare)は、コンテンツ配信ネットワークサービス、クラウドサイバーセキュリティ、DDoS緩和、およびICANN認定ドメイン登録サービスを提供する米国企業です。

>[Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/)を使うと、REST APIを介して、`Cloudflare`ネットワーク上でマシンラーニングモデルを実行できます。

>[Cloudflare AI document](https://developers.cloudflare.com/workers-ai/models/text-embeddings/)には、利用可能なすべてのテキストエンベディングモデルがリストされています。

## 設定

CloudflareアカウントIDとAPIトークンが必要です。[このドキュメント](https://developers.cloudflare.com/workers-ai/get-started/rest-api/)から、それらの取得方法を確認してください。

```python
import getpass

my_account_id = getpass.getpass("Enter your Cloudflare account ID:\n\n")
my_api_token = getpass.getpass("Enter your Cloudflare API token:\n\n")
```

## 例

```python
from langchain_community.embeddings.cloudflare_workersai import (
    CloudflareWorkersAIEmbeddings,
)
```

```python
embeddings = CloudflareWorkersAIEmbeddings(
    account_id=my_account_id,
    api_token=my_api_token,
    model_name="@cf/baai/bge-small-en-v1.5",
)
# single string embeddings
query_result = embeddings.embed_query("test")
len(query_result), query_result[:3]
```

```output
(384, [-0.033627357333898544, 0.03982774540781975, 0.03559349477291107])
```

```python
# string embeddings in batches
batch_query_result = embeddings.embed_documents(["test1", "test2", "test3"])
len(batch_query_result), len(batch_query_result[0])
```

```output
(3, 384)
```
