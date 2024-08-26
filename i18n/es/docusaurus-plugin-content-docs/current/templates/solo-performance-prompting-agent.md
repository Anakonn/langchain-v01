---
translated: true
---

# solo-performance-prompting-agent

Esta plantilla crea un agente que transforma un solo LLM en un sinergista cognitivo al participar en una colaboración de múltiples turnos con múltiples personas.
Un sinergista cognitivo se refiere a un agente inteligente que colabora con múltiples mentes, combinando sus fortalezas y conocimientos individuales, para mejorar la resolución de problemas y el rendimiento general en tareas complejas. Al identificar y simular dinámicamente diferentes personas en función de las entradas de la tarea, SPP libera el potencial de la sinergia cognitiva en los LLM.

Esta plantilla utilizará la API de búsqueda de `DuckDuckGo`.

## Configuración del entorno

Esta plantilla utilizará `OpenAI` de forma predeterminada.
Asegúrese de que `OPENAI_API_KEY` esté establecido en su entorno.

## Uso

Para usar este paquete, primero debe tener instalada la CLI de LangChain:

```shell
pip install -U langchain-cli
```

Para crear un nuevo proyecto LangChain e instalar este como el único paquete, puede hacer:

```shell
langchain app new my-app --package solo-performance-prompting-agent
```

Si desea agregar esto a un proyecto existente, puede simplemente ejecutar:

```shell
langchain app add solo-performance-prompting-agent
```

Y agregue el siguiente código a su archivo `server.py`:

```python
from solo_performance_prompting_agent.agent import agent_executor as solo_performance_prompting_agent_chain

add_routes(app, solo_performance_prompting_agent_chain, path="/solo-performance-prompting-agent")
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
Podemos acceder al área de juegos en [http://127.0.0.1:8000/solo-performance-prompting-agent/playground](http://127.0.0.1:8000/solo-performance-prompting-agent/playground)

Podemos acceder a la plantilla desde el código con:

```python
from langserve.client import RemoteRunnable

runnable = RemoteRunnable("http://localhost:8000/solo-performance-prompting-agent")
```
