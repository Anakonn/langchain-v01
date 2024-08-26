---
translated: true
---

# Fauna

>[Fauna](https://fauna.com/)는 문서 데이터베이스입니다.

Fauna 문서 쿼리

```python
%pip install --upgrade --quiet  fauna
```

## 데이터 쿼리 예시

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

### 페이지네이션을 사용한 쿼리

더 많은 데이터가 있는 경우 `after` 값을 받게 됩니다. 쿼리에 `after` 문자열을 전달하여 커서 이후의 값을 가져올 수 있습니다.

자세한 내용은 [이 링크](https://fqlx-beta--fauna-docs.netlify.app/fqlx/beta/reference/schema_entities/set/static-paginate)를 참고하세요.

```python
query = """
Item.paginate("hs+DzoPOg ... aY1hOohozrV7A")
Item.all()
"""
loader = FaunaLoader(query, field, secret)
```
