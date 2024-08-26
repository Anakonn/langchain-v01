---
translated: true
---

# AwaDB

>[AwaDB](https://github.com/awa-ai/awadb) es una base de datos nativa de IA para la búsqueda y el almacenamiento de vectores de incrustación utilizados por aplicaciones de LLM.

## Instalación y configuración

```bash
pip install awadb
```

## Almacén de vectores

```python
<!--IMPORTS:[{"imported": "AwaDB", "source": "langchain_community.vectorstores", "docs": "https://api.python.langchain.com/en/latest/vectorstores/langchain_community.vectorstores.awadb.AwaDB.html", "title": "AwaDB"}]-->
from langchain_community.vectorstores import AwaDB
```

Consulte un [ejemplo de uso](/docs/integrations/vectorstores/awadb).

## Modelos de incrustación

```python
<!--IMPORTS:[{"imported": "AwaEmbeddings", "source": "langchain_community.embeddings", "docs": "https://api.python.langchain.com/en/latest/embeddings/langchain_community.embeddings.awa.AwaEmbeddings.html", "title": "AwaDB"}]-->
from langchain_community.embeddings import AwaEmbeddings
```

Consulte un [ejemplo de uso](/docs/integrations/text_embedding/awadb).
