---
translated: true
---

# sql-llamacpp

Esta plantilla permite a un usuario interactuar con una base de datos SQL utilizando lenguaje natural.

Utiliza [Mistral-7b](https://mistral.ai/news/announcing-mistral-7b/) a través de [llama.cpp](https://github.com/ggerganov/llama.cpp) para ejecutar la inferencia localmente en una computadora portátil Mac.

## Configuración del entorno

Para configurar el entorno, sigue estos pasos:

```shell
wget https://github.com/conda-forge/miniforge/releases/latest/download/Miniforge3-MacOSX-arm64.sh
bash Miniforge3-MacOSX-arm64.sh
conda create -n llama python=3.9.16
conda activate /Users/rlm/miniforge3/envs/llama
CMAKE_ARGS="-DLLAMA_METAL=on" FORCE_CMAKE=1 pip install -U llama-cpp-python --no-cache-dir
```

## Uso

Para usar este paquete, primero debes tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto de LangChain e instalar este como el único paquete, puedes hacer:

```shell
langchain app new my-app --package sql-llamacpp
```

Si quieres agregar esto a un proyecto existente, puedes simplemente ejecutar:

```shell
langchain app add sql-llamacpp
```

Y agrega el siguiente código a tu archivo `server.py`:

```python
from sql_llamacpp import chain as sql_llamacpp_chain

add_routes(app, sql_llamacpp_chain, path="/sql-llamacpp")
```

El paquete descargará el modelo Mistral-7b desde [aquí](https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.1-GGUF). Puedes seleccionar otros archivos y especificar su ruta de descarga (navega [aquí](https://huggingface.co/TheBloke)).

Este paquete incluye un ejemplo de base de datos de los equipos de la NBA 2023. Puedes ver las instrucciones para construir esta base de datos [aquí](https://github.com/facebookresearch/llama-recipes/blob/main/demo_apps/StructuredLlama.ipynb).

(Opcional) Configura LangSmith para el rastreo, el monitoreo y la depuración de las aplicaciones de LangChain. Puedes registrarte en LangSmith [aquí](https://smith.langchain.com/). Si no tienes acceso, puedes omitir esta sección.

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

Si estás dentro de este directorio, entonces puedes iniciar una instancia de LangServe directamente mediante:

```shell
langchain serve
```

Esto iniciará la aplicación FastAPI con un servidor en ejecución localmente en
[http://localhost:8000](http://localhost:8000)

Puedes ver todas las plantillas en [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Puedes acceder al playground en [http://127.0.0.1:8000/sql-llamacpp/playground](http://127.0.0.1:8000/sql-llamacpp/playground)

Puedes acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/sql-llamacpp")
```
