---
translated: true
---

# DataForSEO

>[DataForSeo](https://dataforseo.com/) proporciona soluciones de datos integrales de SEO y marketing digital a través de API.
>
>El `DataForSeo API` recupera `SERP` de los motores de búsqueda más populares como `Google`, `Bing`, `Yahoo`. También permite obtener SERP de diferentes tipos de motores de búsqueda como `Maps`, `News`, `Events`, etc.

Este cuaderno demuestra cómo usar el [DataForSeo API](https://dataforseo.com/apis) para obtener resultados de los motores de búsqueda.

```python
from langchain_community.utilities.dataforseo_api_search import DataForSeoAPIWrapper
```

## Configuración de las credenciales de la API

Puede obtener sus credenciales de API registrándose en el sitio web de `DataForSeo`.

```python
import os

os.environ["DATAFORSEO_LOGIN"] = "your_api_access_username"
os.environ["DATAFORSEO_PASSWORD"] = "your_api_access_password"

wrapper = DataForSeoAPIWrapper()
```

El método run devolverá el primer fragmento de resultado de uno de los siguientes elementos: answer_box, knowledge_graph, featured_snippet, shopping, organic.

```python
wrapper.run("Weather in Los Angeles")
```

## La diferencia entre `run` y `results`

`run` y `results` son dos métodos proporcionados por la clase `DataForSeoAPIWrapper`.

El método `run` ejecuta la búsqueda y devuelve el primer fragmento de resultado del cuadro de respuestas, el gráfico de conocimiento, el fragmento destacado, las compras u los resultados orgánicos. Estos elementos se ordenan por prioridad de mayor a menor.

El método `results` devuelve una respuesta JSON configurada de acuerdo con los parámetros establecidos en el wrapper. Esto permite una mayor flexibilidad en términos de qué datos desea devolver de la API.

## Obtener resultados como JSON

Puede personalizar los tipos de resultados y los campos que desea devolver en la respuesta JSON. También puede establecer un recuento máximo para el número de resultados principales que se devolverán.

```python
json_wrapper = DataForSeoAPIWrapper(
    json_result_types=["organic", "knowledge_graph", "answer_box"],
    json_result_fields=["type", "title", "description", "text"],
    top_count=3,
)
```

```python
json_wrapper.results("Bill Gates")
```

## Personalizar la ubicación y el idioma

Puede especificar la ubicación y el idioma de sus resultados de búsqueda pasando parámetros adicionales al wrapper de la API.

```python
customized_wrapper = DataForSeoAPIWrapper(
    top_count=10,
    json_result_types=["organic", "local_pack"],
    json_result_fields=["title", "description", "type"],
    params={"location_name": "Germany", "language_code": "en"},
)
customized_wrapper.results("coffee near me")
```

## Personalizar el motor de búsqueda

También puede especificar el motor de búsqueda que desea usar.

```python
customized_wrapper = DataForSeoAPIWrapper(
    top_count=10,
    json_result_types=["organic", "local_pack"],
    json_result_fields=["title", "description", "type"],
    params={"location_name": "Germany", "language_code": "en", "se_name": "bing"},
)
customized_wrapper.results("coffee near me")
```

## Personalizar el tipo de búsqueda

El wrapper de la API también le permite especificar el tipo de búsqueda que desea realizar. Por ejemplo, puede realizar una búsqueda de mapas.

```python
maps_search = DataForSeoAPIWrapper(
    top_count=10,
    json_result_fields=["title", "value", "address", "rating", "type"],
    params={
        "location_coordinate": "52.512,13.36,12z",
        "language_code": "en",
        "se_type": "maps",
    },
)
maps_search.results("coffee near me")
```

## Integración con agentes Langchain

Puede usar la clase `Tool` del módulo `langchain.agents` para integrar el `DataForSeoAPIWrapper` con un agente langchain. La clase `Tool` encapsula una función que el agente puede llamar.

```python
from langchain.agents import Tool

search = DataForSeoAPIWrapper(
    top_count=3,
    json_result_types=["organic"],
    json_result_fields=["title", "description", "type"],
)
tool = Tool(
    name="google-search-answer",
    description="My new answer tool",
    func=search.run,
)
json_tool = Tool(
    name="google-search-json",
    description="My new json tool",
    func=search.results,
)
```
