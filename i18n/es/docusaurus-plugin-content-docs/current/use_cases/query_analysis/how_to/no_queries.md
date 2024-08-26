---
sidebar_position: 3
translated: true
---

# Manejar casos en los que no se generan consultas

A veces, una técnica de análisis de consultas puede permitir que se genere cualquier número de consultas, ¡incluyendo ninguna! En este caso, nuestra cadena general deberá inspeccionar el resultado del análisis de consultas antes de decidir si llamar al recuperador o no.

Utilizaremos datos ficticios para este ejemplo.

## Configuración

#### Instalar dependencias

```python
# %pip install -qU langchain langchain-community langchain-openai langchain-chroma
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

### Crear índice

Crearemos un almacén vectorial sobre información falsa.

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings

texts = ["Harrison worked at Kensho"]
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
vectorstore = Chroma.from_texts(
    texts,
    embeddings,
)
retriever = vectorstore.as_retriever()
```

## Análisis de consultas

Utilizaremos la llamada de funciones para estructurar la salida. Sin embargo, configuraremos el LLM de tal manera que no NECESITE llamar a la función que representa una consulta de búsqueda (en caso de que decida no hacerlo). También utilizaremos un mensaje para realizar el análisis de consultas que indique explícitamente cuándo se debe y cuándo no se debe realizar una búsqueda.

```python
from typing import Optional

from langchain_core.pydantic_v1 import BaseModel, Field


class Search(BaseModel):
    """Search over a database of job records."""

    query: str = Field(
        ...,
        description="Similarity search query applied to job record.",
    )
```

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI

system = """You have the ability to issue search queries to get information to help answer user information.

You do not NEED to look things up. If you don't need to, then just respond normally."""
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "{question}"),
    ]
)
llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
structured_llm = llm.bind_tools([Search])
query_analyzer = {"question": RunnablePassthrough()} | prompt | structured_llm
```

Podemos ver que al invocar esto obtenemos un mensaje que a veces, pero no siempre, devuelve una llamada a una herramienta.

```python
query_analyzer.invoke("where did Harrison Work")
```

```output
AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_ZnoVX4j9Mn8wgChaORyd1cvq', 'function': {'arguments': '{"query":"Harrison"}', 'name': 'Search'}, 'type': 'function'}]})
```

```python
query_analyzer.invoke("hi!")
```

```output
AIMessage(content='Hello! How can I assist you today?')
```

## Recuperación con análisis de consultas

Entonces, ¿cómo incluiríamos esto en una cadena? Veamos un ejemplo a continuación.

```python
from langchain_core.output_parsers.openai_tools import PydanticToolsParser
from langchain_core.runnables import chain

output_parser = PydanticToolsParser(tools=[Search])
```

```python
@chain
def custom_chain(question):
    response = query_analyzer.invoke(question)
    if "tool_calls" in response.additional_kwargs:
        query = output_parser.invoke(response)
        docs = retriever.invoke(query[0].query)
        # Could add more logic - like another LLM call - here
        return docs
    else:
        return response
```

```python
custom_chain.invoke("where did Harrison Work")
```

```output
Number of requested results 4 is greater than number of elements in index 1, updating n_results = 1
```

```output
[Document(page_content='Harrison worked at Kensho')]
```

```python
custom_chain.invoke("hi!")
```

```output
AIMessage(content='Hello! How can I assist you today?')
```
