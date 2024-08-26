---
translated: true
---

# AwaDB

>[AwaDB](https://github.com/awa-ai/awadb)は、LLMアプリケーションで使用されるエンベディングベクトルの検索とストレージのためのAI Native データベースです。

## インストールとセットアップ

```bash
pip install awadb
```

## ベクトルストア

```python
<!--IMPORTS:[{"imported": "AwaDB", "source": "langchain_community.vectorstores", "docs": "https://api.python.langchain.com/en/latest/vectorstores/langchain_community.vectorstores.awadb.AwaDB.html", "title": "AwaDB"}]-->
from langchain_community.vectorstores import AwaDB
```

[使用例](/docs/integrations/vectorstores/awadb)を参照してください。

## エンベディングモデル

```python
<!--IMPORTS:[{"imported": "AwaEmbeddings", "source": "langchain_community.embeddings", "docs": "https://api.python.langchain.com/en/latest/embeddings/langchain_community.embeddings.awa.AwaEmbeddings.html", "title": "AwaDB"}]-->
from langchain_community.embeddings import AwaEmbeddings
```

[使用例](/docs/integrations/text_embedding/awadb)を参照してください。
