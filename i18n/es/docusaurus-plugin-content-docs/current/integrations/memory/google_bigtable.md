---
translated: true
---

# Google Bigtable

> [Google Cloud Bigtable](https://cloud.google.com/bigtable) es una tienda de clave-valor y columna ancha, ideal para un acceso rápido a datos estructurados, semi-estructurados o no estructurados. Extienda su aplicación de base de datos para construir experiencias impulsadas por IA aprovechando las integraciones de Langchain de Bigtable.

Este cuaderno explica cómo usar [Google Cloud Bigtable](https://cloud.google.com/bigtable) para almacenar el historial de mensajes de chat con la clase `BigtableChatMessageHistory`.

Más información sobre el paquete en [GitHub](https://github.com/googleapis/langchain-google-bigtable-python/).

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-bigtable-python/blob/main/docs/chat_message_history.ipynb)

## Antes de comenzar

Para ejecutar este cuaderno, deberá hacer lo siguiente:

* [Crear un proyecto de Google Cloud](https://developers.google.com/workspace/guides/create-project)
* [Habilitar la API de Bigtable](https://console.cloud.google.com/flows/enableapi?apiid=bigtable.googleapis.com)
* [Crear una instancia de Bigtable](https://cloud.google.com/bigtable/docs/creating-instance)
* [Crear una tabla de Bigtable](https://cloud.google.com/bigtable/docs/managing-tables)
* [Crear credenciales de acceso a Bigtable](https://developers.google.com/workspace/guides/create-credentials)

### 🦜🔗 Instalación de la biblioteca

La integración se encuentra en su propio paquete `langchain-google-bigtable`, por lo que necesitamos instalarlo.

```python
%pip install -upgrade --quiet langchain-google-bigtable
```

**Solo Colab**: Descomenta la siguiente celda para reiniciar el kernel o usa el botón para reiniciar el kernel. Para Vertex AI Workbench puedes reiniciar el terminal usando el botón de arriba.

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### ☁ Establece tu proyecto de Google Cloud

Establece tu proyecto de Google Cloud para que puedas aprovechar los recursos de Google Cloud dentro de este cuaderno.

Si no conoces tu ID de proyecto, intenta lo siguiente:

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

Auténtica en Google Cloud como el usuario de IAM que ha iniciado sesión en este cuaderno para acceder a tu proyecto de Google Cloud.

- Si estás usando Colab para ejecutar este cuaderno, usa la celda a continuación y continúa.
- Si estás usando Vertex AI Workbench, consulta las instrucciones de configuración [aquí](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env).

```python
from google.colab import auth

auth.authenticate_user()
```

## Uso básico

### Inicializar el esquema de Bigtable

El esquema de `BigtableChatMessageHistory` requiere que la instancia y la tabla existan, y tengan una familia de columnas llamada `langchain`.

```python
# @markdown Please specify an instance and a table for demo purpose.
INSTANCE_ID = "my_instance"  # @param {type:"string"}
TABLE_ID = "my_table"  # @param {type:"string"}
```

Si la tabla o la familia de columnas no existen, puedes usar la siguiente función para crearlas:

```python
from google.cloud import bigtable
from langchain_google_bigtable import create_chat_history_table

create_chat_history_table(
    instance_id=INSTANCE_ID,
    table_id=TABLE_ID,
)
```

### BigtableChatMessageHistory

Para inicializar la clase `BigtableChatMessageHistory` solo necesitas proporcionar 3 cosas:

1. `instance_id` - La instancia de Bigtable que se utilizará para el historial de mensajes de chat.
1. `table_id`: La tabla de Bigtable para almacenar el historial de mensajes de chat.
1. `session_id` - Una cadena de identificador único que especifica un id para la sesión.

```python
from langchain_google_bigtable import BigtableChatMessageHistory

message_history = BigtableChatMessageHistory(
    instance_id=INSTANCE_ID,
    table_id=TABLE_ID,
    session_id="user-session-id",
)

message_history.add_user_message("hi!")
message_history.add_ai_message("whats up?")
```

```python
message_history.messages
```

#### Limpieza

Cuando el historial de una sesión específica está obsoleto y se puede eliminar, se puede hacer de la siguiente manera.

**Nota:** Una vez eliminados, los datos ya no se almacenarán en Bigtable y se perderán para siempre.

```python
message_history.clear()
```

## Uso avanzado

### Cliente personalizado

El cliente creado por defecto es el cliente predeterminado, usando solo la opción admin=True. Para usar un cliente no predeterminado, se puede pasar un [cliente personalizado](https://cloud.google.com/python/docs/reference/bigtable/latest/client#class-googlecloudbigtableclientclientprojectnone-credentialsnone-readonlyfalse-adminfalse-clientinfonone-clientoptionsnone-adminclientoptionsnone-channelnone) al constructor.

```python
from google.cloud import bigtable

client = (bigtable.Client(...),)

create_chat_history_table(
    instance_id="my-instance",
    table_id="my-table",
    client=client,
)

custom_client_message_history = BigtableChatMessageHistory(
    instance_id="my-instance",
    table_id="my-table",
    client=client,
)
```
