---
translated: true
---

# 🦜🕸️LangGraph

[![Descargas](https://static.pepy.tech/badge/langgraph/month)](https://pepy.tech/project/langgraph)
[![Problemas abiertos](https://img.shields.io/github/issues-raw/langchain-ai/langgraph)](https://github.com/langchain-ai/langgraph/issues)
[![](https://dcbadge.vercel.app/api/server/6adMQxSpJS?compact=true&style=flat)](https://discord.com/channels/1038097195422978059/1170024642245832774)
[![Documentación](https://img.shields.io/badge/docs-latest-blue)](https://langchain-ai.github.io/langgraph/)

⚡ Construyendo agentes de lenguaje como gráficos ⚡

## Resumen

[LangGraph](https://langchain-ai.github.io/langgraph/) es una biblioteca para construir aplicaciones con estados múltiples y varios actores con LLM.
Inspirado en [Pregel](https://research.google/pubs/pub37252/) y [Apache Beam](https://beam.apache.org/), LangGraph le permite coordinar y hacer checkpoints de múltiples cadenas (o actores) a través de pasos computacionales cíclicos utilizando funciones de python regulares (o [JS](https://github.com/langchain-ai/langgraphjs)). La interfaz pública se inspira en [NetworkX](https://networkx.org/documentation/latest/).

El uso principal es para agregar **ciclos** y **persistencia** a su aplicación LLM. Si solo necesita Directed Acyclic Graphs (DAGs) rápidos, ya puede lograr esto utilizando [LangChain Expression Language](https://python.langchain.com/docs/expression_language/).

Los ciclos son importantes para los comportamientos agénticos, donde llama a un LLM en un bucle, preguntándole qué acción tomar a continuación.

## Instalación

```shell
pip install -U langgraph
```

## Inicio rápido

Uno de los conceptos centrales de LangGraph es el estado. Cada ejecución de gráfico crea un estado que se pasa entre los nodos del gráfico a medida que se ejecutan, y cada nodo actualiza este estado interno con su valor de retorno después de que se ejecuta. La forma en que el gráfico actualiza su estado interno está definida por el tipo de gráfico elegido o por una función personalizada.

El estado en LangGraph puede ser bastante general, pero para mantener las cosas más simples para comenzar, mostraremos un ejemplo donde el estado del gráfico se limita a una lista de mensajes de chat utilizando la clase `MessageGraph` incorporada. Esto es conveniente cuando se usa LangGraph con modelos de chat de LangChain porque podemos devolver directamente la salida del modelo de chat.

Primero, instala el paquete de integración de OpenAI de LangChain:

```python
pip install langchain_openai
```

También necesitamos exportar algunas variables de entorno:

```shell
export OPENAI_API_KEY=sk-...
```

¡Y ahora estamos listos! El gráfico a continuación contiene un solo nodo llamado `"oracle"` que ejecuta un modelo de chat y luego devuelve el resultado:

```python
<!--IMPORTS:[{"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://api.python.langchain.com/en/latest/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "\ud83e\udd9c\ud83d\udd78\ufe0fLangGraph"}, {"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://api.python.langchain.com/en/latest/messages/langchain_core.messages.human.HumanMessage.html", "title": "\ud83e\udd9c\ud83d\udd78\ufe0fLangGraph"}]-->
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
from langgraph.graph import END, MessageGraph

model = ChatOpenAI(temperature=0)

graph = MessageGraph()

graph.add_node("oracle", model)
graph.add_edge("oracle", END)

graph.set_entry_point("oracle")

runnable = graph.compile()
```

¡Vamos a ejecutarlo!

```python
runnable.invoke(HumanMessage("What is 1 + 1?"))
```

```python
[HumanMessage(content='What is 1 + 1?'), AIMessage(content='1 + 1 equals 2.')]
```

Entonces, ¿qué hicimos aquí? Vamos a desglosarlo paso a paso:

1. Primero, inicializamos nuestro modelo y un `MessageGraph`.
2. A continuación, agregamos un solo nodo al gráfico, llamado `"oracle"`, que simplemente llama al modelo con la entrada dada.
3. Agregamos un borde de este nodo `"oracle"` a la cadena especial `END` (`"__end__"`). Esto significa que la ejecución terminará después del nodo actual.
4. Establecemos `"oracle"` como el punto de entrada al gráfico.
5. Compilamos el gráfico, traduciéndolo a operaciones [pregel](https://research.google/pubs/pregel-a-system-for-large-scale-graph-processing/) de bajo nivel, asegurando que se pueda ejecutar.

Entonces, cuando ejecutamos el gráfico:

1. LangGraph agrega el mensaje de entrada al estado interno y luego pasa el estado al nodo de punto de entrada, `"oracle"`.
2. El nodo `"oracle"` se ejecuta, invocando el modelo de chat.
3. El modelo de chat devuelve un `AIMessage`. LangGraph lo agrega al estado.
4. La ejecución progresa al valor especial `END` y genera el estado final.

Y como resultado, obtenemos una lista de dos mensajes de chat como salida.

### Interacción con LCEL

Como un aparte para aquellos que ya están familiarizados con LangChain: `add_node` en realidad acepta cualquier función o [runnable](https://python.langchain.com/docs/expression_language/interface/) como entrada. En el ejemplo anterior, el modelo se usa "tal cual", pero también podríamos haber pasado una función:

```python
def call_oracle(messages: list):
    return model.invoke(messages)

graph.add_node("oracle", call_oracle)
```

Simplemente asegúrate de estar atento al hecho de que la entrada para el [runnable](https://python.langchain.com/docs/expression_language/interface/) es **todo el estado actual**. Entonces esto fallará:

```python
<!--IMPORTS:[{"imported": "ChatPromptTemplate", "source": "langchain_core.prompts", "docs": "https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html", "title": "\ud83e\udd9c\ud83d\udd78\ufe0fLangGraph"}, {"imported": "MessagesPlaceholder", "source": "langchain_core.prompts", "docs": "https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.MessagesPlaceholder.html", "title": "\ud83e\udd9c\ud83d\udd78\ufe0fLangGraph"}]-->
# This will not work with MessageGraph!
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant named {name} who always speaks in pirate dialect"),
    MessagesPlaceholder(variable_name="messages"),
])

chain = prompt | model

# State is a list of messages, but our chain expects a dict input:
#
# { "name": some_string, "messages": [] }
#
# Therefore, the graph will throw an exception when it executes here.
graph.add_node("oracle", chain)
```

## Bordes condicionales

Ahora, vamos a pasar a algo un poco menos trivial. Los LLM tienen problemas con las matemáticas, así que permitamos que el LLM llame condicionalmente a un nodo `"multiply"` usando [tool calling](https://python.langchain.com/docs/modules/model_io/chat/function_calling/).

Recrearemos nuestro gráfico con un `"multiply"` adicional que tomará el resultado del mensaje más reciente, si es una llamada a herramienta, y calculará el resultado.
También [vincularemos](https://api.python.langchain.com/en/latest/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html#langchain_openai.chat_models.base.ChatOpenAI.bind_tools) el esquema de la calculadora al modelo de OpenAI como una herramienta para permitir que el modelo use opcionalmente la herramienta necesaria para responder al estado actual:

```python
<!--IMPORTS:[{"imported": "tool", "source": "langchain_core.tools", "docs": "https://api.python.langchain.com/en/latest/tools/langchain_core.tools.tool.html", "title": "\ud83e\udd9c\ud83d\udd78\ufe0fLangGraph"}]-->
from langchain_core.tools import tool
from langgraph.prebuilt import ToolNode

@tool
def multiply(first_number: int, second_number: int):
    """Multiplies two numbers together."""
    return first_number * second_number

model = ChatOpenAI(temperature=0)
model_with_tools = model.bind_tools([multiply])

builder = MessageGraph()

builder.add_node("oracle", model_with_tools)

tool_node = ToolNode([multiply])
builder.add_node("multiply", tool_node)

builder.add_edge("multiply", END)

builder.set_entry_point("oracle")
```

Ahora pensemos: ¿qué queremos que suceda?

- Si el nodo `"oracle"` devuelve un mensaje que espera una llamada a herramienta, queremos ejecutar el nodo `"multiply"`
- Si no, podemos simplemente terminar la ejecución

Podemos lograr esto usando **bordes condicionales**, que llaman a una función en el estado actual y enrutan la ejecución a un nodo según la salida de la función.

Así es como se ve:

```python
from typing import Literal

def router(state: List[BaseMessage]) -> Literal["multiply", "__end__"]:
    tool_calls = state[-1].additional_kwargs.get("tool_calls", [])
    if len(tool_calls):
        return "multiply"
    else:
        return "__end__"

builder.add_conditional_edges("oracle", router)
```

Si la salida del modelo contiene una llamada a herramienta, nos movemos al nodo `"multiply"`. De lo contrario, terminamos la ejecución.

¡Genial! Ahora todo lo que queda es compilar el gráfico y probarlo. Las preguntas relacionadas con las matemáticas se enrutan a la herramienta de la calculadora:

```python
runnable = builder.compile()

runnable.invoke(HumanMessage("What is 123 * 456?"))
```

```output

[HumanMessage(content='What is 123 * 456?'),
 AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_OPbdlm8Ih1mNOObGf3tMcNgb', 'function': {'arguments': '{"first_number":123,"second_number":456}', 'name': 'multiply'}, 'type': 'function'}]}),
 ToolMessage(content='56088', tool_call_id='call_OPbdlm8Ih1mNOObGf3tMcNgb')]
```

Mientras que las respuestas conversacionales se generan directamente:

```python
runnable.invoke(HumanMessage("What is your name?"))
```

```output
[HumanMessage(content='What is your name?'),
 AIMessage(content='My name is Assistant. How can I assist you today?')]
```

## Ciclos

Ahora, vamos a repasar un ejemplo cíclico más general. Recrearemos la clase `AgentExecutor` de LangChain. El agente en sí mismo utilizará modelos de chat y llamadas a herramientas.
Este agente representará todo su estado como una lista de mensajes.

Necesitaremos instalar algunos paquetes de la comunidad de LangChain, así como [Tavily](https://app.tavily.com/sign-in) para usarlo como herramienta de ejemplo.

```shell
pip install -U langgraph langchain_openai tavily-python
```

También necesitamos exportar algunas variables de entorno adicionales para el acceso a la API de OpenAI y Tavily.

```shell
export OPENAI_API_KEY=sk-...
export TAVILY_API_KEY=tvly-...
```

Opcionalmente, podemos configurar [LangSmith](https://docs.smith.langchain.com/) para una observabilidad de primera clase.

```shell
export LANGCHAIN_TRACING_V2="true"
export LANGCHAIN_API_KEY=ls__...
```

### Configurar las herramientas

Como se mencionó anteriormente, primero definiremos las herramientas que queremos utilizar.
Para este ejemplo sencillo, utilizaremos una herramienta de búsqueda web.
Sin embargo, es muy fácil crear tus propias herramientas; consulta la documentación [aquí](https://python.langchain.com/docs/modules/agents/tools/custom_tools) sobre cómo hacerlo.

```python
<!--IMPORTS:[{"imported": "TavilySearchResults", "source": "langchain_community.tools.tavily_search", "docs": "https://api.python.langchain.com/en/latest/tools/langchain_community.tools.tavily_search.tool.TavilySearchResults.html", "title": "\ud83e\udd9c\ud83d\udd78\ufe0fLangGraph"}]-->
from langchain_community.tools.tavily_search import TavilySearchResults

tools = [TavilySearchResults(max_results=1)]
```

Ahora podemos envolver estas herramientas en un simple [ToolNode](https://langchain-ai.github.io/langgraph/reference/prebuilt/#toolnode) de LangGraph.
Esta clase recibe la lista de mensajes (que contiene [tool_calls](https://api.python.langchain.com/en/latest/messages/langchain_core.messages.ai.AIMessage.html#langchain_core.messages.ai.AIMessage.tool_calls)), llama a la(s) herramienta(s) que el LLM ha solicitado ejecutar y devuelve la salida como un nuevo [ToolMessage](https://api.python.langchain.com/en/latest/messages/langchain_core.messages.tool.ToolMessage.html#langchain_core.messages.tool.ToolMessage)(s).

```python
from langgraph.prebuilt import ToolNode

tool_node = ToolNode(tools)
```

### Configurar el modelo

Ahora necesitamos cargar el modelo de chat que vamos a utilizar.

```python
<!--IMPORTS:[{"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://api.python.langchain.com/en/latest/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "\ud83e\udd9c\ud83d\udd78\ufe0fLangGraph"}]-->
from langchain_openai import ChatOpenAI

# We will set streaming=True so that we can stream tokens
# See the streaming section for more information on this.
model = ChatOpenAI(model="gpt-3.5-turbo", temperature=0, streaming=True)
```

Después de haber hecho esto, debemos asegurarnos de que el modelo sepa que tiene estas herramientas disponibles para llamar.
Podemos hacer esto convirtiendo las herramientas de LangChain al formato para la llamada de herramientas de OpenAI utilizando el método [bind_tools()](https://api.python.langchain.com/en/latest/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html#langchain_openai.chat_models.base.ChatOpenAI.bind_tools).

```python
model = model.bind_tools(tools)
```

### Definir el estado del agente

Esta vez, utilizaremos el `StateGraph` más general.
Este gráfico se parametriza por un objeto de estado que pasa a cada nodo.
Recuerda que cada nodo luego devuelve operaciones para actualizar ese estado.
Estas operaciones pueden establecer (SET) atributos específicos en el estado (por ejemplo, sobrescribir los valores existentes) o agregar (ADD) al atributo existente.
Si se debe establecer o agregar se indica anotando el objeto de estado con el que se construye el gráfico.

Para este ejemplo, el estado que vamos a rastrear será simplemente una lista de mensajes.
Queremos que cada nodo simplemente agregue mensajes a esa lista.
Por lo tanto, utilizaremos un `TypedDict` con una clave (`messages`) y lo anotaremos para que siempre se **agregue** a la clave `messages` al actualizarla utilizando el segundo parámetro (`operator.add`).
(Nota: el estado puede ser cualquier [tipo](https://docs.python.org/3/library/stdtypes.html#type-objects), incluidos los [pydantic BaseModel's](https://docs.pydantic.dev/latest/api/base_model/)).

```python
from typing import TypedDict, Annotated

def add_messages(left: list, right: list):
    """Add-don't-overwrite."""
    return left + right

class AgentState(TypedDict):
    # The `add_messages` function within the annotation defines
    # *how* updates should be merged into the state.
    messages: Annotated[list, add_messages]
```

Puedes pensar en el `MessageGraph` utilizado en el ejemplo inicial como una versión preconfigura da de este gráfico, donde el estado es directamente una matriz de mensajes,
y el paso de actualización siempre agrega los valores devueltos de un nodo al estado interno.

### Definir los nodos

Ahora necesitamos definir varios nodos diferentes en nuestro gráfico.
En `langgraph`, un nodo puede ser una función de Python regular o un [runnable](https://python.langchain.com/docs/expression_language/).

Hay dos nodos principales que necesitamos para esto:

1. El agente: responsable de decidir qué acciones (si las hay) tomar.
2. Una función para invocar herramientas: si el agente decide tomar una acción, este nodo ejecutará esa acción. Ya definimos esto anteriormente.

También necesitaremos definir algunos bordes.
Algunos de estos bordes pueden ser condicionales.
La razón por la que son condicionales es que el destino depende del contenido del `State` del gráfico.

La ruta que se tomará no se conoce hasta que se ejecute ese nodo (el LLM decide). Para nuestro caso de uso, necesitaremos uno de cada tipo de borde:

1. Borde condicional: después de llamar al agente, deberíamos:

   a. Ejecutar herramientas si el agente dijo que se debe tomar una acción, O

   b. Finalizar (responder al usuario) si el agente no solicitó ejecutar herramientas

2. Borde normal: después de invocar las herramientas, el gráfico siempre debe volver al agente para decidir qué hacer a continuación

Definamos los nodos, así como una función para definir el borde condicional a tomar.

```python
from typing import Literal

# Define the function that determines whether to continue or not
def should_continue(state: AgentState) -> Literal["action", "__end__"]:
    messages = state['messages']
    last_message = messages[-1]
    # If the LLM makes a tool call, then we route to the "action" node
    if last_message.tool_calls:
        return "action"
    # Otherwise, we stop (reply to the user)
    return "__end__"


# Define the function that calls the model
def call_model(state: AgentState):
    messages = state['messages']
    response = model.invoke(messages)
    # We return a list, because this will get added to the existing list
    return {"messages": [response]}
```

### Definir el gráfico

¡Ahora podemos unirlo todo y definir el gráfico!

```python
from langgraph.graph import StateGraph, END
# Define a new graph
workflow = StateGraph(AgentState)

# Define the two nodes we will cycle between
workflow.add_node("agent", call_model)
workflow.add_node("action", tool_node)

# Set the entrypoint as `agent`
# This means that this node is the first one called
workflow.set_entry_point("agent")

# We now add a conditional edge
workflow.add_conditional_edges(
    # First, we define the start node. We use `agent`.
    # This means these are the edges taken after the `agent` node is called.
    "agent",
    # Next, we pass in the function that will determine which node is called next.
    should_continue,
)

# We now add a normal edge from `tools` to `agent`.
# This means that after `tools` is called, `agent` node is called next.
workflow.add_edge('action', 'agent')

# Finally, we compile it!
# This compiles it into a LangChain Runnable,
# meaning you can use it as you would any other runnable
app = workflow.compile()
```

### ¡Usarlo!

¡Ahora podemos usarlo!
Esto ahora expone la [misma interfaz](https://python.langchain.com/docs/expression_language/) que todos los demás runnables de LangChain.
Este [runnable](https://python.langchain.com/docs/expression_language/interface/) acepta una lista de mensajes.

```python
<!--IMPORTS:[{"imported": "HumanMessage", "source": "langchain_core.messages", "docs": "https://api.python.langchain.com/en/latest/messages/langchain_core.messages.human.HumanMessage.html", "title": "\ud83e\udd9c\ud83d\udd78\ufe0fLangGraph"}]-->
from langchain_core.messages import HumanMessage

inputs = {"messages": [HumanMessage(content="what is the weather in sf")]}
app.invoke(inputs)
```

Esto puede tardar un poco; está haciendo algunas llamadas detrás de escena.
Para comenzar a ver algunos resultados intermedios a medida que se producen, podemos usar streaming; consulta a continuación más información sobre eso.

## Streaming

LangGraph tiene soporte para varios tipos diferentes de streaming.

### Salida de nodo de streaming

Uno de los beneficios de usar LangGraph es que es fácil transmitir la salida a medida que se produce en cada nodo.

```python
inputs = {"messages": [HumanMessage(content="what is the weather in sf")]}
for output in app.stream(inputs, stream_mode="updates"):
    # stream() yields dictionaries with output keyed by node name
    for key, value in output.items():
        print(f"Output from node '{key}':")
        print("---")
        print(value)
    print("\n---\n")
```

```output
Output from node 'agent':
---
{'messages': [AIMessage(content='', additional_kwargs={'function_call': {'arguments': '{\n  "query": "weather in San Francisco"\n}', 'name': 'tavily_search_results_json'}})]}

---

Output from node 'action':
---
{'messages': [FunctionMessage(content="[{'url': 'https://weatherspark.com/h/m/557/2024/1/Historical-Weather-in-January-2024-in-San-Francisco-California-United-States', 'content': 'January 2024 Weather History in San Francisco California, United States  Daily Precipitation in January 2024 in San Francisco Observed Weather in January 2024 in San Francisco  San Francisco Temperature History January 2024 Hourly Temperature in January 2024 in San Francisco  Hours of Daylight and Twilight in January 2024 in San FranciscoThis report shows the past weather for San Francisco, providing a weather history for January 2024. It features all historical weather data series we have available, including the San Francisco temperature history for January 2024. You can drill down from year to month and even day level reports by clicking on the graphs.'}]", name='tavily_search_results_json')]}

---

Output from node 'agent':
---
{'messages': [AIMessage(content="I couldn't find the current weather in San Francisco. However, you can visit [WeatherSpark](https://weatherspark.com/h/m/557/2024/1/Historical-Weather-in-January-2024-in-San-Francisco-California-United-States) to check the historical weather data for January 2024 in San Francisco.")]}

---

Output from node '__end__':
---
{'messages': [HumanMessage(content='what is the weather in sf'), AIMessage(content='', additional_kwargs={'function_call': {'arguments': '{\n  "query": "weather in San Francisco"\n}', 'name': 'tavily_search_results_json'}}), FunctionMessage(content="[{'url': 'https://weatherspark.com/h/m/557/2024/1/Historical-Weather-in-January-2024-in-San-Francisco-California-United-States', 'content': 'January 2024 Weather History in San Francisco California, United States  Daily Precipitation in January 2024 in San Francisco Observed Weather in January 2024 in San Francisco  San Francisco Temperature History January 2024 Hourly Temperature in January 2024 in San Francisco  Hours of Daylight and Twilight in January 2024 in San FranciscoThis report shows the past weather for San Francisco, providing a weather history for January 2024. It features all historical weather data series we have available, including the San Francisco temperature history for January 2024. You can drill down from year to month and even day level reports by clicking on the graphs.'}]", name='tavily_search_results_json'), AIMessage(content="I couldn't find the current weather in San Francisco. However, you can visit [WeatherSpark](https://weatherspark.com/h/m/557/2024/1/Historical-Weather-in-January-2024-in-San-Francisco-California-United-States) to check the historical weather data for January 2024 in San Francisco.")]}

---
```

### Tokens de streaming LLM

También puedes acceder a los tokens LLM a medida que se producen en cada nodo.
En este caso, solo el nodo "agente" produce tokens LLM.
Para que esto funcione correctamente, debes estar utilizando un LLM que admita streaming y también haberlo establecido al construir el LLM (por ejemplo, `ChatOpenAI(model="gpt-3.5-turbo-1106", streaming=True)`)

```python
inputs = {"messages": [HumanMessage(content="what is the weather in sf")]}
async for output in app.astream_log(inputs, include_types=["llm"]):
    # astream_log() yields the requested logs (here LLMs) in JSONPatch format
    for op in output.ops:
        if op["path"] == "/streamed_output/-":
            # this is the output from .stream()
            ...
        elif op["path"].startswith("/logs/") and op["path"].endswith(
            "/streamed_output/-"
        ):
            # because we chose to only include LLMs, these are LLM tokens
            print(op["value"])
```

```output
content='' additional_kwargs={'function_call': {'arguments': '', 'name': 'tavily_search_results_json'}}
content='' additional_kwargs={'function_call': {'arguments': '{\n', 'name': ''}}}
content='' additional_kwargs={'function_call': {'arguments': ' ', 'name': ''}}
content='' additional_kwargs={'function_call': {'arguments': ' "', 'name': ''}}
content='' additional_kwargs={'function_call': {'arguments': 'query', 'name': ''}}
...
```

## Cuándo usar

¿Cuándo deberías usar esto en lugar de [LangChain Expression Language](https://python.langchain.com/docs/expression_language/)?

Si necesitas ciclos.

LangChain Expression Language te permite definir fácilmente cadenas (DAGs), pero no tiene un buen mecanismo para agregar ciclos.
`langgraph` agrega esa sintaxis.

## Documentación

¡Esperamos que esto te haya dado una idea de lo que puedes construir! Consulta el resto de la documentación para aprender más.

### Tutoriales

Aprende a construir con LangGraph a través de ejemplos guiados en los [Tutoriales de LangGraph](https://langchain-ai.github.io/langgraph/tutorials/).

Te recomendamos comenzar con la [Introducción a LangGraph](https://langchain-ai.github.io/langgraph/tutorials/introduction/) antes de probar las guías más avanzadas.

### Guías prácticas

Las [guías prácticas de LangGraph](https://langchain-ai.github.io/langgraph/how-tos/) muestran cómo lograr cosas específicas dentro de LangGraph, desde el streaming, hasta agregar memoria y persistencia, hasta patrones de diseño comunes (ramificación, subgráficos, etc.), estos son el lugar al que ir si quieres copiar y ejecutar un fragmento de código específico.

### Referencia

La API de LangGraph tiene algunas clases y métodos importantes que se cubren en los [Documentos de Referencia](https://langchain-ai.github.io/langgraph/reference/graphs/). Revisa estos para ver los argumentos de función específicos y ejemplos sencillos de cómo usar el gráfico y las API de puntos de control, o para ver algunos de los componentes preconfigurados de alto nivel.
