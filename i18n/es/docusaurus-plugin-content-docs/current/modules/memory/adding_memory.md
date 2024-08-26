---
translated: true
---

# Memoria en LLMChain

Este cuaderno repasa cómo usar la clase Memory con un `LLMChain`.

Añadiremos la clase [ConversationBufferMemory](https://api.python.langchain.com/en/latest/memory/langchain.memory.buffer.ConversationBufferMemory.html#langchain.memory.buffer.ConversationBufferMemory), aunque esta puede ser cualquier clase de memoria.

```python
from langchain.chains import LLMChain
from langchain.memory import ConversationBufferMemory
from langchain_core.prompts import PromptTemplate
from langchain_openai import OpenAI
```

El paso más importante es configurar correctamente el prompt. En el siguiente prompt, tenemos dos claves de entrada: una para la entrada real, otra para la entrada de la clase Memory. Es importante asegurarse de que las claves en el `PromptTemplate` y el `ConversationBufferMemory` coincidan (`chat_history`).

```python
template = """You are a chatbot having a conversation with a human.

{chat_history}
Human: {human_input}
Chatbot:"""

prompt = PromptTemplate(
    input_variables=["chat_history", "human_input"], template=template
)
memory = ConversationBufferMemory(memory_key="chat_history")
```

```python
llm = OpenAI()
llm_chain = LLMChain(
    llm=llm,
    prompt=prompt,
    verbose=True,
    memory=memory,
)
```

```python
llm_chain.predict(human_input="Hi there my friend")
```

```output


[1m> Entering new LLMChain chain...[0m
Prompt after formatting:
[32;1m[1;3mYou are a chatbot having a conversation with a human.


Human: Hi there my friend
Chatbot:[0m

[1m> Finished chain.[0m
```

```output
' Hi there! How can I help you today?'
```

```python
llm_chain.predict(human_input="Not too bad - how are you?")
```

```output


[1m> Entering new LLMChain chain...[0m
Prompt after formatting:
[32;1m[1;3mYou are a chatbot having a conversation with a human.

Human: Hi there my friend
AI:  Hi there! How can I help you today?
Human: Not too bad - how are you?
Chatbot:[0m

[1m> Finished chain.[0m
```

```output
" I'm doing great, thanks for asking! How are you doing?"
```

## Añadiendo Memoria a un `LLMChain` basado en modelo de chat

Lo anterior funciona para `LLM`s de estilo de finalización, pero si estás usando un modelo de chat, probablemente obtendrás un mejor rendimiento usando mensajes de chat estructurados. A continuación se muestra un ejemplo.

```python
from langchain_core.messages import SystemMessage
from langchain_core.prompts import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    MessagesPlaceholder,
)
from langchain_openai import ChatOpenAI
```

Usaremos la clase [ChatPromptTemplate](https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html?highlight=chatprompttemplate) para configurar el prompt de chat.

El método [from_messages](https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html#langchain_core.prompts.chat.ChatPromptTemplate.from_messages) crea un `ChatPromptTemplate` a partir de una lista de mensajes (por ejemplo, `SystemMessage`, `HumanMessage`, `AIMessage`, `ChatMessage`, etc.) o plantillas de mensajes, como el [MessagesPlaceholder](https://api.python.langchain.com/en/latest/prompts/langchain_core.prompts.chat.MessagesPlaceholder.html#langchain_core.prompts.chat.MessagesPlaceholder) a continuación.

La configuración a continuación hace que la memoria se inyecte en el medio del prompt de chat, en la clave `chat_history`, y las entradas del usuario se añadan en un mensaje humano/usuario al final del prompt de chat.

```python
prompt = ChatPromptTemplate.from_messages(
    [
        SystemMessage(
            content="You are a chatbot having a conversation with a human."
        ),  # The persistent system prompt
        MessagesPlaceholder(
            variable_name="chat_history"
        ),  # Where the memory will be stored.
        HumanMessagePromptTemplate.from_template(
            "{human_input}"
        ),  # Where the human input will injected
    ]
)

memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)
```

```python
llm = ChatOpenAI()

chat_llm_chain = LLMChain(
    llm=llm,
    prompt=prompt,
    verbose=True,
    memory=memory,
)
```

```python
chat_llm_chain.predict(human_input="Hi there my friend")
```

```output


[1m> Entering new LLMChain chain...[0m
Prompt after formatting:
[32;1m[1;3mSystem: You are a chatbot having a conversation with a human.
Human: Hi there my friend[0m

[1m> Finished chain.[0m
```

```output
'Hello! How can I assist you today, my friend?'
```

```python
chat_llm_chain.predict(human_input="Not too bad - how are you?")
```

```output


[1m> Entering new LLMChain chain...[0m
Prompt after formatting:
[32;1m[1;3mSystem: You are a chatbot having a conversation with a human.
Human: Hi there my friend
AI: Hello! How can I assist you today, my friend?
Human: Not too bad - how are you?[0m

[1m> Finished chain.[0m
```

```output
"I'm an AI chatbot, so I don't have feelings, but I'm here to help and chat with you! Is there something specific you would like to talk about or any questions I can assist you with?"
```
