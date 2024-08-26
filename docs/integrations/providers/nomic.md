---
canonical: https://python.langchain.com/v0.1/docs/integrations/providers/nomic
translated: false
---

# Nomic

Nomic currently offers two products:

- Atlas: their Visual Data Engine
- GPT4All: their Open Source Edge Language Model Ecosystem

The Nomic integration exists in its own [partner package](https://pypi.org/project/langchain-nomic/). You can install it with:

```python
%pip install -qU langchain-nomic
```

Currently, you can import their hosted [embedding model](/docs/integrations/text_embedding/nomic) as follows:

```python
from langchain_nomic import NomicEmbeddings
```