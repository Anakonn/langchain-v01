---
translated: true
---

# Crítica y revisión básica

Generar candidatos de esquema de forma iterativa y revisarlos en función de los errores.

## Configuración del entorno

Esta plantilla utiliza la llamada a funciones de OpenAI, por lo que deberá establecer la variable de entorno `OPENAI_API_KEY` para poder utilizar esta plantilla.

## Uso

Para utilizar este paquete, primero debe tener instalada la CLI de LangChain:

```shell
pip install -U "langchain-cli[serve]"
```

Para crear un nuevo proyecto de LangChain e instalar este como único paquete, puede hacer:

```shell
langchain app new my-app --package basic-critique-revise
```

Si desea agregar esto a un proyecto existente, simplemente puede ejecutar:

```shell
langchain app add basic-critique-revise
```

Y agregar el siguiente código a su archivo `server.py`:

```python
from basic_critique_revise import chain as basic_critique_revise_chain

add_routes(app, basic_critique_revise_chain, path="/basic-critique-revise")
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
Podemos acceder al playground en [http://127.0.0.1:8000/basic-critique-revise/playground](http://127.0.0.1:8000/basic-critique-revise/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/basic-critique-revise")
```
