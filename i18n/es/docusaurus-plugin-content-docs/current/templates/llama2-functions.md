---
translated: true
---

# llama2-functions

Esta plantilla realiza la extracción de datos estructurados a partir de datos no estructurados utilizando un [modelo LLaMA2 que admite un esquema de salida JSON especificado](https://github.com/ggerganov/llama.cpp/blob/master/grammars/README.md).

El esquema de extracción se puede establecer en `chain.py`.

## Configuración del entorno

Esto utilizará un [modelo LLaMA2-13b alojado por Replicate](https://replicate.com/andreasjansson/llama-2-13b-chat-gguf/versions).

Asegúrese de que `REPLICATE_API_TOKEN` esté establecido en su entorno.

## Uso

Para usar este paquete, primero debe tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto de LangChain e instalar este como el único paquete, puede hacer:

```shell
langchain app new my-app --package llama2-functions
```

Si desea agregar esto a un proyecto existente, puede simplemente ejecutar:

```shell
langchain app add llama2-functions
```

Y agregue el siguiente código a su archivo `server.py`:

```python
from llama2_functions import chain as llama2_functions_chain

add_routes(app, llama2_functions_chain, path="/llama2-functions")
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
Podemos acceder al área de juegos en [http://127.0.0.1:8000/llama2-functions/playground](http://127.0.0.1:8000/llama2-functions/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/llama2-functions")
```
