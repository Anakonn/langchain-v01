---
translated: true
---

# FireworksEmbeddings

이 노트북은 langchain_fireworks 패키지에 포함된 Fireworks Embeddings를 사용하여 텍스트를 임베딩하는 방법을 설명합니다. 이 예제에서는 기본 nomic-ai v1.5 모델을 사용합니다.

```python
%pip install -qU langchain-fireworks
```

## 설정

```python
from langchain_fireworks import FireworksEmbeddings
```

```python
import getpass
import os

if "FIREWORKS_API_KEY" not in os.environ:
    os.environ["FIREWORKS_API_KEY"] = getpass.getpass("Fireworks API Key:")
```

# 임베딩 모델 사용하기

`FireworksEmbeddings`를 사용하면 기본 모델 'nomic-ai/nomic-embed-text-v1.5'를 직접 사용하거나 다른 모델을 설정할 수 있습니다.

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
