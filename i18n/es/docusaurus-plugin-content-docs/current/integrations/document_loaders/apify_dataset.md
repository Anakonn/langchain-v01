---
translated: true
---

# Conjunto de datos de Apify

>[Apify Dataset](https://docs.apify.com/platform/storage/dataset) es un almacenamiento escalable de solo anexos con acceso secuencial construido para almacenar resultados estructurados de web scraping, como una lista de productos o resultados de búsqueda de Google, y luego exportarlos a varios formatos como JSON, CSV o Excel. Los conjuntos de datos se utilizan principalmente para guardar los resultados de [Apify Actors](https://apify.com/store): programas en la nube sin servidor para diversos casos de uso de web scraping, rastreo y extracción de datos.

Este cuaderno muestra cómo cargar conjuntos de datos de Apify a LangChain.

## Requisitos previos

Necesitas tener un conjunto de datos existente en la plataforma Apify. Si no tienes uno, primero echa un vistazo a [este cuaderno](/docs/integrations/tools/apify) sobre cómo usar Apify para extraer contenido de documentación, bases de conocimiento, centros de ayuda o blogs.

```python
%pip install --upgrade --quiet  apify-client
```

Primero, importa `ApifyDatasetLoader` en tu código fuente:

```python
from langchain_community.document_loaders import ApifyDatasetLoader
from langchain_core.documents import Document
```

Luego proporciona una función que asigne los campos de registro del conjunto de datos de Apify al formato `Document` de LangChain.

Por ejemplo, si los elementos de tu conjunto de datos tienen la siguiente estructura:

```json
{
    "url": "https://apify.com",
    "text": "Apify is the best web scraping and automation platform."
}
```

La función de asignación en el código a continuación los convertirá al formato `Document` de LangChain, para que puedas usarlos posteriormente con cualquier modelo LLM (por ejemplo, para responder preguntas).

```python
loader = ApifyDatasetLoader(
    dataset_id="your-dataset-id",
    dataset_mapping_function=lambda dataset_item: Document(
        page_content=dataset_item["text"], metadata={"source": dataset_item["url"]}
    ),
)
```

```python
data = loader.load()
```

## Un ejemplo con respuesta a preguntas

En este ejemplo, usamos datos de un conjunto de datos para responder una pregunta.

```python
from langchain.indexes import VectorstoreIndexCreator
from langchain_community.docstore.document import Document
from langchain_community.document_loaders import ApifyDatasetLoader
```

```python
loader = ApifyDatasetLoader(
    dataset_id="your-dataset-id",
    dataset_mapping_function=lambda item: Document(
        page_content=item["text"] or "", metadata={"source": item["url"]}
    ),
)
```

```python
index = VectorstoreIndexCreator().from_loaders([loader])
```

```python
query = "What is Apify?"
result = index.query_with_sources(query)
```

```python
print(result["answer"])
print(result["sources"])
```

```output
 Apify is a platform for developing, running, and sharing serverless cloud programs. It enables users to create web scraping and automation tools and publish them on the Apify platform.

https://docs.apify.com/platform/actors, https://docs.apify.com/platform/actors/running/actors-in-store, https://docs.apify.com/platform/security, https://docs.apify.com/platform/actors/examples
```
