---
translated: true
---

# Fauna

>[Fauna](https://fauna.com/) es una base de datos de documentos.

Consultar documentos `Fauna`

```python
%pip install --upgrade --quiet  fauna
```

## Ejemplo de consulta de datos

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

### Consulta con paginación

Obtendrá un valor `after` si hay más datos. Puede obtener valores después del cursor pasando la cadena `after` en la consulta.

Para obtener más información, siga [este enlace](https://fqlx-beta--fauna-docs.netlify.app/fqlx/beta/reference/schema_entities/set/static-paginate)

```python
query = """
Item.paginate("hs+DzoPOg ... aY1hOohozrV7A")
Item.all()
"""
loader = FaunaLoader(query, field, secret)
```
