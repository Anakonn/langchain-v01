---
translated: true
---

# AwaDB

>[AwaDB](https://github.com/awa-ai/awadb) est une base de données native à l'IA pour la recherche et le stockage des vecteurs d'intégration utilisés par les applications LLM.

## Installation et configuration

```bash
pip install awadb
```

## Magasin de vecteurs

```python
<!--IMPORTS:[{"imported": "AwaDB", "source": "langchain_community.vectorstores", "docs": "https://api.python.langchain.com/en/latest/vectorstores/langchain_community.vectorstores.awadb.AwaDB.html", "title": "AwaDB"}]-->
from langchain_community.vectorstores import AwaDB
```

Voir un [exemple d'utilisation](/docs/integrations/vectorstores/awadb).

## Modèles d'intégration

```python
<!--IMPORTS:[{"imported": "AwaEmbeddings", "source": "langchain_community.embeddings", "docs": "https://api.python.langchain.com/en/latest/embeddings/langchain_community.embeddings.awa.AwaEmbeddings.html", "title": "AwaDB"}]-->
from langchain_community.embeddings import AwaEmbeddings
```

Voir un [exemple d'utilisation](/docs/integrations/text_embedding/awadb).
