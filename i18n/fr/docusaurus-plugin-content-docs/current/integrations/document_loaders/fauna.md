---
translated: true
---

# Fauna

>[Fauna](https://fauna.com/) est une base de données de documents.

Requête `Fauna` documents

```python
%pip install --upgrade --quiet  fauna
```

## Exemple de requête de données

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

### Requête avec pagination

Vous obtenez une valeur `after` s'il y a plus de données. Vous pouvez récupérer les valeurs après le curseur en passant la chaîne `after` dans la requête.

Pour en savoir plus, suivez [ce lien](https://fqlx-beta--fauna-docs.netlify.app/fqlx/beta/reference/schema_entities/set/static-paginate)

```python
query = """
Item.paginate("hs+DzoPOg ... aY1hOohozrV7A")
Item.all()
"""
loader = FaunaLoader(query, field, secret)
```
