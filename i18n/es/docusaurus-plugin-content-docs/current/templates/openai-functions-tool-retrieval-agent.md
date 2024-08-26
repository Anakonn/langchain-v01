---
translated: true
---

# Herramienta de recuperación de funciones de openai

La idea novedosa presentada en esta plantilla es la idea de usar la recuperación para seleccionar el conjunto de herramientas a usar para responder a una consulta de un agente. Esto es útil cuando tienes muchas herramientas para seleccionar. No puedes poner la descripción de todas las herramientas en el mensaje (debido a problemas de longitud de contexto), así que en su lugar seleccionas dinámicamente las N herramientas que quieres considerar usar en tiempo de ejecución.

En esta plantilla crearemos un ejemplo algo artificial. Tendremos una herramienta legítima (búsqueda) y luego 99 herramientas falsas que son solo sinsentido. Luego agregaremos un paso en la plantilla del mensaje que toma la entrada del usuario y recupera las herramientas relevantes para la consulta.

Esta plantilla se basa en [esta Guía del Agente](https://python.langchain.com/docs/modules/agents/how_to/custom_agent_with_tool_retrieval).

## Configuración del entorno

Las siguientes variables de entorno deben estar configuradas:

Establece la variable de entorno `OPENAI_API_KEY` para acceder a los modelos de OpenAI.

Establece la variable de entorno `TAVILY_API_KEY` para acceder a Tavily.

## Uso

Para usar este paquete, primero debes tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto de LangChain e instalar este como el único paquete, puedes hacer:

```shell
langchain app new my-app --package openai-functions-tool-retrieval-agent
```

Si quieres agregar esto a un proyecto existente, puedes simplemente ejecutar:

```shell
langchain app add openai-functions-tool-retrieval-agent
```

Y agrega el siguiente código a tu archivo `server.py`:

```python
from openai_functions_tool_retrieval_agent import agent_executor as openai_functions_tool_retrieval_agent_chain

add_routes(app, openai_functions_tool_retrieval_agent_chain, path="/openai-functions-tool-retrieval-agent")
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

Esto iniciará la aplicación FastAPI con un servidor que se está ejecutando localmente en
[http://localhost:8000](http://localhost:8000)

Podemos ver todas las plantillas en [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Podemos acceder al área de juegos en [http://127.0.0.1:8000/openai-functions-tool-retrieval-agent/playground](http://127.0.0.1:8000/openai-functions-tool-retrieval-agent/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/openai-functions-tool-retrieval-agent")
```
