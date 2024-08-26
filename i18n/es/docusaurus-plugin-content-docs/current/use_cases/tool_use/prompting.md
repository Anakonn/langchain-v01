---
sidebar_position: 3
translated: true
---

# Uso de modelos que no admiten la llamada a herramientas

En esta guía construiremos una Cadena que no se basa en ninguna API de modelo especial (como la llamada a herramientas, que mostramos en el [Inicio rápido](/docs/use_cases/tool_use/quickstart)) y en su lugar simplemente solicita al modelo que invoque herramientas directamente.

## Configuración

Necesitaremos instalar los siguientes paquetes:

```python
%pip install --upgrade --quiet langchain langchain-openai
```

Y establecer estas variables de entorno:

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()

# If you'd like to use LangSmith, uncomment the below:
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## Crear una herramienta

Primero, necesitamos crear una herramienta para llamar. Para este ejemplo, crearemos una herramienta personalizada a partir de una función. Para obtener más información sobre todos los detalles relacionados con la creación de herramientas personalizadas, consulta [esta guía](/docs/modules/tools/).

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

## Creando nuestro mensaje

Queremos escribir un mensaje que especifique las herramientas a las que tiene acceso el modelo, los argumentos de esas herramientas y el formato de salida deseado del modelo. En este caso le indicaremos que genere un blob JSON con el formato `{"name": "...", "arguments": {...}}`.

```python
from langchain.tools.render import render_text_description

rendered_tools = render_text_description([multiply])
rendered_tools
```

```output
'multiply: multiply(first_int: int, second_int: int) -> int - Multiply two integers together.'
```

```python
from langchain_core.prompts import ChatPromptTemplate

system_prompt = f"""You are an assistant that has access to the following set of tools. Here are the names and descriptions for each tool:

{rendered_tools}

Given the user input, return the name and input of the tool to use. Return your response as a JSON blob with 'name' and 'arguments' keys."""

prompt = ChatPromptTemplate.from_messages(
    [("system", system_prompt), ("user", "{input}")]
)
```

## Agregar un analizador de salida

Utilizaremos el `JsonOutputParser` para analizar la salida de nuestros modelos a JSON.

```python
from langchain_core.output_parsers import JsonOutputParser
from langchain_openai import ChatOpenAI

model = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
chain = prompt | model | JsonOutputParser()
chain.invoke({"input": "what's thirteen times 4"})
```

```output
{'name': 'multiply', 'arguments': {'first_int': 13, 'second_int': 4}}
```

## Invocar la herramienta

Podemos invocar la herramienta como parte de la cadena pasando los "argumentos" generados por el modelo a ella:

```python
from operator import itemgetter

chain = prompt | model | JsonOutputParser() | itemgetter("arguments") | multiply
chain.invoke({"input": "what's thirteen times 4"})
```

```output
52
```

## Elegir entre varias herramientas

Supongamos que tenemos varias herramientas entre las que queremos que la cadena pueda elegir:

```python
@tool
def add(first_int: int, second_int: int) -> int:
    "Add two integers."
    return first_int + second_int


@tool
def exponentiate(base: int, exponent: int) -> int:
    "Exponentiate the base to the exponent power."
    return base**exponent
```

Con la llamada a funciones, podemos hacer esto así:

Si queremos ejecutar la herramienta seleccionada por el modelo, podemos hacerlo usando una función que devuelva la herramienta en función de la salida del modelo. Específicamente, nuestra función devolverá su propia subcadena que obtendrá la parte "argumentos" de la salida del modelo y la pasará a la herramienta elegida:

```python
tools = [add, exponentiate, multiply]


def tool_chain(model_output):
    tool_map = {tool.name: tool for tool in tools}
    chosen_tool = tool_map[model_output["name"]]
    return itemgetter("arguments") | chosen_tool
```

```python
rendered_tools = render_text_description(tools)
system_prompt = f"""You are an assistant that has access to the following set of tools. Here are the names and descriptions for each tool:

{rendered_tools}

Given the user input, return the name and input of the tool to use. Return your response as a JSON blob with 'name' and 'arguments' keys."""

prompt = ChatPromptTemplate.from_messages(
    [("system", system_prompt), ("user", "{input}")]
)

chain = prompt | model | JsonOutputParser() | tool_chain
chain.invoke({"input": "what's 3 plus 1132"})
```

```output
1135
```

## Devolver las entradas de la herramienta

Puede ser útil devolver no solo las salidas de la herramienta, sino también las entradas. Podemos hacer esto fácilmente con LCEL asignando la salida de la herramienta a `RunnablePassthrough.assign`. Esto tomará lo que sea que sea la entrada de los componentes RunnablePassrthrough (se supone que es un diccionario) y agregará una clave a él, al mismo tiempo que sigue pasando todo lo que hay actualmente en la entrada:

```python
from langchain_core.runnables import RunnablePassthrough

chain = (
    prompt | model | JsonOutputParser() | RunnablePassthrough.assign(output=tool_chain)
)
chain.invoke({"input": "what's 3 plus 1132"})
```

```output
{'name': 'add',
 'arguments': {'first_int': 3, 'second_int': 1132},
 'output': 1135}
```
