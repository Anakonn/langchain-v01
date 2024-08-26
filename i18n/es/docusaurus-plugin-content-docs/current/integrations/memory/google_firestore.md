---
translated: true
---

# Google Firestore (Modo Nativo)

> [Google Cloud Firestore](https://cloud.google.com/firestore) es una base de datos de documentos sin servidor que se escala para satisfacer cualquier demanda. Extienda su aplicación de base de datos para construir experiencias impulsadas por IA aprovechando las integraciones de Langchain de `Firestore`.

Este cuaderno explica cómo usar [Google Cloud Firestore](https://cloud.google.com/firestore) para almacenar el historial de mensajes de chat con la clase `FirestoreChatMessageHistory`.

Más información sobre el paquete en [GitHub](https://github.com/googleapis/langchain-google-firestore-python/).

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-firestore-python/blob/main/docs/chat_message_history.ipynb)

## Antes de Comenzar

Para ejecutar este cuaderno, deberá hacer lo siguiente:

* [Crear un proyecto de Google Cloud](https://developers.google.com/workspace/guides/create-project)
* [Habilitar la API de Firestore](https://console.cloud.google.com/flows/enableapi?apiid=firestore.googleapis.com)
* [Crear una base de datos de Firestore](https://cloud.google.com/firestore/docs/manage-databases)

Después de confirmar el acceso a la base de datos en el entorno de ejecución de este cuaderno, complete los siguientes valores y ejecute la celda antes de ejecutar los scripts de ejemplo.

### 🦜🔗 Instalación de la Biblioteca

La integración se encuentra en su propio paquete `langchain-google-firestore`, por lo que necesitamos instalarlo.

```python
%pip install -upgrade --quiet langchain-google-firestore
```

**Solo Colab**: Descomenta la siguiente celda para reiniciar el kernel o usa el botón para reiniciar el kernel. Para Vertex AI Workbench puedes reiniciar el terminal usando el botón de arriba.

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### ☁ Establece tu Proyecto de Google Cloud

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

Autentícate en Google Cloud como el usuario de IAM que ha iniciado sesión en este cuaderno para acceder a tu proyecto de Google Cloud.

- Si estás usando Colab para ejecutar este cuaderno, usa la celda a continuación y continúa.
- Si estás usando Vertex AI Workbench, consulta las instrucciones de configuración [aquí](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env).

```python
from google.colab import auth

auth.authenticate_user()
```

## Uso Básico

### FirestoreChatMessageHistory

Para inicializar la clase `FirestoreChatMessageHistory` solo necesitas proporcionar 3 cosas:

1. `session_id` - Una cadena de identificador único que especifica un id para la sesión.
1. `collection`: La ruta de una sola `/`-delimitada a una colección de Firestore.

```python
from langchain_google_firestore import FirestoreChatMessageHistory

chat_history = FirestoreChatMessageHistory(
    session_id="user-session-id", collection="HistoryMessages"
)

chat_history.add_user_message("Hi!")
chat_history.add_ai_message("How can I help you?")
```

```python
chat_history.messages
```

#### Limpieza

Cuando el historial de una sesión específica está obsoleto y se puede eliminar de la base de datos y la memoria, se puede hacer de la siguiente manera.

**Nota:** Una vez eliminados, los datos ya no se almacenan en Firestore y se pierden para siempre.

```python
chat_history.clear()
```

### Cliente Personalizado

El cliente se crea de forma predeterminada utilizando las variables de entorno disponibles. Se puede pasar un [cliente personalizado](https://cloud.google.com/python/docs/reference/firestore/latest/client) al constructor.

```python
from google.auth import compute_engine
from google.cloud import firestore

client = firestore.Client(
    project="project-custom",
    database="non-default-database",
    credentials=compute_engine.Credentials(),
)

history = FirestoreChatMessageHistory(
    session_id="session-id", collection="History", client=client
)

history.add_user_message("New message")

history.messages

history.clear()
```
