---
translated: true
---

# Xata

>[Xata](https://xata.io) es una plataforma de datos sin servidor, basada en `PostgreSQL` y `Elasticsearch`. Proporciona un SDK de Python para interactuar con tu base de datos y una interfaz de usuario para gestionar tus datos. Con la clase `XataChatMessageHistory`, puedes usar las bases de datos de Xata para la persistencia a largo plazo de las sesiones de chat.

Este cuaderno cubre:

* Un ejemplo sencillo que muestra lo que hace `XataChatMessageHistory`.
* Un ejemplo más complejo que utiliza un agente REACT que responde a preguntas basadas en una base de conocimientos o documentación (almacenada en Xata como un almacén de vectores) y también tiene un historial de mensajes buscable a largo plazo (almacenado en Xata como un almacén de memoria)

## Configuración

### Crear una base de datos

En la [interfaz de usuario de Xata](https://app.xata.io), crea una nueva base de datos. Puedes ponerle el nombre que quieras, en este cuaderno usaremos `langchain`. La integración de Langchain puede crear automáticamente la tabla utilizada para almacenar la memoria, y es la que usaremos en este ejemplo. Si quieres crear la tabla previamente, asegúrate de que tiene el esquema adecuado y establece `create_table` en `False` al crear la clase. Crear la tabla previamente ahorra un viaje a la base de datos durante cada inicialización de la sesión.

Primero instalemos nuestras dependencias:

```python
%pip install --upgrade --quiet  xata langchain-openai langchain
```

A continuación, necesitamos obtener las variables de entorno para Xata. Puedes crear una nueva clave API visitando la [configuración de tu cuenta](https://app.xata.io/settings). Para encontrar la URL de la base de datos, ve a la página de Configuración de la base de datos que has creado. La URL de la base de datos debería tener este aspecto: `https://demo-uni3q8.eu-west-1.xata.sh/db/langchain`.

```python
import getpass

api_key = getpass.getpass("Xata API key: ")
db_url = input("Xata database URL (copy it from your DB settings):")
```

## Crear un almacén de memoria simple

Para probar la funcionalidad del almacén de memoria de forma aislada, usemos el siguiente fragmento de código:

```python
from langchain_community.chat_message_histories import XataChatMessageHistory

history = XataChatMessageHistory(
    session_id="session-1", api_key=api_key, db_url=db_url, table_name="memory"
)

history.add_user_message("hi!")

history.add_ai_message("whats up?")
```

El código anterior crea una sesión con el ID `session-1` y almacena dos mensajes en ella. Después de ejecutar lo anterior, si visitas la interfaz de usuario de Xata, deberías ver una tabla llamada `memory` y los dos mensajes añadidos a ella.

Puedes recuperar el historial de mensajes de una sesión determinada con el siguiente código:

```python
history.messages
```

## Cadena de preguntas y respuestas conversacionales sobre tus datos con memoria

Ahora veamos un ejemplo más complejo en el que combinamos OpenAI, la integración del Almacén de Vectores de Xata y la integración del almacén de memoria de Xata para crear un chatbot de preguntas y respuestas sobre tus datos, con preguntas de seguimiento y historial.

Necesitaremos acceder a la API de OpenAI, así que configuremos la clave API:

```python
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

Para almacenar los documentos que el chatbot buscará para encontrar respuestas, agrega una tabla llamada `docs` a tu base de datos `langchain` usando la interfaz de usuario de Xata, y agrega las siguientes columnas:

* `content` de tipo "Texto". Se utiliza para almacenar los valores de `Document.pageContent`.
* `embedding` de tipo "Vector". Usa la dimensión utilizada por el modelo que planeas usar. En este cuaderno usamos incrustaciones de OpenAI, que tienen 1536 dimensiones.

Creemos el almacén de vectores y agreguemos algunos documentos de muestra:

```python
from langchain_community.vectorstores.xata import XataVectorStore
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings()

texts = [
    "Xata is a Serverless Data platform based on PostgreSQL",
    "Xata offers a built-in vector type that can be used to store and query vectors",
    "Xata includes similarity search",
]

vector_store = XataVectorStore.from_texts(
    texts, embeddings, api_key=api_key, db_url=db_url, table_name="docs"
)
```

Después de ejecutar el comando anterior, si vas a la interfaz de usuario de Xata, deberías ver los documentos cargados junto con sus incrustaciones en la tabla `docs`.

Ahora creemos un ConversationBufferMemory para almacenar los mensajes de chat tanto del usuario como del AI.

```python
from uuid import uuid4

from langchain.memory import ConversationBufferMemory

chat_memory = XataChatMessageHistory(
    session_id=str(uuid4()),  # needs to be unique per user session
    api_key=api_key,
    db_url=db_url,
    table_name="memory",
)
memory = ConversationBufferMemory(
    memory_key="chat_history", chat_memory=chat_memory, return_messages=True
)
```

Ahora es el momento de crear un Agente que use tanto el almacén de vectores como la memoria de chat juntos.

```python
from langchain.agents import AgentType, initialize_agent
from langchain.agents.agent_toolkits import create_retriever_tool
from langchain_openai import ChatOpenAI

tool = create_retriever_tool(
    vector_store.as_retriever(),
    "search_docs",
    "Searches and returns documents from the Xata manual. Useful when you need to answer questions about Xata.",
)
tools = [tool]

llm = ChatOpenAI(temperature=0)

agent = initialize_agent(
    tools,
    llm,
    agent=AgentType.CHAT_CONVERSATIONAL_REACT_DESCRIPTION,
    verbose=True,
    memory=memory,
)
```

Para probar, digámosle al agente nuestro nombre:

```python
agent.run(input="My name is bob")
```

Ahora, preguntémosle al agente algunas cosas sobre Xata:

```python
agent.run(input="What is xata?")
```

Observa que responde en función de los datos almacenados en el almacén de documentos. Y ahora, hagámosle una pregunta de seguimiento:

```python
agent.run(input="Does it support similarity search?")
```

Y ahora probemos su memoria:

```python
agent.run(input="Did I tell you my name? What is it?")
```
