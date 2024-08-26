---
sidebar_position: 4
translated: true
---

# Manejar múltiples consultas

A veces, una técnica de análisis de consultas puede permitir la generación de múltiples consultas. En estos casos, debemos recordar ejecutar todas las consultas y luego combinar los resultados. Mostraremos un ejemplo sencillo (utilizando datos ficticios) de cómo hacer eso.

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

texts = ["Harrison worked at Kensho", "Ankush worked at Facebook"]
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
vectorstore = Chroma.from_texts(
    texts,
    embeddings,
)
retriever = vectorstore.as_retriever(search_kwargs={"k": 1})
```

## Análisis de consultas

Utilizaremos la llamada a funciones para estructurar la salida. Dejaremos que devuelva múltiples consultas.

```python
from typing import List, Optional

from langchain_core.pydantic_v1 import BaseModel, Field


class Search(BaseModel):
    """Search over a database of job records."""

    queries: List[str] = Field(
        ...,
        description="Distinct queries to search for",
    )
```

```python
from langchain_core.output_parsers.openai_tools import PydanticToolsParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI

output_parser = PydanticToolsParser(tools=[Search])

system = """You have the ability to issue search queries to get information to help answer user information.

If you need to look up two distinct pieces of information, you are allowed to do that!"""
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

```output
/Users/harrisonchase/workplace/langchain/libs/core/langchain_core/_api/beta_decorator.py:86: LangChainBetaWarning: The function `with_structured_output` is in beta. It is actively being worked on, so the API may change.
  warn_beta(
```

Podemos ver que esto permite crear múltiples consultas

```python
query_analyzer.invoke("where did Harrison Work")
```

```output
Search(queries=['Harrison work location'])
```

```python
query_analyzer.invoke("where did Harrison and ankush Work")
```

```output
Search(queries=['Harrison work place', 'Ankush work place'])
```

## Recuperación con análisis de consultas

Entonces, ¿cómo incluiríamos esto en una cadena? Una cosa que lo facilitará mucho es si llamamos a nuestro recuperador de forma asincrónica: esto nos permitirá recorrer las consultas y no bloquearnos en el tiempo de respuesta.

```python
from langchain_core.runnables import chain
```

```python
@chain
async def custom_chain(question):
    response = await query_analyzer.ainvoke(question)
    docs = []
    for query in response.queries:
        new_docs = await retriever.ainvoke(query)
        docs.extend(new_docs)
    # You probably want to think about reranking or deduplicating documents here
    # But that is a separate topic
    return docs
```

```python
await custom_chain.ainvoke("where did Harrison Work")
```

```output
[Document(page_content='Harrison worked at Kensho')]
```

```python
await custom_chain.ainvoke("where did Harrison and ankush Work")
```

```output
[Document(page_content='Harrison worked at Kensho'),
 Document(page_content='Ankush worked at Facebook')]
```
