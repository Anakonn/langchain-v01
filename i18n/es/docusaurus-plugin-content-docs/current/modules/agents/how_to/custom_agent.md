---
translated: true
---

# Agente personalizado

Este cuaderno explica cómo crear tu propio agente personalizado.

En este ejemplo, utilizaremos OpenAI Tool Calling para crear este agente.
**Esta es generalmente la forma más confiable de crear agentes.**

Primero lo crearemos SIN memoria, pero luego mostraremos cómo agregar memoria.
La memoria es necesaria para habilitar la conversación.

## Cargar el modelo de lenguaje

Primero, carguemos el modelo de lenguaje que vamos a utilizar para controlar el agente.

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
```

## Definir herramientas

A continuación, definamos algunas herramientas para usar.
Escribiremos una función de Python realmente simple para calcular la longitud de una palabra que se pasa como argumento.

Tenga en cuenta que aquí la cadena de documentación de la función que usamos es bastante importante. Lea más sobre por qué es el caso [aquí](/docs/modules/tools/custom_tools)

```python
from langchain.agents import tool


@tool
def get_word_length(word: str) -> int:
    """Returns the length of a word."""
    return len(word)


get_word_length.invoke("abc")
```

```output
3
```

```python
tools = [get_word_length]
```

## Crear el prompt

Ahora creemos el prompt.
Dado que OpenAI Function Calling está entrenado específicamente para el uso de herramientas, apenas necesitamos instrucciones sobre cómo razonar o cómo dar formato a la salida.
Tendremos dos variables de entrada: `input` y `agent_scratchpad`. `input` debe ser una cadena que contenga el objetivo del usuario. `agent_scratchpad` debe ser una secuencia de mensajes que contenga las invocaciones previas de herramientas del agente y las salidas correspondientes.

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are very powerful assistant, but don't know current events",
        ),
        ("user", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ]
)
```

## Vincular herramientas al modelo de lenguaje

¿Cómo sabe el agente qué herramientas puede usar?

En este caso, nos estamos basando en los modelos de llamada de función de OpenAI, que toman las herramientas como un argumento separado y han sido entrenados específicamente para saber cuándo invocar esas herramientas.

Para pasar nuestras herramientas al agente, solo necesitamos darles formato al [formato de herramienta de OpenAI](https://platform.openai.com/docs/api-reference/chat/create) y pasarlas a nuestro modelo. (Al "vincular" las funciones, nos aseguramos de que se pasen cada vez que se invoque el modelo).

```python
llm_with_tools = llm.bind_tools(tools)
```

## Crear el agente

Juntando esas piezas, ahora podemos crear el agente.
Importaremos dos últimas funciones de utilidad: un componente para dar formato a los pasos intermedios (pares de acción del agente y salida de la herramienta) en mensajes de entrada que se pueden enviar al modelo, y un componente para convertir el mensaje de salida en una acción/finalización del agente.

```python
from langchain.agents.format_scratchpad.openai_tools import (
    format_to_openai_tool_messages,
)
from langchain.agents.output_parsers.openai_tools import OpenAIToolsAgentOutputParser

agent = (
    {
        "input": lambda x: x["input"],
        "agent_scratchpad": lambda x: format_to_openai_tool_messages(
            x["intermediate_steps"]
        ),
    }
    | prompt
    | llm_with_tools
    | OpenAIToolsAgentOutputParser()
)
```

```python
from langchain.agents import AgentExecutor

agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

```python
list(agent_executor.stream({"input": "How many letters in the word eudca"}))
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `get_word_length` with `{'word': 'eudca'}`


[0m[36;1m[1;3m5[0m[32;1m[1;3mThere are 5 letters in the word "eudca".[0m

[1m> Finished chain.[0m
```

```output
[{'actions': [OpenAIToolAgentAction(tool='get_word_length', tool_input={'word': 'eudca'}, log="\nInvoking: `get_word_length` with `{'word': 'eudca'}`\n\n\n", message_log=[AIMessageChunk(content='', additional_kwargs={'tool_calls': [{'index': 0, 'id': 'call_A07D5TuyqcNIL0DIEVRPpZkg', 'function': {'arguments': '{\n  "word": "eudca"\n}', 'name': 'get_word_length'}, 'type': 'function'}]})], tool_call_id='call_A07D5TuyqcNIL0DIEVRPpZkg')],
  'messages': [AIMessageChunk(content='', additional_kwargs={'tool_calls': [{'index': 0, 'id': 'call_A07D5TuyqcNIL0DIEVRPpZkg', 'function': {'arguments': '{\n  "word": "eudca"\n}', 'name': 'get_word_length'}, 'type': 'function'}]})]},
 {'steps': [AgentStep(action=OpenAIToolAgentAction(tool='get_word_length', tool_input={'word': 'eudca'}, log="\nInvoking: `get_word_length` with `{'word': 'eudca'}`\n\n\n", message_log=[AIMessageChunk(content='', additional_kwargs={'tool_calls': [{'index': 0, 'id': 'call_A07D5TuyqcNIL0DIEVRPpZkg', 'function': {'arguments': '{\n  "word": "eudca"\n}', 'name': 'get_word_length'}, 'type': 'function'}]})], tool_call_id='call_A07D5TuyqcNIL0DIEVRPpZkg'), observation=5)],
  'messages': [FunctionMessage(content='5', name='get_word_length')]},
 {'output': 'There are 5 letters in the word "eudca".',
  'messages': [AIMessage(content='There are 5 letters in the word "eudca".')]}]
```

Si comparamos esto con el modelo de lenguaje base, podemos ver que el modelo de lenguaje solo tiene dificultades

```python
llm.invoke("How many letters in the word educa")
```

```output
AIMessage(content='There are 6 letters in the word "educa".')
```

## Agregar memoria

¡Esto es genial, tenemos un agente!
Sin embargo, este agente es sin estado, no recuerda nada de las interacciones anteriores.
Esto significa que no puedes hacer preguntas de seguimiento fácilmente.
Arreglemos eso agregando memoria.

Para hacer esto, necesitamos hacer dos cosas:

1. Agregar un lugar para que las variables de memoria vayan en el prompt
2. Hacer un seguimiento del historial de chat

Primero, agreguemos un lugar para la memoria en el prompt.
Hacemos esto agregando un marcador de posición para los mensajes con la clave `"chat_history"`.
Observe que lo colocamos ARRIBA de la nueva entrada del usuario (para seguir el flujo de la conversación).

```python
from langchain_core.prompts import MessagesPlaceholder

MEMORY_KEY = "chat_history"
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are very powerful assistant, but bad at calculating lengths of words.",
        ),
        MessagesPlaceholder(variable_name=MEMORY_KEY),
        ("user", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ]
)
```

Luego, podemos configurar una lista para realizar un seguimiento del historial de chat

```python
from langchain_core.messages import AIMessage, HumanMessage

chat_history = []
```

¡Luego podemos unirlo todo!

```python
agent = (
    {
        "input": lambda x: x["input"],
        "agent_scratchpad": lambda x: format_to_openai_tool_messages(
            x["intermediate_steps"]
        ),
        "chat_history": lambda x: x["chat_history"],
    }
    | prompt
    | llm_with_tools
    | OpenAIToolsAgentOutputParser()
)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

Al ejecutar, ahora necesitamos realizar un seguimiento de las entradas y salidas como historial de chat

```python
input1 = "how many letters in the word educa?"
result = agent_executor.invoke({"input": input1, "chat_history": chat_history})
chat_history.extend(
    [
        HumanMessage(content=input1),
        AIMessage(content=result["output"]),
    ]
)
agent_executor.invoke({"input": "is that a real word?", "chat_history": chat_history})
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `get_word_length` with `{'word': 'educa'}`


[0m[36;1m[1;3m5[0m[32;1m[1;3mThere are 5 letters in the word "educa".[0m

[1m> Finished chain.[0m


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mNo, "educa" is not a real word in English.[0m

[1m> Finished chain.[0m
```

```output
{'input': 'is that a real word?',
 'chat_history': [HumanMessage(content='how many letters in the word educa?'),
  AIMessage(content='There are 5 letters in the word "educa".')],
 'output': 'No, "educa" is not a real word in English.'}
```
