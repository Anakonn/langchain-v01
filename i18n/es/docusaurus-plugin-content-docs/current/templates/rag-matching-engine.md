---
translated: true
---

# rag-matching-engine

Esta plantilla realiza RAG utilizando Vertex AI de Google Cloud Platform con el motor de coincidencia.

Utilizará un índice creado previamente para recuperar los documentos o contextos relevantes en función de las preguntas proporcionadas por el usuario.

## Configuración del entorno

Debe crearse un índice antes de ejecutar el código.

El proceso para crear este índice se puede encontrar [aquí](https://github.com/GoogleCloudPlatform/generative-ai/blob/main/language/use-cases/document-qa/question_answering_documents_langchain_matching_engine.ipynb).

Las variables de entorno para Vertex deben estar configuradas:

```text
PROJECT_ID
ME_REGION
GCS_BUCKET
ME_INDEX_ID
ME_ENDPOINT_ID
```

## Uso

Para usar este paquete, primero debe tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto de LangChain e instalar este como el único paquete, puede hacer:

```shell
langchain app new my-app --package rag-matching-engine
```

Si desea agregar esto a un proyecto existente, puede simplemente ejecutar:

```shell
langchain app add rag-matching-engine
```

Y agregue el siguiente código a su archivo `server.py`:

```python
from rag_matching_engine import chain as rag_matching_engine_chain

add_routes(app, rag_matching_engine_chain, path="/rag-matching-engine")
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

Si está dentro de este directorio, entonces puede iniciar una instancia de LangServe directamente por:

```shell
langchain serve
```

Esto iniciará la aplicación FastAPI con un servidor que se ejecuta localmente en
[http://localhost:8000](http://localhost:8000)

Podemos ver todas las plantillas en [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Podemos acceder al playground en [http://127.0.0.1:8000/rag-matching-engine/playground](http://127.0.0.1:8000/rag-matching-engine/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-matching-engine")
```

Para más detalles sobre cómo conectarse a la plantilla, consulte el cuaderno Jupyter `rag_matching_engine`.
