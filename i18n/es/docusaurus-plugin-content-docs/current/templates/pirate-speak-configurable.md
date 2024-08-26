---
translated: true
---

# pirate-speak-configurable

Esta plantilla convierte la entrada del usuario en lenguaje de piratas. Muestra cómo puede permitir `configurable_alternatives` en el Runnable, lo que le permite seleccionar entre OpenAI, Anthropic o Cohere como su proveedor de LLM en el playground (o a través de la API).

## Configuración del entorno

Establezca las siguientes variables de entorno para acceder a los 3 proveedores de modelos alternativos configurables:

- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `COHERE_API_KEY`

## Uso

Para usar este paquete, primero debe tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto LangChain e instalar este como el único paquete, puede hacer:

```shell
langchain app new my-app --package pirate-speak-configurable
```

Si desea agregar esto a un proyecto existente, puede simplemente ejecutar:

```shell
langchain app add pirate-speak-configurable
```

Y agregue el siguiente código a su archivo `server.py`:

```python
from pirate_speak_configurable import chain as pirate_speak_configurable_chain

add_routes(app, pirate_speak_configurable_chain, path="/pirate-speak-configurable")
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

Si está dentro de este directorio, puede iniciar una instancia de LangServe directamente por:

```shell
langchain serve
```

Esto iniciará la aplicación FastAPI con un servidor que se ejecuta localmente en
[http://localhost:8000](http://localhost:8000)

Podemos ver todas las plantillas en [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Podemos acceder al playground en [http://127.0.0.1:8000/pirate-speak-configurable/playground](http://127.0.0.1:8000/pirate-speak-configurable/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/pirate-speak-configurable")
```
