---
translated: true
---

# Gestión de la memoria

Una característica clave de los chatbots es su capacidad de usar el contenido de los turnos de conversación anteriores como contexto. Esta gestión del estado puede adoptar varias formas, incluyendo:

- Simplemente rellenar los mensajes anteriores en el prompt del modelo de chat.
- Lo anterior, pero recortando los mensajes antiguos para reducir la cantidad de información distractora que el modelo tiene que procesar.
- Modificaciones más complejas como la síntesis de resúmenes para conversaciones de larga duración.

¡Profundizaremos en algunas técnicas a continuación!

## Configuración

Deberás instalar algunos paquetes y tener tu clave API de OpenAI establecida como una variable de entorno llamada `OPENAI_API_KEY`:

```python
%pip install --upgrade --quiet langchain langchain-openai

# Set env var OPENAI_API_KEY or load from a .env file:
import dotenv

dotenv.load_dotenv()
```

```output
[33mWARNING: You are using pip version 22.0.4; however, version 23.3.2 is available.
You should consider upgrading via the '/Users/jacoblee/.pyenv/versions/3.10.5/bin/python -m pip install --upgrade pip' command.[0m[33m
[0mNote: you may need to restart the kernel to use updated packages.
```

```output
True
```

Vamos a configurar también un modelo de chat que usaremos para los ejemplos a continuación.

```python
from langchain_openai import ChatOpenAI

chat = ChatOpenAI(model="gpt-3.5-turbo-1106")
```

## Paso de mensajes

La forma más simple de memoria es simplemente pasar los mensajes del historial de chat a una cadena. Aquí hay un ejemplo:

```python
from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful assistant. Answer all questions to the best of your ability.",
        ),
        MessagesPlaceholder(variable_name="messages"),
    ]
)

chain = prompt | chat

chain.invoke(
    {
        "messages": [
            HumanMessage(
                content="Translate this sentence from English to French: I love programming."
            ),
            AIMessage(content="J'adore la programmation."),
            HumanMessage(content="What did you just say?"),
        ],
    }
)
```

```output
AIMessage(content='I said "J\'adore la programmation," which means "I love programming" in French.')
```

Podemos ver que al pasar la conversación anterior a una cadena, puede usarla como contexto para responder preguntas. Este es el concepto básico que sustenta la memoria de los chatbots; el resto de la guía demostrará técnicas convenientes para pasar o reformatear mensajes.

## Historial de chat

Está perfectamente bien almacenar y pasar mensajes directamente como una matriz, pero también podemos usar la clase de historial de mensajes incorporada de LangChain [message history class](/docs/modules/memory/chat_messages/) para almacenar y cargar mensajes. Las instancias de esta clase son responsables de almacenar y cargar mensajes de chat desde un almacenamiento persistente. LangChain se integra con muchos proveedores; puedes ver una [lista de integraciones aquí](/docs/integrations/memory), pero para esta demostración usaremos una clase de demostración efímera.

Aquí hay un ejemplo de la API:

```python
from langchain.memory import ChatMessageHistory

demo_ephemeral_chat_history = ChatMessageHistory()

demo_ephemeral_chat_history.add_user_message(
    "Translate this sentence from English to French: I love programming."
)

demo_ephemeral_chat_history.add_ai_message("J'adore la programmation.")

demo_ephemeral_chat_history.messages
```

```output
[HumanMessage(content='Translate this sentence from English to French: I love programming.'),
 AIMessage(content="J'adore la programmation.")]
```

Podemos usarlo directamente para almacenar los turnos de la conversación para nuestra cadena:

```python
demo_ephemeral_chat_history = ChatMessageHistory()

input1 = "Translate this sentence from English to French: I love programming."

demo_ephemeral_chat_history.add_user_message(input1)

response = chain.invoke(
    {
        "messages": demo_ephemeral_chat_history.messages,
    }
)

demo_ephemeral_chat_history.add_ai_message(response)

input2 = "What did I just ask you?"

demo_ephemeral_chat_history.add_user_message(input2)

chain.invoke(
    {
        "messages": demo_ephemeral_chat_history.messages,
    }
)
```

```output
AIMessage(content='You asked me to translate the sentence "I love programming" from English to French.')
```

## Gestión automática del historial

Los ejemplos anteriores pasan mensajes a la cadena de forma explícita. Este es un enfoque completamente aceptable, pero requiere una gestión externa de los nuevos mensajes. LangChain también incluye un contenedor para las cadenas LCEL que pueden manejar este proceso automáticamente, llamado `RunnableWithMessageHistory`.

Para mostrar cómo funciona, vamos a modificar ligeramente el prompt anterior para que tome una variable `input` final que rellene una plantilla `HumanMessage` después del historial de chat. Esto significa que esperaremos un parámetro `chat_history` que contenga todos los mensajes ANTES del mensaje actual, en lugar de todos los mensajes.

```python
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful assistant. Answer all questions to the best of your ability.",
        ),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}"),
    ]
)

chain = prompt | chat
```

Pasaremos la entrada más reciente a la conversación aquí y dejaremos que la clase `RunnableWithMessageHistory` envuelva nuestra cadena y haga el trabajo de agregar esa variable `input` al historial de chat.

A continuación, declaremos nuestra cadena envuelta:

```python
from langchain_core.runnables.history import RunnableWithMessageHistory

demo_ephemeral_chat_history_for_chain = ChatMessageHistory()

chain_with_message_history = RunnableWithMessageHistory(
    chain,
    lambda session_id: demo_ephemeral_chat_history_for_chain,
    input_messages_key="input",
    history_messages_key="chat_history",
)
```

Esta clase toma algunos parámetros adicionales a la cadena que queremos envolver:

- Una función de fábrica que devuelve un historial de mensajes para un ID de sesión determinado. Esto permite que tu cadena maneje varios usuarios a la vez cargando diferentes mensajes para diferentes conversaciones.
- Una `input_messages_key` que especifica qué parte de la entrada debe rastrearse y almacenarse en el historial de chat. En este ejemplo, queremos rastrear la cadena pasada como `input`.
- Una `history_messages_key` que especifica dónde se deben inyectar los mensajes anteriores en el prompt. Nuestro prompt tiene un `MessagesPlaceholder` llamado `chat_history`, por lo que especificamos esta propiedad para que coincida.
- (Para cadenas con múltiples salidas) una `output_messages_key` que especifica qué salida almacenar como historial. Este es el inverso de `input_messages_key`.

Podemos invocar esta nueva cadena como de costumbre, con un campo `configurable` adicional que especifica el `session_id` particular que se pasará a la función de fábrica. Esto no se usa para la demostración, pero en las cadenas del mundo real, querrás devolver un historial de chat correspondiente a la sesión pasada:

```python
chain_with_message_history.invoke(
    {"input": "Translate this sentence from English to French: I love programming."},
    {"configurable": {"session_id": "unused"}},
)
```

```output
AIMessage(content='The translation of "I love programming" in French is "J\'adore la programmation."')
```

```python
chain_with_message_history.invoke(
    {"input": "What did I just ask you?"}, {"configurable": {"session_id": "unused"}}
)
```

```output
AIMessage(content='You just asked me to translate the sentence "I love programming" from English to French.')
```

## Modificar el historial de chat

Modificar los mensajes de chat almacenados puede ayudar a tu chatbot a manejar una variedad de situaciones. Aquí hay algunos ejemplos:

### Recorte de mensajes

Los LLM y los modelos de chat tienen ventanas de contexto limitadas, y aunque no esté alcanzando los límites directamente, es posible que desee limitar la cantidad de distracción que el modelo debe procesar. Una solución es cargar y almacenar solo los `n` mensajes más recientes. Usemos un ejemplo de historial con algunos mensajes precargados:

```python
demo_ephemeral_chat_history = ChatMessageHistory()

demo_ephemeral_chat_history.add_user_message("Hey there! I'm Nemo.")
demo_ephemeral_chat_history.add_ai_message("Hello!")
demo_ephemeral_chat_history.add_user_message("How are you today?")
demo_ephemeral_chat_history.add_ai_message("Fine thanks!")

demo_ephemeral_chat_history.messages
```

```output
[HumanMessage(content="Hey there! I'm Nemo."),
 AIMessage(content='Hello!'),
 HumanMessage(content='How are you today?'),
 AIMessage(content='Fine thanks!')]
```

Usemos este historial de mensajes con la cadena `RunnableWithMessageHistory` que declaramos anteriormente:

```python
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful assistant. Answer all questions to the best of your ability.",
        ),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}"),
    ]
)

chain = prompt | chat

chain_with_message_history = RunnableWithMessageHistory(
    chain,
    lambda session_id: demo_ephemeral_chat_history,
    input_messages_key="input",
    history_messages_key="chat_history",
)

chain_with_message_history.invoke(
    {"input": "What's my name?"},
    {"configurable": {"session_id": "unused"}},
)
```

```output
AIMessage(content='Your name is Nemo.')
```

Podemos ver que la cadena recuerda el nombre precargado.

Pero supongamos que tenemos una ventana de contexto muy pequeña y queremos recortar el número de mensajes que se pasan a la cadena, dejando solo los 2 más recientes. Podemos usar el método `clear` para eliminar mensajes y volver a agregarlos al historial. No tenemos que hacerlo, pero vamos a colocar este método al principio de nuestra cadena para asegurarnos de que siempre se llame:

```python
from langchain_core.runnables import RunnablePassthrough


def trim_messages(chain_input):
    stored_messages = demo_ephemeral_chat_history.messages
    if len(stored_messages) <= 2:
        return False

    demo_ephemeral_chat_history.clear()

    for message in stored_messages[-2:]:
        demo_ephemeral_chat_history.add_message(message)

    return True


chain_with_trimming = (
    RunnablePassthrough.assign(messages_trimmed=trim_messages)
    | chain_with_message_history
)
```

Llamemos a esta nueva cadena y revisemos los mensajes después:

```python
chain_with_trimming.invoke(
    {"input": "Where does P. Sherman live?"},
    {"configurable": {"session_id": "unused"}},
)
```

```output
AIMessage(content="P. Sherman's address is 42 Wallaby Way, Sydney.")
```

```python
demo_ephemeral_chat_history.messages
```

```output
[HumanMessage(content="What's my name?"),
 AIMessage(content='Your name is Nemo.'),
 HumanMessage(content='Where does P. Sherman live?'),
 AIMessage(content="P. Sherman's address is 42 Wallaby Way, Sydney.")]
```

Y podemos ver que nuestro historial ha eliminado los dos mensajes más antiguos, pero aún agrega la conversación más reciente al final. La próxima vez que se llame a la cadena, se llamará a `trim_messages` nuevamente, y solo se pasarán los dos mensajes más recientes al modelo. En este caso, esto significa que el modelo olvidará el nombre que le dimos la próxima vez que lo invoquemos:

```python
chain_with_trimming.invoke(
    {"input": "What is my name?"},
    {"configurable": {"session_id": "unused"}},
)
```

```output
AIMessage(content="I'm sorry, I don't have access to your personal information.")
```

```python
demo_ephemeral_chat_history.messages
```

```output
[HumanMessage(content='Where does P. Sherman live?'),
 AIMessage(content="P. Sherman's address is 42 Wallaby Way, Sydney."),
 HumanMessage(content='What is my name?'),
 AIMessage(content="I'm sorry, I don't have access to your personal information.")]
```

### Resumen de memoria

También podemos usar este mismo patrón de otras maneras. Por ejemplo, podríamos usar una llamada adicional a LLM para generar un resumen de la conversación antes de llamar a nuestra cadena. Volvamos a crear nuestro historial de chat y la cadena de chatbot:

```python
demo_ephemeral_chat_history = ChatMessageHistory()

demo_ephemeral_chat_history.add_user_message("Hey there! I'm Nemo.")
demo_ephemeral_chat_history.add_ai_message("Hello!")
demo_ephemeral_chat_history.add_user_message("How are you today?")
demo_ephemeral_chat_history.add_ai_message("Fine thanks!")

demo_ephemeral_chat_history.messages
```

```output
[HumanMessage(content="Hey there! I'm Nemo."),
 AIMessage(content='Hello!'),
 HumanMessage(content='How are you today?'),
 AIMessage(content='Fine thanks!')]
```

Modificaremos ligeramente el mensaje para que el LLM sepa que recibirá un resumen condensado en lugar de un historial de chat:

```python
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful assistant. Answer all questions to the best of your ability. The provided chat history includes facts about the user you are speaking with.",
        ),
        MessagesPlaceholder(variable_name="chat_history"),
        ("user", "{input}"),
    ]
)

chain = prompt | chat

chain_with_message_history = RunnableWithMessageHistory(
    chain,
    lambda session_id: demo_ephemeral_chat_history,
    input_messages_key="input",
    history_messages_key="chat_history",
)
```

Y ahora, creemos una función que destile las interacciones anteriores en un resumen. También podemos agregar esta a la parte delantera de la cadena:

```python
def summarize_messages(chain_input):
    stored_messages = demo_ephemeral_chat_history.messages
    if len(stored_messages) == 0:
        return False
    summarization_prompt = ChatPromptTemplate.from_messages(
        [
            MessagesPlaceholder(variable_name="chat_history"),
            (
                "user",
                "Distill the above chat messages into a single summary message. Include as many specific details as you can.",
            ),
        ]
    )
    summarization_chain = summarization_prompt | chat

    summary_message = summarization_chain.invoke({"chat_history": stored_messages})

    demo_ephemeral_chat_history.clear()

    demo_ephemeral_chat_history.add_message(summary_message)

    return True


chain_with_summarization = (
    RunnablePassthrough.assign(messages_summarized=summarize_messages)
    | chain_with_message_history
)
```

Veamos si recuerda el nombre que le dimos:

```python
chain_with_summarization.invoke(
    {"input": "What did I say my name was?"},
    {"configurable": {"session_id": "unused"}},
)
```

```output
AIMessage(content='You introduced yourself as Nemo. How can I assist you today, Nemo?')
```

```python
demo_ephemeral_chat_history.messages
```

```output
[AIMessage(content='The conversation is between Nemo and an AI. Nemo introduces himself and the AI responds with a greeting. Nemo then asks the AI how it is doing, and the AI responds that it is fine.'),
 HumanMessage(content='What did I say my name was?'),
 AIMessage(content='You introduced yourself as Nemo. How can I assist you today, Nemo?')]
```

Tenga en cuenta que invocar la cadena nuevamente generará otro resumen generado a partir del resumen inicial más los nuevos mensajes y así sucesivamente. También podrías diseñar un enfoque híbrido donde se conserve un cierto número de mensajes en el historial de chat mientras que otros se resumen.
