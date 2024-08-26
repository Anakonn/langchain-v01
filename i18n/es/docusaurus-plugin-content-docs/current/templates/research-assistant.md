---
translated: true
---

# Asistente de investigación

Esta plantilla implementa una versión de
[GPT Researcher](https://github.com/assafelovic/gpt-researcher) que puedes usar
como punto de partida para un agente de investigación.

## Configuración del entorno

La plantilla predeterminada se basa en ChatOpenAI y DuckDuckGo, por lo que necesitarás la
siguiente variable de entorno:

- `OPENAI_API_KEY`

Y para usar el motor de búsqueda optimizado para LLM de Tavily, necesitarás:

- `TAVILY_API_KEY`

## Uso

Para usar este paquete, primero debes tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto LangChain e instalar este como el único paquete, puedes hacer:

```shell
langchain app new my-app --package research-assistant
```

Si quieres agregar esto a un proyecto existente, puedes simplemente ejecutar:

```shell
langchain app add research-assistant
```

Y agrega el siguiente código a tu archivo `server.py`:

```python
from research_assistant import chain as research_assistant_chain

add_routes(app, research_assistant_chain, path="/research-assistant")
```

(Opcional) Ahora configuremos LangSmith.
LangSmith nos ayudará a rastrear, monitorear y depurar aplicaciones LangChain.
Puedes registrarte en LangSmith [aquí](https://smith.langchain.com/).
Si no tienes acceso, puedes omitir esta sección

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
Podemos acceder al playground en [http://127.0.0.1:8000/research-assistant/playground](http://127.0.0.1:8000/research-assistant/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/research-assistant")
```
