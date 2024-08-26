---
translated: true
---

# Ruta

> [Ruta](https://pathway.com/) es un marco de procesamiento de datos abierto. Te permite desarrollar fácilmente tuberías de transformación de datos y aplicaciones de Machine Learning que funcionan con fuentes de datos en vivo y datos cambiantes.

Este cuaderno demuestra cómo usar una tubería de indexación de datos en vivo `Ruta` con `Langchain`. Puedes consultar los resultados de esta tubería desde tus cadenas de la misma manera que lo harías con un almacén de vectores regular. Sin embargo, detrás de escena, Ruta actualiza el índice en cada cambio de datos, lo que te da respuestas siempre actualizadas.

En este cuaderno, usaremos una [tubería de procesamiento de documentos públicos de demostración](https://pathway.com/solutions/ai-pipelines#try-it-out) que:

1. Monitorea varios orígenes de datos en la nube para detectar cambios en los datos.
2. Construye un índice de vectores para los datos.

Para tener tu propia tubería de procesamiento de documentos, consulta la [oferta alojada](https://pathway.com/solutions/ai-pipelines) o [construye la tuya propia](https://pathway.com/developers/user-guide/llm-xpack/vectorstore_pipeline/).

Nos conectaremos al índice usando un cliente `VectorStore`, que implementa la función `similarity_search` para recuperar los documentos coincidentes.

La tubería básica utilizada en este documento permite construir fácilmente un índice de vectores simple de archivos almacenados en una ubicación en la nube. Sin embargo, Ruta proporciona todo lo necesario para construir tuberías y aplicaciones de datos en tiempo real, incluidas operaciones similares a SQL como agrupaciones y reducciones, uniones entre fuentes de datos dispares, agrupación y ventanas basadas en el tiempo, y una amplia gama de conectores.

## Consultar la tubería de datos

Para instanciar y configurar el cliente, debes proporcionar la `url` o el `host` y el `port` de tu tubería de indexación de documentos. En el código a continuación, usamos una [tubería de demostración](https://pathway.com/solutions/ai-pipelines#try-it-out) disponible públicamente, cuya API REST puedes acceder en `https://demo-document-indexing.pathway.stream`. Esta demostración ingiere documentos de [Google Drive](https://drive.google.com/drive/u/0/folders/1cULDv2OaViJBmOfG5WB0oWcgayNrGtVs) y [Sharepoint](https://navalgo.sharepoint.com/sites/ConnectorSandbox/Shared%20Documents/Forms/AllItems.aspx?id=%2Fsites%2FConnectorSandbox%2FShared%20Documents%2FIndexerSandbox&p=true&ga=1) y mantiene un índice para recuperar documentos.

```python
from langchain_community.vectorstores import PathwayVectorClient

client = PathwayVectorClient(url="https://demo-document-indexing.pathway.stream")
```

 Y podemos comenzar a hacer preguntas

```python
query = "What is Pathway?"
docs = client.similarity_search(query)
```

```python
print(docs[0].page_content)
```

 **¡Tu turno!** [Obtén tu tubería](https://pathway.com/solutions/ai-pipelines) o carga [nuevos documentos](https://chat-realtime-sharepoint-gdrive.demo.pathway.com/) a la tubería de demostración y vuelve a intentar la consulta.

## Filtrar por metadatos de archivo

Admitimos el filtrado de documentos utilizando expresiones [jmespath](https://jmespath.org/), por ejemplo:

```python
# take into account only sources modified later than unix timestamp
docs = client.similarity_search(query, metadata_filter="modified_at >= `1702672093`")

# take into account only sources modified later than unix timestamp
docs = client.similarity_search(query, metadata_filter="owner == `james`")

# take into account only sources with path containing 'repo_readme'
docs = client.similarity_search(query, metadata_filter="contains(path, 'repo_readme')")

# and of two conditions
docs = client.similarity_search(
    query, metadata_filter="owner == `james` && modified_at >= `1702672093`"
)

# or of two conditions
docs = client.similarity_search(
    query, metadata_filter="owner == `james` || modified_at >= `1702672093`"
)
```

## Obtener información sobre los archivos indexados

 `PathwayVectorClient.get_vectorstore_statistics()` proporciona estadísticas esenciales sobre el estado del almacén de vectores, como el número de archivos indexados y la marca de tiempo del último actualizado. Puedes usarlo en tus cadenas para decirle al usuario qué tan fresca es tu base de conocimiento.

```python
client.get_vectorstore_statistics()
```

## Tu propia tubería

### Ejecutar en producción

Para tener tu propia tubería de indexación de datos de Ruta, consulta la oferta de [tuberías alojadas](https://pathway.com/solutions/ai-pipelines) de Ruta. También puedes ejecutar tu propia tubería de Ruta; para obtener información sobre cómo construir la tubería, consulta la [guía de Ruta](https://pathway.com/developers/user-guide/llm-xpack/vectorstore_pipeline/).

### Procesar documentos

La tubería de vectorización admite componentes enchufables para analizar, dividir y incrustar documentos. Para incrustar y dividir, puedes usar [componentes de Langchain](https://pathway.com/developers/user-guide/llm-xpack/vectorstore_pipeline/#langchain) o consultar los [incrustadores](https://pathway.com/developers/api-docs/pathway-xpacks-llm/embedders) y [divisores](https://pathway.com/developers/api-docs/pathway-xpacks-llm/splitters) disponibles en Ruta. Si no se proporciona un analizador, se usa el analizador predeterminado de `UTF-8`. Puedes encontrar los analizadores disponibles [aquí](https://github.com/pathwaycom/pathway/blob/main/python/pathway/xpacks/llm/parser.py).
