---
translated: true
---

# Google Bigtable

> [Bigtable](https://cloud.google.com/bigtable) es una tienda de valores clave y columna ancha, ideal para un acceso rápido a datos estructurados, semi-estructurados o no estructurados. Extienda su aplicación de base de datos para construir experiencias impulsadas por IA aprovechando las integraciones de Langchain de Bigtable.

Este cuaderno explica cómo usar [Bigtable](https://cloud.google.com/bigtable) para [guardar, cargar y eliminar documentos de langchain](/docs/modules/data_connection/document_loaders/) con `BigtableLoader` y `BigtableSaver`.

Más información sobre el paquete en [GitHub](https://github.com/googleapis/langchain-google-bigtable-python/).

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-bigtable-python/blob/main/docs/document_loader.ipynb)

## Antes de comenzar

Para ejecutar este cuaderno, deberá hacer lo siguiente:

* [Crear un proyecto de Google Cloud](https://developers.google.com/workspace/guides/create-project)
* [Habilitar la API de Bigtable](https://console.cloud.google.com/flows/enableapi?apiid=bigtable.googleapis.com)
* [Crear una instancia de Bigtable](https://cloud.google.com/bigtable/docs/creating-instance)
* [Crear una tabla de Bigtable](https://cloud.google.com/bigtable/docs/managing-tables)
* [Crear credenciales de acceso a Bigtable](https://developers.google.com/workspace/guides/create-credentials)

Después de confirmar el acceso a la base de datos en el entorno de ejecución de este cuaderno, complete los siguientes valores y ejecute la celda antes de ejecutar los scripts de ejemplo.

```python
# @markdown Please specify an instance and a table for demo purpose.
INSTANCE_ID = "my_instance"  # @param {type:"string"}
TABLE_ID = "my_table"  # @param {type:"string"}
```

### 🦜🔗 Instalación de la biblioteca

La integración se encuentra en su propio paquete `langchain-google-bigtable`, por lo que debemos instalarlo.

```python
%pip install -upgrade --quiet langchain-google-bigtable
```

**Colab solo**: Descomenta la siguiente celda para reiniciar el kernel o usa el botón para reiniciar el kernel. Para Vertex AI Workbench puedes reiniciar el terminal usando el botón de arriba.

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### ☁ Establece tu proyecto de Google Cloud

Establece tu proyecto de Google Cloud para que puedas aprovechar los recursos de Google Cloud dentro de este cuaderno.

Si no sabes tu ID de proyecto, prueba lo siguiente:

* Ejecuta `gcloud config list`.
* Ejecuta `gcloud projects list`.
* Consulta la página de soporte: [Localiza el ID del proyecto](https://support.google.com/googleapi/answer/7014113).

```python
# @markdown Please fill in the value below with your Google Cloud project ID and then run the cell.

PROJECT_ID = "my-project-id"  # @param {type:"string"}

# Set the project id
!gcloud config set project {PROJECT_ID}
```

### 🔐 Autenticación

Autentícate en Google Cloud como el usuario de IAM que ha iniciado sesión en este cuaderno para acceder a tu proyecto de Google Cloud.

- Si estás usando Colab para ejecutar este cuaderno, usa la celda a continuación y continúa.
- Si estás usando Vertex AI Workbench, consulta las instrucciones de configuración [aquí](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env).

```python
from google.colab import auth

auth.authenticate_user()
```

## Uso básico

### Uso del saver

Guarda documentos de langchain con `BigtableSaver.add_documents(<documents>)`. Para inicializar la clase `BigtableSaver` necesitas proporcionar 2 cosas:

1. `instance_id` - Una instancia de Bigtable.
1. `table_id` - El nombre de la tabla dentro de Bigtable para almacenar documentos de langchain.

```python
from langchain_core.documents import Document
from langchain_google_bigtable import BigtableSaver

test_docs = [
    Document(
        page_content="Apple Granny Smith 150 0.99 1",
        metadata={"fruit_id": 1},
    ),
    Document(
        page_content="Banana Cavendish 200 0.59 0",
        metadata={"fruit_id": 2},
    ),
    Document(
        page_content="Orange Navel 80 1.29 1",
        metadata={"fruit_id": 3},
    ),
]

saver = BigtableSaver(
    instance_id=INSTANCE_ID,
    table_id=TABLE_ID,
)

saver.add_documents(test_docs)
```

### Consultar documentos de Bigtable

Para más detalles sobre la conexión a una tabla de Bigtable, consulta la [documentación del SDK de Python](https://cloud.google.com/python/docs/reference/bigtable/latest/client).

#### Cargar documentos de la tabla

Carga documentos de langchain con `BigtableLoader.load()` o `BigtableLoader.lazy_load()`. `lazy_load` devuelve un generador que solo consulta la base de datos durante la iteración. Para inicializar la clase `BigtableLoader` necesitas proporcionar:

1. `instance_id` - Una instancia de Bigtable.
1. `table_id` - El nombre de la tabla dentro de Bigtable para almacenar documentos de langchain.

```python
from langchain_google_bigtable import BigtableLoader

loader = BigtableLoader(
    instance_id=INSTANCE_ID,
    table_id=TABLE_ID,
)

for doc in loader.lazy_load():
    print(doc)
    break
```

### Eliminar documentos

Elimina una lista de documentos de langchain de la tabla de Bigtable con `BigtableSaver.delete(<documents>)`.

```python
from langchain_google_bigtable import BigtableSaver

docs = loader.load()
print("Documents before delete: ", docs)

onedoc = test_docs[0]
saver.delete([onedoc])
print("Documents after delete: ", loader.load())
```

## Uso avanzado

### Limitar las filas devueltas

Hay dos formas de limitar las filas devueltas:

1. Usando un [filtro](https://cloud.google.com/python/docs/reference/bigtable/latest/row-filters)
2. Usando un [conjunto de filas](https://cloud.google.com/python/docs/reference/bigtable/latest/row-set#google.cloud.bigtable.row_set.RowSet)

```python
import google.cloud.bigtable.row_filters as row_filters

filter_loader = BigtableLoader(
    INSTANCE_ID, TABLE_ID, filter=row_filters.ColumnQualifierRegexFilter(b"os_build")
)


from google.cloud.bigtable.row_set import RowSet

row_set = RowSet()
row_set.add_row_range_from_keys(
    start_key="phone#4c410523#20190501", end_key="phone#4c410523#201906201"
)

row_set_loader = BigtableLoader(
    INSTANCE_ID,
    TABLE_ID,
    row_set=row_set,
)
```

### Cliente personalizado

El cliente creado por defecto es el cliente predeterminado, usando solo la opción admin=True. Para usar un cliente no predeterminado, se puede pasar un [cliente personalizado](https://cloud.google.com/python/docs/reference/bigtable/latest/client#class-googlecloudbigtableclientclientprojectnone-credentialsnone-readonlyfalse-adminfalse-clientinfonone-clientoptionsnone-adminclientoptionsnone-channelnone) al constructor.

```python
from google.cloud import bigtable

custom_client_loader = BigtableLoader(
    INSTANCE_ID,
    TABLE_ID,
    client=bigtable.Client(...),
)
```

### Contenido personalizado

BigtableLoader asume que hay una familia de columnas llamada `langchain`, que tiene una columna llamada `content`, que contiene valores codificados en UTF-8. Estos valores predeterminados se pueden cambiar de la siguiente manera:

```python
from langchain_google_bigtable import Encoding

custom_content_loader = BigtableLoader(
    INSTANCE_ID,
    TABLE_ID,
    content_encoding=Encoding.ASCII,
    content_column_family="my_content_family",
    content_column_name="my_content_column_name",
)
```

### Asignación de metadatos

De forma predeterminada, el mapa `metadata` en el objeto `Document` contendrá una sola clave, `rowkey`, con el valor del valor de la fila. Para agregar más elementos a ese mapa, usa `metadata_mapping`.

```python
import json

from langchain_google_bigtable import MetadataMapping

metadata_mapping_loader = BigtableLoader(
    INSTANCE_ID,
    TABLE_ID,
    metadata_mappings=[
        MetadataMapping(
            column_family="my_int_family",
            column_name="my_int_column",
            metadata_key="key_in_metadata_map",
            encoding=Encoding.INT_BIG_ENDIAN,
        ),
        MetadataMapping(
            column_family="my_custom_family",
            column_name="my_custom_column",
            metadata_key="custom_key",
            encoding=Encoding.CUSTOM,
            custom_decoding_func=lambda input: json.loads(input.decode()),
            custom_encoding_func=lambda input: str.encode(json.dumps(input)),
        ),
    ],
)
```

### Metadatos como JSON

Si hay una columna en Bigtable que contiene una cadena JSON que deseas agregar a los metadatos de salida del documento, es posible agregar los siguientes parámetros a BigtableLoader. Nota que el valor predeterminado para `metadata_as_json_encoding` es UTF-8.

```python
metadata_as_json_loader = BigtableLoader(
    INSTANCE_ID,
    TABLE_ID,
    metadata_as_json_encoding=Encoding.ASCII,
    metadata_as_json_family="my_metadata_as_json_family",
    metadata_as_json_name="my_metadata_as_json_column_name",
)
```

### Personalizar BigtableSaver

BigtableSaver también se puede personalizar de manera similar a BigtableLoader.

```python
saver = BigtableSaver(
    INSTANCE_ID,
    TABLE_ID,
    client=bigtable.Client(...),
    content_encoding=Encoding.ASCII,
    content_column_family="my_content_family",
    content_column_name="my_content_column_name",
    metadata_mappings=[
        MetadataMapping(
            column_family="my_int_family",
            column_name="my_int_column",
            metadata_key="key_in_metadata_map",
            encoding=Encoding.INT_BIG_ENDIAN,
        ),
        MetadataMapping(
            column_family="my_custom_family",
            column_name="my_custom_column",
            metadata_key="custom_key",
            encoding=Encoding.CUSTOM,
            custom_decoding_func=lambda input: json.loads(input.decode()),
            custom_encoding_func=lambda input: str.encode(json.dumps(input)),
        ),
    ],
    metadata_as_json_encoding=Encoding.ASCII,
    metadata_as_json_family="my_metadata_as_json_family",
    metadata_as_json_name="my_metadata_as_json_column_name",
)
```
