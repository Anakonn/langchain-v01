---
translated: true
---

# Google El Carro Oracle

> [Google Cloud El Carro Oracle](https://github.com/GoogleCloudPlatform/elcarro-oracle-operator) ofrece una forma de ejecutar bases de datos `Oracle` en `Kubernetes` como un sistema de orquestación de contenedores portátil, de código abierto, impulsado por la comunidad y sin bloqueo de proveedores. `El Carro` proporciona una poderosa API declarativa para una configuración y implementación completas y coherentes, así como para operaciones y monitoreo en tiempo real. Amplía las capacidades de tu base de datos `Oracle` para construir experiencias impulsadas por IA aprovechando la integración `El Carro` Langchain.

Esta guía explica cómo usar la integración `El Carro` Langchain para almacenar el historial de mensajes de chat con la clase `ElCarroChatMessageHistory`. Esta integración funciona para cualquier base de datos `Oracle`, independientemente de dónde se esté ejecutando.

Más información sobre el paquete en [GitHub](https://github.com/googleapis/langchain-google-el-carro-python/).

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-el-carro-python/blob/main/docs/chat_message_history.ipynb)

## Antes de comenzar

Para ejecutar este cuaderno, deberá hacer lo siguiente:

 * Completar la sección [Primeros pasos](https://github.com/googleapis/langchain-google-el-carro-python/tree/main/README.md#getting-started) si desea ejecutar su base de datos Oracle con El Carro.

### 🦜🔗 Instalación de la biblioteca

La integración se encuentra en su propio paquete `langchain-google-el-carro`, por lo que debemos instalarlo.

```python
%pip install --upgrade --quiet langchain-google-el-carro langchain-google-vertexai langchain
```

**Sólo Colab:** Descomenta la siguiente celda para reiniciar el kernel o usa el botón para reiniciar el kernel. Para Vertex AI Workbench puedes reiniciar el terminal usando el botón de arriba.

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### 🔐 Autenticación

Autentícate en Google Cloud como el usuario IAM conectado a este cuaderno para acceder a tu proyecto de Google Cloud.

* Si estás usando Colab para ejecutar este cuaderno, usa la celda de abajo y continúa.
* Si estás usando Vertex AI Workbench, consulta las instrucciones de configuración [aquí](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env).

```python
# from google.colab import auth

# auth.authenticate_user()
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

## Uso básico

### Configurar la conexión a la base de datos Oracle

Completa la siguiente variable con los detalles de conexión de tu base de datos Oracle.

```python
# @title Set Your Values Here { display-mode: "form" }
HOST = "127.0.0.1"  # @param {type: "string"}
PORT = 3307  # @param {type: "integer"}
DATABASE = "my-database"  # @param {type: "string"}
TABLE_NAME = "message_store"  # @param {type: "string"}
USER = "my-user"  # @param {type: "string"}
PASSWORD = input("Please provide a password to be used for the database user: ")
```

Si estás usando `El Carro`, puedes encontrar los valores de host y puerto en el
estado de la instancia de Kubernetes `El Carro`.
Usa la contraseña de usuario que creaste para tu PDB.
Ejemplo

kubectl get -w instances.oracle.db.anthosapis.com -n db
NAME   DB ENGINE   VERSION   EDITION      ENDPOINT      URL                DB NAMES   BACKUP ID   READYSTATUS   READYREASON        DBREADYSTATUS   DBREADYREASON
mydb   Oracle      18c       Express      mydb-svc.db   34.71.69.25:6021                          False         CreateInProgress

### Grupo de conexiones ElCarroEngine

`ElCarroEngine` configura un grupo de conexiones a tu base de datos Oracle, lo que permite conexiones exitosas desde tu aplicación y siguiendo las mejores prácticas de la industria.

```python
from langchain_google_el_carro import ElCarroEngine

elcarro_engine = ElCarroEngine.from_instance(
    db_host=HOST,
    db_port=PORT,
    db_name=DATABASE,
    db_user=USER,
    db_password=PASSWORD,
)
```

### Inicializar una tabla

La clase `ElCarroChatMessageHistory` requiere una tabla de base de datos con un esquema específico para almacenar el historial de mensajes de chat.

La clase `ElCarroEngine` tiene un
método `init_chat_history_table()` que se puede usar para crear una tabla con el
esquema adecuado para ti.

```python
elcarro_engine.init_chat_history_table(table_name=TABLE_NAME)
```

### ElCarroChatMessageHistory

Para inicializar la clase `ElCarroChatMessageHistory` solo necesitas proporcionar 3
cosas:

1. `elcarro_engine` - Una instancia de un motor `ElCarroEngine`.
1. `session_id` - Una cadena de identificador único que especifica un id para la
   sesión.
1. `table_name` : El nombre de la tabla dentro de la base de datos Oracle para almacenar el
   historial de mensajes de chat.

```python
from langchain_google_el_carro import ElCarroChatMessageHistory

history = ElCarroChatMessageHistory(
    elcarro_engine=elcarro_engine, session_id="test_session", table_name=TABLE_NAME
)
history.add_user_message("hi!")
history.add_ai_message("whats up?")
```

```python
history.messages
```

#### Limpieza

Cuando el historial de una sesión específica está obsoleto y se puede eliminar, se puede hacer de la siguiente manera.

**Nota:** Una vez eliminados, los datos ya no se almacenarán en tu base de datos y se perderán para siempre.

```python
history.clear()
```

## 🔗 Encadenamiento

Podemos combinar fácilmente esta clase de historial de mensajes con [LCEL Runnables](/docs/expression_language/how_to/message_history)

Para hacer esto, usaremos uno de los [modelos de chat de Google Vertex AI](/docs/integrations/chat/google_vertex_ai_palm) que requiere que [habilites la API de Vertex AI](https://console.cloud.google.com/flows/enableapi?apiid=aiplatform.googleapis.com) en tu proyecto de Google Cloud.

```python
# enable Vertex AI API
!gcloud services enable aiplatform.googleapis.com
```

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_google_vertexai import ChatVertexAI
```

```python
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful assistant."),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{question}"),
    ]
)

chain = prompt | ChatVertexAI(project=PROJECT_ID)
```

```python
chain_with_history = RunnableWithMessageHistory(
    chain,
    lambda session_id: ElCarroChatMessageHistory(
        elcarro_engine,
        session_id=session_id,
        table_name=TABLE_NAME,
    ),
    input_messages_key="question",
    history_messages_key="history",
)
```

```python
# This is where we configure the session id
config = {"configurable": {"session_id": "test_session"}}
```

```python
chain_with_history.invoke({"question": "Hi! I'm bob"}, config=config)
```

```python
chain_with_history.invoke({"question": "Whats my name"}, config=config)
```
