---
canonical: https://python.langchain.com/v0.1/docs/integrations/providers/awadb
translated: false
---

# AwaDB

>[AwaDB](https://github.com/awa-ai/awadb) is an AI Native database for the search and storage of embedding vectors used by LLM Applications.

## Installation and Setup

```bash
pip install awadb
```

## Vector store

```python
<!--IMPORTS:[{"imported": "AwaDB", "source": "langchain_community.vectorstores", "docs": "https://api.python.langchain.com/en/latest/vectorstores/langchain_community.vectorstores.awadb.AwaDB.html", "title": "AwaDB"}]-->
from langchain_community.vectorstores import AwaDB
```

See a [usage example](/docs/integrations/vectorstores/awadb).

## Embedding models

```python
<!--IMPORTS:[{"imported": "AwaEmbeddings", "source": "langchain_community.embeddings", "docs": "https://api.python.langchain.com/en/latest/embeddings/langchain_community.embeddings.awa.AwaEmbeddings.html", "title": "AwaDB"}]-->
from langchain_community.embeddings import AwaEmbeddings
```

See a [usage example](/docs/integrations/text_embedding/awadb).