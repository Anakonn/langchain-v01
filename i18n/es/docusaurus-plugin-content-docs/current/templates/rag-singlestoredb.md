---
translated: true
---

# rag-singlestoredb

Esta plantilla realiza RAG utilizando SingleStoreDB y OpenAI.

## Configuración del entorno

Esta plantilla utiliza SingleStoreDB como un vectorstore y requiere que se establezca la variable de entorno `SINGLESTOREDB_URL`. Debe tener el formato `admin:password@svc-xxx.svc.singlestore.com:port/db_name`.

Establezca la variable de entorno `OPENAI_API_KEY` para acceder a los modelos de OpenAI.

## Uso

Para utilizar este paquete, primero debe tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto de LangChain e instalar este como el único paquete, puede hacer:

```shell
langchain app new my-app --package rag-singlestoredb
```

Si desea agregar esto a un proyecto existente, puede ejecutar:

```shell
langchain app add rag-singlestoredb
```

Y agregar el siguiente código a su archivo `server.py`:

```python
from rag_singlestoredb import chain as rag_singlestoredb_chain

add_routes(app, rag_singlestoredb_chain, path="/rag-singlestoredb")
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
Podemos acceder al playground en [http://127.0.0.1:8000/rag-singlestoredb/playground](http://127.0.0.1:8000/rag-singlestoredb/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-singlestoredb")
```
