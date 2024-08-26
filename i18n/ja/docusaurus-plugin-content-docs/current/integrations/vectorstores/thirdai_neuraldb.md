---
translated: true
---

# ThirdAI NeuralDB

>[NeuralDB](https://www.thirdai.com/neuraldb-enterprise/)は、[ThirdAI](https://www.thirdai.com/)が開発したCPUフレンドリーで微調整可能なベクトルストアです。

## 初期化

初期化方法は2つあります:
- スクラッチから: 基本モデル
- チェックポイントから: 以前保存したモデルをロード

以下のすべての初期化方法について、`thirdai_key`パラメーターは`THIRDAI_KEY`環境変数が設定されている場合は省略できます。

ThirdAIのAPIキーは https://www.thirdai.com/try-bolt/ で取得できます。

```python
from langchain.vectorstores import NeuralDBVectorStore

# From scratch
vectorstore = NeuralDBVectorStore.from_scratch(thirdai_key="your-thirdai-key")

# From checkpoint
vectorstore = NeuralDBVectorStore.from_checkpoint(
    # Path to a NeuralDB checkpoint. For example, if you call
    # vectorstore.save("/path/to/checkpoint.ndb") in one script, then you can
    # call NeuralDBVectorStore.from_checkpoint("/path/to/checkpoint.ndb") in
    # another script to load the saved model.
    checkpoint="/path/to/checkpoint.ndb",
    thirdai_key="your-thirdai-key",
)
```

## ドキュメントソースの挿入

```python
vectorstore.insert(
    # If you have PDF, DOCX, or CSV files, you can directly pass the paths to the documents
    sources=["/path/to/doc.pdf", "/path/to/doc.docx", "/path/to/doc.csv"],
    # When True this means that the underlying model in the NeuralDB will
    # undergo unsupervised pretraining on the inserted files. Defaults to True.
    train=True,
    # Much faster insertion with a slight drop in performance. Defaults to True.
    fast_mode=True,
)

from thirdai import neural_db as ndb

vectorstore.insert(
    # If you have files in other formats, or prefer to configure how
    # your files are parsed, then you can pass in NeuralDB document objects
    # like this.
    sources=[
        ndb.PDF(
            "/path/to/doc.pdf",
            version="v2",
            chunk_size=100,
            metadata={"published": 2022},
        ),
        ndb.Unstructured("/path/to/deck.pptx"),
    ]
)
```

## 類似検索

ベクトルストアをクエリするには、標準のLangChainベクトルストアメソッド`similarity_search`を使用できます。これは、LangChainドキュメントオブジェクトのリストを返します。各ドキュメントオブジェクトは、インデックス化されたファイルからのテキストの塊を表します。たとえば、インデックス化されたPDFファイルの1つのパラグラフが含まれている可能性があります。テキストに加えて、ドキュメントのメタデータフィールドには、ドキュメントのID、このドキュメントの出所(どのファイルから来たか)、ドキュメントのスコアなどの情報が含まれています。

```python
# This returns a list of LangChain Document objects
documents = vectorstore.similarity_search("query", k=10)
```

## 微調整

NeuralDBVectorStoreは、ユーザーの行動やドメイン固有の知識に合わせて微調整できます。2つの方法で微調整できます:
1. 関連付け: ベクトルストアがソースフレーズとターゲットフレーズを関連付けます。ベクトルストアがソースフレーズを見つけると、ターゲットフレーズに関連する結果も考慮します。
2. 上方投票: ベクトルストアが特定のクエリに対するドキュメントのスコアを上方修正します。これは、ベクトルストアをユーザーの行動に合わせて微調整する際に役立ちます。たとえば、ユーザーが「車はどのように製造されるか」と検索し、ID 52のドキュメントに満足した場合、クエリ「車はどのように製造されるか」に対してID 52のドキュメントのスコアを上方修正できます。

```python
vectorstore.associate(source="source phrase", target="target phrase")
vectorstore.associate_batch(
    [
        ("source phrase 1", "target phrase 1"),
        ("source phrase 2", "target phrase 2"),
    ]
)

vectorstore.upvote(query="how is a car manufactured", document_id=52)
vectorstore.upvote_batch(
    [
        ("query 1", 52),
        ("query 2", 20),
    ]
)
```
