---
translated: true
---

# Polygon IO Toolkit

Este cuaderno muestra cómo usar agentes para interactuar con el [Polygon IO](https://polygon.io/) toolkit. El toolkit proporciona acceso a la API de datos del mercado de valores de Polygon.

## Ejemplo de uso

### Configuración

```python
%pip install --upgrade --quiet langchain-community > /dev/null
```

Obtén tu clave API de Polygon IO [aquí](https://polygon.io/) y luego configúrala a continuación.
Tenga en cuenta que la herramienta utilizada en este ejemplo requiere una suscripción "Stocks Advanced".

```python
import getpass
import os

os.environ["POLYGON_API_KEY"] = getpass.getpass()
```

```output
········
```

También es útil (pero no necesario) configurar [LangSmith](https://smith.langchain.com/) para una observabilidad de primera clase.

```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

### Inicializar el agente

```python
from langchain import hub
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain_community.agent_toolkits.polygon.toolkit import PolygonToolkit
from langchain_community.utilities.polygon import PolygonAPIWrapper
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(temperature=0)

instructions = """You are an assistant."""
base_prompt = hub.pull("langchain-ai/openai-functions-template")
prompt = base_prompt.partial(instructions=instructions)
```

```python
polygon = PolygonAPIWrapper()
toolkit = PolygonToolkit.from_polygon_api_wrapper(polygon)
agent = create_openai_functions_agent(llm, toolkit.get_tools(), prompt)
```

```python
agent_executor = AgentExecutor(
    agent=agent,
    tools=toolkit.get_tools(),
    verbose=True,
)
```

### Obtener la última cotización de precio de una acción

```python
agent_executor.invoke({"input": "What is the latest stock price for AAPL?"})
```
