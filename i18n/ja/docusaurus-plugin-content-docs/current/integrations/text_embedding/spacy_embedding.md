---
translated: true
---

# SpaCy

>[spaCy](https://spacy.io/)は、プログラミング言語のPythonとCythonで書かれた、高度な自然言語処理のためのオープンソースソフトウェアライブラリです。

## インストールとセットアップ

```python
%pip install --upgrade --quiet  spacy
```

必要なクラスをインポートします。

```python
from langchain_community.embeddings.spacy_embeddings import SpacyEmbeddings
```

## 例

SpacyEmbeddingsを初期化します。これにより、Spacyモデルがメモリにロードされます。

```python
embedder = SpacyEmbeddings(model_name="en_core_web_sm")
```

サンプルテキストを定義します。これらは、分析したいドキュメント(ニュース記事、ソーシャルメディアの投稿、製品レビューなど)です。

```python
texts = [
    "The quick brown fox jumps over the lazy dog.",
    "Pack my box with five dozen liquor jugs.",
    "How vexingly quick daft zebras jump!",
    "Bright vixens jump; dozy fowl quack.",
]
```

テキストのエンベディングを生成して出力します。SpacyEmbeddingsクラスは、各ドキュメントのエンベディング(ドキュメントの内容を表す数値表現)を生成します。これらのエンベディングは、ドキュメントの類似性比較やテキスト分類などの自然言語処理タスクに使用できます。

```python
embeddings = embedder.embed_documents(texts)
for i, embedding in enumerate(embeddings):
    print(f"Embedding for document {i+1}: {embedding}")
```

単一のテキストのエンベディングを生成して出力します。検索クエリなどの単一のテキストについても、エンベディングを生成できます。これは、情報検索のようなタスクで、与えられたクエリに似たドキュメントを見つけるのに役立ちます。

```python
query = "Quick foxes and lazy dogs."
query_embedding = embedder.embed_query(query)
print(f"Embedding for query: {query_embedding}")
```
