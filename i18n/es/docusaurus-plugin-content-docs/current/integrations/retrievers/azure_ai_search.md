---
translated: true
---

# Búsqueda de IA de Azure

[Azure AI Search](https://learn.microsoft.com/azure/search/search-what-is-azure-search) (anteriormente conocido como `Azure Cognitive Search`) es un servicio de búsqueda en la nube de Microsoft que proporciona a los desarrolladores infraestructura, API y herramientas para la recuperación de información de consultas vectoriales, de palabras clave y híbridas a escala.

`AzureAISearchRetriever` es un módulo de integración que devuelve documentos a partir de una consulta no estructurada. Se basa en la clase BaseRetriever y se dirige a la versión estable 2023-11-01 de la API REST de Azure AI Search, lo que significa que admite indexación y consultas vectoriales.

Para usar este módulo, necesitas:

+ Un servicio de Azure AI Search. Puedes [crearlo](https://learn.microsoft.com/azure/search/search-create-service-portal) de forma gratuita si te registras en la prueba de Azure. Un servicio gratuito tiene cuotas más bajas, pero es suficiente para ejecutar el código en este cuaderno.

+ Un índice existente con campos vectoriales. Hay varias formas de crear uno, incluyendo el uso del [módulo de almacén de vectores](../vectorstores/azuresearch.md). O bien, [prueba las API REST de Azure AI Search](https://learn.microsoft.com/azure/search/search-get-started-vector).

+ Una clave API. Las claves API se generan cuando creas el servicio de búsqueda. Si solo estás consultando un índice, puedes usar la clave API de consulta, de lo contrario usa una clave API de administrador. Consulta [Encuentra tus claves API](https://learn.microsoft.com/azure/search/search-security-api-keys?tabs=rest-use%2Cportal-find%2Cportal-query#find-existing-keys) para obtener más detalles.

`AzureAISearchRetriever` reemplaza a `AzureCognitiveSearchRetriever`, que pronto será obsoleto. Recomendamos cambiar a la versión más reciente que se basa en la versión más reciente estable de las API de búsqueda.

## Instalar paquetes

Usa el paquete azure-documents-search versión 11.4 o posterior.

```python
%pip install --upgrade --quiet langchain
%pip install --upgrade --quiet langchain-openai
%pip install --upgrade --quiet  azure-search-documents
%pip install --upgrade --quiet  azure-identity
```

## Importar las bibliotecas requeridas

```python
import os

from langchain_community.retrievers import (
    AzureAISearchRetriever,
)
```

## Configurar la configuración de búsqueda

Establece el nombre del servicio de búsqueda, el nombre del índice y la clave API como variables de entorno (alternativamente, puedes pasarlos como argumentos a `AzureAISearchRetriever`). El índice de búsqueda proporciona el contenido que se puede buscar.

```python
os.environ["AZURE_AI_SEARCH_SERVICE_NAME"] = "<YOUR_SEARCH_SERVICE_NAME>"
os.environ["AZURE_AI_SEARCH_INDEX_NAME"] = "<YOUR_SEARCH_INDEX_NAME>"
os.environ["AZURE_AI_SEARCH_API_KEY"] = "<YOUR_API_KEY>"
```

## Crear el recuperador

Para `AzureAISearchRetriever`, proporciona un `index_name`, `content_key` y `top_k` establecido en el número de resultados que deseas recuperar. Establecer `top_k` en cero (el valor predeterminado) devuelve todos los resultados.

```python
retriever = AzureAISearchRetriever(
    content_key="content", top_k=1, index_name="langchain-vector-demo"
)
```

Ahora puedes usarlo para recuperar documentos de Azure AI Search.
Este es el método que llamarías para hacerlo. Devolverá todos los documentos relevantes para la consulta.

```python
retriever.invoke("here is my unstructured query string")
```

## Ejemplo

Esta sección demuestra el uso del recuperador sobre datos de muestra integrados. Puedes omitir este paso si ya tienes un índice vectorial en tu servicio de búsqueda.

Comienza proporcionando los puntos finales y las claves. Dado que estamos creando un índice vectorial en este paso, especifica un modelo de incrustación de texto para obtener una representación vectorial del texto. Este ejemplo asume Azure OpenAI con un despliegue de text-embedding-ada-002. Debido a que este paso crea un índice, asegúrate de usar una clave API de administrador para tu servicio de búsqueda.

```python
import os

from langchain.document_loaders import DirectoryLoader, TextLoader
from langchain.text_splitter import TokenTextSplitter
from langchain.vectorstores import AzureSearch
from langchain_community.retrievers import AzureAISearchRetriever
from langchain_openai import AzureOpenAIEmbeddings, OpenAIEmbeddings

os.environ["AZURE_AI_SEARCH_SERVICE_NAME"] = "<YOUR_SEARCH_SERVICE_NAME>"
os.environ["AZURE_AI_SEARCH_INDEX_NAME"] = "langchain-vector-demo"
os.environ["AZURE_AI_SEARCH_API_KEY"] = "<YOUR_SEARCH_SERVICE_ADMIN_API_KEY>"
azure_endpoint: str = "<YOUR_AZURE_OPENAI_ENDPOINT>"
azure_openai_api_key: str = "<YOUR_AZURE_OPENAI_API_KEY>"
azure_openai_api_version: str = "2023-05-15"
azure_deployment: str = "text-embedding-ada-002"
```

Usaremos un modelo de incrustación de Azure OpenAI para convertir nuestros documentos en incrustaciones almacenadas en el almacén vectorial de Azure AI Search. También estableceremos el nombre del índice en `langchain-vector-demo`. Esto creará un nuevo almacén vectorial asociado a ese nombre de índice.

```python
embeddings = AzureOpenAIEmbeddings(
    model=azure_deployment,
    azure_endpoint=azure_endpoint,
    openai_api_key=azure_openai_api_key,
)

vector_store: AzureSearch = AzureSearch(
    embedding_function=embeddings.embed_query,
    azure_search_endpoint=os.getenv("AZURE_AI_SEARCH_SERVICE_NAME"),
    azure_search_key=os.getenv("AZURE_AI_SEARCH_API_KEY"),
    index_name="langchain-vector-demo",
)
```

A continuación, cargaremos datos en nuestro nuevo almacén vectorial. Para este ejemplo, cargaremos el archivo `state_of_the_union.txt`. Dividiremos el texto en fragmentos de 400 tokens sin superposición. Finalmente, los documentos se agregarán a nuestro almacén vectorial como incrustaciones.

```python
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import CharacterTextSplitter

loader = TextLoader("../../modules/state_of_the_union.txt", encoding="utf-8")

documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=400, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

vector_store.add_documents(documents=docs)
```

Luego, crearemos un recuperador. La variable `index_name` actual es `langchain-vector-demo` del último paso. Si omitiste la creación del almacén vectorial, proporciona el nombre de tu índice en el parámetro. En esta consulta, se devuelve el resultado superior.

```python
retriever = AzureAISearchRetriever(
    content_key="content", top_k=1, index_name="langchain-vector-demo"
)
```

Ahora podemos recuperar los datos relevantes para nuestra consulta de los documentos que cargamos.

```python
retriever.invoke("does the president have a plan for covid-19?")
```
