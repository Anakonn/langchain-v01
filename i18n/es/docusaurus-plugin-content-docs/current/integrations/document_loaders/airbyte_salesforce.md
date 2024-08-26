---
translated: true
---

# Airbyte Salesforce (Deprecated)

Nota: Este cargador específico del conector está en desuso. Por favor, use [`AirbyteLoader`](/docs/integrations/document_loaders/airbyte) en su lugar.

>[Airbyte](https://github.com/airbytehq/airbyte) es una plataforma de integración de datos para tuberías ELT desde API, bases de datos y archivos a almacenes de datos y lagos. Tiene el catálogo más grande de conectores ELT a almacenes de datos y bases de datos.

Este cargador expone el conector Salesforce como un cargador de documentos, lo que le permite cargar varios objetos de Salesforce como documentos.

## Instalación

Primero, necesitas instalar el paquete de Python `airbyte-source-salesforce`.

```python
%pip install --upgrade --quiet  airbyte-source-salesforce
```

## Ejemplo

Consulta la [página de documentación de Airbyte](https://docs.airbyte.com/integrations/sources/salesforce/) para obtener detalles sobre cómo configurar el lector.
El esquema JSON al que debe adherirse el objeto de configuración se puede encontrar en Github: [https://github.com/airbytehq/airbyte/blob/master/airbyte-integrations/connectors/source-salesforce/source_salesforce/spec.yaml](https://github.com/airbytehq/airbyte/blob/master/airbyte-integrations/connectors/source-salesforce/source_salesforce/spec.yaml).

La forma general se ve así:

```python
{
  "client_id": "<oauth client id>",
  "client_secret": "<oauth client secret>",
  "refresh_token": "<oauth refresh token>",
  "start_date": "<date from which to start retrieving records from in ISO format, e.g. 2020-10-20T00:00:00Z>",
  "is_sandbox": False, # set to True if you're using a sandbox environment
  "streams_criteria": [ # Array of filters for salesforce objects that should be loadable
    {"criteria": "exacts", "value": "Account"}, # Exact name of salesforce object
    {"criteria": "starts with", "value": "Asset"}, # Prefix of the name
    # Other allowed criteria: ends with, contains, starts not with, ends not with, not contains, not exacts
  ],
}
```

De forma predeterminada, todos los campos se almacenan como metadatos en los documentos y el texto se establece en una cadena vacía. Construye el texto del documento transformando los documentos devueltos por el lector.

```python
from langchain_community.document_loaders.airbyte import AirbyteSalesforceLoader

config = {
    # your salesforce configuration
}

loader = AirbyteSalesforceLoader(
    config=config, stream_name="asset"
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

Ten en cuenta que, de forma predeterminada, el contenido de la página está vacío y el objeto de metadatos contiene toda la información del registro. Para crear documentos de una manera diferente, pasa una función `record_handler` al crear el cargador:

```python
from langchain_community.docstore.document import Document


def handle_record(record, id):
    return Document(page_content=record.data["title"], metadata=record.data)


loader = AirbyteSalesforceLoader(
    config=config, record_handler=handle_record, stream_name="asset"
)
docs = loader.load()
```

## Cargas incrementales

Algunos flujos permiten la carga incremental, lo que significa que la fuente realiza un seguimiento de los registros sincronizados y no los cargará de nuevo. Esto es útil para fuentes que tienen un alto volumen de datos y se actualizan con frecuencia.

Para aprovechar esto, almacena la propiedad `last_state` del cargador y pásala al crear el cargador de nuevo. Esto garantizará que solo se carguen los registros nuevos.

```python
last_state = loader.last_state  # store safely

incremental_loader = AirbyteSalesforceLoader(
    config=config, stream_name="asset", state=last_state
)

new_docs = incremental_loader.load()
```
