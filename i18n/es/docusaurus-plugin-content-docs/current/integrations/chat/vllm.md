---
sidebar_label: vLLM Chat
translated: true
---

# vLLM Chat

vLLM se puede implementar como un servidor que imita el protocolo de la API de OpenAI. Esto permite que vLLM se use como un reemplazo instantáneo para aplicaciones que utilizan la API de OpenAI. Este servidor se puede consultar en el mismo formato que la API de OpenAI.

Este cuaderno cubre cómo comenzar con los modelos de chat de vLLM utilizando `ChatOpenAI` de langchain **tal como está**.

```python
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.prompts.chat import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
)
from langchain_openai import ChatOpenAI
```

```python
inference_server_url = "http://localhost:8000/v1"

chat = ChatOpenAI(
    model="mosaicml/mpt-7b",
    openai_api_key="EMPTY",
    openai_api_base=inference_server_url,
    max_tokens=5,
    temperature=0,
)
```

```python
messages = [
    SystemMessage(
        content="You are a helpful assistant that translates English to Italian."
    ),
    HumanMessage(
        content="Translate the following sentence from English to Italian: I love programming."
    ),
]
chat(messages)
```

```output
AIMessage(content=' Io amo programmare', additional_kwargs={}, example=False)
```

Puede hacer uso de la creación de plantillas utilizando un `MessagePromptTemplate`. Puede construir un `ChatPromptTemplate` a partir de uno o más `MessagePromptTemplates`. Puede usar el método `format_prompt` de ChatPromptTemplate: esto devuelve un `PromptValue`, que puede convertir en una cadena o un objeto `Message`, dependiendo de si desea usar el valor con formato como entrada para un modelo llm o de chat.

Por conveniencia, hay un método `from_template` expuesto en la plantilla. Si fuera a usar esta plantilla, esto es lo que parecería:

```python
template = (
    "You are a helpful assistant that translates {input_language} to {output_language}."
)
system_message_prompt = SystemMessagePromptTemplate.from_template(template)
human_template = "{text}"
human_message_prompt = HumanMessagePromptTemplate.from_template(human_template)
```

```python
chat_prompt = ChatPromptTemplate.from_messages(
    [system_message_prompt, human_message_prompt]
)

# get a chat completion from the formatted messages
chat(
    chat_prompt.format_prompt(
        input_language="English", output_language="Italian", text="I love programming."
    ).to_messages()
)
```

```output
AIMessage(content=' I love programming too.', additional_kwargs={}, example=False)
```
