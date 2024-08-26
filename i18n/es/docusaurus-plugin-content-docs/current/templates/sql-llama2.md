---
translated: true
---

# sql-llama2

Esta plantilla permite a un usuario interactuar con una base de datos SQL utilizando lenguaje natural.

Utiliza LLamA2-13b alojado por [Replicate](https://python.langchain.com/docs/integrations/llms/replicate), pero se puede adaptar a cualquier API que admita LLaMA2, incluido [Fireworks](https://python.langchain.com/docs/integrations/chat/fireworks).

La plantilla incluye un ejemplo de base de datos de los equipos de la NBA 2023.

Para obtener más información sobre cómo construir esta base de datos, consulte [aquí](https://github.com/facebookresearch/llama-recipes/blob/main/demo_apps/StructuredLlama.ipynb).

## Configuración del entorno

Asegúrese de que el `REPLICATE_API_TOKEN` esté establecido en su entorno.

## Uso

Para usar este paquete, primero debe tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto LangChain e instalar este como el único paquete, puede hacer:

```shell
langchain app new my-app --package sql-llama2
```

Si desea agregar esto a un proyecto existente, puede simplemente ejecutar:

```shell
langchain app add sql-llama2
```

Y agregue el siguiente código a su archivo `server.py`:

```python
from sql_llama2 import chain as sql_llama2_chain

add_routes(app, sql_llama2_chain, path="/sql-llama2")
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
Podemos acceder al playground en [http://127.0.0.1:8000/sql-llama2/playground](http://127.0.0.1:8000/sql-llama2/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/sql-llama2")
```
