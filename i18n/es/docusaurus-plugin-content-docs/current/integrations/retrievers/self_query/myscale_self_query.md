---
traducido: falso
translated: true
---

# MyScale

>[MyScale](https://docs.myscale.com/en/) es una base de datos vectorial integrada. Puedes acceder a tu base de datos en SQL y también desde aquí, LangChain.
>`MyScale` puede hacer uso de [varios tipos de datos y funciones para filtros](https://blog.myscale.com/2023/06/06/why-integrated-database-solution-can-boost-your-llm-apps/#filter-on-anything-without-constraints). Impulsará tu aplicación LLM sin importar si estás escalando tus datos o expandiendo tu sistema a aplicaciones más amplias.

En el cuaderno, demostraremos el `SelfQueryRetriever` envuelto alrededor de un almacén de vectores `MyScale` con algunas piezas adicionales que contribuimos a LangChain.

En resumen, se puede condensar en 4 puntos:
1. Agregar el comparador `contain` para coincidir con la lista de cualquiera si hay más de un elemento coincidente
2. Agregar el tipo de datos `timestamp` para la coincidencia de fecha y hora (formato ISO o AAAA-MM-DD)
3. Agregar el comparador `like` para la búsqueda de patrones de cadena
4. Agregar la capacidad de función arbitraria

## Creando un almacén de vectores MyScale

MyScale ya se ha integrado a LangChain durante un tiempo. Entonces puedes seguir [este cuaderno](/docs/integrations/vectorstores/myscale) para crear tu propio almacén de vectores para un recuperador de autoconsula.

**Nota:** Todos los recuperadores de autoconsula requieren que tengas `lark` instalado (`pip install lark`). Usamos `lark` para la definición de gramática. Antes de proceder al siguiente paso, también queremos recordarte que `clickhouse-connect` también es necesario para interactuar con tu backend MyScale.

```python
%pip install --upgrade --quiet  lark clickhouse-connect
```

En este tutorial seguimos la configuración de otros ejemplos y usamos `OpenAIEmbeddings`. Recuerda obtener una clave API de OpenAI para tener acceso válido a LLMs.

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
os.environ["MYSCALE_HOST"] = getpass.getpass("MyScale URL:")
os.environ["MYSCALE_PORT"] = getpass.getpass("MyScale Port:")
os.environ["MYSCALE_USERNAME"] = getpass.getpass("MyScale Username:")
os.environ["MYSCALE_PASSWORD"] = getpass.getpass("MyScale Password:")
```

```python
from langchain_community.vectorstores import MyScale
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings()
```

## Crear algunos datos de muestra

Como puedes ver, los datos que creamos tienen algunas diferencias en comparación con otros recuperadores de autoconsula. Reemplazamos la palabra clave `year` con `date` que te da un control más fino sobre las marcas de tiempo. También cambiamos el tipo de la palabra clave `gerne` a una lista de cadenas, donde un LLM puede usar un nuevo comparador `contain` para construir filtros. También proporcionamos el comparador `like` y el soporte de función arbitraria a los filtros, que se introducirán en las próximas celdas.

Ahora veamos los datos primero.

```python
docs = [
    Document(
        page_content="A bunch of scientists bring back dinosaurs and mayhem breaks loose",
        metadata={"date": "1993-07-02", "rating": 7.7, "genre": ["science fiction"]},
    ),
    Document(
        page_content="Leo DiCaprio gets lost in a dream within a dream within a dream within a ...",
        metadata={"date": "2010-12-30", "director": "Christopher Nolan", "rating": 8.2},
    ),
    Document(
        page_content="A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea",
        metadata={"date": "2006-04-23", "director": "Satoshi Kon", "rating": 8.6},
    ),
    Document(
        page_content="A bunch of normal-sized women are supremely wholesome and some men pine after them",
        metadata={"date": "2019-08-22", "director": "Greta Gerwig", "rating": 8.3},
    ),
    Document(
        page_content="Toys come alive and have a blast doing so",
        metadata={"date": "1995-02-11", "genre": ["animated"]},
    ),
    Document(
        page_content="Three men walk into the Zone, three men walk out of the Zone",
        metadata={
            "date": "1979-09-10",
            "director": "Andrei Tarkovsky",
            "genre": ["science fiction", "adventure"],
            "rating": 9.9,
        },
    ),
]
vectorstore = MyScale.from_documents(
    docs,
    embeddings,
)
```

## Creando nuestro recuperador de autoconsula

Al igual que otros recuperadores... simple y agradable.

```python
from langchain.chains.query_constructor.base import AttributeInfo
from langchain.retrievers.self_query.base import SelfQueryRetriever
from langchain_openai import OpenAI

metadata_field_info = [
    AttributeInfo(
        name="genre",
        description="The genres of the movie",
        type="list[string]",
    ),
    # If you want to include length of a list, just define it as a new column
    # This will teach the LLM to use it as a column when constructing filter.
    AttributeInfo(
        name="length(genre)",
        description="The length of genres of the movie",
        type="integer",
    ),
    # Now you can define a column as timestamp. By simply set the type to timestamp.
    AttributeInfo(
        name="date",
        description="The date the movie was released",
        type="timestamp",
    ),
    AttributeInfo(
        name="director",
        description="The name of the movie director",
        type="string",
    ),
    AttributeInfo(
        name="rating", description="A 1-10 rating for the movie", type="float"
    ),
]
document_content_description = "Brief summary of a movie"
llm = OpenAI(temperature=0)
retriever = SelfQueryRetriever.from_llm(
    llm, vectorstore, document_content_description, metadata_field_info, verbose=True
)
```

## Probándolo con las funcionalidades existentes del recuperador de autoconsula

¡Y ahora podemos intentar usar realmente nuestro recuperador!

```python
# This example only specifies a relevant query
retriever.invoke("What are some movies about dinosaurs")
```

```python
# This example only specifies a filter
retriever.invoke("I want to watch a movie rated higher than 8.5")
```

```python
# This example specifies a query and a filter
retriever.invoke("Has Greta Gerwig directed any movies about women")
```

```python
# This example specifies a composite filter
retriever.invoke("What's a highly rated (above 8.5) science fiction film?")
```

```python
# This example specifies a query and composite filter
retriever.invoke(
    "What's a movie after 1990 but before 2005 that's all about toys, and preferably is animated"
)
```

# Espera un segundo... ¿qué más?

¡El recuperador de autoconsula con MyScale puede hacer más! Vamos a descubrirlo.

```python
# You can use length(genres) to do anything you want
retriever.invoke("What's a movie that have more than 1 genres?")
```

```python
# Fine-grained datetime? You got it already.
retriever.invoke("What's a movie that release after feb 1995?")
```

```python
# Don't know what your exact filter should be? Use string pattern match!
retriever.invoke("What's a movie whose name is like Andrei?")
```

```python
# Contain works for lists: so you can match a list with contain comparator!
retriever.invoke("What's a movie who has genres science fiction and adventure?")
```

## Filtrar k

También podemos usar el recuperador de autoconsula para especificar `k`: el número de documentos a recuperar.

Podemos hacer esto pasando `enable_limit=True` al constructor.

```python
retriever = SelfQueryRetriever.from_llm(
    llm,
    vectorstore,
    document_content_description,
    metadata_field_info,
    enable_limit=True,
    verbose=True,
)
```

```python
# This example only specifies a relevant query
retriever.invoke("what are two movies about dinosaurs")
```
