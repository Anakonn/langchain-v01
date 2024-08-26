---
translated: true
---

# Xata

> [Xata](https://xata.io) es una plataforma de datos sin servidor, basada en PostgreSQL. Proporciona un SDK de Python para interactuar con tu base de datos y una interfaz de usuario para gestionar tus datos.
> Xata tiene un tipo de vector nativo, que se puede agregar a cualquier tabla y admite la búsqueda de similitud. LangChain inserta vectores directamente en Xata y lo consulta para obtener los vecinos más cercanos de un vector dado, de modo que puedas usar todas las integraciones de Xata Embeddings de LangChain.

Este cuaderno te guía sobre cómo usar Xata como un VectorStore.

## Configuración

### Crear una base de datos para usar como un vector store

En la [interfaz de usuario de Xata](https://app.xata.io), crea una nueva base de datos. Puedes ponerle el nombre que quieras, en este cuaderno usaremos `langchain`.
Crea una tabla, nuevamente puedes ponerle el nombre que quieras, pero usaremos `vectors`. Agrega las siguientes columnas a través de la interfaz de usuario:

* `content` de tipo "Texto". Se usa para almacenar los valores de `Document.pageContent`.
* `embedding` de tipo "Vector". Usa la dimensión utilizada por el modelo que planeas usar. En este cuaderno usamos incrustaciones de OpenAI, que tienen 1536 dimensiones.
* `source` de tipo "Texto". Se usa como una columna de metadatos por este ejemplo.
* cualquier otra columna que quieras usar como metadatos. Se rellenan a partir del objeto `Document.metadata`. Por ejemplo, si en el objeto `Document.metadata` tienes una propiedad `title`, puedes crear una columna `title` en la tabla y se rellenará.

Primero instalemos nuestras dependencias:

```python
%pip install --upgrade --quiet  xata langchain-openai tiktoken langchain
```

Carguemos la clave de OpenAI al entorno. Si no tienes una, puedes crear una cuenta de OpenAI y crear una clave en esta [página](https://platform.openai.com/account/api-keys).

```python
import getpass
import os

os.environ["OPENAI_API_KEY"] = getpass.getpass("OpenAI API Key:")
```

De manera similar, necesitamos obtener las variables de entorno para Xata. Puedes crear una nueva clave API visitando la [configuración de tu cuenta](https://app.xata.io/settings). Para encontrar la URL de la base de datos, ve a la página de Configuración de la base de datos que has creado. La URL de la base de datos debe tener un aspecto similar a este: `https://demo-uni3q8.eu-west-1.xata.sh/db/langchain`.

```python
api_key = getpass.getpass("Xata API key: ")
db_url = input("Xata database URL (copy it from your DB settings):")
```

```python
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores.xata import XataVectorStore
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter
```

### Crear el vector store de Xata

Carguemos nuestro conjunto de datos de prueba:

```python
loader = TextLoader("../../modules/state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

Ahora creemos el vector store real, respaldado por la tabla Xata.

```python
vector_store = XataVectorStore.from_documents(
    docs, embeddings, api_key=api_key, db_url=db_url, table_name="vectors"
)
```

Después de ejecutar el comando anterior, si vas a la interfaz de usuario de Xata, deberías ver los documentos cargados junto con sus incrustaciones.
Para usar una tabla Xata existente que ya contenga contenido vectorial, inicializa el constructor XataVectorStore:

```python
vector_store = XataVectorStore(
    api_key=api_key, db_url=db_url, embedding=embeddings, table_name="vectors"
)
```

### Búsqueda de similitud

```python
query = "What did the president say about Ketanji Brown Jackson"
found_docs = vector_store.similarity_search(query)
print(found_docs)
```

### Búsqueda de similitud con puntuación (distancia vectorial)

```python
query = "What did the president say about Ketanji Brown Jackson"
result = vector_store.similarity_search_with_score(query)
for doc, score in result:
    print(f"document={doc}, score={score}")
```
