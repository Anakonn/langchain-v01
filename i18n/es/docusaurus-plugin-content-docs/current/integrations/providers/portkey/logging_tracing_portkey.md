---
translated: true
---

# Registrar, rastrear y monitorear

Al construir aplicaciones o agentes usando Langchain, terminas haciendo múltiples llamadas a la API para cumplir con una sola solicitud de usuario. Sin embargo, estas solicitudes no se encadenan cuando quieres analizarlas. Con [**Portkey**](/docs/integrations/providers/portkey/), todos los incrustaciones, completaciones y otras solicitudes de una sola solicitud de usuario se registrarán y rastrearán a un ID común, lo que te permitirá obtener una visibilidad completa de las interacciones de los usuarios.

Este cuaderno sirve como una guía paso a paso sobre cómo registrar, rastrear y monitorear las llamadas de Langchain LLM usando `Portkey` en tu aplicación Langchain.

Primero, importemos Portkey, OpenAI y las herramientas de Agent

```python
import os

from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain_openai import ChatOpenAI
from portkey_ai import PORTKEY_GATEWAY_URL, createHeaders
```

Pega tu clave API de OpenAI a continuación. [(Puedes encontrarla aquí)](https://platform.openai.com/account/api-keys)

```python
os.environ["OPENAI_API_KEY"] = "..."
```

## Obtener la clave API de Portkey

1. Regístrate en [Portkey aquí](https://app.portkey.ai/signup)
2. En tu [panel de control](https://app.portkey.ai/), haz clic en el icono de perfil en la parte inferior izquierda, luego haz clic en "Copiar clave API"
3. Pégala a continuación

```python
PORTKEY_API_KEY = "..."  # Paste your Portkey API Key here
```

## Establecer el ID de rastreo

1. Establece el ID de rastreo para tu solicitud a continuación
2. El ID de rastreo puede ser común para todas las llamadas a la API que se originen de una sola solicitud

```python
TRACE_ID = "uuid-trace-id"  # Set trace id here
```

## Generar encabezados de Portkey

```python
portkey_headers = createHeaders(
    api_key=PORTKEY_API_KEY, provider="openai", trace_id=TRACE_ID
)
```

Define los mensajes y las herramientas a utilizar

```python
from langchain import hub
from langchain_core.tools import tool

prompt = hub.pull("hwchase17/openai-tools-agent")


@tool
def multiply(first_int: int, second_int: int) -> int:
    """Multiply two integers together."""
    return first_int * second_int


@tool
def exponentiate(base: int, exponent: int) -> int:
    "Exponentiate the base to the exponent power."
    return base**exponent


tools = [multiply, exponentiate]
```

Ejecuta tu agente como de costumbre. El **único** cambio es que **incluiremos los encabezados anteriores** en la solicitud ahora.

```python
model = ChatOpenAI(
    base_url=PORTKEY_GATEWAY_URL, default_headers=portkey_headers, temperature=0
)

# Construct the OpenAI Tools agent
agent = create_openai_tools_agent(model, tools, prompt)

# Create an agent executor by passing in the agent and tools
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

agent_executor.invoke(
    {
        "input": "Take 3 to the fifth power and multiply that by thirty six, then square the result"
    }
)
```

```output


[1m> Entering new AgentExecutor chain...[0m
[32;1m[1;3m
Invoking: `exponentiate` with `{'base': 3, 'exponent': 5}`


[0m[33;1m[1;3m243[0m[32;1m[1;3m
Invoking: `multiply` with `{'first_int': 243, 'second_int': 36}`


[0m[36;1m[1;3m8748[0m[32;1m[1;3m
Invoking: `exponentiate` with `{'base': 8748, 'exponent': 2}`


[0m[33;1m[1;3m76527504[0m[32;1m[1;3mThe result of taking 3 to the fifth power, multiplying it by 36, and then squaring the result is 76,527,504.[0m

[1m> Finished chain.[0m
```

```output
{'input': 'Take 3 to the fifth power and multiply that by thirty six, then square the result',
 'output': 'The result of taking 3 to the fifth power, multiplying it by 36, and then squaring the result is 76,527,504.'}
```

## Cómo funciona el registro y el rastreo en Portkey

**Registro**
- Enviar tu solicitud a través de Portkey asegura que todas las solicitudes se registren de forma predeterminada
- Cada registro de solicitud contiene `marca de tiempo`, `nombre del modelo`, `costo total`, `tiempo de solicitud`, `json de solicitud`, `json de respuesta` y características adicionales de Portkey

**[Rastreo](https://portkey.ai/docs/product/observability-modern-monitoring-for-llms/traces)**
- El ID de rastreo se pasa junto con cada solicitud y es visible en los registros en el panel de control de Portkey
- También puedes establecer un **ID de rastreo distinto** para cada solicitud si lo deseas
- También puedes agregar comentarios del usuario a un ID de rastreo. [Más información sobre esto aquí](https://portkey.ai/docs/product/observability-modern-monitoring-for-llms/feedback)

Para la solicitud anterior, podrás ver el rastro de registro completo así
![Ver rastros de Langchain en Portkey](https://assets.portkey.ai/docs/agent_tracing.gif)

## Características avanzadas de LLMOps - Almacenamiento en caché, etiquetado, reintentos

Además del registro y el rastreo, Portkey proporciona más funciones que agregan capacidades de producción a tus flujos de trabajo existentes:

**Almacenamiento en caché**

Responde a las consultas de clientes previamente atendidas desde la caché en lugar de enviarlas de nuevo a OpenAI. Coincide con cadenas exactas O cadenas semánticamente similares. La caché puede ahorrar costos y reducir las latencias en un 20x. [Documentación](https://portkey.ai/docs/product/ai-gateway-streamline-llm-integrations/cache-simple-and-semantic)

**Reintentos**

Vuelve a procesar automáticamente cualquier solicitud de API sin éxito **hasta 5** veces. Utiliza una estrategia de **"retroceso exponencial"**, que espacía los intentos de reintento para evitar la sobrecarga de la red. [Documentación](https://portkey.ai/docs/product/ai-gateway-streamline-llm-integrations)

**Etiquetado**

Realiza un seguimiento y auditoría de cada interacción del usuario con detalles detallados con etiquetas predefinidas. [Documentación](https://portkey.ai/docs/product/observability-modern-monitoring-for-llms/metadata)
