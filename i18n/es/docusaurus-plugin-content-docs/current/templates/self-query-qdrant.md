---
translated: true
---

# Consulta automática de Qdrant

Esta plantilla realiza [consulta automática](https://python.langchain.com/docs/modules/data_connection/retrievers/self_query/) utilizando Qdrant y OpenAI. De forma predeterminada, utiliza un conjunto de datos artificial de 10 documentos, pero puedes reemplazarlo por tu propio conjunto de datos.

## Configuración del entorno

Establece la variable de entorno `OPENAI_API_KEY` para acceder a los modelos de OpenAI.

Establece `QDRANT_URL` en la URL de tu instancia de Qdrant. Si utilizas [Qdrant Cloud](https://cloud.qdrant.io), también debes establecer la variable de entorno `QDRANT_API_KEY`. Si no estableces ninguno de ellos, la plantilla intentará conectarse a una instancia local de Qdrant en `http://localhost:6333`.

```shell
export QDRANT_URL=
export QDRANT_API_KEY=

export OPENAI_API_KEY=
```

## Uso

Para utilizar este paquete, primero instala la CLI de LangChain:

```shell
pip install -U "langchain-cli[serve]"
```

Crea un nuevo proyecto de LangChain e instala este paquete como el único:

```shell
langchain app new my-app --package self-query-qdrant
```

Para agregarlo a un proyecto existente, ejecuta:

```shell
langchain app add self-query-qdrant
```

### Valores predeterminados

Antes de iniciar el servidor, debes crear una colección de Qdrant e indexar los documentos. Esto se puede hacer ejecutando el siguiente comando:

```python
from self_query_qdrant.chain import initialize

initialize()
```

Agrega el siguiente código a tu archivo `app/server.py`:

```python
from self_query_qdrant.chain import chain

add_routes(app, chain, path="/self-query-qdrant")
```

El conjunto de datos predeterminado consta de 10 documentos sobre platos, junto con su precio e información del restaurante. Puedes encontrar los documentos en el archivo `packages/self-query-qdrant/self_query_qdrant/defaults.py`. Aquí hay uno de los documentos:

```python
<!--IMPORTS:[{"imported": "Document", "source": "langchain_core.documents", "docs": "https://api.python.langchain.com/en/latest/documents/langchain_core.documents.base.Document.html", "title": "self-query-qdrant"}]-->
from langchain_core.documents import Document

Document(
    page_content="Spaghetti with meatballs and tomato sauce",
    metadata={
        "price": 12.99,
        "restaurant": {
            "name": "Olive Garden",
            "location": ["New York", "Chicago", "Los Angeles"],
        },
    },
)
```

La consulta automática permite realizar búsquedas semánticas en los documentos, con un filtrado adicional basado en los metadatos. Por ejemplo, puedes buscar los platos que cuestan menos de $15 y se sirven en Nueva York.

### Personalización

Todos los ejemplos anteriores asumen que quieres iniciar la plantilla solo con los valores predeterminados. Si deseas personalizar la plantilla, puedes hacerlo pasando los parámetros a la función `create_chain` en el archivo `app/server.py`:

```python
<!--IMPORTS:[{"imported": "Cohere", "source": "langchain_community.llms", "docs": "https://api.python.langchain.com/en/latest/llms/langchain_community.llms.cohere.Cohere.html", "title": "self-query-qdrant"}, {"imported": "HuggingFaceEmbeddings", "source": "langchain_community.embeddings", "docs": "https://api.python.langchain.com/en/latest/embeddings/langchain_community.embeddings.huggingface.HuggingFaceEmbeddings.html", "title": "self-query-qdrant"}, {"imported": "AttributeInfo", "source": "langchain.chains.query_constructor.schema", "docs": "https://api.python.langchain.com/en/latest/chains/langchain.chains.query_constructor.schema.AttributeInfo.html", "title": "self-query-qdrant"}]-->
from langchain_community.llms import Cohere
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain.chains.query_constructor.schema import AttributeInfo

from self_query_qdrant.chain import create_chain

chain = create_chain(
    llm=Cohere(),
    embeddings=HuggingFaceEmbeddings(),
    document_contents="Descriptions of cats, along with their names and breeds.",
    metadata_field_info=[
        AttributeInfo(name="name", description="Name of the cat", type="string"),
        AttributeInfo(name="breed", description="Cat's breed", type="string"),
    ],
    collection_name="cats",
)
```

Lo mismo se aplica a la función `initialize` que crea una colección de Qdrant e indexa los documentos:

```python
<!--IMPORTS:[{"imported": "Document", "source": "langchain_core.documents", "docs": "https://api.python.langchain.com/en/latest/documents/langchain_core.documents.base.Document.html", "title": "self-query-qdrant"}, {"imported": "HuggingFaceEmbeddings", "source": "langchain_community.embeddings", "docs": "https://api.python.langchain.com/en/latest/embeddings/langchain_community.embeddings.huggingface.HuggingFaceEmbeddings.html", "title": "self-query-qdrant"}]-->
from langchain_core.documents import Document
from langchain_community.embeddings import HuggingFaceEmbeddings

from self_query_qdrant.chain import initialize

initialize(
    embeddings=HuggingFaceEmbeddings(),
    collection_name="cats",
    documents=[
        Document(
            page_content="A mean lazy old cat who destroys furniture and eats lasagna",
            metadata={"name": "Garfield", "breed": "Tabby"},
        ),
        ...
    ]
)
```

La plantilla es flexible y se puede utilizar fácilmente para diferentes conjuntos de documentos.

### LangSmith

(Opcional) Si tienes acceso a LangSmith, configúralo para ayudar a rastrear, monitorear y depurar las aplicaciones de LangChain. Si no tienes acceso, salta esta sección.

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

Si te encuentras dentro de este directorio, puedes iniciar una instancia de LangServe directamente mediante:

```shell
langchain serve
```

### Servidor local

Esto iniciará la aplicación FastAPI con un servidor en ejecución localmente en [http://localhost:8000](http://localhost:8000)

Puedes ver todas las plantillas en [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Accede al área de juegos en [http://127.0.0.1:8000/self-query-qdrant/playground](http://127.0.0.1:8000/self-query-qdrant/playground)

Accede a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/self-query-qdrant")
```
