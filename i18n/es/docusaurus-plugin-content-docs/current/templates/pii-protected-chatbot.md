---
translated: true
---

# pii-protected-chatbot

Esta plantilla crea un chatbot que marca cualquier PII entrante y no lo pasa al LLM.

## Configuración del entorno

Las siguientes variables de entorno deben estar configuradas:

Establezca la variable de entorno `OPENAI_API_KEY` para acceder a los modelos de OpenAI.

## Uso

Para usar este paquete, primero debe tener instalada la CLI de LangChain:

```shell
pip install -U "langchain-cli[serve]"
```

Para crear un nuevo proyecto LangChain e instalar este como el único paquete, puede hacer:

```shell
langchain app new my-app --package pii-protected-chatbot
```

Si desea agregar esto a un proyecto existente, puede simplemente ejecutar:

```shell
langchain app add pii-protected-chatbot
```

Y agregue el siguiente código a su archivo `server.py`:

```python
from pii_protected_chatbot.chain import chain as pii_protected_chatbot

add_routes(app, pii_protected_chatbot, path="/openai-functions-agent")
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

Si está dentro de este directorio, entonces puede iniciar una instancia de LangServe directamente por:

```shell
langchain serve
```

Esto iniciará la aplicación FastAPI con un servidor que se ejecuta localmente en
[http://localhost:8000](http://localhost:8000)

Podemos ver todas las plantillas en [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
Podemos acceder al playground en [http://127.0.0.1:8000/pii_protected_chatbot/playground](http://127.0.0.1:8000/pii_protected_chatbot/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/pii_protected_chatbot")
```
