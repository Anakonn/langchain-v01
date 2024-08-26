---
translated: true
---

# Airbyte Gong (Obsoleto)

Nota: Este cargador específico del conector está obsoleto. Por favor, use [`AirbyteLoader`](/docs/integrations/document_loaders/airbyte) en su lugar.

>[Airbyte](https://github.com/airbytehq/airbyte) es una plataforma de integración de datos para tuberías ELT desde API, bases de datos y archivos a almacenes de datos y lagos. Tiene el catálogo más grande de conectores ELT a almacenes de datos y bases de datos.

Este cargador expone el conector Gong como un cargador de documentos, lo que le permite cargar varios objetos Gong como documentos.

## Instalación

Primero, necesitas instalar el paquete de Python `airbyte-source-gong`.

```python
%pip install --upgrade --quiet  airbyte-source-gong
```

## Ejemplo

Consulta la [página de documentación de Airbyte](https://docs.airbyte.com/integrations/sources/gong/) para obtener detalles sobre cómo configurar el lector.
El esquema JSON al que debe adherirse el objeto de configuración se puede encontrar en Github: [https://github.com/airbytehq/airbyte/blob/master/airbyte-integrations/connectors/source-gong/source_gong/spec.yaml](https://github.com/airbytehq/airbyte/blob/master/airbyte-integrations/connectors/source-gong/source_gong/spec.yaml).

La forma general se ve así:

```python
{
  "access_key": "<access key name>",
  "access_key_secret": "<access key secret>",
  "start_date": "<date from which to start retrieving records from in ISO format, e.g. 2020-10-20T00:00:00Z>",
}
```

De forma predeterminada, todos los campos se almacenan como metadatos en los documentos y el texto se establece en una cadena vacía. Construye el texto del documento transformando los documentos devueltos por el lector.

```python
from langchain_community.document_loaders.airbyte import AirbyteGongLoader

config = {
    # your gong configuration
}

loader = AirbyteGongLoader(
    config=config, stream_name="calls"
)  # check the documentation linked above for a list of all streams
```

Ahora puedes cargar documentos de la manera habitual

```python
docs = loader.load()
```

Como `load` devuelve una lista, bloqueará hasta que se carguen todos los documentos. Para tener un mejor control sobre este proceso, también puedes usar el método `lazy_load`, que devuelve un iterador:

```python
docs_iterator = loader.lazy_load()
```

Ten en cuenta que, de forma predeterminada, el contenido de la página está vacío y el objeto de metadatos contiene toda la información del registro. Para procesar documentos, crea una clase que herede del cargador base e implementa el método `_handle_records` tú mismo:

```python
from langchain_community.docstore.document import Document


def handle_record(record, id):
    return Document(page_content=record.data["title"], metadata=record.data)


loader = AirbyteGongLoader(
    config=config, record_handler=handle_record, stream_name="calls"
)
docs = loader.load()
```

## Cargas incrementales

Algunos flujos permiten la carga incremental, lo que significa que la fuente realiza un seguimiento de los registros sincronizados y no los cargará de nuevo. Esto es útil para fuentes que tienen un alto volumen de datos y se actualizan con frecuencia.

Para aprovechar esto, almacena la propiedad `last_state` del cargador y pásala al crear el cargador de nuevo. Esto garantizará que solo se carguen los registros nuevos.

```python
last_state = loader.last_state  # store safely

incremental_loader = AirbyteGongLoader(
    config=config, stream_name="calls", state=last_state
)

new_docs = incremental_loader.load()
```
