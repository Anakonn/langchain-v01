---
traducido: falso
translated: true
---

# Robocorp

Este cuaderno cubre cómo comenzar con el [Robocorp Action Server](https://github.com/robocorp/robocorp) y el kit de herramientas de LangChain.

Robocorp es la forma más sencilla de ampliar las capacidades de los agentes de IA, asistentes y copilots con acciones personalizadas.

## Instalación

Primero, consulta la [Guía de inicio rápido de Robocorp](https://github.com/robocorp/robocorp#quickstart) sobre cómo configurar el `Action Server` y crear tus Acciones.

En tu aplicación LangChain, instala el paquete `langchain-robocorp`:

```python
# Install package
%pip install --upgrade --quiet langchain-robocorp
```

Cuando creas el nuevo `Action Server` siguiendo la guía de inicio rápido anterior.

Creará un directorio con archivos, incluido `action.py`.

Podemos agregar funciones de Python como acciones como se muestra [aquí](https://github.com/robocorp/robocorp/tree/master/actions#describe-your-action).

Agreguemos una función ficticia a `action.py`.

```python
@action
def get_weather_forecast(city: str, days: int, scale: str = "celsius") -> str:
    """
    Returns weather conditions forecast for a given city.

    Args:
        city (str): Target city to get the weather conditions for
        days: How many day forecast to return
        scale (str): Temperature scale to use, should be one of "celsius" or "fahrenheit"

    Returns:
        str: The requested weather conditions forecast
    """
    return "75F and sunny :)"
```

Luego iniciamos el servidor:

```bash
action-server start
```

Y podemos ver:

```text
Found new action: get_weather_forecast

```

Prueba localmente yendo al servidor que se ejecuta en `http://localhost:8080` y usa la interfaz de usuario para ejecutar la función.

## Configuración del entorno

Opcionalmente, puedes establecer las siguientes variables de entorno:

- `LANGCHAIN_TRACING_V2=true`: Para habilitar el seguimiento de ejecución de registros de LangSmith que también se pueden vincular a los registros de ejecución de acciones del Action Server respectivo. Consulta la [documentación de LangSmith](https://docs.smith.langchain.com/tracing#log-runs) para obtener más información.

## Uso

Iniciamos el servidor de acciones local, arriba, que se ejecuta en `http://localhost:8080`.

```python
from langchain.agents import AgentExecutor, OpenAIFunctionsAgent
from langchain_core.messages import SystemMessage
from langchain_openai import ChatOpenAI
from langchain_robocorp import ActionServerToolkit

# Initialize LLM chat model
llm = ChatOpenAI(model="gpt-4", temperature=0)

# Initialize Action Server Toolkit
toolkit = ActionServerToolkit(url="http://localhost:8080", report_trace=True)
tools = toolkit.get_tools()

# Initialize Agent
system_message = SystemMessage(content="You are a helpful assistant")
prompt = OpenAIFunctionsAgent.create_prompt(system_message)
agent = OpenAIFunctionsAgent(llm=llm, prompt=prompt, tools=tools)

executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

executor.invoke("What is the current weather today in San Francisco in fahrenheit?")
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `robocorp_action_server_get_weather_forecast` with `{'city': 'San Francisco', 'days': 1, 'scale': 'fahrenheit'}`


[0m[33;1m[1;3m"75F and sunny :)"[0m[32;1m[1;3mThe current weather today in San Francisco is 75F and sunny.[0m

[1m> Finished chain.[0m
```

```output
{'input': 'What is the current weather today in San Francisco in fahrenheit?',
 'output': 'The current weather today in San Francisco is 75F and sunny.'}
```

### Herramientas de entrada única

De forma predeterminada, `toolkit.get_tools()` devolverá las acciones como Herramientas Estructuradas.

Para devolver herramientas de entrada única, pasa un modelo de Chat que se utilizará para procesar las entradas.

```python
# Initialize single input Action Server Toolkit
toolkit = ActionServerToolkit(url="http://localhost:8080")
tools = toolkit.get_tools(llm=llm)
```
