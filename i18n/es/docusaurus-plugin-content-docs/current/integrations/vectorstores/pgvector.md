---
translated: true
---

# PGVector

> Una implementación de la abstracción de almacén de vectores de LangChain utilizando `postgres` como backend y aprovechando la extensión `pgvector`.

El código se encuentra en un paquete de integración llamado: [langchain_postgres](https://github.com/langchain-ai/langchain-postgres/).

Puede ejecutar el siguiente comando para iniciar un contenedor de postgres con la extensión `pgvector`:

```shell
docker run --name pgvector-container -e POSTGRES_USER=langchain -e POSTGRES_PASSWORD=langchain -e POSTGRES_DB=langchain -p 6024:5432 -d pgvector/pgvector:pg16
```

## Estado

Este código se ha migrado de `langchain_community` a un paquete dedicado llamado `langchain-postgres`. Se han realizado los siguientes cambios:

* langchain_postgres solo funciona con psycopg3. Actualice sus cadenas de conexión de `postgresql+psycopg2://...` a `postgresql+psycopg://langchain:langchain@...` (sí, el nombre del controlador es `psycopg` no `psycopg3`, pero utilizará `psycopg3`.
* El esquema del almacén de incrustaciones y la colección se han cambiado para que el método add_documents funcione correctamente con los ID especificados por el usuario.
* Ahora se debe pasar un objeto de conexión explícito.

Actualmente, no hay **ningún mecanismo** que admita una migración de datos sencilla en los cambios de esquema. Por lo tanto, cualquier cambio de esquema en el almacén de vectores requerirá que el usuario vuelva a crear las tablas y vuelva a agregar los documentos.
Si esto es una preocupación, utilice un almacén de vectores diferente. Si no, esta implementación debería funcionar bien para su caso de uso.

## Instalar dependencias

Aquí, estamos utilizando `langchain_cohere` para las incrustaciones, pero puede utilizar otros proveedores de incrustaciones.

```python
!pip install --quiet -U langchain_cohere
!pip install --quiet -U langchain_postgres
```

## Inicializar el almacén de vectores

```python
from langchain_cohere import CohereEmbeddings
from langchain_core.documents import Document
from langchain_postgres import PGVector
from langchain_postgres.vectorstores import PGVector

# See docker command above to launch a postgres instance with pgvector enabled.
connection = "postgresql+psycopg://langchain:langchain@localhost:6024/langchain"  # Uses psycopg3!
collection_name = "my_docs"
embeddings = CohereEmbeddings()

vectorstore = PGVector(
    embeddings=embeddings,
    collection_name=collection_name,
    connection=connection,
    use_jsonb=True,
)
```

## Eliminar tablas

Si necesita eliminar tablas (por ejemplo, actualizar la incrustación a una dimensión diferente o simplemente actualizar el proveedor de incrustaciones):

```python
vectorstore.drop_tables()
```

## Agregar documentos

Agregar documentos al almacén de vectores

```python
docs = [
    Document(
        page_content="there are cats in the pond",
        metadata={"id": 1, "location": "pond", "topic": "animals"},
    ),
    Document(
        page_content="ducks are also found in the pond",
        metadata={"id": 2, "location": "pond", "topic": "animals"},
    ),
    Document(
        page_content="fresh apples are available at the market",
        metadata={"id": 3, "location": "market", "topic": "food"},
    ),
    Document(
        page_content="the market also sells fresh oranges",
        metadata={"id": 4, "location": "market", "topic": "food"},
    ),
    Document(
        page_content="the new art exhibit is fascinating",
        metadata={"id": 5, "location": "museum", "topic": "art"},
    ),
    Document(
        page_content="a sculpture exhibit is also at the museum",
        metadata={"id": 6, "location": "museum", "topic": "art"},
    ),
    Document(
        page_content="a new coffee shop opened on Main Street",
        metadata={"id": 7, "location": "Main Street", "topic": "food"},
    ),
    Document(
        page_content="the book club meets at the library",
        metadata={"id": 8, "location": "library", "topic": "reading"},
    ),
    Document(
        page_content="the library hosts a weekly story time for kids",
        metadata={"id": 9, "location": "library", "topic": "reading"},
    ),
    Document(
        page_content="a cooking class for beginners is offered at the community center",
        metadata={"id": 10, "location": "community center", "topic": "classes"},
    ),
]
```

```python
vectorstore.add_documents(docs, ids=[doc.metadata["id"] for doc in docs])
```

```output
[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
```

```python
vectorstore.similarity_search("kitty", k=10)
```

```output
[Document(page_content='there are cats in the pond', metadata={'id': 1, 'topic': 'animals', 'location': 'pond'}),
 Document(page_content='the book club meets at the library', metadata={'id': 8, 'topic': 'reading', 'location': 'library'}),
 Document(page_content='the library hosts a weekly story time for kids', metadata={'id': 9, 'topic': 'reading', 'location': 'library'}),
 Document(page_content='the new art exhibit is fascinating', metadata={'id': 5, 'topic': 'art', 'location': 'museum'}),
 Document(page_content='ducks are also found in the pond', metadata={'id': 2, 'topic': 'animals', 'location': 'pond'}),
 Document(page_content='the market also sells fresh oranges', metadata={'id': 4, 'topic': 'food', 'location': 'market'}),
 Document(page_content='a cooking class for beginners is offered at the community center', metadata={'id': 10, 'topic': 'classes', 'location': 'community center'}),
 Document(page_content='fresh apples are available at the market', metadata={'id': 3, 'topic': 'food', 'location': 'market'}),
 Document(page_content='a sculpture exhibit is also at the museum', metadata={'id': 6, 'topic': 'art', 'location': 'museum'}),
 Document(page_content='a new coffee shop opened on Main Street', metadata={'id': 7, 'topic': 'food', 'location': 'Main Street'})]
```

Agregar documentos por ID sobrescribirá cualquier documento existente que coincida con ese ID.

```python
docs = [
    Document(
        page_content="there are cats in the pond",
        metadata={"id": 1, "location": "pond", "topic": "animals"},
    ),
    Document(
        page_content="ducks are also found in the pond",
        metadata={"id": 2, "location": "pond", "topic": "animals"},
    ),
    Document(
        page_content="fresh apples are available at the market",
        metadata={"id": 3, "location": "market", "topic": "food"},
    ),
    Document(
        page_content="the market also sells fresh oranges",
        metadata={"id": 4, "location": "market", "topic": "food"},
    ),
    Document(
        page_content="the new art exhibit is fascinating",
        metadata={"id": 5, "location": "museum", "topic": "art"},
    ),
    Document(
        page_content="a sculpture exhibit is also at the museum",
        metadata={"id": 6, "location": "museum", "topic": "art"},
    ),
    Document(
        page_content="a new coffee shop opened on Main Street",
        metadata={"id": 7, "location": "Main Street", "topic": "food"},
    ),
    Document(
        page_content="the book club meets at the library",
        metadata={"id": 8, "location": "library", "topic": "reading"},
    ),
    Document(
        page_content="the library hosts a weekly story time for kids",
        metadata={"id": 9, "location": "library", "topic": "reading"},
    ),
    Document(
        page_content="a cooking class for beginners is offered at the community center",
        metadata={"id": 10, "location": "community center", "topic": "classes"},
    ),
]
```

## Soporte de filtrado

El almacén de vectores admite un conjunto de filtros que se pueden aplicar a los campos de metadatos de los documentos.

| Operador | Significado/Categoría    |
|----------|-------------------------|
| \$eq      | Igualdad (==)           |
| \$ne      | Desigualdad (!=)         |
| \$lt      | Menor que (<)           |
| \$lte     | Menor o igual que (<=) |
| \$gt      | Mayor que (>)        |
| \$gte     | Mayor o igual que (>=) |
| \$in      | Caso especial (in)      |
| \$nin     | Caso especial (not in)  |
| \$between | Caso especial (between) |
| \$like    | Texto (like)             |
| \$ilike   | Texto (like insensible a mayúsculas) |
| \$and     | Lógico (and)           |
| \$or      | Lógico (or)            |

```python
vectorstore.similarity_search("kitty", k=10, filter={"id": {"$in": [1, 5, 2, 9]}})
```

```output
[Document(page_content='there are cats in the pond', metadata={'id': 1, 'topic': 'animals', 'location': 'pond'}),
 Document(page_content='the library hosts a weekly story time for kids', metadata={'id': 9, 'topic': 'reading', 'location': 'library'}),
 Document(page_content='the new art exhibit is fascinating', metadata={'id': 5, 'topic': 'art', 'location': 'museum'}),
 Document(page_content='ducks are also found in the pond', metadata={'id': 2, 'topic': 'animals', 'location': 'pond'})]
```

Si proporciona un diccionario con varios campos, pero sin operadores, el nivel superior se interpretará como un filtro lógico **AND**

```python
vectorstore.similarity_search(
    "ducks",
    k=10,
    filter={"id": {"$in": [1, 5, 2, 9]}, "location": {"$in": ["pond", "market"]}},
)
```

```output
[Document(page_content='ducks are also found in the pond', metadata={'id': 2, 'topic': 'animals', 'location': 'pond'}),
 Document(page_content='there are cats in the pond', metadata={'id': 1, 'topic': 'animals', 'location': 'pond'})]
```

```python
vectorstore.similarity_search(
    "ducks",
    k=10,
    filter={
        "$and": [
            {"id": {"$in": [1, 5, 2, 9]}},
            {"location": {"$in": ["pond", "market"]}},
        ]
    },
)
```

```output
[Document(page_content='ducks are also found in the pond', metadata={'id': 2, 'topic': 'animals', 'location': 'pond'}),
 Document(page_content='there are cats in the pond', metadata={'id': 1, 'topic': 'animals', 'location': 'pond'})]
```

```python
vectorstore.similarity_search("bird", k=10, filter={"location": {"$ne": "pond"}})
```

```output
[Document(page_content='the book club meets at the library', metadata={'id': 8, 'topic': 'reading', 'location': 'library'}),
 Document(page_content='the new art exhibit is fascinating', metadata={'id': 5, 'topic': 'art', 'location': 'museum'}),
 Document(page_content='the library hosts a weekly story time for kids', metadata={'id': 9, 'topic': 'reading', 'location': 'library'}),
 Document(page_content='a sculpture exhibit is also at the museum', metadata={'id': 6, 'topic': 'art', 'location': 'museum'}),
 Document(page_content='the market also sells fresh oranges', metadata={'id': 4, 'topic': 'food', 'location': 'market'}),
 Document(page_content='a cooking class for beginners is offered at the community center', metadata={'id': 10, 'topic': 'classes', 'location': 'community center'}),
 Document(page_content='a new coffee shop opened on Main Street', metadata={'id': 7, 'topic': 'food', 'location': 'Main Street'}),
 Document(page_content='fresh apples are available at the market', metadata={'id': 3, 'topic': 'food', 'location': 'market'})]
```
