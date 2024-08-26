---
translated: true
---

# 노믹

노믹은 현재 두 가지 제품을 제공하고 있습니다:

- Atlas: 그들의 Visual Data Engine
- GPT4All: 그들의 Open Source Edge Language Model Ecosystem

노믹 통합은 자체 [partner package](https://pypi.org/project/langchain-nomic/)에 존재합니다. 다음과 같이 설치할 수 있습니다:

```python
%pip install -qU langchain-nomic
```

현재 다음과 같이 그들의 호스팅된 [embedding model](/docs/integrations/text_embedding/nomic)을 가져올 수 있습니다:

```python
from langchain_nomic import NomicEmbeddings
```
