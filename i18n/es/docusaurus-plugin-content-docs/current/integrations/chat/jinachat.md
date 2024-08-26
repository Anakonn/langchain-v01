---
translated: true
---

# JinaChat

Este cuaderno cubre cómo comenzar con los modelos de chat JinaChat.

```python
from langchain_community.chat_models import JinaChat
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.prompts.chat import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
)
```

```python
chat = JinaChat(temperature=0)
```

```python
messages = [
    SystemMessage(
        content="You are a helpful assistant that translates English to French."
    ),
    HumanMessage(
        content="Translate this sentence from English to French. I love programming."
    ),
]
chat(messages)
```

```output
AIMessage(content="J'aime programmer.", additional_kwargs={}, example=False)
```

Puede hacer uso de la creación de plantillas utilizando un `MessagePromptTemplate`. Puede construir un `ChatPromptTemplate` a partir de uno o más `MessagePromptTemplates`. Puede usar `ChatPromptTemplate`'s `format_prompt` -- esto devuelve un `PromptValue`, que puede convertir en una cadena o un objeto Message, dependiendo de si desea usar el valor con formato como entrada para un llm o un modelo de chat.

Por conveniencia, hay un método `from_template` expuesto en la plantilla. Si fueras a usar esta plantilla, esto es lo que se vería:

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
        input_language="English", output_language="French", text="I love programming."
    ).to_messages()
)
```

```output
AIMessage(content="J'aime programmer.", additional_kwargs={}, example=False)
```
