---
translated: true
---

# MongoDB

[MongoDB](https://www.mongodb.com/) は、動的なスキーマをサポートするJSONライクなドキュメントを持つNoSQLのドキュメント指向データベースです。

## 概要

MongoDB Document Loaderは、MongoDB データベースからLangChain Documentsのリストを返します。

Loaderには以下のパラメーターが必要です:

*   MongoDB接続文字列
*   MongoDB データベース名
*   MongoDB コレクション名
*   (オプション) コンテンツフィルター辞書
*   (オプション) 出力に含めるフィールド名のリスト

出力は以下の形式になります:

- pageContent= Mongoドキュメント
- metadata={'database': '[database_name]', 'collection': '[collection_name]'}

## Document Loaderの読み込み

```python
# add this import for running in jupyter notebook
import nest_asyncio

nest_asyncio.apply()
```

```python
from langchain_community.document_loaders.mongodb import MongodbLoader
```

```python
loader = MongodbLoader(
    connection_string="mongodb://localhost:27017/",
    db_name="sample_restaurants",
    collection_name="restaurants",
    filter_criteria={"borough": "Bronx", "cuisine": "Bakery"},
    field_names=["name", "address"],
)
```

```python
docs = loader.load()

len(docs)
```

```output
71
```

```python
docs[0]
```

```output
Document(page_content="Morris Park Bake Shop {'building': '1007', 'coord': [-73.856077, 40.848447], 'street': 'Morris Park Ave', 'zipcode': '10462'}", metadata={'database': 'sample_restaurants', 'collection': 'restaurants'})
```
