---
translated: true
---

# Nuclia

>[Nuclia](https://nuclia.com) は、内部および外部のあらゆる情報源から構造化されていないデータを自動的にインデックス化し、最適化された検索結果と生成された回答を提供します。ビデオやオーディオの文字起こし、画像コンテンツの抽出、文書の解析などに対応しています。

`Nuclia Understanding API` のドキュメントトランスフォーマーは、テキストを段落や文に分割し、エンティティを識別し、テキストの要約を提供し、すべての文のエンベディングを生成します。

Nuclia Understanding APIを使用するには、Nucliaアカウントが必要です。[https://nuclia.cloud](https://nuclia.cloud)で無料で作成でき、[NUAキーを作成](https://docs.nuclia.dev/docs/docs/using/understanding/intro)することができます。

from langchain_community.document_transformers.nuclia_text_transform import NucliaTextTransformer

```python
%pip install --upgrade --quiet  protobuf
%pip install --upgrade --quiet  nucliadb-protos
```

```python
import os

os.environ["NUCLIA_ZONE"] = "<YOUR_ZONE>"  # e.g. europe-1
os.environ["NUCLIA_NUA_KEY"] = "<YOUR_API_KEY>"
```

Nucliaドキュメントトランスフォーマーを使用するには、`enable_ml`を`True`に設定した`NucliaUnderstandingAPI`ツールをインスタンス化する必要があります:

```python
from langchain_community.tools.nuclia import NucliaUnderstandingAPI

nua = NucliaUnderstandingAPI(enable_ml=True)
```

Nucliaドキュメントトランスフォーマーは非同期モードで呼び出す必要があるため、`atransform_documents`メソッドを使用する必要があります:

```python
import asyncio

from langchain_community.document_transformers.nuclia_text_transform import (
    NucliaTextTransformer,
)
from langchain_core.documents import Document


async def process():
    documents = [
        Document(page_content="<TEXT 1>", metadata={}),
        Document(page_content="<TEXT 2>", metadata={}),
        Document(page_content="<TEXT 3>", metadata={}),
    ]
    nuclia_transformer = NucliaTextTransformer(nua)
    transformed_documents = await nuclia_transformer.atransform_documents(documents)
    print(transformed_documents)


asyncio.run(process())
```
