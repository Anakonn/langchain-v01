---
translated: true
---

# extracción-funciones-antropic

Esta plantilla permite [llamar a funciones de Anthropic](https://python.langchain.com/docs/integrations/chat/anthropic_functions).

Esto se puede usar para diversas tareas, como extracción o etiquetado.

El esquema de salida de la función se puede establecer en `chain.py`.

## Configuración del entorno

Establece la variable de entorno `ANTHROPIC_API_KEY` para acceder a los modelos de Anthropic.

## Uso

Para usar este paquete, primero debe tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto de LangChain e instalar este como el único paquete, puedes hacer:

```shell
langchain app new my-app --package extraction-anthropic-functions
```

Si quieres agregar esto a un proyecto existente, puedes simplemente ejecutar:

```shell
langchain app add extraction-anthropic-functions
```

Y agrega el siguiente código a tu archivo `server.py`:

```python
from extraction_anthropic_functions import chain as extraction_anthropic_functions_chain

add_routes(app, extraction_anthropic_functions_chain, path="/extraction-anthropic-functions")
```

(Opcional) Ahora configuremos LangSmith.
LangSmith nos ayudará a rastrear, monitorear y depurar aplicaciones de LangChain.
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
Podemos acceder al playground en [http://127.0.0.1:8000/extraction-anthropic-functions/playground](http://127.0.0.1:8000/extraction-anthropic-functions/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/extraction-anthropic-functions")
```

De forma predeterminada, el paquete extraerá el título y el autor de los documentos a partir de la información que especifiques en `chain.py`. Esta plantilla usará `Claude2` de forma predeterminada.

---
