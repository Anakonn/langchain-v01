---
sidebar_position: 3
translated: true
---

# Estructuración

Uno de los pasos más importantes en la recuperación es convertir una entrada de texto en los parámetros de búsqueda y filtro adecuados. A este proceso de extraer parámetros estructurados de una entrada no estructurada lo denominamos **estructuración de consultas**.

Para ilustrarlo, volvamos a nuestro ejemplo de un bot de preguntas y respuestas sobre los videos de LangChain en YouTube desde el [Inicio rápido](/docs/use_cases/query_analysis/quickstart) y veamos cómo podrían ser las consultas estructuradas más complejas en este caso.

## Configuración

#### Instalar dependencias

```python
# %pip install -qU langchain langchain-openai youtube-transcript-api pytube
```

#### Establecer variables de entorno

Utilizaremos OpenAI en este ejemplo:

```python
import getpass
import os

# os.environ["OPENAI_API_KEY"] = getpass.getpass()

# Optional, uncomment to trace runs with LangSmith. Sign up here: https://smith.langchain.com.
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

### Cargar documento de ejemplo

Carguemos un documento representativo

```python
from langchain_community.document_loaders import YoutubeLoader

docs = YoutubeLoader.from_youtube_url(
    "https://www.youtube.com/watch?v=pbAd8O1Lvm4", add_video_info=True
).load()
```

Aquí está la metadata asociada a un video:

```python
docs[0].metadata
```

```output
{'source': 'pbAd8O1Lvm4',
 'title': 'Self-reflective RAG with LangGraph: Self-RAG and CRAG',
 'description': 'Unknown',
 'view_count': 9006,
 'thumbnail_url': 'https://i.ytimg.com/vi/pbAd8O1Lvm4/hq720.jpg',
 'publish_date': '2024-02-07 00:00:00',
 'length': 1058,
 'author': 'LangChain'}
```

Y aquí hay una muestra del contenido de un documento:

```python
docs[0].page_content[:500]
```

```output
"hi this is Lance from Lang chain I'm going to be talking about using Lang graph to build a diverse and sophisticated rag flows so just to set the stage the basic rag flow you can see here starts with a question retrieval of relevant documents from an index which are passed into the context window of an llm for generation of an answer grounded in the ret documents so that's kind of the basic outline and we can see it's like a very linear path um in practice though you often encounter a few differ"
```

## Esquema de consulta

Para generar consultas estructuradas, primero necesitamos definir nuestro esquema de consulta. Podemos ver que cada documento tiene un título, un recuento de vistas, una fecha de publicación y una duración en segundos. Supongamos que hemos construido un índice que nos permite realizar búsquedas no estructuradas sobre el contenido y el título de cada documento, y utilizar filtros de rango en el recuento de vistas, la fecha de publicación y la duración.

Para comenzar, crearemos un esquema con atributos explícitos de mínimo y máximo para el recuento de vistas, la fecha de publicación y la duración del video, de modo que se puedan filtrar. Y agregaremos atributos separados para las búsquedas en el contenido de la transcripción y en el título del video.

Alternativamente, podríamos crear un esquema más genérico donde, en lugar de tener uno o más atributos de filtro para cada campo filtrable, tenemos un solo atributo `filters` que acepta una lista de tuplas (atributo, condición, valor). También demostraremos cómo hacer esto. Qué enfoque funciona mejor depende de la complejidad de su índice. Si tiene muchos campos filtrables, puede ser mejor tener un solo atributo de consulta `filters`. Si tiene solo unos pocos campos filtrables y/o hay campos que solo se pueden filtrar de formas muy específicas, puede ser útil tener atributos de consulta separados para ellos, cada uno con su propia descripción.

```python
import datetime
from typing import Literal, Optional, Tuple

from langchain_core.pydantic_v1 import BaseModel, Field


class TutorialSearch(BaseModel):
    """Search over a database of tutorial videos about a software library."""

    content_search: str = Field(
        ...,
        description="Similarity search query applied to video transcripts.",
    )
    title_search: str = Field(
        ...,
        description=(
            "Alternate version of the content search query to apply to video titles. "
            "Should be succinct and only include key words that could be in a video "
            "title."
        ),
    )
    min_view_count: Optional[int] = Field(
        None,
        description="Minimum view count filter, inclusive. Only use if explicitly specified.",
    )
    max_view_count: Optional[int] = Field(
        None,
        description="Maximum view count filter, exclusive. Only use if explicitly specified.",
    )
    earliest_publish_date: Optional[datetime.date] = Field(
        None,
        description="Earliest publish date filter, inclusive. Only use if explicitly specified.",
    )
    latest_publish_date: Optional[datetime.date] = Field(
        None,
        description="Latest publish date filter, exclusive. Only use if explicitly specified.",
    )
    min_length_sec: Optional[int] = Field(
        None,
        description="Minimum video length in seconds, inclusive. Only use if explicitly specified.",
    )
    max_length_sec: Optional[int] = Field(
        None,
        description="Maximum video length in seconds, exclusive. Only use if explicitly specified.",
    )

    def pretty_print(self) -> None:
        for field in self.__fields__:
            if getattr(self, field) is not None and getattr(self, field) != getattr(
                self.__fields__[field], "default", None
            ):
                print(f"{field}: {getattr(self, field)}")
```

## Generación de consultas

Para convertir las preguntas de los usuarios en consultas estructuradas, haremos uso de un modelo de llamada a funciones, como ChatOpenAI. LangChain tiene algunos constructores agradables que facilitan la especificación de un esquema de llamada a función deseado a través de una clase Pydantic:

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

system = """You are an expert at converting user questions into database queries. \
You have access to a database of tutorial videos about a software library for building LLM-powered applications. \
Given a question, return a database query optimized to retrieve the most relevant results.

If there are acronyms or words you are not familiar with, do not try to rephrase them."""
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        ("human", "{question}"),
    ]
)
llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
structured_llm = llm.with_structured_output(TutorialSearch)
query_analyzer = prompt | structured_llm
```

Probémoslo:

```python
query_analyzer.invoke({"question": "rag from scratch"}).pretty_print()
```

```output
content_search: rag from scratch
title_search: rag from scratch
```

```python
query_analyzer.invoke(
    {"question": "videos on chat langchain published in 2023"}
).pretty_print()
```

```output
content_search: chat langchain
title_search: chat langchain
earliest_publish_date: 2023-01-01
latest_publish_date: 2024-01-01
```

```python
query_analyzer.invoke(
    {
        "question": "how to use multi-modal models in an agent, only videos under 5 minutes"
    }
).pretty_print()
```

```output
content_search: multi-modal models agent
title_search: multi-modal models agent
max_length_sec: 300
```

## Alternativa: Esquema conciso

Si tenemos muchos campos filtrables, tener un esquema detallado podría perjudicar el rendimiento o incluso no ser posible dado las limitaciones en el tamaño de los esquemas de función. En estos casos, podemos intentar esquemas de consulta más concisos que intercambien algo de la explicitez de la dirección por concisión:

```python
from typing import List, Literal, Union


class Filter(BaseModel):
    field: Literal["view_count", "publish_date", "length_sec"]
    comparison: Literal["eq", "lt", "lte", "gt", "gte"]
    value: Union[int, datetime.date] = Field(
        ...,
        description="If field is publish_date then value must be a ISO-8601 format date",
    )


class TutorialSearch(BaseModel):
    """Search over a database of tutorial videos about a software library."""

    content_search: str = Field(
        ...,
        description="Similarity search query applied to video transcripts.",
    )
    title_search: str = Field(
        ...,
        description=(
            "Alternate version of the content search query to apply to video titles. "
            "Should be succinct and only include key words that could be in a video "
            "title."
        ),
    )
    filters: List[Filter] = Field(
        default_factory=list,
        description="Filters over specific fields. Final condition is a logical conjunction of all filters.",
    )

    def pretty_print(self) -> None:
        for field in self.__fields__:
            if getattr(self, field) is not None and getattr(self, field) != getattr(
                self.__fields__[field], "default", None
            ):
                print(f"{field}: {getattr(self, field)}")
```

```python
structured_llm = llm.with_structured_output(TutorialSearch)
query_analyzer = prompt | structured_llm
```

Probémoslo:

```python
query_analyzer.invoke({"question": "rag from scratch"}).pretty_print()
```

```output
content_search: rag from scratch
title_search: rag
filters: []
```

```python
query_analyzer.invoke(
    {"question": "videos on chat langchain published in 2023"}
).pretty_print()
```

```output
content_search: chat langchain
title_search: 2023
filters: [Filter(field='publish_date', comparison='eq', value=datetime.date(2023, 1, 1))]
```

```python
query_analyzer.invoke(
    {
        "question": "how to use multi-modal models in an agent, only videos under 5 minutes and with over 276 views"
    }
).pretty_print()
```

```output
content_search: multi-modal models in an agent
title_search: multi-modal models agent
filters: [Filter(field='length_sec', comparison='lt', value=300), Filter(field='view_count', comparison='gte', value=276)]
```

Podemos ver que el analizador maneja bien los enteros, pero tiene problemas con los rangos de fechas. Podemos intentar ajustar la descripción de nuestro esquema y/o nuestro mensaje para corregir esto:

```python
class TutorialSearch(BaseModel):
    """Search over a database of tutorial videos about a software library."""

    content_search: str = Field(
        ...,
        description="Similarity search query applied to video transcripts.",
    )
    title_search: str = Field(
        ...,
        description=(
            "Alternate version of the content search query to apply to video titles. "
            "Should be succinct and only include key words that could be in a video "
            "title."
        ),
    )
    filters: List[Filter] = Field(
        default_factory=list,
        description=(
            "Filters over specific fields. Final condition is a logical conjunction of all filters. "
            "If a time period longer than one day is specified then it must result in filters that define a date range. "
            f"Keep in mind the current date is {datetime.date.today().strftime('%m-%d-%Y')}."
        ),
    )

    def pretty_print(self) -> None:
        for field in self.__fields__:
            if getattr(self, field) is not None and getattr(self, field) != getattr(
                self.__fields__[field], "default", None
            ):
                print(f"{field}: {getattr(self, field)}")


structured_llm = llm.with_structured_output(TutorialSearch)
query_analyzer = prompt | structured_llm
```

```python
query_analyzer.invoke(
    {"question": "videos on chat langchain published in 2023"}
).pretty_print()
```

```output
content_search: chat langchain
title_search: chat langchain
filters: [Filter(field='publish_date', comparison='gte', value=datetime.date(2023, 1, 1)), Filter(field='publish_date', comparison='lte', value=datetime.date(2023, 12, 31))]
```

¡Esto parece funcionar!

## Ordenación: Más allá de la búsqueda

Con ciertos índices, la búsqueda por campo no es la única forma de recuperar resultados: también podemos ordenar los documentos por un campo y recuperar los principales resultados ordenados. Con la consulta estructurada, esto es fácil de acomodar al agregar campos de consulta separados que especifiquen cómo ordenar los resultados.

```python
class TutorialSearch(BaseModel):
    """Search over a database of tutorial videos about a software library."""

    content_search: str = Field(
        "",
        description="Similarity search query applied to video transcripts.",
    )
    title_search: str = Field(
        "",
        description=(
            "Alternate version of the content search query to apply to video titles. "
            "Should be succinct and only include key words that could be in a video "
            "title."
        ),
    )
    min_view_count: Optional[int] = Field(
        None, description="Minimum view count filter, inclusive."
    )
    max_view_count: Optional[int] = Field(
        None, description="Maximum view count filter, exclusive."
    )
    earliest_publish_date: Optional[datetime.date] = Field(
        None, description="Earliest publish date filter, inclusive."
    )
    latest_publish_date: Optional[datetime.date] = Field(
        None, description="Latest publish date filter, exclusive."
    )
    min_length_sec: Optional[int] = Field(
        None, description="Minimum video length in seconds, inclusive."
    )
    max_length_sec: Optional[int] = Field(
        None, description="Maximum video length in seconds, exclusive."
    )
    sort_by: Literal[
        "relevance",
        "view_count",
        "publish_date",
        "length",
    ] = Field("relevance", description="Attribute to sort by.")
    sort_order: Literal["ascending", "descending"] = Field(
        "descending", description="Whether to sort in ascending or descending order."
    )

    def pretty_print(self) -> None:
        for field in self.__fields__:
            if getattr(self, field) is not None and getattr(self, field) != getattr(
                self.__fields__[field], "default", None
            ):
                print(f"{field}: {getattr(self, field)}")


structured_llm = llm.with_structured_output(TutorialSearch)
query_analyzer = prompt | structured_llm
```

```python
query_analyzer.invoke(
    {"question": "What has LangChain released lately?"}
).pretty_print()
```

```output
title_search: LangChain
sort_by: publish_date
```

```python
query_analyzer.invoke({"question": "What are the longest videos?"}).pretty_print()
```

```output
sort_by: length
```

Incluso podemos admitir la búsqueda y la ordenación juntas. Esto podría parecerse a recuperar primero todos los resultados por encima de un umbral de relevancia y luego ordenarlos según el atributo especificado:

```python
query_analyzer.invoke(
    {"question": "What are the shortest videos about agents?"}
).pretty_print()
```

```output
content_search: agents
sort_by: length
sort_order: ascending
```
