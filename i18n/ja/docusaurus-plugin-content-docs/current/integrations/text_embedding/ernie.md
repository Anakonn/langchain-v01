---
translated: true
---

# ERNIE

[ERNIE Embedding-V1](https://cloud.baidu.com/doc/WENXINWORKSHOP/s/alj562vvu)は、`Baidu Wenxin`の大規模モデル技術に基づいたテキスト表現モデルで、テキストをベクトル形式の数値で表現し、テキスト検索、情報推薦、知識マイニングなどのシナリオで使用されます。

**非推奨の警告**

ユーザーには `langchain_community.embeddings.ErnieEmbeddings` の代わりに `langchain_community.embeddings.QianfanEmbeddingsEndpoint` の使用をお勧めします。

`QianfanEmbeddingsEndpoint` のドキュメントは [こちら](/docs/integrations/text_embedding/baidu_qianfan_endpoint/) です。

ユーザーに `QianfanEmbeddingsEndpoint` の使用をお勧めする理由は2つあります:

1. `QianfanEmbeddingsEndpoint` は、Qianfanプラットフォームでより多くの埋め込みモデルをサポートしています。
2. `ErnieEmbeddings` はメンテナンスされておらず、非推奨となっています。

移行のためのヒント:

```python
from langchain_community.embeddings import QianfanEmbeddingsEndpoint

embeddings = QianfanEmbeddingsEndpoint(
    qianfan_ak="your qianfan ak",
    qianfan_sk="your qianfan sk",
)
```

## 使用方法

```python
from langchain_community.embeddings import ErnieEmbeddings
```

```python
embeddings = ErnieEmbeddings()
```

```python
query_result = embeddings.embed_query("foo")
```

```python
doc_results = embeddings.embed_documents(["foo"])
```
