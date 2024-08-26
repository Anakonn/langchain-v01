---
sidebar_position: 5
translated: true
---

# Manejar múltiples recuperadores

A veces, una técnica de análisis de consultas puede permitir la selección de qué recuperador usar. Para usar esto, deberá agregar algo de lógica para seleccionar el recuperador a usar. Mostraremos un ejemplo sencillo (usando datos ficticios) de cómo hacer eso.

## Configuración

#### Instalar dependencias

```python
# %pip install -qU langchain langchain-community langchain-openai langchain-chroma
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

### Crear índice

Crearemos un almacén vectorial sobre información falsa.

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings

texts = ["Harrison worked at Kensho"]
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
vectorstore = Chroma.from_texts(texts, embeddings, collection_name="harrison")
retriever_harrison = vectorstore.as_retriever(search_kwargs={"k": 1})

texts = ["Ankush worked at Facebook"]
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
vectorstore = Chroma.from_texts(texts, embeddings, collection_name="ankush")
retriever_ankush = vectorstore.as_retriever(search_kwargs={"k": 1})
```

## Análisis de consultas

Usaremos la llamada de funciones para estructurar la salida. Dejaremos que devuelva varias consultas.

```python
from typing import List, Optional

from langchain_core.pydantic_v1 import BaseModel, Field


class Search(BaseModel):
    """Search for information about a person."""

    query: str = Field(
        ...,
        description="Query to look up",
    )
    person: str = Field(
        ...,
        description="Person to look things up for. Should be `HARRISON` or `ANKUSH`.",
    )
```

```python
from langchain_core.output_parsers.openai_tools import PydanticToolsParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI

output_parser = PydanticToolsParser(tools=[Search])

system = """You have the ability to issue search queries to get information to help answer user information."""
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "{question}"),
    ]
)
llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
structured_llm = llm.with_structured_output(Search)
query_analyzer = {"question": RunnablePassthrough()} | prompt | structured_llm
```

Podemos ver que esto permite el enrutamiento entre los recuperadores

```python
query_analyzer.invoke("where did Harrison Work")
```

```output
Search(query='workplace', person='HARRISON')
```

```python
query_analyzer.invoke("where did ankush Work")
```

```output
Search(query='workplace', person='ANKUSH')
```

## Recuperación con análisis de consultas

Entonces, ¿cómo incluiríamos esto en una cadena? Solo necesitamos una lógica simple para seleccionar el recuperador y pasar la consulta de búsqueda

```python
from langchain_core.runnables import chain
```

```python
retrievers = {
    "HARRISON": retriever_harrison,
    "ANKUSH": retriever_ankush,
}
```

```python
@chain
def custom_chain(question):
    response = query_analyzer.invoke(question)
    retriever = retrievers[response.person]
    return retriever.invoke(response.query)
```

```python
custom_chain.invoke("where did Harrison Work")
```

```output
[Document(page_content='Harrison worked at Kensho')]
```

```python
custom_chain.invoke("where did ankush Work")
```

```output
[Document(page_content='Ankush worked at Facebook')]
```
