---
translated: true
---

# rag-azure-search

Esta plantilla realiza RAG en documentos utilizando [Azure AI Search](https://learn.microsoft.com/azure/search/search-what-is-azure-search) como el vectorstore y los modelos de chat y embedding de Azure OpenAI.

Para obtener más detalles sobre RAG con Azure AI Search, consulte [este cuaderno](https://github.com/langchain-ai/langchain/blob/master/docs/docs/integrations/vectorstores/azuresearch.ipynb).

## Configuración del entorno

***Requisitos previos:*** Recursos existentes de [Azure AI Search](https://learn.microsoft.com/azure/search/search-what-is-azure-search) y [Azure OpenAI](https://learn.microsoft.com/azure/ai-services/openai/overview).

***Variables de entorno:***

Para ejecutar esta plantilla, deberá establecer las siguientes variables de entorno:

***Requerido:***

- AZURE_SEARCH_ENDPOINT - El punto final del servicio Azure AI Search.
- AZURE_SEARCH_KEY - La clave API para el servicio Azure AI Search.
- AZURE_OPENAI_ENDPOINT - El punto final del servicio Azure OpenAI.
- AZURE_OPENAI_API_KEY - La clave API para el servicio Azure OpenAI.
- AZURE_EMBEDDINGS_DEPLOYMENT - Nombre de la implementación de Azure OpenAI que se utilizará para los embeddings.
- AZURE_CHAT_DEPLOYMENT - Nombre de la implementación de Azure OpenAI que se utilizará para el chat.

***Opcional:***

- AZURE_SEARCH_INDEX_NAME - Nombre de un índice existente de Azure AI Search que se utilizará. Si no se proporciona, se creará un índice con el nombre "rag-azure-search".
- OPENAI_API_VERSION - Versión de la API de Azure OpenAI que se utilizará. El valor predeterminado es "2023-05-15".

## Uso

Para usar este paquete, primero debe tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto de LangChain e instalar este como el único paquete, puede hacer:

```shell
langchain app new my-app --package rag-azure-search
```

Si desea agregar esto a un proyecto existente, puede ejecutar:

```shell
langchain app add rag-azure-search
```

Y agregar el siguiente código a su archivo `server.py`:

```python
from rag_azure_search import chain as rag_azure_search_chain

add_routes(app, rag_azure_search_chain, path="/rag-azure-search")
```

(Opcional) Ahora configuremos LangSmith.
LangSmith nos ayudará a rastrear, monitorear y depurar las aplicaciones de LangChain.
Puede registrarse en LangSmith [aquí](https://smith.langchain.com/).
Si no tiene acceso, puede omitir esta sección.

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

Si se encuentra en este directorio, puede iniciar una instancia de LangServe directamente mediante:

```shell
langchain serve
```

Esto iniciará la aplicación FastAPI con un servidor que se ejecuta localmente en
[http://localhost:8000](http://localhost:8000)

Podemos ver todas las plantillas en [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Podemos acceder al playground en [http://127.0.0.1:8000/rag-azure-search/playground](http://127.0.0.1:8000/rag-azure-search/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-azure-search")
```
