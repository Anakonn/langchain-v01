---
translated: true
---

# rag-pinecone-multi-query

Esta plantilla realiza RAG utilizando Pinecone y OpenAI con un recuperador de consultas múltiples.

Utiliza un LLM para generar múltiples consultas desde diferentes perspectivas basadas en la consulta de entrada del usuario.

Para cada consulta, recupera un conjunto de documentos relevantes y toma la unión única a través de todas las consultas para la síntesis de respuestas.

## Configuración del entorno

Esta plantilla utiliza Pinecone como un almacén de vectores y requiere que se establezcan `PINECONE_API_KEY`, `PINECONE_ENVIRONMENT` y `PINECONE_INDEX`.

Establece la variable de entorno `OPENAI_API_KEY` para acceder a los modelos de OpenAI.

## Uso

Para usar este paquete, primero debe instalar la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto LangChain e instalar este paquete, haz:

```shell
langchain app new my-app --package rag-pinecone-multi-query
```

Para agregar este paquete a un proyecto existente, ejecuta:

```shell
langchain app add rag-pinecone-multi-query
```

Y agrega el siguiente código a tu archivo `server.py`:

```python
from rag_pinecone_multi_query import chain as rag_pinecone_multi_query_chain

add_routes(app, rag_pinecone_multi_query_chain, path="/rag-pinecone-multi-query")
```

(Opcional) Ahora, configuremos LangSmith. LangSmith nos ayudará a rastrear, monitorear y depurar las aplicaciones de LangChain. Puedes registrarte en LangSmith [aquí](https://smith.langchain.com/). Si no tienes acceso, puedes omitir esta sección.

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

Si estás dentro de este directorio, entonces puedes iniciar una instancia de LangServe directamente por:

```shell
langchain serve
```

Esto iniciará la aplicación FastAPI con un servidor en ejecución localmente en [http://localhost:8000](http://localhost:8000)

Puedes ver todas las plantillas en [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Puedes acceder al playground en [http://127.0.0.1:8000/rag-pinecone-multi-query/playground](http://127.0.0.1:8000/rag-pinecone-multi-query/playground)

Para acceder a la plantilla desde el código, usa:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-pinecone-multi-query")
```
