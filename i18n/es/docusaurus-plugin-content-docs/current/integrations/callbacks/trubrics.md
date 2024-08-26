---
translated: true
---

# Trubrics

>[Trubrics](https://trubrics.com) es una plataforma de análisis de usuarios de LLM que le permite recopilar, analizar y administrar los
prompts y comentarios de los usuarios sobre los modelos de IA.
>
>Consulte [Trubrics repo](https://github.com/trubrics/trubrics-sdk) para obtener más información sobre `Trubrics`.

En esta guía, repasaremos cómo configurar el `TrubricsCallbackHandler`.

## Instalación y configuración

```python
%pip install --upgrade --quiet  trubrics
```

### Obtener las credenciales de Trubrics

Si no tiene una cuenta de Trubrics, créela [aquí](https://trubrics.streamlit.app/). En este tutorial, utilizaremos el proyecto `default` que se basa en la creación de la cuenta.

Ahora establezca sus credenciales como variables de entorno:

```python
import os

os.environ["TRUBRICS_EMAIL"] = "***@***"
os.environ["TRUBRICS_PASSWORD"] = "***"
```

```python
from langchain_community.callbacks.trubrics_callback import TrubricsCallbackHandler
```

### Uso

El `TrubricsCallbackHandler` puede recibir varios argumentos opcionales. Consulte [aquí](https://trubrics.github.io/trubrics-sdk/platform/user_prompts/#saving-prompts-to-trubrics) para ver los kwargs que se pueden pasar a los prompts de Trubrics.

```python
class TrubricsCallbackHandler(BaseCallbackHandler):

    """
    Callback handler for Trubrics.

    Args:
        project: a trubrics project, default project is "default"
        email: a trubrics account email, can equally be set in env variables
        password: a trubrics account password, can equally be set in env variables
        **kwargs: all other kwargs are parsed and set to trubrics prompt variables, or added to the `metadata` dict
    """
```

## Ejemplos

Aquí hay dos ejemplos de cómo usar el `TrubricsCallbackHandler` con Langchain [LLMs](/docs/modules/model_io/llms/) o [Chat Models](/docs/modules/model_io/chat/). Utilizaremos modelos de OpenAI, así que establezca su clave `OPENAI_API_KEY` aquí:

```python
os.environ["OPENAI_API_KEY"] = "sk-***"
```

### 1. Con un LLM

```python
from langchain_openai import OpenAI
```

```python
llm = OpenAI(callbacks=[TrubricsCallbackHandler()])
```

```output
[32m2023-09-26 11:30:02.149[0m | [1mINFO    [0m | [36mtrubrics.platform.auth[0m:[36mget_trubrics_auth_token[0m:[36m61[0m - [1mUser jeff.kayne@trubrics.com has been authenticated.[0m
```

```python
res = llm.generate(["Tell me a joke", "Write me a poem"])
```

```output
[32m2023-09-26 11:30:07.760[0m | [1mINFO    [0m | [36mtrubrics.platform[0m:[36mlog_prompt[0m:[36m102[0m - [1mUser prompt saved to Trubrics.[0m
[32m2023-09-26 11:30:08.042[0m | [1mINFO    [0m | [36mtrubrics.platform[0m:[36mlog_prompt[0m:[36m102[0m - [1mUser prompt saved to Trubrics.[0m
```

```python
print("--> GPT's joke: ", res.generations[0][0].text)
print()
print("--> GPT's poem: ", res.generations[1][0].text)
```

```output
--> GPT's joke:

Q: What did the fish say when it hit the wall?
A: Dam!

--> GPT's poem:

A Poem of Reflection

I stand here in the night,
The stars above me filling my sight.
I feel such a deep connection,
To the world and all its perfection.

A moment of clarity,
The calmness in the air so serene.
My mind is filled with peace,
And I am released.

The past and the present,
My thoughts create a pleasant sentiment.
My heart is full of joy,
My soul soars like a toy.

I reflect on my life,
And the choices I have made.
My struggles and my strife,
The lessons I have paid.

The future is a mystery,
But I am ready to take the leap.
I am ready to take the lead,
And to create my own destiny.
```

### 2. Con un modelo de chat

```python
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
```

```python
chat_llm = ChatOpenAI(
    callbacks=[
        TrubricsCallbackHandler(
            project="default",
            tags=["chat model"],
            user_id="user-id-1234",
            some_metadata={"hello": [1, 2]},
        )
    ]
)
```

```python
chat_res = chat_llm.invoke(
    [
        SystemMessage(content="Every answer of yours must be about OpenAI."),
        HumanMessage(content="Tell me a joke"),
    ]
)
```

```output
[32m2023-09-26 11:30:10.550[0m | [1mINFO    [0m | [36mtrubrics.platform[0m:[36mlog_prompt[0m:[36m102[0m - [1mUser prompt saved to Trubrics.[0m
```

```python
print(chat_res.content)
```

```output
Why did the OpenAI computer go to the party?

Because it wanted to meet its AI friends and have a byte of fun!
```
