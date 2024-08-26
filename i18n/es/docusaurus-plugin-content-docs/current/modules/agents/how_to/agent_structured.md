---
translated: true
---

# Devolver salida estructurada

Este cuaderno cubre cómo hacer que un agente devuelva una salida estructurada.
De forma predeterminada, la mayoría de los agentes devuelven una sola cadena.
A menudo puede ser útil tener un agente que devuelva algo con más estructura.

Un buen ejemplo de esto es un agente encargado de hacer preguntas y respuestas sobre algunas fuentes.
Digamos que queremos que el agente responda no solo con la respuesta, sino también con una lista de las fuentes utilizadas.
Luego queremos que nuestra salida siga aproximadamente el siguiente esquema:

```python
class Response(BaseModel):
    """Final response to the question being asked"""
    answer: str = Field(description = "The final answer to respond to the user")
    sources: List[int] = Field(description="List of page chunks that contain answer to the question. Only include a page chunk if it contains relevant information")
```

En este cuaderno veremos un agente que tiene una herramienta de recuperación y responde en el formato correcto.

## Crear el recuperador

En esta sección haremos algunos trabajos de configuración para crear nuestro recuperador sobre algunos datos ficticios que contienen el discurso del "Estado de la Unión". Es importante que agreguemos una etiqueta "page_chunk" a los metadatos de cada documento. Esto es solo algunos datos ficticios destinados a simular un campo de origen. En la práctica, esto probablemente sería la URL o la ruta de un documento.

```python
%pip install -qU langchain langchain-community langchain-openai langchain-chroma
```

```python
from langchain_chroma import Chroma
from langchain_community.document_loaders import TextLoader
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
```

```python
# Load in document to retrieve over
loader = TextLoader("../../state_of_the_union.txt")
documents = loader.load()

# Split document into chunks
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
texts = text_splitter.split_documents(documents)

# Here is where we add in the fake source information
for i, doc in enumerate(texts):
    doc.metadata["page_chunk"] = i

# Create our retriever
embeddings = OpenAIEmbeddings()
vectorstore = Chroma.from_documents(texts, embeddings, collection_name="state-of-union")
retriever = vectorstore.as_retriever()
```

## Crear las herramientas

Ahora crearemos las herramientas que queremos darle al agente. En este caso, es solo una: una herramienta que envuelve nuestro recuperador.

```python
from langchain.tools.retriever import create_retriever_tool

retriever_tool = create_retriever_tool(
    retriever,
    "state-of-union-retriever",
    "Query a retriever to get information about state of the union address",
)
```

## Crear el esquema de respuesta

Aquí es donde definiremos el esquema de respuesta. En este caso, queremos que la respuesta final tenga dos campos: uno para la `respuesta` y otro que es una lista de `fuentes`.

```python
from typing import List

from langchain_core.pydantic_v1 import BaseModel, Field


class Response(BaseModel):
    """Final response to the question being asked"""

    answer: str = Field(description="The final answer to respond to the user")
    sources: List[int] = Field(
        description="List of page chunks that contain answer to the question. Only include a page chunk if it contains relevant information"
    )
```

## Crear la lógica de análisis personalizada

Ahora creamos algo de lógica de análisis personalizada.
Cómo funciona esto es que pasaremos el esquema `Respuesta` al LLM de OpenAI a través de su parámetro `funciones`.
Esto es similar a cómo pasamos herramientas para que el agente las use.

Cuando se llama a la función `Respuesta` por OpenAI, queremos usarla como una señal para volver al usuario.
Cuando se llama a cualquier otra función por OpenAI, la tratamos como una invocación de herramienta.

Por lo tanto, nuestra lógica de análisis tiene los siguientes bloques:

- Si no se llama a ninguna función, suponer que debemos usar la respuesta para responder al usuario y, por lo tanto, devolver `AgentFinish`
- Si se llama a la función `Respuesta`, responder al usuario con las entradas a esa función (nuestra salida estructurada) y, por lo tanto, devolver `AgentFinish`
- Si se llama a cualquier otra función, tratarla como una invocación de herramienta y, por lo tanto, devolver `AgentActionMessageLog`

Tenga en cuenta que estamos usando `AgentActionMessageLog` en lugar de `AgentAction` porque nos permite adjuntar un registro de mensajes que podemos usar en el futuro para volver a pasar al agente.

```python
import json

from langchain_core.agents import AgentActionMessageLog, AgentFinish
```

```python
def parse(output):
    # If no function was invoked, return to user
    if "function_call" not in output.additional_kwargs:
        return AgentFinish(return_values={"output": output.content}, log=output.content)

    # Parse out the function call
    function_call = output.additional_kwargs["function_call"]
    name = function_call["name"]
    inputs = json.loads(function_call["arguments"])

    # If the Response function was invoked, return to the user with the function inputs
    if name == "Response":
        return AgentFinish(return_values=inputs, log=str(function_call))
    # Otherwise, return an agent action
    else:
        return AgentActionMessageLog(
            tool=name, tool_input=inputs, log="", message_log=[output]
        )
```

## Crear el Agente

¡Ahora podemos juntar todo esto! Los componentes de este agente son:

- prompt: un prompt simple con marcadores de posición para la pregunta del usuario y luego el `agent_scratchpad` (cualquier paso intermedio)
- herramientas: podemos adjuntar las herramientas y el formato `Respuesta` al LLM como funciones
- formato de borrador: para dar formato al `agent_scratchpad` de los pasos intermedios, usaremos el estándar `format_to_openai_function_messages`. Esto toma pasos intermedios y los formatea como AIMessages y FunctionMessages.
- analizador de salida: usaremos nuestro analizador personalizado anterior para analizar la respuesta del LLM
- AgentExecutor: usaremos el AgentExecutor estándar para ejecutar el bucle de agente-herramienta-agente-herramienta...

```python
from langchain.agents import AgentExecutor
from langchain.agents.format_scratchpad import format_to_openai_function_messages
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_openai import ChatOpenAI
```

```python
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are a helpful assistant"),
        ("user", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ]
)
```

```python
llm = ChatOpenAI(temperature=0)
```

```python
llm_with_tools = llm.bind_functions([retriever_tool, Response])
```

```python
agent = (
    {
        "input": lambda x: x["input"],
        # Format agent scratchpad from intermediate steps
        "agent_scratchpad": lambda x: format_to_openai_function_messages(
            x["intermediate_steps"]
        ),
    }
    | prompt
    | llm_with_tools
    | parse
)
```

```python
agent_executor = AgentExecutor(tools=[retriever_tool], agent=agent, verbose=True)
```

## Ejecutar el agente

¡Ahora podemos ejecutar el agente! Observe cómo responde con un diccionario con dos claves: `respuesta` y `fuentes`.

```python
agent_executor.invoke(
    {"input": "what did the president say about ketanji brown jackson"},
    return_only_outputs=True,
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m[0m[36;1m[1;3mTonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections.

Tonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service.

One of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court.

And I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.

And for our LGBTQ+ Americans, let’s finally get the bipartisan Equality Act to my desk. The onslaught of state laws targeting transgender Americans and their families is wrong.

As I said last year, especially to our younger transgender Americans, I will always have your back as your President, so you can be yourself and reach your God-given potential.

While it often appears that we never agree, that isn’t true. I signed 80 bipartisan bills into law last year. From preventing government shutdowns to protecting Asian-Americans from still-too-common hate crimes to reforming military justice.

And soon, we’ll strengthen the Violence Against Women Act that I first wrote three decades ago. It is important for us to show the nation that we can come together and do big things.

So tonight I’m offering a Unity Agenda for the Nation. Four big things we can do together.

First, beat the opioid epidemic.

Madam Speaker, Madam Vice President, our First Lady and Second Gentleman. Members of Congress and the Cabinet. Justices of the Supreme Court. My fellow Americans.

Last year COVID-19 kept us apart. This year we are finally together again.

Tonight, we meet as Democrats Republicans and Independents. But most importantly as Americans.

With a duty to one another to the American people to the Constitution.

And with an unwavering resolve that freedom will always triumph over tyranny.

Six days ago, Russia’s Vladimir Putin sought to shake the foundations of the free world thinking he could make it bend to his menacing ways. But he badly miscalculated.

He thought he could roll into Ukraine and the world would roll over. Instead he met a wall of strength he never imagined.

He met the Ukrainian people.

From President Zelenskyy to every Ukrainian, their fearlessness, their courage, their determination, inspires the world.

A former top litigator in private practice. A former federal public defender. And from a family of public school educators and police officers. A consensus builder. Since she’s been nominated, she’s received a broad range of support—from the Fraternal Order of Police to former judges appointed by Democrats and Republicans.

And if we are to advance liberty and justice, we need to secure the Border and fix the immigration system.

We can do both. At our border, we’ve installed new technology like cutting-edge scanners to better detect drug smuggling.

We’ve set up joint patrols with Mexico and Guatemala to catch more human traffickers.

We’re putting in place dedicated immigration judges so families fleeing persecution and violence can have their cases heard faster.

We’re securing commitments and supporting partners in South and Central America to host more refugees and secure their own borders.[0m[32;1m[1;3m{'arguments': '{\n"answer": "President Biden nominated Ketanji Brown Jackson for the United States Supreme Court and described her as one of our nation\'s top legal minds who will continue Justice Breyer\'s legacy of excellence.",\n"sources": [6]\n}', 'name': 'Response'}[0m

[1m> Finished chain.[0m
```

```output
{'answer': "President Biden nominated Ketanji Brown Jackson for the United States Supreme Court and described her as one of our nation's top legal minds who will continue Justice Breyer's legacy of excellence.",
 'sources': [6]}
```
