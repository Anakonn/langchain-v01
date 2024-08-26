---
translated: true
---

# Rockset

> Rockset es una base de datos analítica en tiempo real que permite realizar consultas en datos semi-estructurados masivos sin carga operativa. Con Rockset, los datos ingeridos son consultables en un segundo y las consultas analíticas contra esos datos se ejecutan típicamente en milisegundos. Rockset está optimizado para el cálculo, lo que lo hace adecuado para servir aplicaciones de alta concurrencia en el rango de sub-100TB (o más de 100s de TB con rollups).

Este cuaderno demuestra cómo usar Rockset como un cargador de documentos en langchain. Para comenzar, asegúrese de tener una cuenta de Rockset y una clave API disponible.

## Configuración del entorno

1. Vaya a la [consola de Rockset](https://console.rockset.com/apikeys) y obtenga una clave API. Encuentre su región API en la [referencia de API](https://rockset.com/docs/rest-api/#introduction). Para los fines de este cuaderno, asumiremos que está usando Rockset desde `Oregon(us-west-2)`.
2. Establezca la variable de entorno `ROCKSET_API_KEY`.
3. Instale el cliente python de Rockset, que será utilizado por langchain para interactuar con la base de datos de Rockset.

```python
%pip install --upgrade --quiet  rockset
```

# Carga de documentos

La integración de Rockset con LangChain le permite cargar documentos de colecciones de Rockset con consultas SQL. Para hacer esto, debe construir un objeto `RocksetLoader`. Aquí hay un fragmento de ejemplo que inicializa un `RocksetLoader`.

```python
from langchain_community.document_loaders import RocksetLoader
from rockset import Regions, RocksetClient, models

loader = RocksetLoader(
    RocksetClient(Regions.usw2a1, "<api key>"),
    models.QueryRequestSql(query="SELECT * FROM langchain_demo LIMIT 3"),  # SQL query
    ["text"],  # content columns
    metadata_keys=["id", "date"],  # metadata columns
)
```

Aquí, puede ver que se ejecuta la siguiente consulta:

```sql
SELECT * FROM langchain_demo LIMIT 3
```

La columna `text` de la colección se usa como el contenido de la página, y las columnas `id` y `date` del registro se usan como metadatos (si no pasa nada en `metadata_keys`, se usará todo el documento de Rockset como metadatos).

Para ejecutar la consulta y acceder a un iterador sobre los `Document`s resultantes, ejecute:

```python
loader.lazy_load()
```

Para ejecutar la consulta y acceder a todos los `Document`s resultantes de una vez, ejecute:

```python
loader.load()
```

Aquí hay un ejemplo de respuesta de `loader.load()`:

```python
[
    Document(
        page_content="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas a libero porta, dictum ipsum eget, hendrerit neque. Morbi blandit, ex ut suscipit viverra, enim velit tincidunt tellus, a tempor velit nunc et ex. Proin hendrerit odio nec convallis lobortis. Aenean in purus dolor. Vestibulum orci orci, laoreet eget magna in, commodo euismod justo.",
        metadata={"id": 83209, "date": "2022-11-13T18:26:45.000000Z"}
    ),
    Document(
        page_content="Integer at finibus odio. Nam sit amet enim cursus lacus gravida feugiat vestibulum sed libero. Aenean eleifend est quis elementum tincidunt. Curabitur sit amet ornare erat. Nulla id dolor ut magna volutpat sodales fringilla vel ipsum. Donec ultricies, lacus sed fermentum dignissim, lorem elit aliquam ligula, sed suscipit sapien purus nec ligula.",
        metadata={"id": 89313, "date": "2022-11-13T18:28:53.000000Z"}
    ),
    Document(
        page_content="Morbi tortor enim, commodo id efficitur vitae, fringilla nec mi. Nullam molestie faucibus aliquet. Praesent a est facilisis, condimentum justo sit amet, viverra erat. Fusce volutpat nisi vel purus blandit, et facilisis felis accumsan. Phasellus luctus ligula ultrices tellus tempor hendrerit. Donec at ultricies leo.",
        metadata={"id": 87732, "date": "2022-11-13T18:49:04.000000Z"}
    )
]
```

## Uso de varias columnas como contenido

Puede elegir usar varias columnas como contenido:

```python
from langchain_community.document_loaders import RocksetLoader
from rockset import Regions, RocksetClient, models

loader = RocksetLoader(
    RocksetClient(Regions.usw2a1, "<api key>"),
    models.QueryRequestSql(query="SELECT * FROM langchain_demo LIMIT 1 WHERE id=38"),
    ["sentence1", "sentence2"],  # TWO content columns
)
```

Suponiendo que el campo "sentence1" es `"This is the first sentence."` y el campo "sentence2" es `"This is the second sentence."`, el `page_content` del `Document` resultante sería:

```output
This is the first sentence.
This is the second sentence.
```

Puede definir su propia función para unir columnas de contenido estableciendo el argumento `content_columns_joiner` en el constructor de `RocksetLoader`. `content_columns_joiner` es un método que toma una `List[Tuple[str, Any]]]` como argumento, que representa una lista de tuplas de (nombre de columna, valor de columna). De forma predeterminada, este es un método que une cada valor de columna con una nueva línea.

Por ejemplo, si quisiera unir sentence1 y sentence2 con un espacio en lugar de una nueva línea, podría establecer `content_columns_joiner` de la siguiente manera:

```python
RocksetLoader(
    RocksetClient(Regions.usw2a1, "<api key>"),
    models.QueryRequestSql(query="SELECT * FROM langchain_demo LIMIT 1 WHERE id=38"),
    ["sentence1", "sentence2"],
    content_columns_joiner=lambda docs: " ".join(
        [doc[1] for doc in docs]
    ),  # join with space instead of /n
)
```

El `page_content` del `Document` resultante sería:

```output
This is the first sentence. This is the second sentence.
```

A menudo, desea incluir el nombre de la columna en el `page_content`. Puede hacer eso así:

```python
RocksetLoader(
    RocksetClient(Regions.usw2a1, "<api key>"),
    models.QueryRequestSql(query="SELECT * FROM langchain_demo LIMIT 1 WHERE id=38"),
    ["sentence1", "sentence2"],
    content_columns_joiner=lambda docs: "\n".join(
        [f"{doc[0]}: {doc[1]}" for doc in docs]
    ),
)
```

Esto daría como resultado el siguiente `page_content`:

```output
sentence1: This is the first sentence.
sentence2: This is the second sentence.
```
