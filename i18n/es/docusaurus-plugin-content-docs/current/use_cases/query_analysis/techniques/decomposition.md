---
translated: true
---

# Descomposición

Cuando un usuario hace una pregunta, no hay garantía de que los resultados relevantes se puedan devolver con una sola consulta. A veces, para responder a una pregunta, necesitamos dividirla en subpreguntas distintas, recuperar resultados para cada subpregunta y luego responder utilizando el contexto acumulado.

Por ejemplo, si un usuario pregunta: "¿En qué se diferencia Web Voyager de los agentes de reflexión?", y tenemos un documento que explica Web Voyager y otro que explica los agentes de reflexión, pero ningún documento que los compare, entonces probablemente obtendríamos mejores resultados recuperando tanto "¿Qué es Web Voyager?" como "¿Qué son los agentes de reflexión?" y combinando los documentos recuperados, que recuperando directamente en función de la pregunta del usuario.

Este proceso de dividir una entrada en varias subconsultas distintas es a lo que nos referimos como **descomposición de consultas**. También se le conoce a veces como generación de subconsultas. En esta guía, veremos un ejemplo de cómo hacer descomposición, utilizando nuestro ejemplo de un bot de preguntas y respuestas sobre los videos de YouTube de LangChain del [Inicio rápido](/docs/use_cases/query_analysis/quickstart).

## Configuración

#### Instalar dependencias

```python
# %pip install -qU langchain langchain-openai
```

#### Establecer variables de entorno

Utilizaremos OpenAI en este ejemplo:

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()

# Optional, uncomment to trace runs with LangSmith. Sign up here: https://smith.langchain.com.
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## Generación de consultas

Para convertir las preguntas de los usuarios en una lista de subpreguntas, utilizaremos la API de llamada a funciones de OpenAI, que puede devolver varias funciones en cada turno:

```python
import datetime
from typing import Literal, Optional, Tuple

from langchain_core.pydantic_v1 import BaseModel, Field


class SubQuery(BaseModel):
    """Search over a database of tutorial videos about a software library."""

    sub_query: str = Field(
        ...,
        description="A very specific query against the database.",
    )
```

```python
from langchain.output_parsers import PydanticToolsParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

system = """You are an expert at converting user questions into database queries. \
You have access to a database of tutorial videos about a software library for building LLM-powered applications. \

Perform query decomposition. Given a user question, break it down into distinct sub questions that \
you need to answer in order to answer the original question.

If there are acronyms or words you are not familiar with, do not try to rephrase them."""
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "{question}"),
    ]
)
llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
llm_with_tools = llm.bind_tools([SubQuery])
parser = PydanticToolsParser(tools=[SubQuery])
query_analyzer = prompt | llm_with_tools | parser
```

Probémoslo:

```python
query_analyzer.invoke({"question": "how to do rag"})
```

```output
[SubQuery(sub_query='How to do rag')]
```

```python
query_analyzer.invoke(
    {
        "question": "how to use multi-modal models in a chain and turn chain into a rest api"
    }
)
```

```output
[SubQuery(sub_query='How to use multi-modal models in a chain?'),
 SubQuery(sub_query='How to turn a chain into a REST API?')]
```

```python
query_analyzer.invoke(
    {
        "question": "what's the difference between web voyager and reflection agents? do they use langgraph?"
    }
)
```

```output
[SubQuery(sub_query='What is Web Voyager and how does it differ from Reflection Agents?'),
 SubQuery(sub_query='Do Web Voyager and Reflection Agents use Langgraph?')]
```

## Agregar ejemplos y ajustar el mensaje

Esto funciona bastante bien, pero probablemente queramos descomponer aún más la última pregunta para separar las consultas sobre Web Voyager y los agentes de reflexión. Si no estamos seguros de antemano de qué tipos de consultas funcionarán mejor con nuestro índice, también podemos incluir intencionadamente cierta redundancia en nuestras consultas, de modo que devolvamos tanto las subconsultas como las consultas de nivel superior.

Para ajustar los resultados de la generación de consultas, podemos agregar algunos ejemplos de preguntas de entrada y consultas estándar de salida a nuestro mensaje. También podemos intentar mejorar nuestro mensaje del sistema.

```python
examples = []
```

```python
question = "What's chat langchain, is it a langchain template?"
queries = [
    SubQuery(sub_query="What is chat langchain"),
    SubQuery(sub_query="What is a langchain template"),
]
examples.append({"input": question, "tool_calls": queries})
```

```python
question = "How would I use LangGraph to build an automaton"
queries = [
    SubQuery(sub_query="How to build automaton with LangGraph"),
]
examples.append({"input": question, "tool_calls": queries})
```

```python
question = "How to build multi-agent system and stream intermediate steps from it"
queries = [
    SubQuery(sub_query="How to build multi-agent system"),
    SubQuery(sub_query="How to stream intermediate steps"),
    SubQuery(sub_query="How to stream intermediate steps from multi-agent system"),
]
examples.append({"input": question, "tool_calls": queries})
```

```python
question = "What's the difference between LangChain agents and LangGraph?"
queries = [
    SubQuery(sub_query="What's the difference between LangChain agents and LangGraph?"),
    SubQuery(sub_query="What are LangChain agents"),
    SubQuery(sub_query="What is LangGraph"),
]
examples.append({"input": question, "tool_calls": queries})
```

Ahora necesitamos actualizar nuestra plantilla de mensaje y nuestra cadena para que los ejemplos se incluyan en cada mensaje. Como estamos trabajando con la función de llamada de OpenAI, necesitaremos hacer un poco de estructuración adicional para enviar los ejemplos de entrada y salida al modelo. Crearemos una función auxiliar `tool_example_to_messages` para manejar esto por nosotros:

```python
import uuid
from typing import Dict, List

from langchain_core.messages import (
    AIMessage,
    BaseMessage,
    HumanMessage,
    SystemMessage,
    ToolMessage,
)


def tool_example_to_messages(example: Dict) -> List[BaseMessage]:
    messages: List[BaseMessage] = [HumanMessage(content=example["input"])]
    openai_tool_calls = []
    for tool_call in example["tool_calls"]:
        openai_tool_calls.append(
            {
                "id": str(uuid.uuid4()),
                "type": "function",
                "function": {
                    "name": tool_call.__class__.__name__,
                    "arguments": tool_call.json(),
                },
            }
        )
    messages.append(
        AIMessage(content="", additional_kwargs={"tool_calls": openai_tool_calls})
    )
    tool_outputs = example.get("tool_outputs") or [
        "This is an example of a correct usage of this tool. Make sure to continue using the tool this way."
    ] * len(openai_tool_calls)
    for output, tool_call in zip(tool_outputs, openai_tool_calls):
        messages.append(ToolMessage(content=output, tool_call_id=tool_call["id"]))
    return messages


example_msgs = [msg for ex in examples for msg in tool_example_to_messages(ex)]
```

```python
from langchain_core.prompts import MessagesPlaceholder

system = """You are an expert at converting user questions into database queries. \
You have access to a database of tutorial videos about a software library for building LLM-powered applications. \

Perform query decomposition. Given a user question, break it down into the most specific sub questions you can \
which will help you answer the original question. Each sub question should be about a single concept/fact/idea.

If there are acronyms or words you are not familiar with, do not try to rephrase them."""
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        MessagesPlaceholder("examples", optional=True),
        ("human", "{question}"),
    ]
)
query_analyzer_with_examples = (
    prompt.partial(examples=example_msgs) | llm_with_tools | parser
)
```

```python
query_analyzer_with_examples.invoke(
    {
        "question": "what's the difference between web voyager and reflection agents? do they use langgraph?"
    }
)
```

```output
[SubQuery(sub_query="What's the difference between web voyager and reflection agents"),
 SubQuery(sub_query='Do web voyager and reflection agents use LangGraph'),
 SubQuery(sub_query='What is web voyager'),
 SubQuery(sub_query='What are reflection agents')]
```
