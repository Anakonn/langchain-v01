---
translated: true
---

# Vectara

>[Vectara](https://vectara.com/) es la plataforma de GenAI de confianza que proporciona una API fácil de usar para la indexación y consulta de documentos.
>
>`Vectara` proporciona un servicio administrado de extremo a extremo para `Retrieval Augmented Generation` o [RAG](https://vectara.com/grounded-generation/), que incluye:
>1. Una forma de `extraer texto` de archivos de documentos y `dividirlos` en oraciones.
>2. El modelo de incrustaciones [Boomerang](https://vectara.com/how-boomerang-takes-retrieval-augmented-generation-to-the-next-level-via-grounded-generation/) de última generación. Cada fragmento de texto se codifica en un vector de incrustaciones utilizando `Boomerang` y se almacena en el almacén interno de conocimientos (vector+texto) de Vectara.
>3. Un servicio de consulta que codifica automáticamente la consulta en incrustaciones y recupera los segmentos de texto más relevantes (incluye soporte para [Búsqueda híbrida](https://docs.vectara.com/docs/api-reference/search-apis/lexical-matching) y [MMR](https://vectara.com/get-diverse-results-and-comprehensive-summaries-with-vectaras-mmr-reranker/))).
>4. Una opción para crear [resumen generativo](https://docs.vectara.com/docs/learn/grounded-generation/grounded-generation-overview), basado en los documentos recuperados, incluidas las citas.

Consulte la [documentación de la API de Vectara](https://docs.vectara.com/docs/) para obtener más información sobre cómo usar la API.

Este cuaderno muestra cómo usar `SelfQueryRetriever` con Vectara.

# Configuración

Necesitará una cuenta `Vectara` para usar `Vectara` con `LangChain`. Para comenzar, use los siguientes pasos (consulte nuestra [guía de inicio rápido](https://docs.vectara.com/docs/quickstart)):
1. [Regístrese](https://console.vectara.com/signup) en una cuenta `Vectara` si aún no tiene una. Una vez que haya completado su registro, tendrá un ID de cliente de Vectara. Puede encontrar su ID de cliente haciendo clic en su nombre, en la parte superior derecha de la ventana de la consola de Vectara.
2. Dentro de su cuenta, puede crear uno o más corpus. Cada corpus representa un área que almacena datos de texto al ingerir desde documentos de entrada. Para crear un corpus, use el botón **"Crear corpus"**. Luego proporciona un nombre a tu corpus, así como una descripción. Opcionalmente, puede definir atributos de filtrado y aplicar algunas opciones avanzadas. Si hace clic en su corpus creado, puede ver su nombre y el ID del corpus en la parte superior.
3. A continuación, deberá crear claves de API para acceder al corpus. Haga clic en la pestaña **"Autorización"** en la vista del corpus y luego en el botón **"Crear clave de API"**. Dé un nombre a su clave y elija si desea solo consulta o consulta+índice para su clave. Haga clic en "Crear" y ahora tiene una clave de API activa. Mantenga esta clave confidencial.

Para usar LangChain con Vectara, necesita tres valores: ID de cliente, ID de corpus y api_key.
Puede proporcionarlos a LangChain de dos formas:

1. Incluya en su entorno estas tres variables: `VECTARA_CUSTOMER_ID`, `VECTARA_CORPUS_ID` y `VECTARA_API_KEY`.

> Por ejemplo, puede establecer estas variables usando `os.environ` y `getpass` de la siguiente manera:

```python
import os
import getpass

os.environ["VECTARA_CUSTOMER_ID"] = getpass.getpass("Vectara Customer ID:")
os.environ["VECTARA_CORPUS_ID"] = getpass.getpass("Vectara Corpus ID:")
os.environ["VECTARA_API_KEY"] = getpass.getpass("Vectara API Key:")
```

1. Proporciónelos como argumentos al crear el objeto `Vectara` vectorstore:

```python
vectorstore = Vectara(
                vectara_customer_id=vectara_customer_id,
                vectara_corpus_id=vectara_corpus_id,
                vectara_api_key=vectara_api_key
            )
```

**Nota:** El recuperador de autoconsuita requiere que tenga `lark` instalado (`pip install lark`).

## Conectarse a Vectara desde LangChain

En este ejemplo, asumimos que ha creado una cuenta y un corpus, y ha agregado su VECTARA_CUSTOMER_ID, VECTARA_CORPUS_ID y VECTARA_API_KEY (creado con permisos tanto para indexación como para consulta) como variables de entorno.

El corpus tiene 4 campos definidos como metadatos para filtrar: año, director, calificación y género.

```python
from langchain.chains import ConversationalRetrievalChain
from langchain.chains.query_constructor.base import AttributeInfo
from langchain.retrievers.self_query.base import SelfQueryRetriever
from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings import FakeEmbeddings
from langchain_community.vectorstores import Vectara
from langchain_core.documents import Document
from langchain_openai import OpenAI
from langchain_text_splitters import CharacterTextSplitter
```

```python
docs = [
    Document(
        page_content="A bunch of scientists bring back dinosaurs and mayhem breaks loose",
        metadata={"year": 1993, "rating": 7.7, "genre": "science fiction"},
    ),
    Document(
        page_content="Leo DiCaprio gets lost in a dream within a dream within a dream within a ...",
        metadata={"year": 2010, "director": "Christopher Nolan", "rating": 8.2},
    ),
    Document(
        page_content="A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea",
        metadata={"year": 2006, "director": "Satoshi Kon", "rating": 8.6},
    ),
    Document(
        page_content="A bunch of normal-sized women are supremely wholesome and some men pine after them",
        metadata={"year": 2019, "director": "Greta Gerwig", "rating": 8.3},
    ),
    Document(
        page_content="Toys come alive and have a blast doing so",
        metadata={"year": 1995, "genre": "animated"},
    ),
    Document(
        page_content="Three men walk into the Zone, three men walk out of the Zone",
        metadata={
            "year": 1979,
            "rating": 9.9,
            "director": "Andrei Tarkovsky",
            "genre": "science fiction",
        },
    ),
]

vectara = Vectara()
for doc in docs:
    vectara.add_texts(
        [doc.page_content],
        embedding=FakeEmbeddings(size=768),
        doc_metadata=doc.metadata,
    )
```

## Creando nuestro recuperador de autoconsuita

Ahora podemos instanciar nuestro recuperador. Para hacer esto, deberemos proporcionar información previa sobre los campos de metadatos que admiten nuestros documentos y una breve descripción del contenido de los documentos.

```python
from langchain.chains.query_constructor.base import AttributeInfo
from langchain.retrievers.self_query.base import SelfQueryRetriever
from langchain_openai import OpenAI

metadata_field_info = [
    AttributeInfo(
        name="genre",
        description="The genre of the movie",
        type="string or list[string]",
    ),
    AttributeInfo(
        name="year",
        description="The year the movie was released",
        type="integer",
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
    llm, vectara, document_content_description, metadata_field_info, verbose=True
)
```

## Probándolo

¡Y ahora podemos intentar usar realmente nuestro recuperador!

```python
# This example only specifies a relevant query
retriever.invoke("What are some movies about dinosaurs")
```

```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'lang': 'eng', 'offset': '0', 'len': '66', 'year': '1993', 'rating': '7.7', 'genre': 'science fiction', 'source': 'langchain'}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'lang': 'eng', 'offset': '0', 'len': '41', 'year': '1995', 'genre': 'animated', 'source': 'langchain'}),
 Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'lang': 'eng', 'offset': '0', 'len': '116', 'year': '2006', 'director': 'Satoshi Kon', 'rating': '8.6', 'source': 'langchain'}),
 Document(page_content='Leo DiCaprio gets lost in a dream within a dream within a dream within a ...', metadata={'lang': 'eng', 'offset': '0', 'len': '76', 'year': '2010', 'director': 'Christopher Nolan', 'rating': '8.2', 'source': 'langchain'}),
 Document(page_content='A bunch of normal-sized women are supremely wholesome and some men pine after them', metadata={'lang': 'eng', 'offset': '0', 'len': '82', 'year': '2019', 'director': 'Greta Gerwig', 'rating': '8.3', 'source': 'langchain'}),
 Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'lang': 'eng', 'offset': '0', 'len': '60', 'year': '1979', 'rating': '9.9', 'director': 'Andrei Tarkovsky', 'genre': 'science fiction', 'source': 'langchain'})]
```

```python
# This example only specifies a filter
retriever.invoke("I want to watch a movie rated higher than 8.5")
```

```output
[Document(page_content='A psychologist / detective gets lost in a series of dreams within dreams within dreams and Inception reused the idea', metadata={'lang': 'eng', 'offset': '0', 'len': '116', 'year': '2006', 'director': 'Satoshi Kon', 'rating': '8.6', 'source': 'langchain'}),
 Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'lang': 'eng', 'offset': '0', 'len': '60', 'year': '1979', 'rating': '9.9', 'director': 'Andrei Tarkovsky', 'genre': 'science fiction', 'source': 'langchain'})]
```

```python
# This example specifies a query and a filter
retriever.invoke("Has Greta Gerwig directed any movies about women")
```

```output
[Document(page_content='A bunch of normal-sized women are supremely wholesome and some men pine after them', metadata={'lang': 'eng', 'offset': '0', 'len': '82', 'year': '2019', 'director': 'Greta Gerwig', 'rating': '8.3', 'source': 'langchain'})]
```

```python
# This example specifies a composite filter
retriever.invoke("What's a highly rated (above 8.5) science fiction film?")
```

```output
[Document(page_content='Three men walk into the Zone, three men walk out of the Zone', metadata={'lang': 'eng', 'offset': '0', 'len': '60', 'year': '1979', 'rating': '9.9', 'director': 'Andrei Tarkovsky', 'genre': 'science fiction', 'source': 'langchain'})]
```

```python
# This example specifies a query and composite filter
retriever.invoke(
    "What's a movie after 1990 but before 2005 that's all about toys, and preferably is animated"
)
```

```output
[Document(page_content='Toys come alive and have a blast doing so', metadata={'lang': 'eng', 'offset': '0', 'len': '41', 'year': '1995', 'genre': 'animated', 'source': 'langchain'})]
```

## Filtrar k

También podemos usar el recuperador de autoconsuita para especificar `k`: el número de documentos a recuperar.

Podemos hacer esto pasando `enable_limit=True` al constructor.

```python
retriever = SelfQueryRetriever.from_llm(
    llm,
    vectara,
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

```output
[Document(page_content='A bunch of scientists bring back dinosaurs and mayhem breaks loose', metadata={'lang': 'eng', 'offset': '0', 'len': '66', 'year': '1993', 'rating': '7.7', 'genre': 'science fiction', 'source': 'langchain'}),
 Document(page_content='Toys come alive and have a blast doing so', metadata={'lang': 'eng', 'offset': '0', 'len': '41', 'year': '1995', 'genre': 'animated', 'source': 'langchain'})]
```
