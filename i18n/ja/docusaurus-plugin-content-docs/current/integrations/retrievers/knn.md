---
translated: true
---

# kNN

>統計学では、[k-nearest neighbours algorithm (k-NN)](https://en.wikipedia.org/wiki/K-nearest_neighbors_algorithm)は、1951年に `Evelyn Fix` と `Joseph Hodges` によって最初に開発された非パラメトリックな教師あり学習手法で、その後 `Thomas Cover` によって拡張されました。分類と回帰に使用されます。

このノートブックでは、内部でkNNを使用するリトリーバーの使用方法について説明します。

[Andrej Karpathy](https://github.com/karpathy/randomfun/blob/master/knn_vs_svm.html)のコードを大きく参考にしています。

```python
from langchain_community.retrievers import KNNRetriever
from langchain_openai import OpenAIEmbeddings
```

## 新しいリトリーバーを作成し、テキストを追加する

```python
retriever = KNNRetriever.from_texts(
    ["foo", "bar", "world", "hello", "foo bar"], OpenAIEmbeddings()
)
```

## リトリーバーを使用する

リトリーバーを使用することができます!

```python
result = retriever.invoke("foo")
```

```python
result
```

```output
[Document(page_content='foo', metadata={}),
 Document(page_content='foo bar', metadata={}),
 Document(page_content='hello', metadata={}),
 Document(page_content='bar', metadata={})]
```
