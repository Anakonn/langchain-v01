---
translated: true
---

# rag-astradb

Esta plantilla realizará RAG utilizando Astra DB (`AstraDB` clase de vector store)

## Configuración del entorno

Se requiere una base de datos [Astra DB](https://astra.datastax.com); el plan gratuito está bien.

- Necesitas el **punto final de la API** de la base de datos (como `https://0123...-us-east1.apps.astra.datastax.com`) ...
- ... y un **token** (`AstraCS:...`).

También se requiere una **clave de API de OpenAI**. _Tenga en cuenta que, de forma predeterminada, esta demostración solo admite OpenAI, a menos que modifique el código._

Proporciona los parámetros de conexión y los secretos a través de variables de entorno. Consulta `.env.template` para conocer los nombres de las variables.

## Uso

Para usar este paquete, primero debes tener instalada la CLI de LangChain:

```shell
pip install -U "langchain-cli[serve]"
```

Para crear un nuevo proyecto de LangChain e instalar este como el único paquete, puedes hacer:

```shell
langchain app new my-app --package rag-astradb
```

Si quieres agregar esto a un proyecto existente, puedes simplemente ejecutar:

```shell
langchain app add rag-astradb
```

Y agrega el siguiente código a tu archivo `server.py`:

```python
from astradb_entomology_rag import chain as astradb_entomology_rag_chain

add_routes(app, astradb_entomology_rag_chain, path="/rag-astradb")
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
Podemos acceder al área de juegos en [http://127.0.0.1:8000/rag-astradb/playground](http://127.0.0.1:8000/rag-astradb/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-astradb")
```

## Referencia

Repositorio independiente con la cadena LangServe: [aquí](https://github.com/hemidactylus/langserve_astradb_entomology_rag).
