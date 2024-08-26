---
translated: true
---

# Langchain - Servidor de acciones de Robocorp

Esta plantilla permite usar [Robocorp Action Server](https://github.com/robocorp/robocorp) como herramientas para un agente.

## Uso

Para usar este paquete, primero debe tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto de LangChain e instalar este como el único paquete, puede hacer:

```shell
langchain app new my-app --package robocorp-action-server
```

Si desea agregar esto a un proyecto existente, puede simplemente ejecutar:

```shell
langchain app add robocorp-action-server
```

Y agregar el siguiente código a su archivo `server.py`:

```python
from robocorp_action_server import agent_executor as action_server_chain

add_routes(app, action_server_chain, path="/robocorp-action-server")
```

### Ejecutar el servidor de acciones

Para ejecutar el servidor de acciones, debe tener instalado el Robocorp Action Server

```bash
pip install -U robocorp-action-server
```

Luego puede ejecutar el servidor de acciones con:

```bash
action-server new
cd ./your-project-name
action-server start
```

### Configurar LangSmith (opcional)

LangSmith nos ayudará a rastrear, monitorear y depurar las aplicaciones de LangChain.
Puede registrarse en LangSmith [aquí](https://smith.langchain.com/).
Si no tiene acceso, puede omitir esta sección

```shell
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=<your-api-key>
export LANGCHAIN_PROJECT=<your-project>  # if not specified, defaults to "default"
```

### Iniciar una instancia de LangServe

Si está dentro de este directorio, puede iniciar una instancia de LangServe directamente mediante:

```shell
langchain serve
```

Esto iniciará la aplicación FastAPI con un servidor que se ejecuta localmente en
[http://localhost:8000](http://localhost:8000)

Podemos ver todas las plantillas en [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Podemos acceder al área de juegos en [http://127.0.0.1:8000/robocorp-action-server/playground](http://127.0.0.1:8000/robocorp-action-server/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/robocorp-action-server")
```
