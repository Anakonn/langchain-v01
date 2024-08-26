---
translated: true
---

# Polygon IO Toolkit

Ce notebook montre comment utiliser des agents pour interagir avec la boîte à outils [Polygon IO](https://polygon.io/). La boîte à outils fournit un accès à l'API de données de marché boursier de Polygon.

## Exemple d'utilisation

### Configuration

```python
%pip install --upgrade --quiet langchain-community > /dev/null
```

Obtenez votre clé d'API Polygon IO [ici](https://polygon.io/), puis définissez-la ci-dessous.
Notez que l'outil utilisé dans cet exemple nécessite un abonnement "Stocks Advanced".

```python
import getpass
import os

os.environ["POLYGON_API_KEY"] = getpass.getpass()
```

```output
········
```

Il est également utile (mais pas nécessaire) de configurer [LangSmith](https://smith.langchain.com/) pour une observabilité de premier ordre.

```python
# os.environ["LANGCHAIN_TRACING_V2"] = "true"
# os.environ["LANGCHAIN_API_KEY"] = getpass.getpass()
```

### Initialisation de l'agent

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

### Obtenir le dernier cours d'une action

```python
agent_executor.invoke({"input": "What is the latest stock price for AAPL?"})
```
