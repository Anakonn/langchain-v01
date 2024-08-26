---
sidebar_position: 2
translated: true
---

# Agregar ejemplos al prompt

A medida que nuestro análisis de consultas se vuelve más complejo, es posible que el LLM tenga dificultades para entender cómo debe responder exactamente en ciertos escenarios. Para mejorar el rendimiento aquí, podemos agregar ejemplos al prompt para guiar al LLM.

Veamos cómo podemos agregar ejemplos para el analizador de consultas de videos de LangChain YouTube que construimos en el [Inicio rápido](/docs/use_cases/query_analysis/quickstart).

## Configuración

#### Instalar dependencias

```python
# %pip install -qU langchain-core langchain-openai
```

#### Establecer variables de entorno

Usaremos OpenAI en este ejemplo:

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass()

# Optional, uncomment to trace runs with LangSmith. Sign up here: https://smith.langchain.com.
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

## Esquema de consulta

Definiremos un esquema de consulta que queremos que nuestro modelo genere. Para hacer que nuestro análisis de consultas sea un poco más interesante, agregaremos un campo `sub_queries` que contenga preguntas más específicas derivadas de la pregunta de nivel superior.

```python
from typing import List, Optional

from langchain_core.pydantic_v1 import BaseModel, Field

sub_queries_description = """\
If the original question contains multiple distinct sub-questions, \
or if there are more generic questions that would be helpful to answer in \
order to answer the original question, write a list of all relevant sub-questions. \
Make sure this list is comprehensive and covers all parts of the original question. \
It's ok if there's redundancy in the sub-questions. \
Make sure the sub-questions are as narrowly focused as possible."""


class Search(BaseModel):
    """Search over a database of tutorial videos about a software library."""

    query: str = Field(
        ...,
        description="Primary similarity search query applied to video transcripts.",
    )
    sub_queries: List[str] = Field(
        default_factory=list, description=sub_queries_description
    )
    publish_year: Optional[int] = Field(None, description="Year video was published")
```

## Generación de consultas

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI

system = """You are an expert at converting user questions into database queries. \
You have access to a database of tutorial videos about a software library for building LLM-powered applications. \
Given a question, return a list of database queries optimized to retrieve the most relevant results.

If there are acronyms or words you are not familiar with, do not try to rephrase them."""

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        MessagesPlaceholder("examples", optional=True),
        ("human", "{question}"),
    ]
)
llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
structured_llm = llm.with_structured_output(Search)
query_analyzer = {"question": RunnablePassthrough()} | prompt | structured_llm
```

Probemos nuestro analizador de consultas sin ningún ejemplo en el prompt:

```python
query_analyzer.invoke(
    "what's the difference between web voyager and reflection agents? do both use langgraph?"
)
```

```output
Search(query='web voyager vs reflection agents', sub_queries=['difference between web voyager and reflection agents', 'do web voyager and reflection agents use langgraph'], publish_year=None)
```

## Agregar ejemplos y ajustar el prompt

Esto funciona bastante bien, pero probablemente queramos descomponer aún más la pregunta para separar las consultas sobre Web Voyager y Reflection Agents.

Para ajustar los resultados de la generación de consultas, podemos agregar algunos ejemplos de preguntas de entrada y consultas estándar de salida a nuestro prompt.

```python
examples = []
```

```python
question = "What's chat langchain, is it a langchain template?"
query = Search(
    query="What is chat langchain and is it a langchain template?",
    sub_queries=["What is chat langchain", "What is a langchain template"],
)
examples.append({"input": question, "tool_calls": [query]})
```

```python
question = "How to build multi-agent system and stream intermediate steps from it"
query = Search(
    query="How to build multi-agent system and stream intermediate steps from it",
    sub_queries=[
        "How to build multi-agent system",
        "How to stream intermediate steps from multi-agent system",
        "How to stream intermediate steps",
    ],
)

examples.append({"input": question, "tool_calls": [query]})
```

```python
question = "LangChain agents vs LangGraph?"
query = Search(
    query="What's the difference between LangChain agents and LangGraph? How do you deploy them?",
    sub_queries=[
        "What are LangChain agents",
        "What is LangGraph",
        "How do you deploy LangChain agents",
        "How do you deploy LangGraph",
    ],
)
examples.append({"input": question, "tool_calls": [query]})
```

Ahora necesitamos actualizar nuestra plantilla de prompt y la cadena para que los ejemplos se incluyan en cada prompt. Como estamos trabajando con la llamada de función de OpenAI, necesitaremos hacer un poco de estructuración adicional para enviar los ejemplos de entrada y salida al modelo. Crearemos una función `tool_example_to_messages` para manejar esto por nosotros:

```python
import uuid
from typing import Dict

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
        "You have correctly called this tool."
    ] * len(openai_tool_calls)
    for output, tool_call in zip(tool_outputs, openai_tool_calls):
        messages.append(ToolMessage(content=output, tool_call_id=tool_call["id"]))
    return messages


example_msgs = [msg for ex in examples for msg in tool_example_to_messages(ex)]
```

```python
from langchain_core.prompts import MessagesPlaceholder

query_analyzer_with_examples = (
    {"question": RunnablePassthrough()}
    | prompt.partial(examples=example_msgs)
    | structured_llm
)
```

```python
query_analyzer_with_examples.invoke(
    "what's the difference between web voyager and reflection agents? do both use langgraph?"
)
```

```output
Search(query='Difference between web voyager and reflection agents, do they both use LangGraph?', sub_queries=['What is Web Voyager', 'What are Reflection agents', 'Do Web Voyager and Reflection agents use LangGraph'], publish_year=None)
```

Gracias a nuestros ejemplos, obtenemos una consulta de búsqueda ligeramente más descompuesta. Con más ingeniería de prompts y ajuste de nuestros ejemplos, podríamos mejorar aún más la generación de consultas.

Puedes ver que los ejemplos se pasan al modelo como mensajes en el [rastro de LangSmith](https://smith.langchain.com/public/aeaaafce-d2b1-4943-9a61-bc954e8fc6f2/r).
