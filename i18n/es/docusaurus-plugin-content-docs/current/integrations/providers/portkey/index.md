---
translated: true
---

# Portkey

[Portkey](https://portkey.ai) es el Panel de Control para aplicaciones de IA. Con su popular AI Gateway y Observability Suite, cientos de equipos envían aplicaciones **confiables**, **rentables** y **rápidas**.

## LLMOps para Langchain

Portkey aporta preparación para la producción a Langchain. Con Portkey, puedes
- [x] Conectar con más de 150 modelos a través de una API unificada,
- [x] Ver más de 42 **métricas y registros** para todas las solicitudes,
- [x] Habilitar la **caché semántica** para reducir la latencia y los costos,
- [x] Implementar **reintentos y alternativas** automáticos para solicitudes fallidas,
- [x] Agregar **etiquetas personalizadas** a las solicitudes para un mejor seguimiento y análisis y [más](https://portkey.ai/docs).

## Inicio rápido - Portkey y Langchain

Dado que Portkey es totalmente compatible con la firma de OpenAI, puedes conectarte a la AI Gateway de Portkey a través de la interfaz `ChatOpenAI`.

- Establece `base_url` como `PORTKEY_GATEWAY_URL`
- Agrega `default_headers` para consumir los encabezados necesarios por Portkey usando el método auxiliar `createHeaders`.

Para comenzar, obtén tu clave API de Portkey [registrándote aquí](https://app.portkey.ai/signup). (Haz clic en el icono de perfil en la parte inferior izquierda, luego haz clic en "Copiar clave API") o implementa la puerta de enlace de IA de código abierto en [tu propio entorno](https://github.com/Portkey-AI/gateway/blob/main/docs/installation-deployments.md).

A continuación, instala el SDK de Portkey

```python
pip install -U portkey_ai
```

Ahora podemos conectarnos a la AI Gateway de Portkey actualizando el modelo `ChatOpenAI` en Langchain

```python
<!--IMPORTS:[{"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://api.python.langchain.com/en/latest/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Portkey"}]-->
from langchain_openai import ChatOpenAI
from portkey_ai import createHeaders, PORTKEY_GATEWAY_URL

PORTKEY_API_KEY = "..." # Not needed when hosting your own gateway
PROVIDER_API_KEY = "..." # Add the API key of the AI provider being used

portkey_headers = createHeaders(api_key=PORTKEY_API_KEY,provider="openai")

llm = ChatOpenAI(api_key=PROVIDER_API_KEY, base_url=PORTKEY_GATEWAY_URL, default_headers=portkey_headers)

llm.invoke("What is the meaning of life, universe and everything?")
```

La solicitud se enruta a través de tu AI Gateway de Portkey al `proveedor` especificado. Portkey también comenzará a registrar todas las solicitudes en tu cuenta, lo que hace que el depurado sea extremadamente sencillo.

![Ver registros de Langchain en Portkey](https://assets.portkey.ai/docs/langchain-logs.gif)

## Usar más de 150 modelos a través de la puerta de enlace de IA

El poder de la puerta de enlace de IA se manifiesta cuando puedes usar el fragmento de código anterior para conectarte con más de 150 modelos en más de 20 proveedores compatibles a través de la puerta de enlace de IA.

Modifiquemos el código anterior para hacer una llamada al modelo `claude-3-opus-20240229` de Anthropic.

Portkey admite **[Claves Virtuales](https://docs.portkey.ai/docs/product/ai-gateway-streamline-llm-integrations/virtual-keys)** que son una forma sencilla de almacenar y administrar claves API en una bóveda segura. Intentemos usar una Clave Virtual para hacer llamadas a LLM. Puedes navegar a la pestaña de Claves Virtuales en Portkey y crear una nueva clave para Anthropic.

El parámetro `virtual_key` establece la autenticación y el proveedor para el proveedor de IA que se está utilizando. En nuestro caso, estamos usando la clave virtual de Anthropic.

> Observa que el `api_key` se puede dejar en blanco, ya que no se utilizará esa autenticación.

```python
<!--IMPORTS:[{"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://api.python.langchain.com/en/latest/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Portkey"}]-->
from langchain_openai import ChatOpenAI
from portkey_ai import createHeaders, PORTKEY_GATEWAY_URL

PORTKEY_API_KEY = "..."
VIRTUAL_KEY = "..." # Anthropic's virtual key we copied above

portkey_headers = createHeaders(api_key=PORTKEY_API_KEY,virtual_key=VIRTUAL_KEY)

llm = ChatOpenAI(api_key="X", base_url=PORTKEY_GATEWAY_URL, default_headers=portkey_headers, model="claude-3-opus-20240229")

llm.invoke("What is the meaning of life, universe and everything?")
```

La puerta de enlace de IA de Portkey autenticará la solicitud de API a Anthropic y obtendrá la respuesta de vuelta en el formato de OpenAI para que puedas consumirla.

La puerta de enlace de IA extiende la clase `ChatOpenAI` de Langchain, convirtiéndola en una interfaz única para llamar a cualquier proveedor y cualquier modelo.

## Enrutamiento avanzado: equilibrio de carga, alternativas, reintentos

La puerta de enlace de IA de Portkey aporta capacidades como equilibrio de carga, alternativas, experimentación y pruebas canarias a Langchain a través de un enfoque basado en configuración.

Tomemos un **ejemplo** en el que podríamos querer dividir el tráfico entre `gpt-4` y `claude-opus` en una proporción de 50:50 para probar los dos modelos grandes. La configuración de la puerta de enlace para esto sería la siguiente:

```python
config = {
    "strategy": {
         "mode": "loadbalance"
    },
    "targets": [{
        "virtual_key": "openai-25654", # OpenAI's virtual key
        "override_params": {"model": "gpt4"},
        "weight": 0.5
    }, {
        "virtual_key": "anthropic-25654", # Anthropic's virtual key
        "override_params": {"model": "claude-3-opus-20240229"},
        "weight": 0.5
    }]
}
```

Luego podemos usar esta configuración en nuestras solicitudes realizadas desde Langchain.

```python
portkey_headers = createHeaders(
    api_key=PORTKEY_API_KEY,
    config=config
)

llm = ChatOpenAI(api_key="X", base_url=PORTKEY_GATEWAY_URL, default_headers=portkey_headers)

llm.invoke("What is the meaning of life, universe and everything?")
```

Cuando se invoque el LLM, Portkey distribuirá las solicitudes a `gpt-4` y `claude-3-opus-20240229` en la proporción de los pesos definidos.

Puedes encontrar más ejemplos de configuración [aquí](https://docs.portkey.ai/docs/api-reference/config-object#examples).

## **Seguimiento de cadenas y agentes**

La integración de Portkey con Langchain te brinda visibilidad completa sobre la ejecución de un agente. Tomemos un ejemplo de un [flujo de trabajo agentico popular](https://python.langchain.com/docs/use_cases/tool_use/quickstart/#agents).

Solo necesitamos modificar la clase `ChatOpenAI` para usar la puerta de enlace de IA como se indicó anteriormente.

```python
<!--IMPORTS:[{"imported": "AgentExecutor", "source": "langchain.agents", "docs": "https://api.python.langchain.com/en/latest/agents/langchain.agents.agent.AgentExecutor.html", "title": "Portkey"}, {"imported": "create_openai_tools_agent", "source": "langchain.agents", "docs": "https://api.python.langchain.com/en/latest/agents/langchain.agents.openai_tools.base.create_openai_tools_agent.html", "title": "Portkey"}, {"imported": "ChatOpenAI", "source": "langchain_openai", "docs": "https://api.python.langchain.com/en/latest/chat_models/langchain_openai.chat_models.base.ChatOpenAI.html", "title": "Portkey"}, {"imported": "tool", "source": "langchain_core.tools", "docs": "https://api.python.langchain.com/en/latest/tools/langchain_core.tools.tool.html", "title": "Portkey"}]-->
from langchain import hub
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from portkey_ai import PORTKEY_GATEWAY_URL, createHeaders

prompt = hub.pull("hwchase17/openai-tools-agent")

portkey_headers = createHeaders(
    api_key=PORTKEY_API_KEY,
    virtual_key=OPENAI_VIRTUAL_KEY,
    trace_id="uuid-uuid-uuid-uuid"
)

@tool
def multiply(first_int: int, second_int: int) -> int:
    """Multiply two integers together."""
    return first_int * second_int


@tool
def exponentiate(base: int, exponent: int) -> int:
    "Exponentiate the base to the exponent power."
    return base**exponent


tools = [multiply, exponentiate]

model = ChatOpenAI(api_key="X", base_url=PORTKEY_GATEWAY_URL, default_headers=portkey_headers, temperature=0)

# Construct the OpenAI Tools agent
agent = create_openai_tools_agent(model, tools, prompt)

# Create an agent executor by passing in the agent and tools
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

agent_executor.invoke({
    "input": "Take 3 to the fifth power and multiply that by thirty six, then square the result"
})
```

**Puedes ver los registros de las solicitudes junto con el ID de seguimiento en el panel de Portkey:**
![Registros del agente Langchain en Portkey](https://assets.portkey.ai/docs/agent_tracing.gif)

La documentación adicional está disponible aquí:
- Observabilidad - https://portkey.ai/docs/product/observability-modern-monitoring-for-llms
- Puerta de enlace de IA - https://portkey.ai/docs/product/ai-gateway-streamline-llm-integrations
- Biblioteca de indicaciones - https://portkey.ai/docs/product/prompt-library

Puedes consultar nuestra popular puerta de enlace de IA de código abierto aquí: https://github.com/portkey-ai/gateway

Para obtener información detallada sobre cada función y cómo usarla, [consulta la documentación de Portkey](https://portkey.ai/docs). Si tienes alguna pregunta o necesitas más ayuda, [contáctanos en Twitter](https://twitter.com/portkeyai) o en nuestro [correo electrónico de soporte](mailto:hello@portkey.ai).
