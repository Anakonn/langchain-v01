---
translated: true
---

# Dria

>[Dria](https://dria.co/)は、開発者が共有エンベディングレイクに貢献したり利用したりできるパブリックRAGモデルのハブです。このノートブックでは、データ取得タスクに `Dria API` を使う方法を示します。

# インストール

`dria`パッケージがインストールされていることを確認してください。pipを使ってインストールできます:

```python
%pip install --upgrade --quiet dria
```

# API キーの設定

アクセスするためにDria APIキーを設定してください。

```python
import os

os.environ["DRIA_API_KEY"] = "DRIA_API_KEY"
```

# Dria Retrieverの初期化

`DriaRetriever`のインスタンスを作成します。

```python
from langchain.retrievers import DriaRetriever

api_key = os.getenv("DRIA_API_KEY")
retriever = DriaRetriever(api_key=api_key)
```

# **ナレッジベースの作成**

[Driaのナレッジハブ](https://dria.co/knowledge)でナレッジを作成します。

```python
contract_id = retriever.create_knowledge_base(
    name="France's AI Development",
    embedding=DriaRetriever.models.jina_embeddings_v2_base_en.value,
    category="Artificial Intelligence",
    description="Explore the growth and contributions of France in the field of Artificial Intelligence.",
)
```

# データの追加

データをDriaのナレッジベースにロードします。

```python
texts = [
    "The first text to add to Dria.",
    "Another piece of information to store.",
    "More data to include in the Dria knowledge base.",
]

ids = retriever.add_texts(texts)
print("Data added with IDs:", ids)
```

# データの取得

クエリに関連するドキュメントを検索するためにretrieverを使います。

```python
query = "Find information about Dria."
result = retriever.invoke(query)
for doc in result:
    print(doc)
```
