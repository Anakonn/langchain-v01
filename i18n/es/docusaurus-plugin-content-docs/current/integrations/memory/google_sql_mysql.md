---
translated: true
---

# Google SQL para MySQL

> [Cloud Cloud SQL](https://cloud.google.com/sql) es un servicio de base de datos relacional totalmente administrado que ofrece alto rendimiento, integración sin problemas y una impresionante escalabilidad. Ofrece motores de base de datos `MySQL`, `PostgreSQL` y `SQL Server`. Extienda su aplicación de base de datos para construir experiencias impulsadas por IA aprovechando las integraciones de Langchain de Cloud SQL.

Este cuaderno analiza cómo usar `Google Cloud SQL para MySQL` para almacenar el historial de mensajes de chat con la clase `MySQLChatMessageHistory`.

Más información sobre el paquete en [GitHub](https://github.com/googleapis/langchain-google-cloud-sql-mysql-python/).

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/googleapis/langchain-google-cloud-sql-mysql-python/blob/main/docs/chat_message_history.ipynb)

## Antes de comenzar

Para ejecutar este cuaderno, deberá hacer lo siguiente:

 * [Crear un proyecto de Google Cloud](https://developers.google.com/workspace/guides/create-project)
 * [Habilitar la API de administración de Cloud SQL.](https://console.cloud.google.com/marketplace/product/google/sqladmin.googleapis.com)
 * [Crear una instancia de Cloud SQL para MySQL](https://cloud.google.com/sql/docs/mysql/create-instance)
 * [Crear una base de datos de Cloud SQL](https://cloud.google.com/sql/docs/mysql/create-manage-databases)
 * [Agregar un usuario de base de datos IAM a la base de datos](https://cloud.google.com/sql/docs/mysql/add-manage-iam-users#creating-a-database-user) (Opcional)

### 🦜🔗 Instalación de la biblioteca

La integración se encuentra en su propio paquete `langchain-google-cloud-sql-mysql`, por lo que debemos instalarlo.

```python
%pip install --upgrade --quiet langchain-google-cloud-sql-mysql langchain-google-vertexai
```

**Colab solo:** Descomenta la siguiente celda para reiniciar el kernel o usa el botón para reiniciar el kernel. Para Vertex AI Workbench puedes reiniciar el terminal usando el botón de arriba.

```python
# # Automatically restart kernel after installs so that your environment can access the new packages
# import IPython

# app = IPython.Application.instance()
# app.kernel.do_shutdown(True)
```

### 🔐 Autenticación

Autentíquese en Google Cloud como el usuario IAM conectado a este cuaderno para acceder a su proyecto de Google Cloud.

* Si está usando Colab para ejecutar este cuaderno, use la celda a continuación y continúe.
* Si está usando Vertex AI Workbench, consulte las instrucciones de configuración [aquí](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/setup-env).

```python
from google.colab import auth

auth.authenticate_user()
```

### ☁ Establezca su proyecto de Google Cloud

Establezca su proyecto de Google Cloud para que pueda aprovechar los recursos de Google Cloud dentro de este cuaderno.

Si no conoce su ID de proyecto, intente lo siguiente:

* Ejecute `gcloud config list`.
* Ejecute `gcloud projects list`.
* Consulte la página de soporte: [Ubicar el ID del proyecto](https://support.google.com/googleapi/answer/7014113).

```python
# @markdown Please fill in the value below with your Google Cloud project ID and then run the cell.

PROJECT_ID = "my-project-id"  # @param {type:"string"}

# Set the project id
!gcloud config set project {PROJECT_ID}
```

### 💡 Habilitación de la API

El paquete `langchain-google-cloud-sql-mysql` requiere que [habilite la API de administración de Cloud SQL](https://console.cloud.google.com/flows/enableapi?apiid=sqladmin.googleapis.com) en su proyecto de Google Cloud.

```python
# enable Cloud SQL Admin API
!gcloud services enable sqladmin.googleapis.com
```

## Uso básico

### Establecer los valores de la base de datos de Cloud SQL

Encuentre los valores de su base de datos en la [página de instancias de Cloud SQL](https://console.cloud.google.com/sql?_ga=2.223735448.2062268965.1707700487-2088871159.1707257687).

```python
# @title Set Your Values Here { display-mode: "form" }
REGION = "us-central1"  # @param {type: "string"}
INSTANCE = "my-mysql-instance"  # @param {type: "string"}
DATABASE = "my-database"  # @param {type: "string"}
TABLE_NAME = "message_store"  # @param {type: "string"}
```

### Grupo de conexiones del motor MySQL

Uno de los requisitos y argumentos para establecer Cloud SQL como un almacén de memoria de historial de mensajes de chat es un objeto `MySQLEngine`. El `MySQLEngine` configura un grupo de conexiones a su base de datos de Cloud SQL, lo que permite conexiones exitosas desde su aplicación y sigue las mejores prácticas de la industria.

Para crear un `MySQLEngine` usando `MySQLEngine.from_instance()`, solo necesita proporcionar 4 cosas:

1. `project_id`: ID del proyecto de Google Cloud donde se encuentra la instancia de Cloud SQL.
1. `region`: Región donde se encuentra la instancia de Cloud SQL.
1. `instance`: El nombre de la instancia de Cloud SQL.
1. `database`: El nombre de la base de datos a la que conectarse en la instancia de Cloud SQL.

De forma predeterminada, se utilizará [autenticación de base de datos IAM](https://cloud.google.com/sql/docs/mysql/iam-authentication#iam-db-auth) como el método de autenticación de base de datos. Esta biblioteca usa el principal IAM perteneciente a las [Credenciales predeterminadas de la aplicación (ADC)](https://cloud.google.com/docs/authentication/application-default-credentials) obtenidas del entorno.

Para obtener más información sobre la autenticación de base de datos IAM, consulte:

* [Configurar una instancia para la autenticación de base de datos IAM](https://cloud.google.com/sql/docs/mysql/create-edit-iam-instances)
* [Administrar usuarios con autenticación de base de datos IAM](https://cloud.google.com/sql/docs/mysql/add-manage-iam-users)

Opcionalmente, también se puede usar [autenticación de base de datos integrada](https://cloud.google.com/sql/docs/mysql/built-in-authentication) mediante un nombre de usuario y una contraseña para acceder a la base de datos de Cloud SQL. Simplemente proporcione los argumentos opcionales `user` y `password` a `MySQLEngine.from_instance()`:

* `user`: Usuario de base de datos a usar para la autenticación y el inicio de sesión de la base de datos integrada
* `password`: Contraseña de base de datos a usar para la autenticación y el inicio de sesión de la base de datos integrada.

```python
from langchain_google_cloud_sql_mysql import MySQLEngine

engine = MySQLEngine.from_instance(
    project_id=PROJECT_ID, region=REGION, instance=INSTANCE, database=DATABASE
)
```

### Inicializar una tabla

La clase `MySQLChatMessageHistory` requiere una tabla de base de datos con un esquema específico para almacenar el historial de mensajes de chat.

El motor `MySQLEngine` tiene un método auxiliar `init_chat_history_table()` que se puede usar para crear una tabla con el esquema adecuado.

```python
engine.init_chat_history_table(table_name=TABLE_NAME)
```

### MySQLChatMessageHistory

Para inicializar la clase `MySQLChatMessageHistory`, solo necesita proporcionar 3 cosas:

1. `engine`: Una instancia de un motor `MySQLEngine`.
1. `session_id`: Una cadena de identificador único que especifica un id para la sesión.
1. `table_name`: El nombre de la tabla dentro de la base de datos de Cloud SQL para almacenar el historial de mensajes de chat.

```python
from langchain_google_cloud_sql_mysql import MySQLChatMessageHistory

history = MySQLChatMessageHistory(
    engine, session_id="test_session", table_name=TABLE_NAME
)
history.add_user_message("hi!")
history.add_ai_message("whats up?")
```

```python
history.messages
```

```output
[HumanMessage(content='hi!'), AIMessage(content='whats up?')]
```

#### Limpieza

Cuando el historial de una sesión específica esté obsoleto y se pueda eliminar, se puede hacer de la siguiente manera.

**Nota:** Una vez eliminados, los datos ya no se almacenarán en Cloud SQL y se perderán para siempre.

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
    lambda session_id: MySQLChatMessageHistory(
        engine,
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

```output
AIMessage(content=' Hello Bob, how can I help you today?')
```

```python
chain_with_history.invoke({"question": "Whats my name"}, config=config)
```

```output
AIMessage(content=' Your name is Bob.')
```
