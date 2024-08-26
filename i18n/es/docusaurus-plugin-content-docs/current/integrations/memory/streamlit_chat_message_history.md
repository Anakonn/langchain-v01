---
translated: true
---

# Streamlit

>[Streamlit](https://docs.streamlit.io/) es una biblioteca de código abierto de Python que facilita la creación y el intercambio de hermosas aplicaciones web personalizadas para aprendizaje automático y ciencia de datos.

Este cuaderno analiza cómo almacenar y usar el historial de mensajes de chat en una aplicación `Streamlit`. `StreamlitChatMessageHistory` almacenará los mensajes en [Streamlit session state](https://docs.streamlit.io/library/api-reference/session-state) con la clave especificada `key=`. La clave predeterminada es `"langchain_messages"`.

- Tenga en cuenta que `StreamlitChatMessageHistory` solo funciona cuando se ejecuta en una aplicación Streamlit.
- También puede estar interesado en [StreamlitCallbackHandler](/docs/integrations/callbacks/streamlit) para LangChain.
- Para más información sobre Streamlit, consulte su [documentación de inicio](https://docs.streamlit.io/library/get-started).

La integración se encuentra en el paquete `langchain-community`, por lo que debemos instalarlo. También necesitamos instalar `streamlit`.

```bash
pip install -U langchain-community streamlit
```

Puede ver el [ejemplo de aplicación completa en ejecución aquí](https://langchain-st-memory.streamlit.app/) y más ejemplos en [github.com/langchain-ai/streamlit-agent](https://github.com/langchain-ai/streamlit-agent).

```python
from langchain_community.chat_message_histories import (
    StreamlitChatMessageHistory,
)

history = StreamlitChatMessageHistory(key="chat_messages")

history.add_user_message("hi!")
history.add_ai_message("whats up?")
```

```python
history.messages
```

Podemos combinar fácilmente esta clase de historial de mensajes con [LCEL Runnables](/docs/expression_language/how_to/message_history).

El historial se conservará a través de las ejecuciones repetidas de la aplicación Streamlit dentro de una sesión de usuario determinada. Un `StreamlitChatMessageHistory` dado NO se conservará ni se compartirá entre sesiones de usuario.

```python
# Optionally, specify your own session_state key for storing messages
msgs = StreamlitChatMessageHistory(key="special_app_key")

if len(msgs.messages) == 0:
    msgs.add_ai_message("How can I help you?")
```

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_openai import ChatOpenAI

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", "You are an AI chatbot having a conversation with a human."),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{question}"),
    ]
)

chain = prompt | ChatOpenAI()
```

```python
chain_with_history = RunnableWithMessageHistory(
    chain,
    lambda session_id: msgs,  # Always return the instance created earlier
    input_messages_key="question",
    history_messages_key="history",
)
```

Las aplicaciones de chat de Streamlit a menudo volverán a dibujar cada mensaje de chat anterior en cada nueva ejecución. Esto es fácil de hacer iterando a través de `StreamlitChatMessageHistory.messages`:

```python
import streamlit as st

for msg in msgs.messages:
    st.chat_message(msg.type).write(msg.content)

if prompt := st.chat_input():
    st.chat_message("human").write(prompt)

    # As usual, new messages are added to StreamlitChatMessageHistory when the Chain is called.
    config = {"configurable": {"session_id": "any"}}
    response = chain_with_history.invoke({"question": prompt}, config)
    st.chat_message("ai").write(response.content)
```

**[Ver la aplicación final](https://langchain-st-memory.streamlit.app/).**
