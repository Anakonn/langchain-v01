---
sidebar_label: Conversation vLLM
translated: true
---

# Conversation vLLM

vLLM peut être déployé en tant que serveur qui imite le protocole de l'API OpenAI. Cela permet à vLLM d'être utilisé comme un remplacement direct pour les applications utilisant l'API OpenAI. Ce serveur peut être interrogé dans le même format que l'API OpenAI.

Ce notebook couvre comment se lancer avec les modèles de conversation vLLM en utilisant `ChatOpenAI` de langchain **tel quel**.

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

Vous pouvez utiliser le modèle de texte en utilisant un `MessagePromptTemplate`. Vous pouvez construire un `ChatPromptTemplate` à partir d'un ou plusieurs `MessagePromptTemplates`. Vous pouvez utiliser la méthode `format_prompt` de ChatPromptTemplate - cela renvoie une `PromptValue`, que vous pouvez convertir en chaîne de caractères ou en objet `Message`, selon que vous voulez utiliser la valeur formatée comme entrée pour un modèle llm ou de conversation.

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
        input_language="English", output_language="Italian", text="I love programming."
    ).to_messages()
)
```

```output
AIMessage(content=' I love programming too.', additional_kwargs={}, example=False)
```
