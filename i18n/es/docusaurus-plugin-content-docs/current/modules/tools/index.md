---
sidebar_class_name: hidden
sidebar_position: 4
translated: true
---

# Herramientas

Las herramientas son interfaces que un agente, una cadena o un LLM pueden usar para interactuar con el mundo.
Combinan algunas cosas:

1. El nombre de la herramienta
2. Una descripción de lo que es la herramienta
3. El esquema JSON de los datos de entrada de la herramienta
4. La función a llamar
5. Si el resultado de una herramienta debe devolverse directamente al usuario

Es útil tener toda esta información porque esta información se puede usar para construir sistemas de toma de acciones. El nombre, la descripción y el esquema JSON se pueden usar para solicitar al LLM que sepa cómo especificar qué acción tomar, y luego la función a llamar es equivalente a tomar esa acción.

Cuanto más sencilla sea la entrada de una herramienta, más fácil será para un LLM poder usarla.
Muchos agentes solo funcionarán con herramientas que tengan una sola entrada de cadena.
Para obtener una lista de los tipos de agentes y cuáles funcionan con entradas más complicadas, consulte [esta documentación](../agents/agent_types)

Es importante tener en cuenta que el nombre, la descripción y el esquema JSON (si se usa) se utilizan todos en el mensaje. Por lo tanto, es realmente importante que sean claros y describan exactamente cómo se debe usar la herramienta. Es posible que deba cambiar el nombre, la descripción o el esquema JSON predeterminados si el LLM no entiende cómo usar la herramienta.

## Herramientas predeterminadas

Veamos cómo trabajar con herramientas. Para hacer esto, trabajaremos con una herramienta incorporada.

```python
from langchain_community.tools import WikipediaQueryRun
from langchain_community.utilities import WikipediaAPIWrapper
```

Ahora inicializamos la herramienta. Aquí es donde podemos configurarla como queramos.

```python
api_wrapper = WikipediaAPIWrapper(top_k_results=1, doc_content_chars_max=100)
tool = WikipediaQueryRun(api_wrapper=api_wrapper)
```

Este es el nombre predeterminado

```python
tool.name
```

```output
'Wikipedia'
```

Esta es la descripción predeterminada

```python
tool.description
```

```output
'A wrapper around Wikipedia. Useful for when you need to answer general questions about people, places, companies, facts, historical events, or other subjects. Input should be a search query.'
```

Este es el esquema JSON predeterminado de las entradas

```python
tool.args
```

```output
{'query': {'title': 'Query', 'type': 'string'}}
```

Podemos ver si la herramienta debe devolver directamente al usuario

```python
tool.return_direct
```

```output
False
```

Podemos llamar a esta herramienta con una entrada de diccionario

```python
tool.run({"query": "langchain"})
```

```output
'Page: LangChain\nSummary: LangChain is a framework designed to simplify the creation of applications '
```

También podemos llamar a esta herramienta con una sola entrada de cadena.
Podemos hacer esto porque esta herramienta espera solo una entrada.
Si requiriera múltiples entradas, no podríamos hacer eso.

```python
tool.run("langchain")
```

```output
'Page: LangChain\nSummary: LangChain is a framework designed to simplify the creation of applications '
```

## Personalizar herramientas predeterminadas

También podemos modificar el nombre, la descripción y el esquema JSON de los argumentos incorporados.

Al definir el esquema JSON de los argumentos, es importante que las entradas sigan siendo las mismas que la función, por lo que no debe cambiarlas. Pero puede definir descripciones personalizadas para cada entrada fácilmente.

```python
from langchain_core.pydantic_v1 import BaseModel, Field


class WikiInputs(BaseModel):
    """Inputs to the wikipedia tool."""

    query: str = Field(
        description="query to look up in Wikipedia, should be 3 or less words"
    )
```

```python
tool = WikipediaQueryRun(
    name="wiki-tool",
    description="look up things in wikipedia",
    args_schema=WikiInputs,
    api_wrapper=api_wrapper,
    return_direct=True,
)
```

```python
tool.name
```

```output
'wiki-tool'
```

```python
tool.description
```

```output
'look up things in wikipedia'
```

```python
tool.args
```

```output
{'query': {'title': 'Query',
  'description': 'query to look up in Wikipedia, should be 3 or less words',
  'type': 'string'}}
```

```python
tool.return_direct
```

```output
True
```

```python
tool.run("langchain")
```

```output
'Page: LangChain\nSummary: LangChain is a framework designed to simplify the creation of applications '
```

## Más temas

Esta fue una breve introducción a las herramientas en LangChain, pero hay mucho más que aprender.

**[Herramientas incorporadas](/docs/integrations/tools/)**: Para ver una lista de todas las herramientas incorporadas, consulte [esta página](/docs/integrations/tools/)

**[Herramientas personalizadas](./custom_tools)**: Aunque las herramientas incorporadas son útiles, es muy probable que tenga que definir sus propias herramientas. Consulte [esta guía](./custom_tools) para obtener instrucciones sobre cómo hacerlo.

**[Toolkits](./toolkits)**: Los toolkits son colecciones de herramientas que funcionan bien juntas. Para obtener una descripción más detallada y una lista de todos los toolkits incorporados, consulte [esta página](./toolkits)

**[Herramientas como funciones de OpenAI](./tools_as_openai_functions)**: Las herramientas son muy similares a las funciones de OpenAI y se pueden convertir fácilmente a ese formato. Consulte [este cuaderno](./tools_as_openai_functions) para obtener instrucciones sobre cómo hacer eso.
