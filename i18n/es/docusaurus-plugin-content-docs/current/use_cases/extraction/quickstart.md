---
sidebar_position: 0
title: Inicio rápido
translated: true
---

En este inicio rápido, utilizaremos [modelos de chat](/docs/modules/model_io/chat/) que son capaces de **llamar a funciones/herramientas** para extraer información del texto.

:::important
La extracción mediante **llamada a funciones/herramientas** solo funciona con [modelos que admiten **llamada a funciones/herramientas**](/docs/modules/model_io/chat/function_calling).
:::

## Configuración

Utilizaremos el método de [salida estructurada](/docs/modules/model_io/chat/structured_output) disponible en los LLM que son capaces de **llamar a funciones/herramientas**.

¡Selecciona un modelo, instala las dependencias y configura las claves API!

```python
!pip install langchain

# Install a model capable of tool calling
# pip install langchain-openai
# pip install langchain-mistralai
# pip install langchain-fireworks

# Set env vars for the relevant model or load from a .env file:
# import dotenv
# dotenv.load_dotenv()
```

## El esquema

Primero, necesitamos describir qué información queremos extraer del texto.

Utilizaremos Pydantic para definir un esquema de ejemplo para extraer información personal.

```python
from typing import Optional

from langchain_core.pydantic_v1 import BaseModel, Field


class Person(BaseModel):
    """Information about a person."""

    # ^ Doc-string for the entity Person.
    # This doc-string is sent to the LLM as the description of the schema Person,
    # and it can help to improve extraction results.

    # Note that:
    # 1. Each field is an `optional` -- this allows the model to decline to extract it!
    # 2. Each field has a `description` -- this description is used by the LLM.
    # Having a good description can help improve extraction results.
    name: Optional[str] = Field(default=None, description="The name of the person")
    hair_color: Optional[str] = Field(
        default=None, description="The color of the peron's hair if known"
    )
    height_in_meters: Optional[str] = Field(
        default=None, description="Height measured in meters"
    )
```

Hay dos mejores prácticas al definir el esquema:

1. Documentar los **atributos** y el **esquema** en sí: Esta información se envía al LLM y se utiliza para mejorar la calidad de la extracción de información.
2. ¡No obligues al LLM a inventar información! Arriba usamos `Optional` para los atributos, lo que permite que el LLM devuelva `None` si no conoce la respuesta.

:::important
Para obtener un mejor rendimiento, documenta bien el esquema y asegúrate de que el modelo no se vea obligado a devolver resultados si no hay información que extraer en el texto.
:::

## El extractor

Creemos un extractor de información utilizando el esquema que definimos anteriormente.

```python
from typing import Optional

from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_openai import ChatOpenAI

# Define a custom prompt to provide instructions and any additional context.
# 1) You can add examples into the prompt template to improve extraction quality
# 2) Introduce additional parameters to take context into account (e.g., include metadata
#    about the document from which the text was extracted.)
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are an expert extraction algorithm. "
            "Only extract relevant information from the text. "
            "If you do not know the value of an attribute asked to extract, "
            "return null for the attribute's value.",
        ),
        # Please see the how-to about improving performance with
        # reference examples.
        # MessagesPlaceholder('examples'),
        ("human", "{text}"),
    ]
)
```

Necesitamos utilizar un modelo que admita la llamada a funciones/herramientas.

Consulta [salida estructurada](/docs/modules/model_io/chat/structured_output) para ver una lista de algunos modelos que se pueden utilizar con esta API.

```python
from langchain_mistralai import ChatMistralAI

llm = ChatMistralAI(model="mistral-large-latest", temperature=0)

runnable = prompt | llm.with_structured_output(schema=Person)
```

Probémoslo

```python
text = "Alan Smith is 6 feet tall and has blond hair."
runnable.invoke({"text": text})
```

```output
Person(name='Alan Smith', hair_color='blond', height_in_meters='1.8288')
```

:::important

La extracción es generativa 🤯

Los LLM son modelos generativos, por lo que pueden hacer cosas bastante geniales, como extraer correctamente la altura de la persona en metros
¡incluso si se proporcionó en pies!
:::

## Múltiples entidades

En **la mayoría de los casos**, debes extraer una lista de entidades en lugar de una sola entidad.

Esto se puede lograr fácilmente usando pydantic anidando modelos unos dentro de otros.

```python
from typing import List, Optional

from langchain_core.pydantic_v1 import BaseModel, Field


class Person(BaseModel):
    """Information about a person."""

    # ^ Doc-string for the entity Person.
    # This doc-string is sent to the LLM as the description of the schema Person,
    # and it can help to improve extraction results.

    # Note that:
    # 1. Each field is an `optional` -- this allows the model to decline to extract it!
    # 2. Each field has a `description` -- this description is used by the LLM.
    # Having a good description can help improve extraction results.
    name: Optional[str] = Field(default=None, description="The name of the person")
    hair_color: Optional[str] = Field(
        default=None, description="The color of the peron's hair if known"
    )
    height_in_meters: Optional[str] = Field(
        default=None, description="Height measured in meters"
    )


class Data(BaseModel):
    """Extracted data about people."""

    # Creates a model so that we can extract multiple entities.
    people: List[Person]
```

:::important
Es posible que la extracción no sea perfecta aquí. ¡Continúa para ver cómo usar **ejemplos de referencia** para mejorar la calidad de la extracción y consulta la sección de **pautas**!
:::

```python
runnable = prompt | llm.with_structured_output(schema=Data)
text = "My name is Jeff, my hair is black and i am 6 feet tall. Anna has the same color hair as me."
runnable.invoke({"text": text})
```

```output
Data(people=[Person(name='Jeff', hair_color=None, height_in_meters=None), Person(name='Anna', hair_color=None, height_in_meters=None)])
```

:::tip
Cuando el esquema acomoda la extracción de **múltiples entidades**, también permite que el modelo extraiga **ninguna entidad** si no hay información relevante
en el texto proporcionando una lista vacía.

¡Esto suele ser una **buena** cosa! Permite especificar atributos **obligatorios** en una entidad sin necesariamente obligar al modelo a detectar esta entidad.
:::

## Próximos pasos

Ahora que entiendes los conceptos básicos de la extracción con LangChain, estás listo para proceder con el resto de la guía de uso:

- [Agregar ejemplos](/docs/use_cases/extraction/how_to/examples): Aprende a usar **ejemplos de referencia** para mejorar el rendimiento.
- [Manejar texto largo](/docs/use_cases/extraction/how_to/handle_long_text): ¿Qué debes hacer si el texto no cabe en la ventana de contexto del LLM?
- [Manejar archivos](/docs/use_cases/extraction/how_to/handle_files): Ejemplos de uso de cargadores y analizadores de documentos de LangChain para extraer de archivos como PDF.
- [Usar un enfoque de análisis](/docs/use_cases/extraction/how_to/parse): Usa un enfoque basado en indicaciones para extraer con modelos que no admiten **llamada a herramientas/funciones**.
- [Pautas](/docs/use_cases/extraction/guidelines): Pautas para obtener un buen rendimiento en tareas de extracción.
