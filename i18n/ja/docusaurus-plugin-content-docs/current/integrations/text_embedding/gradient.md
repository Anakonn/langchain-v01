---
translated: true
---

# 勾配

`Gradient`を使うと、簡単な Web API で `Embeddings` を作成し、LLM を微調整して完成させることができます。

このノートブックでは、[Gradient](https://gradient.ai/) の Embeddings を使って Langchain を使う方法について説明します。

## インポート

```python
from langchain_community.embeddings import GradientEmbeddings
```

## 環境 API キーの設定

Gradient AI から API キーを取得してください。テストや微調整に使える $10 の無料クレジットが付与されます。

```python
import os
from getpass import getpass

if not os.environ.get("GRADIENT_ACCESS_TOKEN", None):
    # Access token under https://auth.gradient.ai/select-workspace
    os.environ["GRADIENT_ACCESS_TOKEN"] = getpass("gradient.ai access token:")
if not os.environ.get("GRADIENT_WORKSPACE_ID", None):
    # `ID` listed in `$ gradient workspace list`
    # also displayed after login at at https://auth.gradient.ai/select-workspace
    os.environ["GRADIENT_WORKSPACE_ID"] = getpass("gradient.ai workspace id:")
```

オプション: `gradientai` Python パッケージを使って、環境変数 `GRADIENT_ACCESS_TOKEN` と `GRADIENT_WORKSPACE_ID` を検証し、現在デプロイされているモデルを取得します。

```python
%pip install --upgrade --quiet  gradientai
```

## Gradient インスタンスの作成

```python
documents = [
    "Pizza is a dish.",
    "Paris is the capital of France",
    "numpy is a lib for linear algebra",
]
query = "Where is Paris?"
```

```python
embeddings = GradientEmbeddings(model="bge-large")

documents_embedded = embeddings.embed_documents(documents)
query_result = embeddings.embed_query(query)
```

```python
# (demo) compute similarity
import numpy as np

scores = np.array(documents_embedded) @ np.array(query_result).T
dict(zip(documents, scores))
```
