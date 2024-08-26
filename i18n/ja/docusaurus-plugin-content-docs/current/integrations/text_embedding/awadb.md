---
translated: true
---

# AwaDB

>[AwaDB](https://github.com/awa-ai/awadb)は、LLMアプリケーションで使用されるエンベディングベクトルの検索とストレージのためのAI Native データベースです。

このノートブックでは、LangChainでの`AwaEmbeddings`の使用方法を説明します。

```python
# pip install awadb
```

## ライブラリをインポートする

```python
from langchain_community.embeddings import AwaEmbeddings
```

```python
Embedding = AwaEmbeddings()
```

# 埋め込みモデルを設定する

ユーザーは`Embedding.set_model()`を使用して、埋め込みモデルを指定できます。\
この関数の入力は、モデルの名前を表す文字列です。\
現在サポートされているモデルのリストは[こちら](https://github.com/awa-ai/awadb)で確認できます。\

**デフォルトのモデル**は`all-mpnet-base-v2`で、設定せずに使用できます。

```python
text = "our embedding test"

Embedding.set_model("all-mpnet-base-v2")
```

```python
res_query = Embedding.embed_query("The test information")
res_document = Embedding.embed_documents(["test1", "another test"])
```
