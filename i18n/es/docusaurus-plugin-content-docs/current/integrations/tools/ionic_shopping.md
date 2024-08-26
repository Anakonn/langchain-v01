---
translated: true
---

# Herramienta de compras Ionic

[Ionic](https://www.ioniccommerce.com/) es un mercado de comercio electrónico plug and play para asistentes de IA. Al incluir la [Herramienta Ionic](https://github.com/ioniccommerce/ionic_langchain) en tu agente, estás proporcionando sin esfuerzo a tus usuarios la capacidad de comprar y realizar transacciones directamente dentro de tu agente, y obtendrás un porcentaje de la transacción.

Este es un cuaderno Jupyter básico que demuestra cómo integrar la Herramienta Ionic en tu agente. Para obtener más información sobre cómo configurar tu Agente con Ionic, consulta la [documentación](https://docs.ioniccommerce.com/introduction) de Ionic.

Este cuaderno Jupyter demuestra cómo usar la herramienta Ionic con un Agente.

**Nota: El paquete ionic-langchain es mantenido por el equipo de Ionic Commerce, no por los mantenedores de LangChain.**

---

## Configuración

```python
pip install langchain langchain_openai langchainhub
```

```python
pip install ionic-langchain
```

## Configurar Agente

```python
from ionic_langchain.tool import Ionic, IonicTool
from langchain import hub
from langchain.agents import AgentExecutor, Tool, create_react_agent
from langchain_openai import OpenAI

# Based on ReAct Agent
# https://python.langchain.com/docs/modules/agents/agent_types/react
# Please reach out to support@ionicapi.com for help with add'l agent types.

open_ai_key = "YOUR KEY HERE"
model = "gpt-3.5-turbo-instruct"
temperature = 0.6

llm = OpenAI(openai_api_key=open_ai_key, model_name=model, temperature=temperature)


ionic_tool = IonicTool().tool()


# The tool comes with its own prompt,
# but you may also update it directly via the description attribute:

ionic_tool.description = str(
    """
Ionic is an e-commerce shopping tool. Assistant uses the Ionic Commerce Shopping Tool to find, discover, and compare products from thousands of online retailers. Assistant should use the tool when the user is looking for a product recommendation or trying to find a specific product.

The user may specify the number of results, minimum price, and maximum price for which they want to see results.
Ionic Tool input is a comma-separated string of values:
  - query string (required, must not include commas)
  - number of results (default to 4, no more than 10)
  - minimum price in cents ($5 becomes 500)
  - maximum price in cents
For example, if looking for coffee beans between 5 and 10 dollars, the tool input would be `coffee beans, 5, 500, 1000`.

Return them as a markdown formatted list with each recommendation from tool results, being sure to include the full PDP URL. For example:

1. Product 1: [Price] -- link
2. Product 2: [Price] -- link
3. Product 3: [Price] -- link
4. Product 4: [Price] -- link
"""
)

tools = [ionic_tool]

# default prompt for create_react_agent
prompt = hub.pull("hwchase17/react")

agent = create_react_agent(
    llm,
    tools,
    prompt=prompt,
)

agent_executor = AgentExecutor(
    agent=agent, tools=tools, handle_parsing_errors=True, verbose=True, max_iterations=5
)
```

## Ejecutar

```python
input = (
    "I'm looking for a new 4k monitor can you find me some options for less than $1000"
)
agent_executor.invoke({"input": input})
```
