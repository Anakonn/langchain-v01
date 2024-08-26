---
translated: true
---

# Nomic

Nomicは現在2つの製品を提供しています:

- Atlas: Visual Data Engine
- GPT4All: Open Source Edge Language Model Ecosystem

Nomicのインテグレーションは独自の[パートナーパッケージ](https://pypi.org/project/langchain-nomic/)にあります。以下でインストールできます:

```python
%pip install -qU langchain-nomic
```

現在、[埋め込みモデル](/docs/integrations/text_embedding/nomic)をホストされたものとしてインポートできます:

```python
from langchain_nomic import NomicEmbeddings
```
