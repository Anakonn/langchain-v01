---
translated: true
---

# Airbyte CDK (Deprecated)

Nota: `AirbyteCDKLoader` está en desuso. Por favor, use [`AirbyteLoader`](/docs/integrations/document_loaders/airbyte) en su lugar.

>[Airbyte](https://github.com/airbytehq/airbyte) es una plataforma de integración de datos para tuberías ELT desde API, bases de datos y archivos a almacenes de datos y lagos. Tiene el catálogo más grande de conectores ELT a almacenes de datos y bases de datos.

Muchos conectores de origen se implementan utilizando el [Airbyte CDK](https://docs.airbyte.com/connector-development/cdk-python/). Este cargador permite ejecutar cualquiera de estos conectores y devolver los datos como documentos.

## Instalación

Primero, necesitas instalar el paquete de Python `airbyte-cdk`.

```python
%pip install --upgrade --quiet  airbyte-cdk
```

Luego, instala un conector existente del [repositorio de Github de Airbyte](https://github.com/airbytehq/airbyte/tree/master/airbyte-integrations/connectors) o crea tu propio conector utilizando el [Airbyte CDK](https://docs.airbyte.io/connector-development/connector-development).

Por ejemplo, para instalar el conector de Github, ejecuta

```python
%pip install --upgrade --quiet  "source_github@git+https://github.com/airbytehq/airbyte.git@master#subdirectory=airbyte-integrations/connectors/source-github"
```

Algunas fuentes también se publican como paquetes regulares en PyPI.

## Ejemplo

Ahora puedes crear un `AirbyteCDKLoader` basado en la fuente importada. Toma un objeto `config` que se pasa al conector. También tienes que elegir el flujo del que quieres recuperar registros por nombre (`stream_name`). Consulta la página de documentación del conector y la definición de especificaciones para obtener más información sobre el objeto de configuración y los flujos disponibles. Para los conectores de Github, estos son:

* [https://github.com/airbytehq/airbyte/blob/master/airbyte-integrations/connectors/source-github/source_github/spec.json](https://github.com/airbytehq/airbyte/blob/master/airbyte-integrations/connectors/source-github/source_github/spec.json).
* [https://docs.airbyte.com/integrations/sources/github/](https://docs.airbyte.com/integrations/sources/github/)

```python
from langchain_community.document_loaders.airbyte import AirbyteCDKLoader
from source_github.source import SourceGithub  # plug in your own source here

config = {
    # your github configuration
    "credentials": {"api_url": "api.github.com", "personal_access_token": "<token>"},
    "repository": "<repo>",
    "start_date": "<date from which to start retrieving records from in ISO format, e.g. 2020-10-20T00:00:00Z>",
}

issues_loader = AirbyteCDKLoader(
    source_class=SourceGithub, config=config, stream_name="issues"
)
```

Ahora puedes cargar documentos de la manera habitual

```python
docs = issues_loader.load()
```

Como `load` devuelve una lista, bloqueará hasta que se carguen todos los documentos. Para tener un mejor control sobre este proceso, también puedes usar el método `lazy_load`, que devuelve un iterador:

```python
docs_iterator = issues_loader.lazy_load()
```

Ten en cuenta que, de forma predeterminada, el contenido de la página está vacío y el objeto de metadatos contiene toda la información del registro. Para crear documentos de una manera diferente, pasa una función `record_handler` al crear el cargador:

```python
from langchain_community.docstore.document import Document


def handle_record(record, id):
    return Document(
        page_content=record.data["title"] + "\n" + (record.data["body"] or ""),
        metadata=record.data,
    )


issues_loader = AirbyteCDKLoader(
    source_class=SourceGithub,
    config=config,
    stream_name="issues",
    record_handler=handle_record,
)

docs = issues_loader.load()
```

## Cargas incrementales

Algunos flujos permiten la carga incremental, lo que significa que la fuente realiza un seguimiento de los registros sincronizados y no los cargará de nuevo. Esto es útil para fuentes que tienen un alto volumen de datos y se actualizan con frecuencia.

Para aprovechar esto, almacena la propiedad `last_state` del cargador y pásala al crear el cargador de nuevo. Esto garantizará que solo se carguen los registros nuevos.

```python
last_state = issues_loader.last_state  # store safely

incremental_issue_loader = AirbyteCDKLoader(
    source_class=SourceGithub, config=config, stream_name="issues", state=last_state
)

new_docs = incremental_issue_loader.load()
```
