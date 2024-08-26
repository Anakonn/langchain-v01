---
sidebar_label: ZHIPU AI
translated: true
---

# ZHIPU AI

Este cuaderno muestra cómo usar la [API ZHIPU AI](https://open.bigmodel.cn/dev/api) en LangChain con langchain.chat_models.ChatZhipuAI.

>[*GLM-4*](https://open.bigmodel.cn/) es un modelo de lenguaje grande multilingüe alineado con la intención humana, con capacidades en preguntas y respuestas, diálogo de varios turnos y generación de código. El rendimiento general del nuevo modelo base de generación GLM-4 ha mejorado significativamente en comparación con la generación anterior, con soporte para contextos más largos; Una multimodalidad más fuerte; Soporte para una inferencia más rápida, más concurrencia, reduciendo en gran medida los costos de inferencia; Mientras tanto, GLM-4 mejora las capacidades de los agentes inteligentes.

## Comenzando

### Instalación

Primero, asegúrate de que el paquete zhipuai esté instalado en tu entorno de Python. Ejecuta el siguiente comando:

```python
#!pip install --upgrade httpx httpx-sse PyJWT
```

### Importar los módulos requeridos

Después de la instalación, importa los módulos necesarios a tu script de Python:

```python
from langchain_community.chat_models import ChatZhipuAI
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
```

### Configurar tu clave API

Inicia sesión en [ZHIPU AI](https://open.bigmodel.cn/login?redirect=%2Fusercenter%2Fapikeys) para obtener una clave API para acceder a nuestros modelos.

```python
import os

os.environ["ZHIPUAI_API_KEY"] = "zhipuai_api_key"
```

### Inicializar el modelo de chat ZHIPU AI

Así es como inicializar el modelo de chat:

```python
chat = ChatZhipuAI(
    model="glm-4",
    temperature=0.5,
)
```

### Uso básico

Invoca el modelo con mensajes de sistema y humanos de esta manera:

```python
messages = [
    AIMessage(content="Hi."),
    SystemMessage(content="Your role is a poet."),
    HumanMessage(content="Write a short poem about AI in four lines."),
]
```

```python
response = chat.invoke(messages)
print(response.content)  # Displays the AI-generated poem
```

## Características avanzadas

### Soporte de transmisión

Para una interacción continua, usa la función de transmisión:

```python
from langchain_core.callbacks.manager import CallbackManager
from langchain_core.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
```

```python
streaming_chat = ChatZhipuAI(
    model="glm-4",
    temperature=0.5,
    streaming=True,
    callback_manager=CallbackManager([StreamingStdOutCallbackHandler()]),
)
```

```python
streaming_chat(messages)
```

### Llamadas asincrónicas

Para llamadas no bloqueantes, usa el enfoque asincrónico:

```python
async_chat = ChatZhipuAI(
    model="glm-4",
    temperature=0.5,
)
```

```python
response = await async_chat.agenerate([messages])
print(response)
```

### Usar con llamada de funciones

El modelo GLM-4 también se puede usar con la llamada de funciones, usa el siguiente código para ejecutar un simple agente de chat json_chat_agent de LangChain.

```python
os.environ["TAVILY_API_KEY"] = "tavily_api_key"
```

```python
from langchain import hub
from langchain.agents import AgentExecutor, create_json_chat_agent
from langchain_community.tools.tavily_search import TavilySearchResults

tools = [TavilySearchResults(max_results=1)]
prompt = hub.pull("hwchase17/react-chat-json")
llm = ChatZhipuAI(temperature=0.01, model="glm-4")

agent = create_json_chat_agent(llm, tools, prompt)
agent_executor = AgentExecutor(
    agent=agent, tools=tools, verbose=True, handle_parsing_errors=True
)
```

```python
agent_executor.invoke({"input": "what is LangChain?"})
```
