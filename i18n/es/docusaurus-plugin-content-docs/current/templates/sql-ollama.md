---
translated: true
---

# sql-ollama

Esta plantilla permite a un usuario interactuar con una base de datos SQL utilizando lenguaje natural.

Utiliza [Zephyr-7b](https://huggingface.co/HuggingFaceH4/zephyr-7b-alpha) a través de [Ollama](https://ollama.ai/library/zephyr) para ejecutar la inferencia localmente en una computadora portátil Mac.

## Configuración del entorno

Antes de usar esta plantilla, debe configurar Ollama y la base de datos SQL.

1. Siga las instrucciones [aquí](https://python.langchain.com/docs/integrations/chat/ollama) para descargar Ollama.

2. Descarga tu LLM de interés:

    * Este paquete usa `zephyr`: `ollama pull zephyr`
    * Puedes elegir entre muchos LLM [aquí](https://ollama.ai/library)

3. Este paquete incluye una base de datos de ejemplo de los equipos de la NBA 2023. Puedes ver las instrucciones para construir esta base de datos [aquí](https://github.com/facebookresearch/llama-recipes/blob/main/demo_apps/StructuredLlama.ipynb).

## Uso

Para usar este paquete, primero debe tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto LangChain e instalar este como el único paquete, puedes hacer:

```shell
langchain app new my-app --package sql-ollama
```

Si quieres agregar esto a un proyecto existente, puedes simplemente ejecutar:

```shell
langchain app add sql-ollama
```

Y agrega el siguiente código a tu archivo `server.py`:

```python
from sql_ollama import chain as sql_ollama_chain

add_routes(app, sql_ollama_chain, path="/sql-ollama")
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
Podemos acceder al área de juegos en [http://127.0.0.1:8000/sql-ollama/playground](http://127.0.0.1:8000/sql-ollama/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/sql-ollama")
```
