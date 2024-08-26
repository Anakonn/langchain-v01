---
translated: true
---

# **NeuralDB**

NeuralDBは、ThirdAIが開発したCPUフレンドリーで微調整可能な検索エンジンです。

### **初期化**

初期化方法は2つあります:
- スクラッチから: 基本モデル
- チェックポイントから: 以前保存したモデルをロード

以下の初期化方法すべてで、`thirdai_key`パラメーターは`THIRDAI_KEY`環境変数が設定されている場合は省略できます。

ThirdAIのAPIキーは https://www.thirdai.com/try-bolt/ で取得できます。

```python
from langchain.retrievers import NeuralDBRetriever

# From scratch
retriever = NeuralDBRetriever.from_scratch(thirdai_key="your-thirdai-key")

# From checkpoint
retriever = NeuralDBRetriever.from_checkpoint(
    # Path to a NeuralDB checkpoint. For example, if you call
    # retriever.save("/path/to/checkpoint.ndb") in one script, then you can
    # call NeuralDBRetriever.from_checkpoint("/path/to/checkpoint.ndb") in
    # another script to load the saved model.
    checkpoint="/path/to/checkpoint.ndb",
    thirdai_key="your-thirdai-key",
)
```

### **ドキュメントソースの挿入**

```python
retriever.insert(
    # If you have PDF, DOCX, or CSV files, you can directly pass the paths to the documents
    sources=["/path/to/doc.pdf", "/path/to/doc.docx", "/path/to/doc.csv"],
    # When True this means that the underlying model in the NeuralDB will
    # undergo unsupervised pretraining on the inserted files. Defaults to True.
    train=True,
    # Much faster insertion with a slight drop in performance. Defaults to True.
    fast_mode=True,
)

from thirdai import neural_db as ndb

retriever.insert(
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

### **ドキュメントの取得**

検索クエリを実行するには、標準のLangChain検索メソッド`get_relevant_documents`を使用できます。これは、LangChainドキュメントオブジェクトのリストを返します。各ドキュメントオブジェクトは、インデックス化されたファイルからの一部のテキストを表します。例えば、インデックス化されたPDFファイルの1つの段落などです。テキストの他に、ドキュメントのメタデータフィールドには、ドキュメントのID、ドキュメントの出所(どのファイルから来たか)、ドキュメントのスコアなどの情報が含まれています。

```python
# This returns a list of LangChain Document objects
documents = retriever.invoke("query", top_k=10)
```

### **微調整**

NeuralDBRetrieverは、ユーザーの行動や特定のドメインの知識に合わせて微調整できます。2つの方法で微調整できます:
1. 関連付け: 検索エンジンは、ソースフレーズとターゲットフレーズを関連付けます。検索エンジンがソースフレーズを見つけると、ターゲットフレーズに関連するドキュメントも考慮します。
2. 得点の増加: 検索エンジンは、特定のクエリに対するドキュメントの得点を増加させます。これは、検索エンジンをユーザーの行動に合わせて微調整する際に便利です。例えば、ユーザーが"車はどのように製造されるか"と検索し、ID 52のドキュメントに満足した場合、"車はどのように製造されるか"というクエリに対してID 52のドキュメントの得点を増加させることができます。

```python
retriever.associate(source="source phrase", target="target phrase")
retriever.associate_batch(
    [
        ("source phrase 1", "target phrase 1"),
        ("source phrase 2", "target phrase 2"),
    ]
)

retriever.upvote(query="how is a car manufactured", document_id=52)
retriever.upvote_batch(
    [
        ("query 1", 52),
        ("query 2", 20),
    ]
)
```
