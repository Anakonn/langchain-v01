---
translated: true
---

# rag-google-cloud-vertexai-search

Esta plantilla es una aplicación que utiliza Google Vertex AI Search, un servicio de búsqueda impulsado por aprendizaje automático, y PaLM 2 for Chat (chat-bison). La aplicación utiliza una cadena de recuperación para responder preguntas basadas en sus documentos.

Para obtener más información sobre la construcción de aplicaciones RAG con Vertex AI Search, consulte [aquí](https://cloud.google.com/generative-ai-app-builder/docs/enterprise-search-introduction).

## Configuración del entorno

Antes de usar esta plantilla, asegúrese de estar autenticado con Vertex AI Search. Consulte la guía de autenticación: [aquí](https://cloud.google.com/generative-ai-app-builder/docs/authentication).

También necesitará crear:

- Una aplicación de búsqueda [aquí](https://cloud.google.com/generative-ai-app-builder/docs/create-engine-es)
- Un almacén de datos [aquí](https://cloud.google.com/generative-ai-app-builder/docs/create-data-store-es)

Un conjunto de datos adecuado para probar esta plantilla es los informes de ganancias de Alphabet, que puede encontrar [aquí](https://abc.xyz/investor/). Los datos también están disponibles en `gs://cloud-samples-data/gen-app-builder/search/alphabet-investor-pdfs`.

Establezca las siguientes variables de entorno:

* `GOOGLE_CLOUD_PROJECT_ID` - El ID de su proyecto de Google Cloud.
* `DATA_STORE_ID` - El ID del almacén de datos en Vertex AI Search, que es un valor alfanumérico de 36 caracteres que se encuentra en la página de detalles del almacén de datos.
* `MODEL_TYPE` - El tipo de modelo para Vertex AI Search.

## Uso

Para usar este paquete, primero debe tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto de LangChain e instalar este como el único paquete, puede hacer:

```shell
langchain app new my-app --package rag-google-cloud-vertexai-search
```

Si desea agregar esto a un proyecto existente, puede ejecutar:

```shell
langchain app add rag-google-cloud-vertexai-search
```

Y agregue el siguiente código a su archivo `server.py`:

```python
from rag_google_cloud_vertexai_search.chain import chain as rag_google_cloud_vertexai_search_chain

add_routes(app, rag_google_cloud_vertexai_search_chain, path="/rag-google-cloud-vertexai-search")
```

(Opcional) Ahora configuremos LangSmith.
LangSmith nos ayudará a rastrear, monitorear y depurar aplicaciones de LangChain.
Puede registrarse en LangSmith [aquí](https://smith.langchain.com/).
Si no tiene acceso, puede omitir esta sección.

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

Si está dentro de este directorio, puede iniciar una instancia de LangServe directamente por:

```shell
langchain serve
```

Esto iniciará la aplicación FastAPI con un servidor en ejecución localmente en
[http://localhost:8000](http://localhost:8000)

Podemos ver todas las plantillas en [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Podemos acceder al área de juegos
en [http://127.0.0.1:8000/rag-google-cloud-vertexai-search/playground](http://127.0.0.1:8000/rag-google-cloud-vertexai-search/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-google-cloud-vertexai-search")
```
