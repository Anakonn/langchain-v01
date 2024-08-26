---
translated: true
---

# TF-IDF

>[TF-IDF](https://scikit-learn.org/stable/modules/feature_extraction.html#tfidf-term-weighting)は、用語頻度と逆文書頻度の積を意味します。

このノートブックでは、`scikit-learn`パッケージを使って、内部で[TF-IDF](https://en.wikipedia.org/wiki/Tf%E2%80%93idf)を使うリトリーバーの使い方を説明します。

TF-IDFの詳細については、[このブログ記事](https://medium.com/data-science-bootcamp/tf-idf-basics-of-information-retrieval-48de122b2a4c)を参照してください。

```python
%pip install --upgrade --quiet  scikit-learn
```

```python
from langchain_community.retrievers import TFIDFRetriever
```

## 新しいリトリーバーを作成する

```python
retriever = TFIDFRetriever.from_texts(["foo", "bar", "world", "hello", "foo bar"])
```

## 文書を使って新しいリトリーバーを作成する

作成した文書を使って、新しいリトリーバーを作成できます。

```python
from langchain_core.documents import Document

retriever = TFIDFRetriever.from_documents(
    [
        Document(page_content="foo"),
        Document(page_content="bar"),
        Document(page_content="world"),
        Document(page_content="hello"),
        Document(page_content="foo bar"),
    ]
)
```

## リトリーバーを使う

リトリーバーを使うことができます!

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

## 保存と読み込み

このリトリーバーは簡単に保存と読み込みができるので、ローカル開発に便利です!

```python
retriever.save_local("testing.pkl")
```

```python
retriever_copy = TFIDFRetriever.load_local("testing.pkl")
```

```python
retriever_copy.invoke("foo")
```

```output
[Document(page_content='foo', metadata={}),
 Document(page_content='foo bar', metadata={}),
 Document(page_content='hello', metadata={}),
 Document(page_content='world', metadata={})]
```
