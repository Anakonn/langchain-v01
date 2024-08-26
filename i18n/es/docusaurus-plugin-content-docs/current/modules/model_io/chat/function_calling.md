---
sidebar_position: 2
title: Llamada de herramientas/funciones
translated: true
---

# Llamada de herramientas

:::info
Usamos el término "llamada de herramientas" indistintamente con "llamada de funciones". Aunque
a veces se refiere a invocaciones de una sola función, tratamos todos los modelos como si pudieran devolver múltiples llamadas de herramientas o funciones en cada mensaje.
:::

:::tip
Vea [aquí](/docs/integrations/chat/) para una lista de todos los modelos que soportan la llamada de herramientas.
:::

La llamada de herramientas permite que un modelo responda a un prompt dado generando una salida que
coincida con un esquema definido por el usuario. Aunque el nombre implica que el modelo está realizando
alguna acción, ¡esto no es realmente el caso! El modelo está ideando los
argumentos para una herramienta, y ejecutar la herramienta (o no) depende del usuario -
por ejemplo, si deseas [extraer una salida que coincida con algún esquema](/docs/use_cases/extraction/)
de texto no estructurado, podrías darle al modelo una herramienta de "extracción" que tome
parámetros que coincidan con el esquema deseado, y luego tratar la salida generada como tu resultado final.

Una llamada de herramienta incluye un nombre, un diccionario de argumentos y un identificador opcional. El
diccionario de argumentos está estructurado `{nombre_argumento: valor_argumento}`.

Muchos proveedores de LLM, incluyendo [Anthropic](https://www.anthropic.com/),
[Cohere](https://cohere.com/), [Google](https://cloud.google.com/vertex-ai),
[Mistral](https://mistral.ai/), [OpenAI](https://openai.com/), y otros,
soportan variantes de una característica de llamada de herramientas. Estas características típicamente permiten que las solicitudes
al LLM incluyan herramientas disponibles y sus esquemas, y que las respuestas incluyan
llamadas a estas herramientas. Por ejemplo, dada una herramienta de motor de búsqueda, un LLM podría manejar una
consulta emitiendo primero una llamada al motor de búsqueda. El sistema que llama al LLM puede
recibir la llamada de herramienta, ejecutarla y devolver la salida al LLM para informar su
respuesta. LangChain incluye una suite de [herramientas integradas](/docs/integrations/tools/)
y soporta varios métodos para definir tus propias [herramientas personalizadas](/docs/modules/tools/custom_tools).
La llamada de herramientas es extremadamente útil para construir [cadenas y agentes que usan herramientas](/docs/use_cases/tool_use),
y para obtener salidas estructuradas de los modelos en general.

Los proveedores adoptan diferentes convenciones para formatear esquemas de herramientas y llamadas de herramientas.
Por ejemplo, Anthropic devuelve llamadas de herramientas como estructuras analizadas dentro de un bloque de contenido más grande:

```python
[
  {
    "text": "<thinking>\nI should use a tool.\n</thinking>",
    "type": "text"
  },
  {
    "id": "id_value",
    "input": {"arg_name": "arg_value"},
    "name": "tool_name",
    "type": "tool_use"
  }
]
```

mientras que OpenAI separa las llamadas de herramientas en un parámetro distinto, con argumentos como cadenas JSON:

```python
{
  "tool_calls": [
    {
      "id": "id_value",
      "function": {
        "arguments": '{"arg_name": "arg_value"}',
        "name": "tool_name"
      },
      "type": "function"
    }
  ]
}
```

LangChain implementa interfaces estándar para definir herramientas, pasarlas a LLMs,
y representar llamadas de herramientas.

## Solicitud: Pasar herramientas al modelo

Para que un modelo pueda invocar herramientas, necesitas pasarle los esquemas de herramientas al hacer una solicitud de chat.
Los ChatModels de LangChain que soportan características de llamada de herramientas implementan un método `.bind_tools`, que
recibe una lista de [objetos herramienta](https://api.python.langchain.com/en/latest/tools/langchain_core.tools.BaseTool.html#langchain_core.tools.BaseTool) de LangChain, clases Pydantic, o Esquemas JSON y los vincula al modelo de chat en el formato esperado específico del proveedor. Las invocaciones subsiguientes del
modelo de chat vinculado incluirán esquemas de herramientas en cada llamada a la API del modelo.

### Definiendo esquemas de herramientas: Herramienta LangChain

Por ejemplo, podemos definir el esquema para herramientas personalizadas usando el decorador `@tool`
en funciones Python:

```python
from langchain_core.tools import tool


@tool
def add(a: int, b: int) -> int:
    """Adds a and b.

    Args:
        a: first int
        b: second int
    """
    return a + b


@tool
def multiply(a: int, b: int) -> int:
    """Multiplies a and b.

    Args:
        a: first int
        b: second int
    """
    return a * b


tools = [add, multiply]
```

### Definiendo esquemas de herramientas: Clase Pydantic

Podemos definir el esquema de manera equivalente usando Pydantic. Pydantic es útil cuando las entradas de tu herramienta son más complejas:

```python
from langchain_core.pydantic_v1 import BaseModel, Field


# Note that the docstrings here are crucial, as they will be passed along
# to the model along with the class name.
class add(BaseModel):
    """Add two integers together."""

    a: int = Field(..., description="First integer")
    b: int = Field(..., description="Second integer")


class multiply(BaseModel):
    """Multiply two integers together."""

    a: int = Field(..., description="First integer")
    b: int = Field(..., description="Second integer")


tools = [add, multiply]
```

Podemos vincularlos a modelos de chat de la siguiente manera:

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs
  customVarName="llm"
  fireworksParams={`model="accounts/fireworks/models/firefunction-v1", temperature=0`}
/>

### Vinculando esquemas de herramientas

Podemos usar el método `bind_tools()` para manejar la conversión
de `Multiply` a una "herramienta" y vincularla al modelo (es decir,
pasándola cada vez que se invoque el modelo).

```python
# | echo: false
# | output: false

from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
```

```python
llm_with_tools = llm.bind_tools(tools)
```

## Solicitud: Forzar una llamada de herramienta

Cuando solo usas `bind_tools(tools)`, el modelo puede elegir si devolver una llamada de herramienta, múltiples llamadas de herramientas o ninguna llamada de herramienta en absoluto. Algunos modelos soportan un parámetro `tool_choice` que te da cierta capacidad para forzar que el modelo llame a una herramienta. Para los modelos que soportan esto, puedes pasar el nombre de la herramienta que quieres que el modelo llame siempre `tool_choice="xyz_tool_name"`. O puedes pasar `tool_choice="any"` para forzar que el modelo llame al menos a una herramienta, sin especificar cuál herramienta específicamente.

:::note
Actualmente la funcionalidad `tool_choice="any"` es soportada por OpenAI, MistralAI, FireworksAI, y Groq.

Actualmente Anthropic no soporta `tool_choice` en absoluto.
:::

Si quisiéramos que nuestro modelo siempre llame a la herramienta de multiplicación, podríamos hacer:

```python
always_multiply_llm = llm.bind_tools([multiply], tool_choice="multiply")
```

Y si quisiéramos que siempre llame al menos a una de sumar o multiplicar, podríamos hacer:

```python
always_call_tool_llm = llm.bind_tools([add, multiply], tool_choice="any")
```

## Respuesta: Leer llamadas de herramientas de la salida del modelo

Si las llamadas de herramientas están incluidas en una respuesta del LLM, están adjuntas al correspondiente
[AIMessage](https://api.python.langchain.com/en/latest/messages/langchain_core.messages.ai.AIMessage.html#langchain_core.messages.ai.AIMessage)
o [AIMessageChunk](https://api.python.langchain.com/en/latest/messages/langchain_core.messages.ai.AIMessageChunk.html#langchain_core.messages.ai.AIMessageChunk) (cuando se hace streaming)
como una lista de [ToolCall](https://api.python.langchain.com/en/latest/messages/langchain_core.messages.tool.ToolCall.html#langchain_core.messages.tool.ToolCall)
objetos en el atributo `.tool_calls`. Un `ToolCall` es un diccionario tipado que incluye un
nombre de herramienta, un diccionario de valores de argumentos y (opcionalmente) un identificador. Los mensajes sin
llamadas de herramientas tienen por defecto una lista vacía para este atributo.

Ejemplo:

```python
query = "What is 3 * 12? Also, what is 11 + 49?"

llm_with_tools.invoke(query).tool_calls
```

```output
[{'name': 'multiply',
  'args': {'a': 3, 'b': 12},
  'id': 'call_UL7E2232GfDHIQGOM4gJfEDD'},
 {'name': 'add',
  'args': {'a': 11, 'b': 49},
  'id': 'call_VKw8t5tpAuzvbHgdAXe9mjUx'}]
```

El atributo `.tool_calls` debe contener llamadas de herramientas válidas. Ten en cuenta que en ocasiones,
los proveedores de modelos pueden devolver llamadas de herramientas malformadas (por ejemplo, argumentos que no son
JSON válidos). Cuando el análisis falla en estos casos, instancias
de [InvalidToolCall](https://api.python.langchain.com/en/latest/messages/langchain_core.messages.tool.InvalidToolCall.html#langchain_core.messages.tool.InvalidToolCall)
se rellenan en el atributo `.invalid_tool_calls`. Un `InvalidToolCall` puede tener
un nombre, argumentos en cadena, identificador y mensaje de error.

Si se desea, los [parsers de salida](/docs/modules/model_io/output_parsers) pueden
procesar más la salida. Por ejemplo, podemos convertir de nuevo a la clase Pydantic original:

```python
from langchain_core.output_parsers.openai_tools import PydanticToolsParser

chain = llm_with_tools | PydanticToolsParser(tools=[multiply, add])
chain.invoke(query)
```

```output
[multiply(a=3, b=12), add(a=11, b=49)]
```

## Respuesta: Streaming

Cuando se llaman herramientas en un contexto de streaming,
[message chunks](https://api.python.langchain.com/en/latest/messages/langchain_core.messages.ai.AIMessageChunk.html#langchain_core.messages.ai.AIMessageChunk)
se llenarán con [tool call chunk](https://api.python.langchain.com/en/latest/messages/langchain_core.messages.tool.ToolCallChunk.html#langchain_core.messages.tool.ToolCallChunk)
objetos en una lista a través del atributo `.tool_call_chunks`. Un `ToolCallChunk` incluye
campos de cadena opcionales para el `nombre` de la herramienta, `args` y `id`, e incluye un
campo entero opcional `index` que se puede usar para unir fragmentos. Los campos son opcionales
porque partes de una llamada de herramienta pueden ser transmitidas a través de diferentes fragmentos (por ejemplo, un fragmento
que incluye una subcadena de los argumentos puede tener valores nulos para el nombre y el id de la herramienta).

Debido a que los fragmentos de mensaje heredan de su clase de mensaje principal, un
[AIMessageChunk](https://api.python.langchain.com/en/latest/messages/langchain_core.messages.ai.AIMessageChunk.html#langchain_core.messages.ai.AIMessageChunk)
con fragmentos de llamada de herramientas también incluirá los campos `.tool_calls` y `.invalid_tool_calls`.
Estos campos se analizan con el mejor esfuerzo a partir de los fragmentos de llamada de herramientas del mensaje.

Ten en cuenta que no todos los proveedores soportan actualmente streaming para llamadas de herramientas.

Ejemplo:

```python
async for chunk in llm_with_tools.astream(query):
    print(chunk.tool_call_chunks)
```

```output
[]
[{'name': 'multiply', 'args': '', 'id': 'call_5Gdgx3R2z97qIycWKixgD2OU', 'index': 0}]
[{'name': None, 'args': '{"a"', 'id': None, 'index': 0}]
[{'name': None, 'args': ': 3, ', 'id': None, 'index': 0}]
[{'name': None, 'args': '"b": 1', 'id': None, 'index': 0}]
[{'name': None, 'args': '2}', 'id': None, 'index': 0}]
[{'name': 'add', 'args': '', 'id': 'call_DpeKaF8pUCmLP0tkinhdmBgD', 'index': 1}]
[{'name': None, 'args': '{"a"', 'id': None, 'index': 1}]
[{'name': None, 'args': ': 11,', 'id': None, 'index': 1}]
[{'name': None, 'args': ' "b": ', 'id': None, 'index': 1}]
[{'name': None, 'args': '49}', 'id': None, 'index': 1}]
[]
```

Ten en cuenta que agregar fragmentos de mensaje fusionará sus correspondientes fragmentos de llamada de herramientas. Este es el principio por el cual los diversos [parsers de salida de herramientas](/docs/modules/model_io/output_parsers/types/openai_tools/) de LangChain soportan streaming.

Por ejemplo, a continuación acumulamos fragmentos de llamada de herramientas:

```python
first = True
async for chunk in llm_with_tools.astream(query):
    if first:
        gathered = chunk
        first = False
    else:
        gathered = gathered + chunk

    print(gathered.tool_call_chunks)
```

```output
[]
[{'name': 'multiply', 'args': '', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}]
[{'name': 'multiply', 'args': '{"a"', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}]
[{'name': 'multiply', 'args': '{"a": 3, ', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}]
[{'name': 'multiply', 'args': '{"a": 3, "b": 1', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}]
[{'name': 'multiply', 'args': '{"a": 3, "b": 12}', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}]
[{'name': 'multiply', 'args': '{"a": 3, "b": 12}', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}, {'name': 'add', 'args': '', 'id': 'call_GERgANDUbRqdtmXRbIAS9JTS', 'index': 1}]
[{'name': 'multiply', 'args': '{"a": 3, "b": 12}', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}, {'name': 'add', 'args': '{"a"', 'id': 'call_GERgANDUbRqdtmXRbIAS9JTS', 'index': 1}]
[{'name': 'multiply', 'args': '{"a": 3, "b": 12}', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}, {'name': 'add', 'args': '{"a": 11,', 'id': 'call_GERgANDUbRqdtmXRbIAS9JTS', 'index': 1}]
[{'name': 'multiply', 'args': '{"a": 3, "b": 12}', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}, {'name': 'add', 'args': '{"a": 11, "b": ', 'id': 'call_GERgANDUbRqdtmXRbIAS9JTS', 'index': 1}]
[{'name': 'multiply', 'args': '{"a": 3, "b": 12}', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}, {'name': 'add', 'args': '{"a": 11, "b": 49}', 'id': 'call_GERgANDUbRqdtmXRbIAS9JTS', 'index': 1}]
[{'name': 'multiply', 'args': '{"a": 3, "b": 12}', 'id': 'call_hXqj6HxzACkpiPG4hFFuIKuP', 'index': 0}, {'name': 'add', 'args': '{"a": 11, "b": 49}', 'id': 'call_GERgANDUbRqdtmXRbIAS9JTS', 'index': 1}]
```

```python
print(type(gathered.tool_call_chunks[0]["args"]))
```

```output
<class 'str'>
```

Y a continuación acumulamos llamadas de herramientas para demostrar el análisis parcial:

```python
first = True
async for chunk in llm_with_tools.astream(query):
    if first:
        gathered = chunk
        first = False
    else:
        gathered = gathered + chunk

    print(gathered.tool_calls)
```

```output
[]
[]
[{'name': 'multiply', 'args': {}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}]
[{'name': 'multiply', 'args': {'a': 3}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}]
[{'name': 'multiply', 'args': {'a': 3, 'b': 1}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}]
[{'name': 'multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}]
[{'name': 'multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}]
[{'name': 'multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}, {'name': 'add', 'args': {}, 'id': 'call_P39VunIrq9MQOxHgF30VByuB'}]
[{'name': 'multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}, {'name': 'add', 'args': {'a': 11}, 'id': 'call_P39VunIrq9MQOxHgF30VByuB'}]
[{'name': 'multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}, {'name': 'add', 'args': {'a': 11}, 'id': 'call_P39VunIrq9MQOxHgF30VByuB'}]
[{'name': 'multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}, {'name': 'add', 'args': {'a': 11, 'b': 49}, 'id': 'call_P39VunIrq9MQOxHgF30VByuB'}]
[{'name': 'multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_aXQdLhKJpEpUxTNPXIS4l7Mv'}, {'name': 'add', 'args': {'a': 11, 'b': 49}, 'id': 'call_P39VunIrq9MQOxHgF30VByuB'}]
```

```python
print(type(gathered.tool_calls[0]["args"]))
```

```output
<class 'dict'>
```

## Solicitud: Pasar salidas de herramientas al modelo

Si estamos usando las invocaciones de herramientas generadas por el modelo para realmente llamar a herramientas y queremos pasar los resultados de las herramientas de vuelta al modelo, podemos hacerlo usando `ToolMessage`s.

```python
from langchain_core.messages import HumanMessage, ToolMessage


@tool
def add(a: int, b: int) -> int:
    """Adds a and b.

    Args:
        a: first int
        b: second int
    """
    return a + b


@tool
def multiply(a: int, b: int) -> int:
    """Multiplies a and b.

    Args:
        a: first int
        b: second int
    """
    return a * b


tools = [add, multiply]
llm_with_tools = llm.bind_tools(tools)

messages = [HumanMessage(query)]
ai_msg = llm_with_tools.invoke(messages)
messages.append(ai_msg)

for tool_call in ai_msg.tool_calls:
    selected_tool = {"add": add, "multiply": multiply}[tool_call["name"].lower()]
    tool_output = selected_tool.invoke(tool_call["args"])
    messages.append(ToolMessage(tool_output, tool_call_id=tool_call["id"]))

messages
```

```output
[HumanMessage(content='What is 3 * 12? Also, what is 11 + 49?'),
 AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_Jja7J89XsjrOLA5rAjULqTSL', 'function': {'arguments': '{"a": 3, "b": 12}', 'name': 'multiply'}, 'type': 'function'}, {'id': 'call_K4ArVEUjhl36EcSuxGN1nwvZ', 'function': {'arguments': '{"a": 11, "b": 49}', 'name': 'add'}, 'type': 'function'}]}, response_metadata={'token_usage': {'completion_tokens': 49, 'prompt_tokens': 144, 'total_tokens': 193}, 'model_name': 'gpt-3.5-turbo-0125', 'system_fingerprint': 'fp_a450710239', 'finish_reason': 'tool_calls', 'logprobs': None}, id='run-9db7e8e1-86d5-4015-9f43-f1d33abea64d-0', tool_calls=[{'name': 'multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_Jja7J89XsjrOLA5rAjULqTSL'}, {'name': 'add', 'args': {'a': 11, 'b': 49}, 'id': 'call_K4ArVEUjhl36EcSuxGN1nwvZ'}]),
 ToolMessage(content='36', tool_call_id='call_Jja7J89XsjrOLA5rAjULqTSL'),
 ToolMessage(content='60', tool_call_id='call_K4ArVEUjhl36EcSuxGN1nwvZ')]
```

```python
llm_with_tools.invoke(messages)
```

```output
AIMessage(content='3 * 12 = 36\n11 + 49 = 60', response_metadata={'token_usage': {'completion_tokens': 16, 'prompt_tokens': 209, 'total_tokens': 225}, 'model_name': 'gpt-3.5-turbo-0125', 'system_fingerprint': 'fp_3b956da36b', 'finish_reason': 'stop', 'logprobs': None}, id='run-a55f8cb5-6d6d-4835-9c6b-7de36b2590c7-0')
```

## Solicitud: Few-shot prompting

Para un uso más complejo de herramientas es muy útil agregar ejemplos few-shot al prompt. Podemos hacerlo agregando `AIMessage`s con `ToolCall`s y `ToolMessage`s correspondientes a nuestro prompt.

:::note
Para la mayoría de los modelos es importante que los ids de ToolCall y ToolMessage coincidan, de modo que cada AIMessage con ToolCalls sea seguido por ToolMessages con ids correspondientes.

Por ejemplo, incluso con algunas instrucciones especiales nuestro modelo puede confundirse por el orden de las operaciones:

```python
llm_with_tools.invoke(
    "Whats 119 times 8 minus 20. Don't do any math yourself, only use tools for math. Respect order of operations"
).tool_calls
```

```output
[{'name': 'multiply',
  'args': {'a': 119, 'b': 8},
  'id': 'call_RofMKNQ2qbWAFaMsef4cpTS9'},
 {'name': 'add',
  'args': {'a': 952, 'b': -20},
  'id': 'call_HjOfoF8ceMCHmO3cpwG6oB3X'}]
```

El modelo no debería estar intentando sumar nada aún, ya que técnicamente no puede conocer los resultados de 119 * 8 aún.

Agregando un prompt con algunos ejemplos podemos corregir este comportamiento:

```python
from langchain_core.messages import AIMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough

examples = [
    HumanMessage(
        "What's the product of 317253 and 128472 plus four", name="example_user"
    ),
    AIMessage(
        "",
        name="example_assistant",
        tool_calls=[
            {"name": "multiply", "args": {"x": 317253, "y": 128472}, "id": "1"}
        ],
    ),
    ToolMessage("16505054784", tool_call_id="1"),
    AIMessage(
        "",
        name="example_assistant",
        tool_calls=[{"name": "add", "args": {"x": 16505054784, "y": 4}, "id": "2"}],
    ),
    ToolMessage("16505054788", tool_call_id="2"),
    AIMessage(
        "The product of 317253 and 128472 plus four is 16505054788",
        name="example_assistant",
    ),
]

system = """You are bad at math but are an expert at using a calculator.

Use past tool usage as an example of how to correctly use the tools."""
few_shot_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        *examples,
        ("human", "{query}"),
    ]
)

chain = {"query": RunnablePassthrough()} | few_shot_prompt | llm_with_tools
chain.invoke("Whats 119 times 8 minus 20").tool_calls
```

```output
[{'name': 'multiply',
  'args': {'a': 119, 'b': 8},
  'id': 'call_tWwpzWqqc8dQtN13CyKZCVMe'}]
```

Parece que obtenemos la salida correcta esta vez.

Aquí está cómo se ve la [traza de LangSmith](https://smith.langchain.com/public/f70550a1-585f-4c9d-a643-13148ab1616f/r).

## Próximos pasos

- **Análisis de salida**: Vea [parsers de salida de OpenAI Tools](/docs/modules/model_io/output_parsers/types/openai_tools/) y [parsers de salida de OpenAI Functions](/docs/modules/model_io/output_parsers/types/openai_functions/) para aprender sobre la extracción de las respuestas de la API de llamadas a funciones en varios formatos.
- **Cadenas de salida estructuradas**: [Algunos modelos tienen constructores](/docs/modules/model_io/chat/structured_output/) que manejan la creación de una cadena de salida estructurada para usted.
- **Uso de herramientas**: Vea cómo construir cadenas y agentes que llamen a las herramientas invocadas en [estas guías](/docs/use_cases/tool_use/).
