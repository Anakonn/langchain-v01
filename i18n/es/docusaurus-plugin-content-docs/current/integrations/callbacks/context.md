---
translated: true
---

# Contexto

>[Contexto](https://context.ai/) proporciona análisis de usuarios para productos y funciones impulsados por LLM.

Con `Contexto`, puede comenzar a comprender a sus usuarios y mejorar sus experiencias en menos de 30 minutos.

En esta guía le mostraremos cómo integrarse con Contexto.

## Instalación y configuración

```python
%pip install --upgrade --quiet  langchain langchain-openai context-python
```

### Obtener credenciales de API

Para obtener su token de API de Contexto:

1. Vaya a la página de configuración dentro de su cuenta de Contexto (https://with.context.ai/settings).
2. Genere un nuevo token de API.
3. Almacene este token en un lugar seguro.

### Configurar Contexto

Para usar el `ContextCallbackHandler`, importe el controlador de Langchain y instáncielo con su token de API de Contexto.

Asegúrese de haber instalado el paquete `context-python` antes de usar el controlador.

```python
from langchain_community.callbacks.context_callback import ContextCallbackHandler
```

```python
import os

token = os.environ["CONTEXT_API_TOKEN"]

context_callback = ContextCallbackHandler(token)
```

## Uso

### Devolución de llamada de contexto dentro de un modelo de chat

El controlador de devolución de llamada de Contexto se puede usar para registrar directamente las transcripciones entre los usuarios y los asistentes de IA.

```python
import os

from langchain.schema import (
    HumanMessage,
    SystemMessage,
)
from langchain_openai import ChatOpenAI

token = os.environ["CONTEXT_API_TOKEN"]

chat = ChatOpenAI(
    headers={"user_id": "123"}, temperature=0, callbacks=[ContextCallbackHandler(token)]
)

messages = [
    SystemMessage(
        content="You are a helpful assistant that translates English to French."
    ),
    HumanMessage(content="I love programming."),
]

print(chat(messages))
```

### Devolución de llamada de contexto dentro de las cadenas

El controlador de devolución de llamada de Contexto también se puede usar para registrar las entradas y salidas de las cadenas. Tenga en cuenta que los pasos intermedios de la cadena no se registran, solo las entradas iniciales y las salidas finales.

__Nota:__ Asegúrese de pasar el mismo objeto de contexto al modelo de chat y a la cadena.

Incorrecto:
> ```python
> chat = ChatOpenAI(temperature=0.9, callbacks=[ContextCallbackHandler(token)])
> chain = LLMChain(llm=chat, prompt=chat_prompt_template, callbacks=[ContextCallbackHandler(token)])
> ```

Correcto:
>```python
>handler = ContextCallbackHandler(token)
>chat = ChatOpenAI(temperature=0.9, callbacks=[callback])
>chain = LLMChain(llm=chat, prompt=chat_prompt_template, callbacks=[callback])
>```

```python
import os

from langchain.chains import LLMChain
from langchain_core.prompts import PromptTemplate
from langchain_core.prompts.chat import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
)
from langchain_openai import ChatOpenAI

token = os.environ["CONTEXT_API_TOKEN"]

human_message_prompt = HumanMessagePromptTemplate(
    prompt=PromptTemplate(
        template="What is a good name for a company that makes {product}?",
        input_variables=["product"],
    )
)
chat_prompt_template = ChatPromptTemplate.from_messages([human_message_prompt])
callback = ContextCallbackHandler(token)
chat = ChatOpenAI(temperature=0.9, callbacks=[callback])
chain = LLMChain(llm=chat, prompt=chat_prompt_template, callbacks=[callback])
print(chain.run("colorful socks"))
```
