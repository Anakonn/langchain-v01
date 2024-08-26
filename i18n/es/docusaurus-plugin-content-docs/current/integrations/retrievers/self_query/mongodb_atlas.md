---
translated: true
---

# MongoDB Atlas

>[MongoDB Atlas](https://www.mongodb.com/) es una base de datos de documentos que se puede
usar como una base de datos de vectores.

En el tutorial, demostraremos el `SelfQueryRetriever` con una tienda de vectores `MongoDB Atlas`.

## Creación de un vector store de MongoDB Atlas

Primero querremos crear un MongoDB Atlas VectorStore y sembrarlo con algunos datos. Hemos creado un pequeño conjunto de datos de demostración de documentos que contienen resúmenes de películas.

NOTA: El recuperador de autoconsuita requiere que tengas `lark` instalado (`pip install lark`). También necesitamos el paquete `pymongo`.

```python
%pip install --upgrade --quiet  lark pymongo
```

Queremos usar `OpenAIEmbeddings`, así que tenemos que obtener la clave API de OpenAI.

```python
import os

OPENAI_API_KEY = "Use your OpenAI key"

os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY
```

```python
from langchain_community.vectorstores import MongoDBAtlasVectorSearch
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings
from pymongo import MongoClient

CONNECTION_STRING = "Use your MongoDB Atlas connection string"
DB_NAME = "Name of your MongoDB Atlas database"
COLLECTION_NAME = "Name of your collection in the database"
INDEX_NAME = "Name of a search index defined on the collection"

MongoClient = MongoClient(CONNECTION_STRING)
collection = MongoClient[DB_NAME][COLLECTION_NAME]

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

vectorstore = MongoDBAtlasVectorSearch.from_documents(
    docs,
    embeddings,
    collection=collection,
    index_name=INDEX_NAME,
)
```

Ahora, creemos un índice de búsqueda de vectores en tu clúster. En el ejemplo a continuación, `embedding` es el nombre del campo que contiene el vector de incrustación. Consulta la [documentación](https://www.mongodb.com/docs/atlas/atlas-search/field-types/knn-vector) para obtener más detalles sobre cómo definir un índice de búsqueda de vectores de Atlas.
Puedes nombrar el índice `{COLLECTION_NAME}` y crear el índice en el espacio de nombres `{DB_NAME}.{COLLECTION_NAME}`. Finalmente, escribe la siguiente definición en el editor JSON en MongoDB Atlas:

```json
{
  "mappings": {
    "dynamic": true,
    "fields": {
      "embedding": {
        "dimensions": 1536,
        "similarity": "cosine",
        "type": "knnVector"
      },
      "genre": {
        "type": "token"
      },
      "ratings": {
        "type": "number"
      },
      "year": {
        "type": "number"
      }
    }
  }
}
```

## Creación de nuestro recuperador de autoconsuita

Ahora podemos instanciar nuestro recuperador. Para hacer esto, necesitaremos proporcionar información previa sobre los campos de metadatos que admiten nuestros documentos y una breve descripción del contenido de los documentos.

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
```

```python
llm = OpenAI(temperature=0)
retriever = SelfQueryRetriever.from_llm(
    llm, vectorstore, document_content_description, metadata_field_info, verbose=True
)
```

## Probándolo

¡Y ahora podemos intentar usar realmente nuestro recuperador!

```python
# This example only specifies a relevant query
retriever.invoke("What are some movies about dinosaurs")
```

```python
# This example specifies a filter
retriever.invoke("What are some highly rated movies (above 9)?")
```

```python
# This example only specifies a query and a filter
retriever.invoke("I want to watch a movie about toys rated higher than 9")
```

```python
# This example specifies a composite filter
retriever.invoke("What's a highly rated (above or equal 9) thriller film?")
```

```python
# This example specifies a query and composite filter
retriever.invoke(
    "What's a movie after 1990 but before 2005 that's all about dinosaurs, \
    and preferably has a lot of action"
)
```

## Filtrar k

También podemos usar el recuperador de autoconsuita para especificar `k`: el número de documentos a recuperar.

Podemos hacer esto pasando `enable_limit=True` al constructor.

```python
retriever = SelfQueryRetriever.from_llm(
    llm,
    vectorstore,
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
