---
translated: true
---

# Google Spanner

> [Google Cloud Spanner](https://cloud.google.com/spanner) es una base de datos altamente escalable que combina una escalabilidad ilimitada con semántica relacional, como índices secundarios, consistencia fuerte, esquemas y SQL, proporcionando una disponibilidad del 99,999% en una sola solución fácil de usar.

Este cuaderno explica cómo usar `Spanner` para almacenar el historial de mensajes de chat con la clase `SpannerChatMessageHistory`.
Obtenga más información sobre el paquete en [GitHub](https://github.com/googleapis/langchain-google-spanner-python/).

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-spanner-python/blob/main/samples/chat_message_history.ipynb)

## Antes de comenzar

Para ejecutar este cuaderno, deberá hacer lo siguiente:

 * [Crear un proyecto de Google Cloud](https://developers.google.com/workspace/guides/create-project)
 * [Habilitar la API de Cloud Spanner](https://console.cloud.google.com/flows/enableapi?apiid=spanner.googleapis.com)
 * [Crear una instancia de Spanner](https://cloud.google.com/spanner/docs/create-manage-instances)
 * [Crear una base de datos de Spanner](https://cloud.google.com/spanner/docs/create-manage-databases)

### 🦜🔗 Instalación de la biblioteca

La integración se encuentra en su propio paquete `langchain-google-spanner`, por lo que debemos instalarlo.

```python
%pip install --upgrade --quiet langchain-google-spanner
```

**Solo Colab:** Descomenta la siguiente celda para reiniciar el kernel o usa el botón para reiniciar el kernel. Para Vertex AI Workbench, puedes reiniciar el terminal usando el botón de la parte superior.

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### 🔐 Autenticación

Autentícate en Google Cloud como el usuario de IAM que ha iniciado sesión en este cuaderno para acceder a tu proyecto de Google Cloud.

* Si estás usando Colab para ejecutar este cuaderno, usa la celda a continuación y continúa.
* Si estás usando Vertex AI Workbench, consulta las instrucciones de configuración [aquí](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env).

```python
from google.colab import auth

auth.authenticate_user()
```

### ☁ Establece tu proyecto de Google Cloud

Establece tu proyecto de Google Cloud para que puedas aprovechar los recursos de Google Cloud dentro de este cuaderno.

Si no conoces tu ID de proyecto, intenta lo siguiente:

* Ejecuta `gcloud config list`.
* Ejecuta `gcloud projects list`.
* Consulta la página de soporte: [Localizar el ID del proyecto](https://support.google.com/googleapi/answer/7014113).

```python
# @markdown Please fill in the value below with your Google Cloud project ID and then run the cell.

PROJECT_ID = "my-project-id"  # @param {type:"string"}

# Set the project id
!gcloud config set project {PROJECT_ID}
```

### 💡 Habilitación de la API

El paquete `langchain-google-spanner` requiere que [habilites la API de Spanner](https://console.cloud.google.com/flows/enableapi?apiid=spanner.googleapis.com) en tu proyecto de Google Cloud.

```python
# enable Spanner API
!gcloud services enable spanner.googleapis.com
```

## Uso básico

### Establecer los valores de la base de datos de Spanner

Encuentra los valores de tu base de datos en la [página de instancias de Spanner](https://console.cloud.google.com/spanner).

```python
# @title Set Your Values Here { display-mode: "form" }
INSTANCE = "my-instance"  # @param {type: "string"}
DATABASE = "my-database"  # @param {type: "string"}
TABLE_NAME = "message_store"  # @param {type: "string"}
```

### Inicializar una tabla

La clase `SpannerChatMessageHistory` requiere una tabla de base de datos con un esquema específico para almacenar el historial de mensajes de chat.

El método auxiliar `init_chat_history_table()` se puede usar para crear una tabla con el esquema adecuado.

```python
from langchain_google_spanner import (
    SpannerChatMessageHistory,
)

SpannerChatMessageHistory.init_chat_history_table(table_name=TABLE_NAME)
```

### SpannerChatMessageHistory

Para inicializar la clase `SpannerChatMessageHistory`, solo necesitas proporcionar 3 cosas:

1. `instance_id` - El nombre de la instancia de Spanner
1. `database_id` - El nombre de la base de datos de Spanner
1. `session_id` - Un identificador único que especifica un ID para la sesión.
1. `table_name` - El nombre de la tabla dentro de la base de datos para almacenar el historial de mensajes de chat.

```python
message_history = SpannerChatMessageHistory(
    instance_id=INSTANCE,
    database_id=DATABASE,
    table_name=TABLE_NAME,
    session_id="user-session-id",
)

message_history.add_user_message("hi!")
message_history.add_ai_message("whats up?")
```

```python
message_history.messages
```

## Cliente personalizado

El cliente creado por defecto es el cliente predeterminado. Para usar uno no predeterminado, se puede pasar un [cliente personalizado](https://cloud.google.com/spanner/docs/samples/spanner-create-client-with-query-options#spanner_create_client_with_query_options-python) al constructor.

```python
from google.cloud import spanner

custom_client_message_history = SpannerChatMessageHistory(
    instance_id="my-instance",
    database_id="my-database",
    client=spanner.Client(...),
)
```

## Limpieza

Cuando el historial de una sesión específica está obsoleto y se puede eliminar, se puede hacer de la siguiente manera.
Nota: Una vez eliminados, los datos ya no se almacenan en Cloud Spanner y se pierden para siempre.

```python
message_history = SpannerChatMessageHistory(
    instance_id=INSTANCE,
    database_id=DATABASE,
    table_name=TABLE_NAME,
    session_id="user-session-id",
)

message_history.clear()
```
