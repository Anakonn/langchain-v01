---
translated: true
---

# Google Memorystore for Redis

> [Google Memorystore for Redis](https://cloud.google.com/memorystore/docs/redis/memorystore-for-redis-overview) es un servicio totalmente administrado que se basa en el almacén de datos en memoria Redis para crear cachés de aplicaciones que proporcionan acceso a datos en menos de un milisegundo. Extiende tu aplicación de base de datos para crear experiencias impulsadas por IA aprovechando las integraciones de Langchain de Memorystore for Redis.

Este cuaderno explica cómo usar [Memorystore for Redis](https://cloud.google.com/memorystore/docs/redis/memorystore-for-redis-overview) para [guardar, cargar y eliminar documentos de langchain](/docs/modules/data_connection/document_loaders/) con `MemorystoreDocumentLoader` y `MemorystoreDocumentSaver`.

Más información sobre el paquete en [GitHub](https://github.com/googleapis/langchain-google-memorystore-redis-python/).

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-memorystore-redis-python/blob/main/docs/document_loader.ipynb)

## Antes de comenzar

Para ejecutar este cuaderno, deberás hacer lo siguiente:

* [Crear un proyecto de Google Cloud](https://developers.google.com/workspace/guides/create-project)
* [Habilitar la API de Memorystore for Redis](https://console.cloud.google.com/flows/enableapi?apiid=redis.googleapis.com)
* [Crear una instancia de Memorystore for Redis](https://cloud.google.com/memorystore/docs/redis/create-instance-console). Asegúrate de que la versión sea mayor o igual a 5.0.

Después de confirmar el acceso a la base de datos en el entorno de ejecución de este cuaderno, rellena los siguientes valores y ejecuta la celda antes de ejecutar los scripts de ejemplo.

```python
# @markdown Please specify an endpoint associated with the instance and a key prefix for demo purpose.
ENDPOINT = "redis://127.0.0.1:6379"  # @param {type:"string"}
KEY_PREFIX = "doc:"  # @param {type:"string"}
```

### 🦜🔗 Instalación de la biblioteca

La integración se encuentra en su propio paquete `langchain-google-memorystore-redis`, por lo que debemos instalarlo.

```python
%pip install -upgrade --quiet langchain-google-memorystore-redis
```

**Colab solo**: Descomenta la siguiente celda para reiniciar el kernel o usa el botón para reiniciar el kernel. Para Vertex AI Workbench puedes reiniciar el terminal usando el botón de la parte superior.

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
* Consulta la página de soporte: [Localizar el ID del proyecto](https://support.google.com/googleapi/answer/7014113).

```python
# @markdown Please fill in the value below with your Google Cloud project ID and then run the cell.

PROJECT_ID = "my-project-id"  # @param {type:"string"}

# Set the project id
!gcloud config set project {PROJECT_ID}
```

### 🔐 Autenticación

Auténtica en Google Cloud como el usuario de IAM que ha iniciado sesión en este cuaderno para acceder a tu proyecto de Google Cloud.

- Si estás usando Colab para ejecutar este cuaderno, usa la celda de abajo y continúa.
- Si estás usando Vertex AI Workbench, consulta las instrucciones de configuración [aquí](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env).

```python
from google.colab import auth

auth.authenticate_user()
```

## Uso básico

### Guardar documentos

Guarda documentos de langchain con `MemorystoreDocumentSaver.add_documents(<documents>)`. Para inicializar la clase `MemorystoreDocumentSaver` necesitas proporcionar 2 cosas:

1. `client` - Un objeto cliente `redis.Redis`.
1. `key_prefix` - Un prefijo para las claves donde se almacenarán los documentos en Redis.

Los documentos se almacenarán en claves generadas aleatoriamente con el prefijo especificado en `key_prefix`. Alternativamente, puedes designar los sufijos de las claves especificando `ids` en el método `add_documents`.

```python
import redis
from langchain_core.documents import Document
from langchain_google_memorystore_redis import MemorystoreDocumentSaver

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
doc_ids = [f"{i}" for i in range(len(test_docs))]

redis_client = redis.from_url(ENDPOINT)
saver = MemorystoreDocumentSaver(
    client=redis_client,
    key_prefix=KEY_PREFIX,
    content_field="page_content",
)
saver.add_documents(test_docs, ids=doc_ids)
```

### Cargar documentos

Inicializa un cargador que carga todos los documentos almacenados en la instancia de Memorystore for Redis con un prefijo específico.

Carga documentos de langchain con `MemorystoreDocumentLoader.load()` o `MemorystoreDocumentLoader.lazy_load()`. `lazy_load` devuelve un generador que solo consulta la base de datos durante la iteración. Para inicializar la clase `MemorystoreDocumentLoader` necesitas proporcionar:

1. `client` - Un objeto cliente `redis.Redis`.
1. `key_prefix` - Un prefijo para las claves donde se almacenarán los documentos en Redis.

```python
import redis
from langchain_google_memorystore_redis import MemorystoreDocumentLoader

redis_client = redis.from_url(ENDPOINT)
loader = MemorystoreDocumentLoader(
    client=redis_client,
    key_prefix=KEY_PREFIX,
    content_fields=set(["page_content"]),
)
for doc in loader.lazy_load():
    print("Loaded documents:", doc)
```

### Eliminar documentos

Elimina todas las claves con el prefijo especificado en la instancia de Memorystore for Redis con `MemorystoreDocumentSaver.delete()`. También puedes especificar los sufijos de las claves si los conoces.

```python
docs = loader.load()
print("Documents before delete:", docs)

saver.delete(ids=[0])
print("Documents after delete:", loader.load())

saver.delete()
print("Documents after delete all:", loader.load())
```

## Uso avanzado

### Personalizar el contenido y los metadatos de la página del documento

Cuando se inicializa un cargador con más de 1 campo de contenido, el `page_content` de los documentos cargados contendrá una cadena codificada en JSON con campos de nivel superior iguales a los campos especificados en `content_fields`.

Si se especifican los `metadata_fields`, el campo `metadata` de los documentos cargados solo tendrá los campos de nivel superior iguales a los `metadata_fields` especificados. Si alguno de los valores de los campos de metadatos se almacena como una cadena codificada en JSON, se decodificará antes de cargarse en los campos de metadatos.

```python
loader = MemorystoreDocumentLoader(
    client=redis_client,
    key_prefix=KEY_PREFIX,
    content_fields=set(["content_field_1", "content_field_2"]),
    metadata_fields=set(["title", "author"]),
)
```
