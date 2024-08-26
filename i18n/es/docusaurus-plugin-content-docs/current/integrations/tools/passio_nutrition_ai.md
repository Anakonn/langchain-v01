---
translated: true
---

# Inicio rápido

Para entender mejor cómo NutritionAI puede dar a tus agentes superpoderes de alimentación y nutrición, construyamos un agente que pueda encontrar esa información a través de Passio NutritionAI.

## Definir herramientas

Primero necesitamos crear [la herramienta Passio NutritionAI](/docs/integrations/tools/passio_nutrition_ai).

### [Passio Nutrition AI](/docs/integrations/tools/passio_nutrition_ai)

Tenemos una herramienta integrada en LangChain para usar fácilmente Passio NutritionAI y encontrar datos de nutrición de alimentos.
Tenga en cuenta que esto requiere una clave API: tienen un plan de tarifa gratuita.

Una vez que crees tu clave API, deberás exportarla como:

```bash
export NUTRITIONAI_SUBSCRIPTION_KEY="..."
```

... o proporcionarla a tu entorno de Python a través de otros medios, como el paquete `dotenv`. También puedes controlar explícitamente la clave a través de llamadas al constructor.

```python
from dotenv import load_dotenv
from langchain_core.utils import get_from_env

load_dotenv()

nutritionai_subscription_key = get_from_env(
    "nutritionai_subscription_key", "NUTRITIONAI_SUBSCRIPTION_KEY"
)
```

```python
from langchain_community.tools.passio_nutrition_ai import NutritionAI
from langchain_community.utilities.passio_nutrition_ai import NutritionAIAPI
```

```python
nutritionai_search = NutritionAI(api_wrapper=NutritionAIAPI())
```

```python
nutritionai_search.invoke("chicken tikka masala")
```

```python
nutritionai_search.invoke("Schnuck Markets sliced pepper jack cheese")
```

### Herramientas

Ahora que tenemos la herramienta, podemos crear una lista de herramientas que usaremos más adelante.

```python
tools = [nutritionai_search]
```

## Crear el agente

Ahora que hemos definido las herramientas, podemos crear el agente. Utilizaremos un agente de funciones de OpenAI; para obtener más información sobre este tipo de agente, así como otras opciones, consulta [esta guía](/docs/modules/agents/agent_types/)

Primero, elegimos el LLM que queremos que guíe al agente.

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
```

A continuación, elegimos el prompt que queremos usar para guiar al agente.

```python
from langchain import hub

# Get the prompt to use - you can modify this!
prompt = hub.pull("hwchase17/openai-functions-agent")
prompt.messages
```

```output
[SystemMessagePromptTemplate(prompt=PromptTemplate(input_variables=[], template='You are a helpful assistant')),
 MessagesPlaceholder(variable_name='chat_history', optional=True),
 HumanMessagePromptTemplate(prompt=PromptTemplate(input_variables=['input'], template='{input}')),
 MessagesPlaceholder(variable_name='agent_scratchpad')]
```

Ahora, podemos inicializar el agente con el LLM, el prompt y las herramientas. El agente es responsable de recibir la entrada y decidir qué acciones tomar. Crucialmente, el Agente no ejecuta esas acciones; eso lo hace el AgentExecutor (siguiente paso). Para obtener más información sobre cómo pensar en estos componentes, consulta nuestra [guía conceptual](/docs/modules/agents/concepts)

```python
from langchain.agents import create_openai_functions_agent

agent = create_openai_functions_agent(llm, tools, prompt)
```

Finalmente, combinamos el agente (el cerebro) con las herramientas dentro del AgentExecutor (que llamará repetidamente al agente y ejecutará herramientas). Para obtener más información sobre cómo pensar en estos componentes, consulta nuestra [guía conceptual](/docs/modules/agents/concepts)

```python
from langchain.agents import AgentExecutor

agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
```

## Ejecutar el agente

¡Ahora podemos ejecutar el agente con algunas consultas! Ten en cuenta que por ahora, estas son todas consultas **sin estado** (no recordará interacciones anteriores).

```python
agent_executor.invoke({"input": "hi!"})
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3mHello! How can I assist you today?[0m

[1m> Finished chain.[0m
```

```output
{'input': 'hi!', 'output': 'Hello! How can I assist you today?'}
```

```python
agent_executor.invoke({"input": "how many calories are in a slice pepperoni pizza?"})
```

Si queremos hacer un seguimiento automático de estos mensajes, podemos envolver esto en un RunnableWithMessageHistory. Para obtener más información sobre cómo usar esto, consulta [esta guía](/docs/expression_language/how_to/message_history)

```python
agent_executor.invoke(
    {"input": "I had bacon and eggs for breakfast.  How many calories is that?"}
)
```

```python
agent_executor.invoke(
    {
        "input": "I had sliced pepper jack cheese for a snack.  How much protein did I have?"
    }
)
```

```python
agent_executor.invoke(
    {
        "input": "I had sliced colby cheese for a snack. Give me calories for this Schnuck Markets product."
    }
)
```

```python
agent_executor.invoke(
    {
        "input": "I had chicken tikka masala for dinner.  how much calories, protein, and fat did I have with default quantity?"
    }
)
```

## Conclusión

¡Eso es todo! En este inicio rápido, cubrimos cómo crear un agente simple que pueda incorporar información de nutrición de alimentos a sus respuestas. Los agentes son un tema complejo, ¡y hay mucho que aprender!
