---
translated: true
---

# rewrite_retrieve_read

Esta plantilla implementa un método para la transformación de consultas (reescritura) en el documento [Query Rewriting for Retrieval-Augmented Large Language Models](https://arxiv.org/pdf/2305.14283.pdf) para optimizar para RAG.

## Configuración del entorno

Establezca la variable de entorno `OPENAI_API_KEY` para acceder a los modelos de OpenAI.

## Uso

Para usar este paquete, primero debe tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto de LangChain e instalar este como el único paquete, puede hacer:

```shell
langchain app new my-app --package rewrite_retrieve_read
```

Si desea agregar esto a un proyecto existente, puede simplemente ejecutar:

```shell
langchain app add rewrite_retrieve_read
```

Y agregue el siguiente código a su archivo `server.py`:

```python
from rewrite_retrieve_read.chain import chain as rewrite_retrieve_read_chain

add_routes(app, rewrite_retrieve_read_chain, path="/rewrite-retrieve-read")
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
Podemos acceder al playground en [http://127.0.0.1:8000/rewrite_retrieve_read/playground](http://127.0.0.1:8000/rewrite_retrieve_read/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rewrite_retrieve_read")
```
