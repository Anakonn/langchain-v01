---
translated: true
---

# Fauna

>[Fauna](https://fauna.com/)は、ドキュメントデータベースです。

Faunaドキュメントをクエリする

```python
%pip install --upgrade --quiet  fauna
```

## データクエリの例

```python
from langchain_community.document_loaders.fauna import FaunaLoader

secret = "<enter-valid-fauna-secret>"
query = "Item.all()"  # Fauna query. Assumes that the collection is called "Item"
field = "text"  # The field that contains the page content. Assumes that the field is called "text"

loader = FaunaLoader(query, field, secret)
docs = loader.lazy_load()

for value in docs:
    print(value)
```

### ページネーションでクエリする

データがさらにある場合は、`after`の値が返されます。`after`の文字列をクエリに渡すことで、カーソル以降の値を取得できます。

詳細は[このリンク](https://fqlx-beta--fauna-docs.netlify.app/fqlx/beta/reference/schema_entities/set/static-paginate)を参照してください。

```python
query = """
Item.paginate("hs+DzoPOg ... aY1hOohozrV7A")
Item.all()
"""
loader = FaunaLoader(query, field, secret)
```
