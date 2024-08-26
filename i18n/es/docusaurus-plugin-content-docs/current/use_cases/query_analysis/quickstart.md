---
sidebar_position: 0
translated: true
---

# Inicio rápido

Esta página mostrará cómo usar el análisis de consultas en un ejemplo básico de principio a fin. Esto cubrirá la creación de un motor de búsqueda simple, mostrará un modo de falla que ocurre al pasar una pregunta de usuario sin procesar a esa búsqueda y luego un ejemplo de cómo el análisis de consultas puede ayudar a abordar ese problema. Hay MUCHAS técnicas diferentes de análisis de consultas y este ejemplo de principio a fin no mostrará todas ellas.

Para el propósito de este ejemplo, haremos la recuperación sobre los videos de YouTube de LangChain.

## Configuración

#### Instalar dependencias

```python
# %pip install -qU langchain langchain-community langchain-openai youtube-transcript-api pytube langchain-chroma
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

### Cargar documentos

Podemos usar el `YouTubeLoader` para cargar los subtítulos de algunos videos de LangChain:

```python
from langchain_community.document_loaders import YoutubeLoader

urls = [
    "https://www.youtube.com/watch?v=HAn9vnJy6S4",
    "https://www.youtube.com/watch?v=dA1cHGACXCo",
    "https://www.youtube.com/watch?v=ZcEMLz27sL4",
    "https://www.youtube.com/watch?v=hvAPnpSfSGo",
    "https://www.youtube.com/watch?v=EhlPDL4QrWY",
    "https://www.youtube.com/watch?v=mmBo8nlu2j0",
    "https://www.youtube.com/watch?v=rQdibOsL1ps",
    "https://www.youtube.com/watch?v=28lC4fqukoc",
    "https://www.youtube.com/watch?v=es-9MgxB-uc",
    "https://www.youtube.com/watch?v=wLRHwKuKvOE",
    "https://www.youtube.com/watch?v=ObIltMaRJvY",
    "https://www.youtube.com/watch?v=DjuXACWYkkU",
    "https://www.youtube.com/watch?v=o7C9ld6Ln-M",
]
docs = []
for url in urls:
    docs.extend(YoutubeLoader.from_youtube_url(url, add_video_info=True).load())
```

```python
import datetime

# Add some additional metadata: what year the video was published
for doc in docs:
    doc.metadata["publish_year"] = int(
        datetime.datetime.strptime(
            doc.metadata["publish_date"], "%Y-%m-%d %H:%M:%S"
        ).strftime("%Y")
    )
```

Aquí están los títulos de los videos que hemos cargado:

```python
[doc.metadata["title"] for doc in docs]
```

```output
['OpenGPTs',
 'Building a web RAG chatbot: using LangChain, Exa (prev. Metaphor), LangSmith, and Hosted Langserve',
 'Streaming Events: Introducing a new `stream_events` method',
 'LangGraph: Multi-Agent Workflows',
 'Build and Deploy a RAG app with Pinecone Serverless',
 'Auto-Prompt Builder (with Hosted LangServe)',
 'Build a Full Stack RAG App With TypeScript',
 'Getting Started with Multi-Modal LLMs',
 'SQL Research Assistant',
 'Skeleton-of-Thought: Building a New Template from Scratch',
 'Benchmarking RAG over LangChain Docs',
 'Building a Research Assistant from Scratch',
 'LangServe and LangChain Templates Webinar']
```

Aquí está la metadata asociada con cada video. Podemos ver que cada documento también tiene un título, recuento de vistas, fecha de publicación y duración:

```python
docs[0].metadata
```

```output
{'source': 'HAn9vnJy6S4',
 'title': 'OpenGPTs',
 'description': 'Unknown',
 'view_count': 7210,
 'thumbnail_url': 'https://i.ytimg.com/vi/HAn9vnJy6S4/hq720.jpg',
 'publish_date': '2024-01-31 00:00:00',
 'length': 1530,
 'author': 'LangChain',
 'publish_year': 2024}
```

Y aquí hay una muestra del contenido de un documento:

```python
docs[0].page_content[:500]
```

```output
"hello today I want to talk about open gpts open gpts is a project that we built here at linkchain uh that replicates the GPT store in a few ways so it creates uh end user-facing friendly interface to create different Bots and these Bots can have access to different tools and they can uh be given files to retrieve things over and basically it's a way to create a variety of bots and expose the configuration of these Bots to end users it's all open source um it can be used with open AI it can be us"
```

### Indexación de documentos

Siempre que realicemos una recuperación, necesitamos crear un índice de documentos que podamos consultar. Usaremos un almacén de vectores para indexar nuestros documentos y los dividiremos en fragmentos primero para que nuestras recuperaciones sean más concisas y precisas:

```python
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

text_splitter = RecursiveCharacterTextSplitter(chunk_size=2000)
chunked_docs = text_splitter.split_documents(docs)
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
vectorstore = Chroma.from_documents(
    chunked_docs,
    embeddings,
)
```

## Recuperación sin análisis de consultas

Podemos realizar una búsqueda de similitud en una pregunta de usuario directamente para encontrar fragmentos relevantes para la pregunta:

```python
search_results = vectorstore.similarity_search("how do I build a RAG agent")
print(search_results[0].metadata["title"])
print(search_results[0].page_content[:500])
```

```output
Build and Deploy a RAG app with Pinecone Serverless
hi this is Lance from the Lang chain team and today we're going to be building and deploying a rag app using pine con serval list from scratch so we're going to kind of walk through all the code required to do this and I'll use these slides as kind of a guide to kind of lay the the ground work um so first what is rag so under capoy has this pretty nice visualization that shows LMS as a kernel of a new kind of operating system and of course one of the core components of our operating system is th
```

¡Esto funciona bastante bien! Nuestro primer resultado es bastante relevante para la pregunta.

¿Qué pasa si quisiéramos buscar resultados de un período de tiempo específico?

```python
search_results = vectorstore.similarity_search("videos on RAG published in 2023")
print(search_results[0].metadata["title"])
print(search_results[0].metadata["publish_date"])
print(search_results[0].page_content[:500])
```

```output
OpenGPTs
2024-01-31
hardcoded that it will always do a retrieval step here the assistant decides whether to do a retrieval step or not sometimes this is good sometimes this is bad sometimes it you don't need to do a retrieval step when I said hi it didn't need to call it tool um but other times you know the the llm might mess up and not realize that it needs to do a retrieval step and so the rag bot will always do a retrieval step so it's more focused there because this is also a simpler architecture so it's always
```

Nuestro primer resultado es de 2024 (a pesar de que le pedimos videos de 2023) y no es muy relevante para la entrada. Dado que solo estamos buscando en el contenido de los documentos, no hay forma de que los resultados se filtren por los atributos de los documentos.

Este es solo un modo de falla que puede surgir. ¡Ahora echemos un vistazo a cómo una forma básica de análisis de consultas puede solucionarlo!

## Análisis de consultas

Podemos usar el análisis de consultas para mejorar los resultados de la recuperación. Esto implicará definir un **esquema de consulta** que contenga algunos filtros de fecha y usar un modelo de llamada a funciones para convertir una pregunta de usuario en consultas estructuradas.

### Esquema de consulta

En este caso tendremos atributos explícitos de fecha mínima y máxima de publicación para que se pueda filtrar.

```python
from typing import Optional

from langchain_core.pydantic_v1 import BaseModel, Field


class Search(BaseModel):
    """Search over a database of tutorial videos about a software library."""

    query: str = Field(
        ...,
        description="Similarity search query applied to video transcripts.",
    )
    publish_year: Optional[int] = Field(None, description="Year video was published")
```

### Generación de consultas

Para convertir las preguntas de los usuarios en consultas estructuradas, utilizaremos la API de llamada a herramientas de OpenAI. Específicamente, usaremos el nuevo [ChatModel.with_structured_output()](/docs/modules/model_io/chat/structured_output) constructor para manejar pasar el esquema al modelo y analizar la salida.

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI

system = """You are an expert at converting user questions into database queries. \
You have access to a database of tutorial videos about a software library for building LLM-powered applications. \
Given a question, return a list of database queries optimized to retrieve the most relevant results.

If there are acronyms or words you are not familiar with, do not try to rephrase them."""
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
/Users/bagatur/langchain/libs/core/langchain_core/_api/beta_decorator.py:86: LangChainBetaWarning: The function `with_structured_output` is in beta. It is actively being worked on, so the API may change.
  warn_beta(
```

Veamos qué consultas genera nuestro analizador para las preguntas que buscamos anteriormente:

```python
query_analyzer.invoke("how do I build a RAG agent")
```

```output
Search(query='build RAG agent', publish_year=None)
```

```python
query_analyzer.invoke("videos on RAG published in 2023")
```

```output
Search(query='RAG', publish_year=2023)
```

## Recuperación con análisis de consultas

Nuestro análisis de consultas se ve bastante bien; ahora probemos usar nuestras consultas generadas para realmente realizar la recuperación.

**Nota:** en nuestro ejemplo, especificamos `tool_choice="Search"`. Esto obligará al LLM a llamar a una - y solo una - herramienta, lo que significa que siempre tendremos una consulta optimizada para buscar. Tenga en cuenta que este no siempre es el caso; consulte otras guías para saber cómo manejar situaciones en las que no se devuelven consultas optimizadas o se devuelven varias.

```python
from typing import List

from langchain_core.documents import Document
```

```python
def retrieval(search: Search) -> List[Document]:
    if search.publish_year is not None:
        # This is syntax specific to Chroma,
        # the vector database we are using.
        _filter = {"publish_year": {"$eq": search.publish_year}}
    else:
        _filter = None
    return vectorstore.similarity_search(search.query, filter=_filter)
```

```python
retrieval_chain = query_analyzer | retrieval
```

Ahora podemos ejecutar esta cadena en la entrada problemática de antes y ver que solo arroja resultados de ese año.

```python
results = retrieval_chain.invoke("RAG tutorial published in 2023")
```

```python
[(doc.metadata["title"], doc.metadata["publish_date"]) for doc in results]
```

```output
[('Getting Started with Multi-Modal LLMs', '2023-12-20 00:00:00'),
 ('LangServe and LangChain Templates Webinar', '2023-11-02 00:00:00'),
 ('Getting Started with Multi-Modal LLMs', '2023-12-20 00:00:00'),
 ('Building a Research Assistant from Scratch', '2023-11-16 00:00:00')]
```
