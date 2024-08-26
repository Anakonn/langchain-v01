---
translated: true
---

# rag-pinecone

Esta plantilla realiza RAG utilizando Pinecone y OpenAI.

## Configuración del entorno

Esta plantilla utiliza Pinecone como un almacén de vectores y requiere que se establezcan `PINECONE_API_KEY`, `PINECONE_ENVIRONMENT` y `PINECONE_INDEX`.

Establece la variable de entorno `OPENAI_API_KEY` para acceder a los modelos de OpenAI.

## Uso

Para usar este paquete, primero debes tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto de LangChain e instalar este como el único paquete, puedes hacer:

```shell
langchain app new my-app --package rag-pinecone
```

Si quieres agregar esto a un proyecto existente, puedes simplemente ejecutar:

```shell
langchain app add rag-pinecone
```

Y agrega el siguiente código a tu archivo `server.py`:

```python
from rag_pinecone import chain as rag_pinecone_chain

add_routes(app, rag_pinecone_chain, path="/rag-pinecone")
```

(Opcional) Ahora configuremos LangSmith.
LangSmith nos ayudará a rastrear, monitorear y depurar las aplicaciones de LangChain.
Puedes registrarte en LangSmith [aquí](https://smith.langchain.com/).
Si no tienes acceso, puedes omitir esta sección.

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

Si estás dentro de este directorio, entonces puedes iniciar una instancia de LangServe directamente por:

```shell
langchain serve
```

Esto iniciará la aplicación FastAPI con un servidor que se ejecuta localmente en
[http://localhost:8000](http://localhost:8000)

Podemos ver todas las plantillas en [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Podemos acceder al playground en [http://127.0.0.1:8000/rag-pinecone/playground](http://127.0.0.1:8000/rag-pinecone/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-pinecone")
```
