---
translated: true
---

# Meilisearch

> [Meilisearch](https://meilisearch.com) es un motor de búsqueda de código abierto, ultrarrápido y muy relevante. Viene con excelentes valores predeterminados para ayudar a los desarrolladores a construir experiencias de búsqueda ágiles.
>
> Puedes [alojar Meilisearch tú mismo](https://www.meilisearch.com/docs/learn/getting_started/installation#local-installation) o ejecutarlo en [Meilisearch Cloud](https://www.meilisearch.com/pricing).

Meilisearch v1.3 admite la búsqueda vectorial. Esta página te guía a través de la integración de Meilisearch como un almacén vectorial y su uso para realizar búsquedas vectoriales.

## Configuración

### Lanzar una instancia de Meilisearch

Necesitarás una instancia de Meilisearch en ejecución para usarla como tu almacén vectorial. Puedes ejecutar [Meilisearch de forma local](https://www.meilisearch.com/docs/learn/getting_started/installation#local-installation) o crear una cuenta en [Meilisearch Cloud](https://cloud.meilisearch.com/).

A partir de Meilisearch v1.3, el almacenamiento vectorial es una función experimental. Después de lanzar tu instancia de Meilisearch, debes **habilitar el almacenamiento vectorial**. Para Meilisearch autohospedado, lee la documentación sobre [habilitar funciones experimentales](https://www.meilisearch.com/docs/learn/experimental/overview). En **Meilisearch Cloud**, habilita _Vector Store_ a través de la página de _Configuración_ de tu proyecto.

Ahora deberías tener una instancia de Meilisearch en ejecución con el almacenamiento vectorial habilitado. 🎉

### Credenciales

Para interactuar con tu instancia de Meilisearch, el SDK de Meilisearch necesita un host (URL de tu instancia) y una clave API.

**Host**

- En **local**, el host predeterminado es `localhost:7700`
- En **Meilisearch Cloud**, encuentra el host en la página de _Configuración_ de tu proyecto

**Claves API**

La instancia de Meilisearch te proporciona tres claves API de forma predeterminada:
- Una `CLAVE MAESTRA` — solo debe usarse para crear tu instancia de Meilisearch
- Una `CLAVE ADMIN` — úsala solo en el servidor para actualizar tu base de datos y sus configuraciones
- Una `CLAVE DE BÚSQUEDA` — una clave que puedes compartir de forma segura en aplicaciones front-end

Puedes crear [claves API adicionales](https://www.meilisearch.com/docs/learn/security/master_api_keys) según sea necesario.

### Instalar dependencias

Esta guía utiliza el [SDK de Python de Meilisearch](https://github.com/meilisearch/meilisearch-python). Puedes instalarlo ejecutando:

```python
%pip install --upgrade --quiet  meilisearch
```

Para más información, consulta la [documentación del SDK de Python de Meilisearch](https://meilisearch.github.io/meilisearch-python/).

## Ejemplos

Hay múltiples formas de inicializar el almacén vectorial de Meilisearch: proporcionar un cliente de Meilisearch o la _URL_ y la _clave API_ según sea necesario. En nuestros ejemplos, las credenciales se cargarán desde el entorno.

Puedes hacer que las variables de entorno estén disponibles en tu entorno de Notebook usando `os` y `getpass`. Puedes usar esta técnica para todos los siguientes ejemplos.

```python
import getpass
import os

os.environ["MEILI_HTTP_ADDR"] = getpass.getpass("Meilisearch HTTP address and port:")
os.environ["MEILI_MASTER_KEY"] = getpass.getpass("Meilisearch API Key:")
```

Queremos usar OpenAIEmbeddings, así que tenemos que obtener la clave API de OpenAI.

```python
os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

### Agregar texto y incrustaciones

Este ejemplo agrega texto a la base de datos vectorial de Meilisearch sin tener que inicializar un almacén vectorial de Meilisearch.

```python
from langchain_community.vectorstores import Meilisearch
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

embeddings = OpenAIEmbeddings()
embedders = {
    "default": {
        "source": "userProvided",
        "dimensions": 1536,
    }
}
embedder_name = "default"
```

```python
with open("../../modules/state_of_the_union.txt") as f:
    state_of_the_union = f.read()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
texts = text_splitter.split_text(state_of_the_union)
```

```python
# Use Meilisearch vector store to store texts & associated embeddings as vector
vector_store = Meilisearch.from_texts(
    texts=texts, embedding=embeddings, embedders=embedders, embedder_name=embedder_name
)
```

Detrás de escena, Meilisearch convertirá el texto en múltiples vectores. Esto nos llevará al mismo resultado que el siguiente ejemplo.

### Agregar documentos e incrustaciones

En este ejemplo, usaremos Langchain TextSplitter para dividir el texto en múltiples documentos. Luego, almacenaremos estos documentos junto con sus incrustaciones.

```python
from langchain_community.document_loaders import TextLoader

# Load text
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)

# Create documents
docs = text_splitter.split_documents(documents)

# Import documents & embeddings in the vector store
vector_store = Meilisearch.from_documents(
    documents=documents,
    embedding=embeddings,
    embedders=embedders,
    embedder_name=embedder_name,
)

# Search in our vector store
query = "What did the president say about Ketanji Brown Jackson"
docs = vector_store.similarity_search(query, embedder_name=embedder_name)
print(docs[0].page_content)
```

## Agregar documentos creando un Meilisearch Vectorstore

En este enfoque, creamos un objeto de almacén vectorial y agregamos documentos a él.

```python
import meilisearch
from langchain_community.vectorstores import Meilisearch

client = meilisearch.Client(url="http://127.0.0.1:7700", api_key="***")
vector_store = Meilisearch(
    embedding=embeddings,
    embedders=embedders,
    client=client,
    index_name="langchain_demo",
    text_key="text",
)
vector_store.add_documents(documents)
```

## Búsqueda de similitud con puntuación

Este método específico te permite devolver los documentos y la puntuación de distancia de la consulta a ellos. `embedder_name` es el nombre del incrustador que se debe usar para la búsqueda semántica, el valor predeterminado es "default".

```python
docs_and_scores = vector_store.similarity_search_with_score(
    query, embedder_name=embedder_name
)
docs_and_scores[0]
```

## Búsqueda de similitud por vector

`embedder_name` es el nombre del incrustador que se debe usar para la búsqueda semántica, el valor predeterminado es "default".

```python
embedding_vector = embeddings.embed_query(query)
docs_and_scores = vector_store.similarity_search_by_vector(
    embedding_vector, embedder_name=embedder_name
)
docs_and_scores[0]
```

## Recursos adicionales

Documentación
- [Meilisearch](https://www.meilisearch.com/docs/)
- [SDK de Python de Meilisearch](https://python-sdk.meilisearch.com)

Repositorios de código abierto
- [Repositorio de Meilisearch](https://github.com/meilisearch/meilisearch)
- [SDK de Python de Meilisearch](https://github.com/meilisearch/meilisearch-python)
