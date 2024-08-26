---
translated: true
---

# MongoDB

[MongoDB](https://www.mongodb.com/) es una base de datos NoSQL, orientada a documentos que admite documentos similares a JSON con un esquema dinámico.

## Resumen

El MongoDB Document Loader devuelve una lista de Langchain Documents de una base de datos MongoDB.

El Loader requiere los siguientes parámetros:

*   Cadena de conexión MongoDB
*   Nombre de la base de datos MongoDB
*   Nombre de la colección MongoDB
*   (Opcional) Diccionario de filtro de contenido
*   (Opcional) Lista de nombres de campos a incluir en la salida

La salida tiene el siguiente formato:

- pageContent= Documento Mongo
- metadata={'database': '[database_name]', 'collection': '[collection_name]'}

## Cargar el Document Loader

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
