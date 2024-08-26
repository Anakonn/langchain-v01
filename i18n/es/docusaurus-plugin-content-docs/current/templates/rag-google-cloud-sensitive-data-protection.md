---
translated: true
---

# rag-google-cloud-sensitive-data-protection

Esta plantilla es una aplicación que utiliza Google Vertex AI Search, un servicio de búsqueda impulsado por aprendizaje automático, y PaLM 2 para Chat (chat-bison). La aplicación utiliza una cadena de recuperación para responder preguntas basadas en sus documentos.

Esta plantilla es una aplicación que utiliza Google Sensitive Data Protection, un servicio para detectar y redactar datos sensibles en texto, y PaLM 2 para Chat (chat-bison), aunque puede utilizar cualquier modelo.

Para obtener más información sobre el uso de Sensitive Data Protection,
consulte [aquí](https://cloud.google.com/dlp/docs/sensitive-data-protection-overview).

## Configuración del entorno

Antes de usar esta plantilla, asegúrese de habilitar la [API DLP](https://console.cloud.google.com/marketplace/product/google/dlp.googleapis.com)
y la [API de Vertex AI](https://console.cloud.google.com/marketplace/product/google/aiplatform.googleapis.com) en su proyecto de Google Cloud.

Para algunos pasos comunes de solución de problemas de entorno relacionados con Google Cloud, consulte la parte inferior
de este archivo README.

Establezca las siguientes variables de entorno:

* `GOOGLE_CLOUD_PROJECT_ID` - El ID de su proyecto de Google Cloud.
* `MODEL_TYPE` - El tipo de modelo para Vertex AI Search (por ejemplo, `chat-bison`)

## Uso

Para usar este paquete, primero debe tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto de LangChain e instalar este como el único paquete, puede hacer:

```shell
langchain app new my-app --package rag-google-cloud-sensitive-data-protection
```

Si desea agregar esto a un proyecto existente, puede simplemente ejecutar:

```shell
langchain app add rag-google-cloud-sensitive-data-protection
```

Y agregue el siguiente código a su archivo `server.py`:

```python
from rag_google_cloud_sensitive_data_protection.chain import chain as rag_google_cloud_sensitive_data_protection_chain

add_routes(app, rag_google_cloud_sensitive_data_protection_chain, path="/rag-google-cloud-sensitive-data-protection")
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

Si está dentro de este directorio, puede iniciar una instancia de LangServe directamente mediante:

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

runnable = RemoteRunnable("http://localhost:8000/rag-google-cloud-sensitive-data-protection")
```

# Solución de problemas de Google Cloud

Puede establecer sus credenciales `gcloud` con su CLI usando `gcloud auth application-default login`

Puede establecer su proyecto `gcloud` con los siguientes comandos

```bash
gcloud config set project <your project>
gcloud auth application-default set-quota-project <your project>
export GOOGLE_CLOUD_PROJECT_ID=<your project>
```
