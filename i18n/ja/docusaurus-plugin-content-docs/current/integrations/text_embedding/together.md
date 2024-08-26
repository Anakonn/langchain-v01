---
sidebar_label: Together AI
translated: true
---

# TogetherEmbeddings

このノートブックでは、Together AI APIでホストされているオープンソースの埋め込みモデルの使い始め方について説明します。

## インストール

```python
# install package
%pip install --upgrade --quiet  langchain-together
```

## 環境設定

次の環境変数を設定する必要があります:

- `TOGETHER_API_KEY`

## 使用方法

まず、[このリスト](https://docs.together.ai/docs/embedding-models)から使用するモデルを選択します。以下の例では、`togethercomputer/m2-bert-80M-8k-retrieval`を使用します。

```python
from langchain_together.embeddings import TogetherEmbeddings

embeddings = TogetherEmbeddings(model="togethercomputer/m2-bert-80M-8k-retrieval")
```

```python
embeddings.embed_query("My query to look up")
```

```python
embeddings.embed_documents(
    ["This is a content of the document", "This is another document"]
)
```

```python
# async embed query
await embeddings.aembed_query("My query to look up")
```

```python
# async embed documents
await embeddings.aembed_documents(
    ["This is a content of the document", "This is another document"]
)
```
