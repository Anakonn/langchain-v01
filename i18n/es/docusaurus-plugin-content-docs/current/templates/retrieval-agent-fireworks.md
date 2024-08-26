---
translated: true
---

# agente-de-recuperación-fuegos-artificiales

Este paquete utiliza modelos de código abierto alojados en FireworksAI para realizar la recuperación utilizando una arquitectura de agente. De forma predeterminada, esta recuperación se realiza sobre Arxiv.

Utilizaremos `Mixtral8x7b-instruct-v0.1`, que se muestra en este blog como que produce resultados razonables
con la llamada de funciones, a pesar de que no está ajustado para esta tarea: https://huggingface.co/blog/open-source-llms-as-agents

## Configuración del entorno

Hay varias formas excelentes de ejecutar modelos OSS. Utilizaremos FireworksAI como una forma sencilla de ejecutar los modelos. Consulta [aquí](https://python.langchain.com/docs/integrations/providers/fireworks) para obtener más información.

Establece la variable de entorno `FIREWORKS_API_KEY` para acceder a Fireworks.

## Uso

Para utilizar este paquete, primero debes tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto de LangChain e instalar este como el único paquete, puedes hacer:

```shell
langchain app new my-app --package retrieval-agent-fireworks
```

Si quieres añadirlo a un proyecto existente, puedes simplemente ejecutar:

```shell
langchain app add retrieval-agent-fireworks
```

Y añadir el siguiente código a tu archivo `server.py`:

```python
from retrieval_agent_fireworks import chain as retrieval_agent_fireworks_chain

add_routes(app, retrieval_agent_fireworks_chain, path="/retrieval-agent-fireworks")
```

(Opcional) Ahora configuremos LangSmith.
LangSmith nos ayudará a trazar, monitorizar y depurar las aplicaciones de LangChain.
Puedes registrarte en LangSmith [aquí](https://smith.langchain.com/).
Si no tienes acceso, puedes omitir esta sección.

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

Si estás dentro de este directorio, entonces puedes iniciar una instancia de LangServe directamente mediante:

```shell
langchain serve
```

Esto iniciará la aplicación FastAPI con un servidor que se ejecuta localmente en
[http://localhost:8000](http://localhost:8000)

Podemos ver todas las plantillas en [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Podemos acceder al playground en [http://127.0.0.1:8000/retrieval-agent-fireworks/playground](http://127.0.0.1:8000/retrieval-agent-fireworks/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/retrieval-agent-fireworks")
```
