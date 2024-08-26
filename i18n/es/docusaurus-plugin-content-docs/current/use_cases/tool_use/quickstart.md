---
sidebar_position: 0
translated: true
---

# Inicio rápido

En esta guía, repasaremos las formas básicas de crear Cadenas y Agentes que llaman a Herramientas. Las Herramientas pueden ser prácticamente cualquier cosa: APIs, funciones, bases de datos, etc. Las Herramientas nos permiten extender las capacidades de un modelo más allá de simplemente generar texto/mensajes. La clave para usar modelos con herramientas es formular correctamente un modelo y analizar su respuesta para que elija las herramientas adecuadas y proporcione las entradas correctas para ellas.

## Configuración

Necesitaremos instalar los siguientes paquetes para esta guía:

```python
%pip install --upgrade --quiet langchain
```

Si desea rastrear sus ejecuciones en [LangSmith](/docs/langsmith/), descomente y establezca las siguientes variables de entorno:

```python
import getpass
import os

# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## Crear una herramienta

Primero, necesitamos crear una herramienta para llamar. Para este ejemplo, crearemos una herramienta personalizada a partir de una función. Para obtener más información sobre la creación de herramientas personalizadas, consulte [esta guía](/docs/modules/tools/).

```python
from langchain_core.tools import tool


@tool
def multiply(first_int: int, second_int: int) -> int:
    """Multiply two integers together."""
    return first_int * second_int
```

```python
print(multiply.name)
print(multiply.description)
print(multiply.args)
```

```output
multiply
multiply(first_int: int, second_int: int) -> int - Multiply two integers together.
{'first_int': {'title': 'First Int', 'type': 'integer'}, 'second_int': {'title': 'Second Int', 'type': 'integer'}}
```

```python
multiply.invoke({"first_int": 4, "second_int": 5})
```

```output
20
```

## Cadenas

Si sabemos que solo necesitamos usar una herramienta un número fijo de veces, podemos crear una cadena para hacerlo. Creemos una cadena simple que simplemente multiplica los números especificados por el usuario.

![chain](../../../../../../static/img/tool_chain.svg)

### Llamada a herramientas/funciones

Una de las formas más confiables de usar herramientas con LLM es con las API de llamada a herramientas (también llamadas a veces API de llamada a funciones). Esto solo funciona con modelos que admiten explícitamente la llamada a herramientas. Puede ver qué modelos admiten la llamada a herramientas [aquí](/docs/integrations/chat/), y aprender más sobre cómo usar la llamada a herramientas en [esta guía](/docs/modules/model_io/chat/function_calling).

Primero definiremos nuestro modelo y herramientas. Comenzaremos con una sola herramienta, `multiply`.

import ChatModelTabs from "@theme/ChatModelTabs";

<ChatModelTabs customVarName="llm"/>

```python
# | echo: false
# | output: false

from langchain_openai.chat_models import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
```

Usaremos `bind_tools` para pasar la definición de nuestra herramienta como parte de cada llamada al modelo, para que el modelo pueda invocar la herramienta cuando sea apropiado:

```python
llm_with_tools = llm.bind_tools([multiply])
```

Cuando el modelo invoca la herramienta, esto se mostrará en el atributo `AIMessage.tool_calls` de la salida:

```python
msg = llm_with_tools.invoke("whats 5 times forty two")
msg.tool_calls
```

```output
[{'name': 'multiply',
  'args': {'first_int': 5, 'second_int': 42},
  'id': 'call_cCP9oA3tRz7HDrjFn1FdmDaG'}]
```

Echa un vistazo al [rastro de LangSmith aquí](https://smith.langchain.com/public/81ff0cbd-e05b-4720-bf61-2c9807edb708/r).

### Invocar la herramienta

¡Genial! Somos capaces de generar invocaciones de herramientas. Pero, ¿qué pasa si queremos llamar realmente a la herramienta? Para ello, tendremos que pasar los argumentos generados de la herramienta a nuestra herramienta. Como ejemplo sencillo, simplemente extraeremos los argumentos de la primera `tool_call`:

```python
from operator import itemgetter

chain = llm_with_tools | (lambda x: x.tool_calls[0]["args"]) | multiply
chain.invoke("What's four times 23")
```

```output
92
```

Echa un vistazo al [rastro de LangSmith aquí](https://smith.langchain.com/public/16bbabb9-fc9b-41e5-a33d-487c42df4f85/r).

## Agentes

Las cadenas son excelentes cuando conocemos la secuencia específica de uso de herramientas necesaria para cualquier entrada del usuario. Pero para ciertos casos de uso, el número de veces que usamos herramientas depende de la entrada. En estos casos, queremos dejar que el propio modelo decida cuántas veces usar herramientas y en qué orden. Los [Agentes](/docs/modules/agents/) nos permiten hacer precisamente esto.

LangChain viene con una serie de agentes integrados que están optimizados para diferentes casos de uso. Lee sobre todos los [tipos de agentes aquí](/docs/modules/agents/agent_types/).

Usaremos el [agente de llamada a herramientas](/docs/modules/agents/agent_types/tool_calling/), que es generalmente el más confiable y el recomendado para la mayoría de los casos de uso.

![agent](../../../../../../static/img/tool_agent.svg)

```python
from langchain import hub
from langchain.agents import AgentExecutor, create_tool_calling_agent
```

```python
# Get the prompt to use - can be replaced with any prompt that includes variables "agent_scratchpad" and "input"!
prompt = hub.pull("hwchase17/openai-tools-agent")
prompt.pretty_print()
```

```output
================================[1m System Message [0m================================

You are a helpful assistant

=============================[1m Messages Placeholder [0m=============================

[33;1m[1;3m{chat_history}[0m

================================[1m Human Message [0m=================================

[33;1m[1;3m{input}[0m

=============================[1m Messages Placeholder [0m=============================

[33;1m[1;3m{agent_scratchpad}[0m
```

Los agentes también son excelentes porque facilitan el uso de varias herramientas. Para aprender cómo construir Cadenas que usen múltiples herramientas, consulta la página [Cadenas con múltiples herramientas](/docs/use_cases/tool_use/multiple_tools).

```python
@tool
def add(first_int: int, second_int: int) -> int:
    "Add two integers."
    return first_int + second_int


@tool
def exponentiate(base: int, exponent: int) -> int:
    "Exponentiate the base to the exponent power."
    return base**exponent


tools = [multiply, add, exponentiate]
```

```python
# Construct the tool calling agent
agent = create_tool_calling_agent(llm, tools, prompt)
```

```python
# Create an agent executor by passing in the agent and tools
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

Con un agente, podemos hacer preguntas que requieran un uso arbitrario de nuestras herramientas:

```python
agent_executor.invoke(
    {
        "input": "Take 3 to the fifth power and multiply that by the sum of twelve and three, then square the whole result"
    }
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `exponentiate` with `{'base': 3, 'exponent': 5}`


[0m[38;5;200m[1;3m243[0m[32;1m[1;3m
Invoking: `add` with `{'first_int': 12, 'second_int': 3}`


[0m[33;1m[1;3m15[0m[32;1m[1;3m
Invoking: `multiply` with `{'first_int': 243, 'second_int': 15}`


[0m[36;1m[1;3m3645[0m[32;1m[1;3m
Invoking: `exponentiate` with `{'base': 405, 'exponent': 2}`


[0m[38;5;200m[1;3m164025[0m[32;1m[1;3mThe result of taking 3 to the fifth power is 243.

The sum of twelve and three is 15.

Multiplying 243 by 15 gives 3645.

Finally, squaring 3645 gives 164025.[0m

[1m> Finished chain.[0m
```

```output
{'input': 'Take 3 to the fifth power and multiply that by the sum of twelve and three, then square the whole result',
 'output': 'The result of taking 3 to the fifth power is 243. \n\nThe sum of twelve and three is 15. \n\nMultiplying 243 by 15 gives 3645. \n\nFinally, squaring 3645 gives 164025.'}
```

Echa un vistazo al [rastro de LangSmith aquí](https://smith.langchain.com/public/eeeb27a4-a2f8-4f06-a3af-9c983f76146c/r).

## Próximos pasos

Aquí hemos repasado las formas básicas de usar Herramientas con Cadenas y Agentes. Recomendamos las siguientes secciones para explorar a continuación:

- [Agentes](/docs/modules/agents/): Todo lo relacionado con los Agentes.
- [Elegir entre múltiples herramientas](/docs/use_cases/tool_use/multiple_tools): Cómo crear cadenas de herramientas que seleccionen entre múltiples herramientas.
- [Formulación para el uso de herramientas](/docs/use_cases/tool_use/prompting): Cómo crear cadenas de herramientas que formulen modelos directamente, sin usar API de llamada a funciones.
- [Uso paralelo de herramientas](/docs/use_cases/tool_use/parallel): Cómo crear cadenas de herramientas que invoquen múltiples herramientas a la vez.
