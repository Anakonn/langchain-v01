---
translated: true
---

# Milvus

>[Milvus](https://milvus.io/docs/overview.md) es una base de datos que almacena, indexa y administra enormes vectores de incrustación generados por redes neuronales profundas y otros modelos de aprendizaje automático (ML).

En el tutorial, demostraremos el `SelfQueryRetriever` con un almacén de vectores `Milvus`.

## Creación de un almacén de vectores Milvus

Primero querremos crear un VectorStore de Milvus y sembrarlo con algunos datos. Hemos creado un pequeño conjunto de datos de demostración de documentos que contienen resúmenes de películas.

He utilizado la versión en la nube de Milvus, por lo que necesito `uri` y `token` también.

NOTA: El recuperador de autoconsuita requiere que tengas `lark` instalado (`pip install lark`). También necesitamos el paquete `pymilvus`.

```python
%pip install --upgrade --quiet  lark
```

```python
%pip install --upgrade --quiet  pymilvus
```

Queremos usar `OpenAIEmbeddings`, así que tenemos que obtener la clave API de OpenAI.

```python
import os

OPENAI_API_KEY = "Use your OpenAI key:)"

os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY
```

```python
from langchain_community.vectorstores import Milvus
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings()
```

```python
docs = [
    Document(
        page_content="A bunch of scientists bring back dinosaurs and mayhem breaks loose",
        metadata={"year": 1993, "rating": 7.7, "genre": "action"},
    ),
    Document(
        page_content="Leo DiCaprio gets lost in a dream within a dream within a dream within a ...",
        metadata={"year": 2010, "genre": "thriller", "rating": 8.2},
    ),
    Document(
        page_content="A bunch of normal-sized women are supremely wholesome and some men pine after them",
        metadata={"year": 2019, "rating": 8.3, "genre": "drama"},
    ),
    Document(
        page_content="Three men walk into the Zone, three men walk out of the Zone",
        metadata={"year": 1979, "rating": 9.9, "genre": "science fiction"},
    ),
    Document(
        page_content="A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea",
        metadata={"year": 2006, "genre": "thriller", "rating": 9.0},
    ),
    Document(
        page_content="Toys come alive and have a blast doing so",
        metadata={"year": 1995, "genre": "animated", "rating": 9.3},
    ),
]

vector_store = Milvus.from_documents(
    docs,
    embedding=embeddings,
    connection_args={"uri": "Use your uri:)", "token": "Use your token:)"},
)
```

## Creación de nuestro recuperador de autoconsuita

Ahora podemos instanciar nuestro recuperador. Para hacer esto, tendremos que proporcionar información previa sobre los campos de metadatos que admiten nuestros documentos y una breve descripción del contenido de los documentos.

```python
from langchain.chains.query_constructor.base import AttributeInfo
from langchain.retrievers.self_query.base import SelfQueryRetriever
from langchain_openai import OpenAI

metadata_field_info = [
    AttributeInfo(
        name="genre",
        description="The genre of the movie",
        type="string",
    ),
    AttributeInfo(
        name="year",
        description="The year the movie was released",
        type="integer",
    ),
    AttributeInfo(
        name="rating", description="A 1-10 rating for the movie", type="float"
    ),
]
document_content_description = "Brief summary of a movie"
llm = OpenAI(temperature=0)
retriever = SelfQueryRetriever.from_llm(
    llm, vector_store, document_content_description, metadata_field_info, verbose=True
)
```

## Probándolo

¡Y ahora podemos intentar usar realmente nuestro recuperador!

```python
# This example only specifies a relevant query
retriever.invoke("What are some movies about dinosaurs")
```

```output
query='dinosaur' filter=None limit=None
```

```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'year': 1993, 'rating': 7.7, 'genre': 'action'}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995, 'rating': 9.3, 'genre': 'animated'}),
 Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979, 'rating': 9.9, 'genre': 'science fiction'}),
 Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'year': 2006, 'rating': 9.0, 'genre': 'thriller'})]
```

```python
# This example specifies a filter
retriever.invoke("What are some highly rated movies (above 9)?")
```

```output
query=' ' filter=Comparison(comparator=<Comparator.GT: 'gt'>, attribute='rating', value=9) limit=None
```

```output
[Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995, 'rating': 9.3, 'genre': 'animated'}),
 Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979, 'rating': 9.9, 'genre': 'science fiction'})]
```

```python
# This example only specifies a query and a filter
retriever.invoke("I want to watch a movie about toys rated higher than 9")
```

```output
query='toys' filter=Comparison(comparator=<Comparator.GT: 'gt'>, attribute='rating', value=9) limit=None
```

```output
[Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995, 'rating': 9.3, 'genre': 'animated'}),
 Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'year': 1979, 'rating': 9.9, 'genre': 'science fiction'})]
```

```python
# This example specifies a composite filter
retriever.invoke("What's a highly rated (above or equal 9) thriller film?")
```

```output
query=' ' filter=Operation(operator=<Operator.AND: 'and'>, arguments=[Comparison(comparator=<Comparator.EQ: 'eq'>, attribute='genre', value='thriller'), Comparison(comparator=<Comparator.GTE: 'gte'>, attribute='rating', value=9)]) limit=None
```

```output
[Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'year': 2006, 'rating': 9.0, 'genre': 'thriller'})]
```

```python
# This example specifies a query and composite filter
retriever.invoke(
    "What's a movie after 1990 but before 2005 that's all about dinosaurs, \
    and preferably has a lot of action"
)
```

```output
query='dinosaur' filter=Operation(operator=<Operator.AND: 'and'>, arguments=[Comparison(comparator=<Comparator.GT: 'gt'>, attribute='year', value=1990), Comparison(comparator=<Comparator.LT: 'lt'>, attribute='year', value=2005), Comparison(comparator=<Comparator.EQ: 'eq'>, attribute='genre', value='action')]) limit=None
```

```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'year': 1993, 'rating': 7.7, 'genre': 'action'})]
```

## Filtrar k

También podemos usar el recuperador de autoconsuita para especificar `k`: el número de documentos a recuperar.

Podemos hacer esto pasando `enable_limit=True` al constructor.

```python
retriever = SelfQueryRetriever.from_llm(
    llm,
    vector_store,
    document_content_description,
    metadata_field_info,
    verbose=True,
    enable_limit=True,
)
```

```python
# This example only specifies a relevant query
retriever.invoke("What are two movies about dinosaurs?")
```

```output
query='dinosaur' filter=None limit=2
```

```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'year': 1993, 'rating': 7.7, 'genre': 'action'}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'year': 1995, 'rating': 9.3, 'genre': 'animated'})]
```
