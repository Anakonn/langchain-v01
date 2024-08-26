---
translated: true
---

# Asistente de investigación SQL

Este paquete realiza investigaciones sobre una base de datos SQL

## Uso

Este paquete se basa en múltiples modelos, que tienen las siguientes dependencias:

- OpenAI: establezca las variables de entorno `OPENAI_API_KEY`
- Ollama: [instalar y ejecutar Ollama](https://python.langchain.com/docs/integrations/chat/ollama)
- llama2 (en Ollama): `ollama pull llama2` (de lo contrario obtendrá errores 404 de Ollama)

Para usar este paquete, primero debe tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto LangChain e instalar este como el único paquete, puede hacer:

```shell
langchain app new my-app --package sql-research-assistant
```

Si desea agregar esto a un proyecto existente, puede simplemente ejecutar:

```shell
langchain app add sql-research-assistant
```

Y agregue el siguiente código a su archivo `server.py`:

```python
from sql_research_assistant import chain as sql_research_assistant_chain

add_routes(app, sql_research_assistant_chain, path="/sql-research-assistant")
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
Podemos acceder al playground en [http://127.0.0.1:8000/sql-research-assistant/playground](http://127.0.0.1:8000/sql-research-assistant/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/sql-research-assistant")
```
