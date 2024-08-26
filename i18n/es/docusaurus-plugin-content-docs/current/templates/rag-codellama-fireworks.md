---
translated: true
---

# rag-codellama-fireworks

Esta plantilla realiza RAG en una base de código.

Utiliza codellama-34b alojado por la [API de inferencia de modelos de Fireworks](https://blog.fireworks.ai/accelerating-code-completion-with-fireworks-fast-llm-inference-f4e8b5ec534a).

## Configuración del entorno

Establece la variable de entorno `FIREWORKS_API_KEY` para acceder a los modelos de Fireworks.

Puedes obtenerla desde [aquí](https://app.fireworks.ai/login?callbackURL=https://app.fireworks.ai).

## Uso

Para usar este paquete, primero debes tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto de LangChain e instalar este como el único paquete, puedes hacer:

```shell
langchain app new my-app --package rag-codellama-fireworks
```

Si quieres agregar esto a un proyecto existente, puedes simplemente ejecutar:

```shell
langchain app add rag-codellama-fireworks
```

Y agrega el siguiente código a tu archivo `server.py`:

```python
from rag_codellama_fireworks import chain as rag_codellama_fireworks_chain

add_routes(app, rag_codellama_fireworks_chain, path="/rag-codellama-fireworks")
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

Si estás dentro de este directorio, entonces puedes iniciar una instancia de LangServe directamente mediante:

```shell
langchain serve
```

Esto iniciará la aplicación FastAPI con un servidor que se ejecuta localmente en
[http://localhost:8000](http://localhost:8000)

Podemos ver todas las plantillas en [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Podemos acceder al playground en [http://127.0.0.1:8000/rag-codellama-fireworks/playground](http://127.0.0.1:8000/rag-codellama-fireworks/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/rag-codellama-fireworks")
```
