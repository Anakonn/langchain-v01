---
sidebar_label: PremAI
translated: true
---

# ChatPremAI

>[PremAI](https://app.premai.io) es una plataforma unificada que le permite construir aplicaciones listas para la producción y potentes impulsadas por GenAI con el menor esfuerzo, para que pueda concentrarse más en la experiencia del usuario y el crecimiento general.

Este ejemplo explica cómo usar LangChain para interactuar con `ChatPremAI`.

### Instalación y configuración

Comenzamos instalando langchain y premai-sdk. Puede escribir el siguiente comando para instalar:

```bash
pip install premai langchain
```

Antes de continuar, asegúrese de haber creado una cuenta en PremAI y de haber iniciado un proyecto. Si no es así, aquí está cómo puede comenzar de forma gratuita:

1. Inicie sesión en [PremAI](https://app.premai.io/accounts/login/), si es la primera vez que viene, y cree su clave API [aquí](https://app.premai.io/api_keys/).

2. Vaya a [app.premai.io](https://app.premai.io) y esto lo llevará al panel de control del proyecto.

3. Cree un proyecto y esto generará un id de proyecto (escrito como ID). Este ID lo ayudará a interactuar con su aplicación implementada.

4. Diríjase a LaunchPad (el que tiene el icono 🚀). Y allí implementa el modelo de tu elección. Tu modelo predeterminado será `gpt-4`. También puede establecer y fijar diferentes parámetros de generación (como max-tokens, temperatura, etc.) y también preestablecer tu sistema de mensajes.

Felicitaciones por crear tu primera aplicación implementada en PremAI 🎉 Ahora podemos usar langchain para interactuar con nuestra aplicación.

```python
from langchain_community.chat_models import ChatPremAI
from langchain_core.messages import HumanMessage, SystemMessage
```

## Configurar la instancia de ChatPremAI en LangChain

Una vez que importamos los módulos requeridos, configuremos nuestro cliente. Por ahora, supongamos que nuestro `project_id` es 8. Pero asegúrate de usar tu id de proyecto, de lo contrario, dará un error.

Para usar langchain con prem, no necesitas pasar ningún nombre de modelo ni establecer ningún parámetro con nuestro cliente de chat. Todos esos usarán el nombre de modelo predeterminado y los parámetros del modelo de LaunchPad.

`NOTA:` Si cambia el `model_name` o cualquier otro parámetro como `temperature` al configurar el cliente, anulará las configuraciones predeterminadas existentes.

```python
import getpass
import os

# First step is to set up the env variable.
# you can also pass the API key while instantiating the model but this
# comes under a best practices to set it as env variable.

if os.environ.get("PREMAI_API_KEY") is None:
    os.environ["PREMAI_API_KEY"] = getpass.getpass("PremAI API Key:")
```

```python
# By default it will use the model which was deployed through the platform
# in my case it will is "claude-3-haiku"

chat = ChatPremAI(project_id=8)
```

## Llamando al modelo

Ahora estás listo. Ahora podemos comenzar a interactuar con nuestra aplicación. `ChatPremAI` admite dos métodos `invoke` (que es lo mismo que `generate`) y `stream`.

El primero nos dará un resultado estático. Mientras que el segundo transmitirá tokens uno por uno. Así es como puedes generar completaciones similares a las de chat.

### Generación

```python
human_message = HumanMessage(content="Who are you?")

response = chat.invoke([human_message])
print(response.content)
```

```output
I am an artificial intelligence created by Anthropic. I'm here to help with a wide variety of tasks, from research and analysis to creative projects and open-ended conversation. I have general knowledge and capabilities, but I'm not a real person - I'm an AI assistant. Please let me know if you have any other questions!
```

¿Arriba se ve interesante, verdad? Establecí mi sistema de mensajes predeterminado de lanchpad como: `Siempre suena como un pirata` También puedes anular el sistema de mensajes predeterminado si lo necesitas. Así es como puedes hacerlo.

```python
system_message = SystemMessage(content="You are a friendly assistant.")
human_message = HumanMessage(content="Who are you?")

chat.invoke([system_message, human_message])
```

```output
AIMessage(content="I am an artificial intelligence created by Anthropic. My purpose is to assist and converse with humans in a friendly and helpful way. I have a broad knowledge base that I can use to provide information, answer questions, and engage in discussions on a wide range of topics. Please let me know if you have any other questions - I'm here to help!")
```

También puedes cambiar los parámetros de generación al llamar al modelo. Así es como puedes hacer eso.

```python
chat.invoke([system_message, human_message], temperature=0.7, max_tokens=10, top_p=0.95)
```

```output
AIMessage(content='I am an artificial intelligence created by Anthropic')
```

### Notas importantes:

Antes de continuar, tenga en cuenta que la versión actual de ChatPrem no admite los parámetros: [n](https://platform.openai.com/docs/api-reference/chat/create#chat-create-n) y [stop](https://platform.openai.com/docs/api-reference/chat/create#chat-create-stop) no son compatibles.

Proporcionaremos soporte para esos dos parámetros anteriores en versiones más recientes.

### Transmisión

Y finalmente, así es como se hace el streaming de tokens para aplicaciones de chat dinámicas.

```python
import sys

for chunk in chat.stream("hello how are you"):
    sys.stdout.write(chunk.content)
    sys.stdout.flush()
```

```output
Hello! As an AI language model, I don't have feelings or a physical state, but I'm functioning properly and ready to assist you with any questions or tasks you might have. How can I help you today?
```

Similar a lo anterior, si desea anular el sistema de mensajes y los parámetros de generación, así es como puede hacerlo.

```python
import sys

# For some experimental reasons if you want to override the system prompt then you
# can pass that here too. However it is not recommended to override system prompt
# of an already deployed model.

for chunk in chat.stream(
    "hello how are you",
    system_prompt="act like a dog",
    temperature=0.7,
    max_tokens=200,
):
    sys.stdout.write(chunk.content)
    sys.stdout.flush()
```

```output
Hello! As an AI language model, I don't have feelings or a physical form, but I'm functioning properly and ready to assist you. How can I help you today?
```
