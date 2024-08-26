---
translated: true
---

# FireworksEmbeddings

このノートブックでは、langchainに含まれるFireworksEmbeddingsを使用してテキストをエンベディングする方法を説明します。このサンプルでは、デフォルトのnomic-ai v1.5モデルを使用しています。

```python
%pip install -qU langchain-fireworks
```

## セットアップ

```python
from langchain_fireworks import FireworksEmbeddings
```

```python
import getpass
import os

if "FIREWORKS_API_KEY" not in os.environ:
    os.environ["FIREWORKS_API_KEY"] = getpass.getpass("Fireworks API Key:")
```

# エンベディングモデルの使用

`FireworksEmbeddings`を使用すると、デフォルトのモデル'nomic-ai/nomic-embed-text-v1.5'を直接使用できるほか、利用可能な場合は別のモデルを設定することもできます。

```python
embedding = FireworksEmbeddings(model="nomic-ai/nomic-embed-text-v1.5")
```

```python
res_query = embedding.embed_query("The test information")
res_document = embedding.embed_documents(["test1", "another test"])
print(res_query[:5])
print(res_document[1][:5])
```

```output
[0.01367950439453125, 0.0103607177734375, -0.157958984375, -0.003070831298828125, 0.05926513671875]
[0.0369873046875, 0.00545501708984375, -0.179931640625, -0.018707275390625, 0.0552978515625]
```
