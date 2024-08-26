---
translated: true
---

# NLP Cloud

>[NLP Cloud](https://docs.nlpcloud.com/#introduction)は、最先端のAIエンジンを使用したり、独自のデータでエンジンを訓練したりできる人工知能プラットフォームです。

[embeddings](https://docs.nlpcloud.com/#embeddings)エンドポイントでは、以下のモデルを提供しています:

* `paraphrase-multilingual-mpnet-base-v2`: Paraphrase Multilingual MPNet Base V2は、Sentence Transformersに基づいた非常に高速なモデルで、50か国語以上の埋め込み抽出に最適です(完全なリストはこちらをご覧ください)。

```python
%pip install --upgrade --quiet  nlpcloud
```

```python
from langchain_community.embeddings import NLPCloudEmbeddings
```

```python
import os

os.environ["NLPCLOUD_API_KEY"] = "xxx"
nlpcloud_embd = NLPCloudEmbeddings()
```

```python
text = "This is a test document."
```

```python
query_result = nlpcloud_embd.embed_query(text)
```

```python
doc_result = nlpcloud_embd.embed_documents([text])
```
