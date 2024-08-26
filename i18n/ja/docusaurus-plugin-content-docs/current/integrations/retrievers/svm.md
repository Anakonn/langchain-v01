---
translated: true
---

# SVM

>[サポートベクターマシン (SVM)](https://scikit-learn.org/stable/modules/svm.html#support-vector-machines) は、分類、回帰、アウトライヤー検出に使用される教師付き学習手法のセットです。

このノートブックでは、内部で `SVM` を使用するリトリーバーの使用方法について説明します。

https://github.com/karpathy/randomfun/blob/master/knn_vs_svm.html を大部分参考にしています。

```python
%pip install --upgrade --quiet  scikit-learn
```

```python
%pip install --upgrade --quiet  lark
```

`OpenAIEmbeddings` を使用するには、OpenAI API キーを取得する必要があります。

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

```output
OpenAI API Key: ········
```

```python
from langchain_community.retrievers import SVMRetriever
from langchain_openai import OpenAIEmbeddings
```

## 新しいリトリーバーにテキストを作成する

```python
retriever = SVMRetriever.from_texts(
    ["foo", "bar", "world", "hello", "foo bar"], OpenAIEmbeddings()
)
```

## リトリーバーを使用する

リトリーバーを使用できるようになりました!

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
 Document(page_content='world', metadata={})]
```
