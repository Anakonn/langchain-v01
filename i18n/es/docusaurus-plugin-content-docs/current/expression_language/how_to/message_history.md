---
translated: true
---

# Agregar historial de mensajes (memoria)

El `RunnableWithMessageHistory` nos permite agregar historial de mensajes a ciertos tipos de cadenas. Envuelve otro Runnable y administra el historial de mensajes de chat para él.

Específicamente, se puede usar para cualquier Runnable que tome como entrada uno de los siguientes:

* una secuencia de `BaseMessage`
* un diccionario con una clave que tome una secuencia de `BaseMessage`
* un diccionario con una clave que tome el(los) último(s) mensaje(s) como una cadena o secuencia de `BaseMessage`, y una clave separada que tome mensajes históricos

Y devuelve como salida uno de los siguientes:

* una cadena que se puede tratar como el contenido de un `AIMessage`
* una secuencia de `BaseMessage`
* un diccionario con una clave que contenga una secuencia de `BaseMessage`

Veamos algunos ejemplos para ver cómo funciona. Primero construimos un runnable (que aquí acepta un diccionario como entrada y devuelve un mensaje como salida):

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_openai.chat_models import ChatOpenAI

model = ChatOpenAI()
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You're an assistant who's good at {ability}. Respond in 20 words or fewer",
        ),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{input}"),
    ]
)
runnable = prompt | model
```

Para administrar el historial de mensajes, necesitaremos:
1. Este runnable;
2. Un callable que devuelva una instancia de `BaseChatMessageHistory`.

Consulta la página de [integraciones de memoria](https://integrations.langchain.com/memory) para ver implementaciones de historiales de mensajes de chat utilizando Redis y otros proveedores. Aquí demostramos el uso de un `ChatMessageHistory` en memoria, así como un almacenamiento más persistente utilizando `RedisChatMessageHistory`.

## En memoria

A continuación, mostramos un ejemplo sencillo en el que el historial de chat se encuentra en memoria, en este caso a través de un diccionario global de Python.

Construimos un callable `get_session_history` que hace referencia a este diccionario para devolver una instancia de `ChatMessageHistory`. Los argumentos para el callable se pueden especificar pasando una configuración a `RunnableWithMessageHistory` en tiempo de ejecución. De forma predeterminada, se espera que el parámetro de configuración sea una sola cadena `session_id`. Esto se puede ajustar a través del argumento `history_factory_config`.

Usando el valor predeterminado de un solo parámetro:

```python
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory

store = {}


def get_session_history(session_id: str) -> BaseChatMessageHistory:
    if session_id not in store:
        store[session_id] = ChatMessageHistory()
    return store[session_id]


with_message_history = RunnableWithMessageHistory(
    runnable,
    get_session_history,
    input_messages_key="input",
    history_messages_key="history",
)
```

Tenga en cuenta que hemos especificado `input_messages_key` (la clave que se tratará como el último mensaje de entrada) y `history_messages_key` (la clave para agregar mensajes históricos).

Al invocar este nuevo runnable, especificamos el historial de chat correspondiente a través de un parámetro de configuración:

```python
with_message_history.invoke(
    {"ability": "math", "input": "What does cosine mean?"},
    config={"configurable": {"session_id": "abc123"}},
)
```

```output
AIMessage(content='Cosine is a trigonometric function that calculates the ratio of the adjacent side to the hypotenuse of a right triangle.')
```

```python
# Remembers
with_message_history.invoke(
    {"ability": "math", "input": "What?"},
    config={"configurable": {"session_id": "abc123"}},
)
```

```output
AIMessage(content='Cosine is a mathematical function used to calculate the length of a side in a right triangle.')
```

```python
# New session_id --> does not remember.
with_message_history.invoke(
    {"ability": "math", "input": "What?"},
    config={"configurable": {"session_id": "def234"}},
)
```

```output
AIMessage(content='I can help with math problems. What do you need assistance with?')
```

Los parámetros de configuración por los cuales se realizan el seguimiento de los historiales de mensajes se pueden personalizar pasando una lista de objetos `ConfigurableFieldSpec` al parámetro `history_factory_config`. A continuación, usamos dos parámetros: `user_id` y `conversation_id`.

```python
from langchain_core.runnables import ConfigurableFieldSpec

store = {}


def get_session_history(user_id: str, conversation_id: str) -> BaseChatMessageHistory:
    if (user_id, conversation_id) not in store:
        store[(user_id, conversation_id)] = ChatMessageHistory()
    return store[(user_id, conversation_id)]


with_message_history = RunnableWithMessageHistory(
    runnable,
    get_session_history,
    input_messages_key="input",
    history_messages_key="history",
    history_factory_config=[
        ConfigurableFieldSpec(
            id="user_id",
            annotation=str,
            name="User ID",
            description="Unique identifier for the user.",
            default="",
            is_shared=True,
        ),
        ConfigurableFieldSpec(
            id="conversation_id",
            annotation=str,
            name="Conversation ID",
            description="Unique identifier for the conversation.",
            default="",
            is_shared=True,
        ),
    ],
)
```

```python
with_message_history.invoke(
    {"ability": "math", "input": "Hello"},
    config={"configurable": {"user_id": "123", "conversation_id": "1"}},
)
```

### Ejemplos con runnables de diferentes firmas

El runnable anterior toma un diccionario como entrada y devuelve un BaseMessage. A continuación, mostramos algunas alternativas.

#### Mensajes de entrada, diccionario de salida

```python
from langchain_core.messages import HumanMessage
from langchain_core.runnables import RunnableParallel

chain = RunnableParallel({"output_message": ChatOpenAI()})


def get_session_history(session_id: str) -> BaseChatMessageHistory:
    if session_id not in store:
        store[session_id] = ChatMessageHistory()
    return store[session_id]


with_message_history = RunnableWithMessageHistory(
    chain,
    get_session_history,
    output_messages_key="output_message",
)

with_message_history.invoke(
    [HumanMessage(content="What did Simone de Beauvoir believe about free will")],
    config={"configurable": {"session_id": "baz"}},
)
```

```output
{'output_message': AIMessage(content="Simone de Beauvoir believed in the existence of free will. She argued that individuals have the ability to make choices and determine their own actions, even in the face of social and cultural constraints. She rejected the idea that individuals are purely products of their environment or predetermined by biology or destiny. Instead, she emphasized the importance of personal responsibility and the need for individuals to actively engage in creating their own lives and defining their own existence. De Beauvoir believed that freedom and agency come from recognizing one's own freedom and actively exercising it in the pursuit of personal and collective liberation.")}
```

```python
with_message_history.invoke(
    [HumanMessage(content="How did this compare to Sartre")],
    config={"configurable": {"session_id": "baz"}},
)
```

```output
{'output_message': AIMessage(content='Simone de Beauvoir\'s views on free will were closely aligned with those of her contemporary and partner Jean-Paul Sartre. Both de Beauvoir and Sartre were existentialist philosophers who emphasized the importance of individual freedom and the rejection of determinism. They believed that human beings have the capacity to transcend their circumstances and create their own meaning and values.\n\nSartre, in his famous work "Being and Nothingness," argued that human beings are condemned to be free, meaning that we are burdened with the responsibility of making choices and defining ourselves in a world that lacks inherent meaning. Like de Beauvoir, Sartre believed that individuals have the ability to exercise their freedom and make choices in the face of external and internal constraints.\n\nWhile there may be some nuanced differences in their philosophical writings, overall, de Beauvoir and Sartre shared a similar belief in the existence of free will and the importance of individual agency in shaping one\'s own life.')}
```

#### Mensajes de entrada, mensajes de salida

```python
RunnableWithMessageHistory(
    ChatOpenAI(),
    get_session_history,
)
```

#### Diccionario con una sola clave para todos los mensajes de entrada, mensajes de salida

```python
from operator import itemgetter

RunnableWithMessageHistory(
    itemgetter("input_messages") | ChatOpenAI(),
    get_session_history,
    input_messages_key="input_messages",
)
```

## Almacenamiento persistente

En muchos casos, es preferible persistir los historiales de conversaciones. `RunnableWithMessageHistory` es agnóstico en cuanto a cómo el callable `get_session_history` recupera sus historiales de mensajes de chat. Consulta [aquí](https://github.com/langchain-ai/langserve/blob/main/examples/chat_with_persistence_and_user/server.py) un ejemplo que usa un sistema de archivos local. A continuación, demostramos cómo se podría usar Redis. Consulta la página de [integraciones de memoria](https://integrations.langchain.com/memory) para ver implementaciones de historiales de mensajes de chat utilizando otros proveedores.

### Configuración

Necesitaremos instalar Redis si aún no está instalado:

```python
%pip install --upgrade --quiet redis
```

Inicia un servidor local de Redis Stack si no tenemos un despliegue de Redis existente al que conectarnos:

```bash
docker run -d -p 6379:6379 -p 8001:8001 redis/redis-stack:latest
```

```python
REDIS_URL = "redis://localhost:6379/0"
```

### [LangSmith](/docs/langsmith)

LangSmith es especialmente útil para algo como la inyección de historial de mensajes, donde puede ser difícil entender de otra manera cuáles son las entradas a varias partes de la cadena.

Tenga en cuenta que LangSmith no es necesario, pero es útil.
Si desea usar LangSmith, después de registrarse en el enlace anterior, asegúrese de descomentar lo siguiente y establecer sus variables de entorno para comenzar a registrar rastros:

```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

Actualizar la implementación del historial de mensajes solo requiere que definamos un nuevo callable, esta vez devolviendo una instancia de `RedisChatMessageHistory`:

```python
from langchain_community.chat_message_histories import RedisChatMessageHistory


def get_message_history(session_id: str) -> RedisChatMessageHistory:
    return RedisChatMessageHistory(session_id, url=REDIS_URL)


with_message_history = RunnableWithMessageHistory(
    runnable,
    get_message_history,
    input_messages_key="input",
    history_messages_key="history",
)
```

Podemos invocar como antes:

```python
with_message_history.invoke(
    {"ability": "math", "input": "What does cosine mean?"},
    config={"configurable": {"session_id": "foobar"}},
)
```

```output
AIMessage(content='Cosine is a trigonometric function that represents the ratio of the adjacent side to the hypotenuse in a right triangle.')
```

```python
with_message_history.invoke(
    {"ability": "math", "input": "What's its inverse"},
    config={"configurable": {"session_id": "foobar"}},
)
```

```output
AIMessage(content='The inverse of cosine is the arccosine function, denoted as acos or cos^-1, which gives the angle corresponding to a given cosine value.')
```

:::tip

[Rastro de Langsmith](https://smith.langchain.com/public/bd73e122-6ec1-48b2-82df-e6483dc9cb63/r)

:::

Al mirar el rastro de Langsmith para la segunda llamada, podemos ver que al construir el mensaje, se ha inyectado una variable "history" que es una lista de dos mensajes (nuestra primera entrada y primera salida).
