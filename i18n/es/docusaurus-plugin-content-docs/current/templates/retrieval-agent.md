---
translated: true
---

# agente de recuperación

Este paquete utiliza Azure OpenAI para realizar la recuperación mediante una arquitectura de agente.
De forma predeterminada, esta recuperación se realiza sobre Arxiv.

## Configuración del entorno

Dado que estamos utilizando Azure OpenAI, necesitaremos establecer las siguientes variables de entorno:

```shell
export AZURE_OPENAI_ENDPOINT=...
export AZURE_OPENAI_API_VERSION=...
export AZURE_OPENAI_API_KEY=...
```

## Uso

Para utilizar este paquete, primero debe tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto de LangChain e instalar este como el único paquete, puede hacer:

```shell
langchain app new my-app --package retrieval-agent
```

Si desea agregar esto a un proyecto existente, puede simplemente ejecutar:

```shell
langchain app add retrieval-agent
```

Y agregar el siguiente código a su archivo `server.py`:

```python
from retrieval_agent import chain as retrieval_agent_chain

add_routes(app, retrieval_agent_chain, path="/retrieval-agent")
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
Podemos acceder al área de juegos en [http://127.0.0.1:8000/retrieval-agent/playground](http://127.0.0.1:8000/retrieval-agent/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/retrieval-agent")
```
