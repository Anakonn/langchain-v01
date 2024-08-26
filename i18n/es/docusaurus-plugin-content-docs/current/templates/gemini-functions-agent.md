---
translated: true
---

# agente-de-funciones-gemini

Esta plantilla crea un agente que utiliza la llamada a funciones de Google Gemini para comunicar sus decisiones sobre qué acciones tomar.

Este ejemplo crea un agente que puede opcionalmente buscar información en Internet utilizando el motor de búsqueda de Tavily.

[Ver un ejemplo de seguimiento de LangSmith aquí](https://smith.langchain.com/public/0ebf1bd6-b048-4019-b4de-25efe8d3d18c/r)

## Configuración del entorno

Las siguientes variables de entorno deben estar establecidas:

Establezca la variable de entorno `TAVILY_API_KEY` para acceder a Tavily

Establezca la variable de entorno `GOOGLE_API_KEY` para acceder a las API de Google Gemini.

## Uso

Para usar este paquete, primero debe tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto LangChain e instalar este como el único paquete, puede hacer:

```shell
langchain app new my-app --package gemini-functions-agent
```

Si desea agregar esto a un proyecto existente, puede simplemente ejecutar:

```shell
langchain app add gemini-functions-agent
```

Y agregue el siguiente código a su archivo `server.py`:

```python
from gemini_functions_agent import agent_executor as gemini_functions_agent_chain

add_routes(app, gemini_functions_agent_chain, path="/openai-functions-agent")
```

(Opcional) Ahora configuremos LangSmith.
LangSmith nos ayudará a rastrear, monitorear y depurar aplicaciones LangChain.
Puede registrarse en LangSmith [aquí](https://smith.langchain.com/).
Si no tiene acceso, puede omitir esta sección

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
Podemos acceder al área de juegos en [http://127.0.0.1:8000/gemini-functions-agent/playground](http://127.0.0.1:8000/gemini-functions-agent/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/gemini-functions-agent")
```
