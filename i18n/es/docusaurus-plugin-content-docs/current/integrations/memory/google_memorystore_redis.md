---
translated: true
---

# Google Memorystore para Redis

> [Google Cloud Memorystore para Redis](https://cloud.google.com/memorystore/docs/redis/memorystore-for-redis-overview) es un servicio totalmente administrado que se basa en el almacén de datos en memoria Redis para crear cachés de aplicaciones que proporcionan acceso a datos en menos de un milisegundo. Extiende tu aplicación de base de datos para crear experiencias impulsadas por IA aprovechando las integraciones de Langchain de Memorystore para Redis.

Este cuaderno explica cómo usar [Google Cloud Memorystore para Redis](https://cloud.google.com/memorystore/docs/redis/memorystore-for-redis-overview) para almacenar el historial de mensajes de chat con la clase `MemorystoreChatMessageHistory`.

Más información sobre el paquete en [GitHub](https://github.com/googleapis/langchain-google-memorystore-redis-python/).

[![Abrir en Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-memorystore-redis-python/blob/main/docs/chat_message_history.ipynb)

## Antes de comenzar

Para ejecutar este cuaderno, deberás hacer lo siguiente:

* [Crear un proyecto de Google Cloud](https://developers.google.com/workspace/guides/create-project)
* [Habilitar la API de Memorystore para Redis](https://console.cloud.google.com/flows/enableapi?apiid=redis.googleapis.com)
* [Crear una instancia de Memorystore para Redis](https://cloud.google.com/memorystore/docs/redis/create-instance-console). Asegúrate de que la versión sea mayor o igual a 5.0.

Después de confirmar el acceso a la base de datos en el entorno de ejecución de este cuaderno, rellena los siguientes valores y ejecuta la celda antes de ejecutar los scripts de ejemplo.

```python
# @markdown Please specify an endpoint associated with the instance or demo purpose.
ENDPOINT = "redis://127.0.0.1:6379"  # @param {type:"string"}
```

### 🦜🔗 Instalación de la biblioteca

La integración se encuentra en su propio paquete `langchain-google-memorystore-redis`, por lo que debemos instalarlo.

```python
%pip install -upgrade --quiet langchain-google-memorystore-redis
```

**Sólo Colab:** Descomenta la siguiente celda para reiniciar el kernel o usa el botón para reiniciar el kernel. Para Vertex AI Workbench puedes reiniciar el terminal usando el botón de la parte superior.

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### ☁ Establece tu proyecto de Google Cloud

Establece tu proyecto de Google Cloud para poder utilizar los recursos de Google Cloud dentro de este cuaderno.

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

* Si estás usando Colab para ejecutar este cuaderno, usa la celda de abajo y continúa.
* Si estás usando Vertex AI Workbench, consulta las instrucciones de configuración [aquí](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env).

```python
from google.colab import auth

auth.authenticate_user()
```

## Uso básico

### MemorystoreChatMessageHistory

Para inicializar la clase `MemorystoreMessageHistory` solo necesitas proporcionar 2 cosas:

1. `redis_client` - Una instancia de Memorystore Redis.
1. `session_id` - Cada objeto de historial de mensajes de chat debe tener un ID de sesión único. Si el ID de sesión ya tiene mensajes almacenados en Redis, se podrán recuperar.

```python
import redis
from langchain_google_memorystore_redis import MemorystoreChatMessageHistory

# Connect to a Memorystore for Redis instance
redis_client = redis.from_url("redis://127.0.0.1:6379")

message_history = MemorystoreChatMessageHistory(redis_client, session_id="session1")
```

```python
message_history.messages
```

#### Limpieza

Cuando el historial de una sesión específica esté obsoleto y pueda eliminarse, se puede hacer de la siguiente manera.

**Nota:** Una vez eliminados, los datos ya no se almacenarán en Memorystore para Redis y se perderán para siempre.

```python
message_history.clear()
```
