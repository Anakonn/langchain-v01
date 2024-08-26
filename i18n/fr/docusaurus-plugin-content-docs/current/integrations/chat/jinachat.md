---
translated: true
---

# JinaChat

Ce cahier couvre comment bien démarrer avec les modèles de chat JinaChat.

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

Vous pouvez utiliser le modèle en utilisant un `MessagePromptTemplate`. Vous pouvez construire un `ChatPromptTemplate` à partir d'un ou plusieurs `MessagePromptTemplates`. Vous pouvez utiliser `ChatPromptTemplate`'s `format_prompt` -- cela renvoie une `PromptValue`, que vous pouvez convertir en une chaîne de caractères ou un objet Message, selon que vous voulez utiliser la valeur formatée comme entrée pour un llm ou un modèle de chat.

Pour plus de commodité, il y a une méthode `from_template` exposée sur le modèle. Si vous deviez utiliser ce modèle, voici à quoi cela ressemblerait :

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
