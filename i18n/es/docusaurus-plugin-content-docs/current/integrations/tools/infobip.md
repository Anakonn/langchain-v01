---
translated: true
---

# Infobip

Este cuaderno muestra cómo usar el wrapper de la API de [Infobip](https://www.infobip.com/) para enviar mensajes SMS y correos electrónicos.

Infobip ofrece muchos servicios, pero este cuaderno se centrará en los servicios de SMS y correo electrónico. Puede encontrar más información sobre la API y otros canales [aquí](https://www.infobip.com/docs/api).

## Configuración

Para usar esta herramienta, necesitas tener una cuenta de Infobip. Puedes crear una [cuenta de prueba gratuita](https://www.infobip.com/docs/essentials/free-trial).

`InfobipAPIWrapper` utiliza parámetros de nombre donde puedes proporcionar las credenciales:

- `infobip_api_key` - [API Key](https://www.infobip.com/docs/essentials/api-authentication#api-key-header) que puedes encontrar en tus [herramientas de desarrollador](https://portal.infobip.com/dev/api-keys)
- `infobip_base_url` - [URL base](https://www.infobip.com/docs/essentials/base-url) para la API de Infobip. Puedes usar el valor predeterminado `https://api.infobip.com/`.

También puedes proporcionar `infobip_api_key` y `infobip_base_url` como variables de entorno `INFOBIP_API_KEY` y `INFOBIP_BASE_URL`.

## Enviar un SMS

```python
from langchain_community.utilities.infobip import InfobipAPIWrapper

infobip: InfobipAPIWrapper = InfobipAPIWrapper()

infobip.run(
    to="41793026727",
    text="Hello, World!",
    sender="Langchain",
    channel="sms",
)
```

## Enviar un correo electrónico

```python
from langchain_community.utilities.infobip import InfobipAPIWrapper

infobip: InfobipAPIWrapper = InfobipAPIWrapper()

infobip.run(
    to="test@example.com",
    sender="test@example.com",
    subject="example",
    body="example",
    channel="email",
)
```

# Cómo usarlo dentro de un Agente

```python
from langchain import hub
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain.tools import StructuredTool
from langchain_community.utilities.infobip import InfobipAPIWrapper
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_openai import ChatOpenAI

instructions = "You are a coding teacher. You are teaching a student how to code. The student asks you a question. You answer the question."
base_prompt = hub.pull("langchain-ai/openai-functions-template")
prompt = base_prompt.partial(instructions=instructions)
llm = ChatOpenAI(temperature=0)


class EmailInput(BaseModel):
    body: str = Field(description="Email body text")
    to: str = Field(description="Email address to send to. Example: email@example.com")
    sender: str = Field(
        description="Email address to send from, must be 'validemail@example.com'"
    )
    subject: str = Field(description="Email subject")
    channel: str = Field(description="Email channel, must be 'email'")


infobip_api_wrapper: InfobipAPIWrapper = InfobipAPIWrapper()
infobip_tool = StructuredTool.from_function(
    name="infobip_email",
    description="Send Email via Infobip. If you need to send email, use infobip_email",
    func=infobip_api_wrapper.run,
    args_schema=EmailInput,
)
tools = [infobip_tool]

agent = create_openai_functions_agent(llm, tools, prompt)
agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True,
)

agent_executor.invoke(
    {
        "input": "Hi, can you please send me an example of Python recursion to my email email@example.com"
    }
)
```

```bash
> Entering new AgentExecutor chain...

Invoking: `infobip_email` with `{'body': 'Hi,\n\nHere is a simple example of a recursive function in Python:\n\n```\ndef factorial(n):\n    if n == 1:\n        return 1\n    else:\n        return n * factorial(n-1)\n```\n\nThis function calculates the factorial of a number. The factorial of a number is the product of all positive integers less than or equal to that number. The function calls itself with a smaller argument until it reaches the base case where n equals 1.\n\nBest,\nCoding Teacher', 'to': 'email@example.com', 'sender': 'validemail@example.com', 'subject': 'Python Recursion Example', 'channel': 'email'}`


I have sent an example of Python recursion to your email. Please check your inbox.

> Finished chain.
```
